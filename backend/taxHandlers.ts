import { DEFAULT_TAX_CODE } from "@/constants";
import {
  OrderSubscriptionFragment,
  TaxBaseSubscriptionFragment,
} from "../generated/graphql";
import { fetchTaxes } from "./avataxApi";

import {
  FetchTaxesLinePayload,
  ResponseTaxPayload,
  AvataxConfig,
  FetchTaxesPayload,
} from "./types";
import {
  getAvataxConfig,
  avataxConfigIsValidToUse,
  taxObjectIsValidToUse,
} from "./utils";

const prepareLinesPayload = (
  taxData: TaxBaseSubscriptionFragment
): Array<FetchTaxesLinePayload> => {
  const lines = taxData.lines;
  const linesPayload = lines.map((line, index) => {
    const taxCode =
      line.sourceLine.__typename === "OrderLine"
        ? line.sourceLine.variant!.product.metafield ||
          line.sourceLine.variant!.product.productType.metafield
        : line.sourceLine.productVariant.product.metafield ||
          line.sourceLine.productVariant.product.productType.metafield;
    const itemCode =
      line.sourceLine.__typename === "OrderLine"
        ? line.sourceLine.productSku || line.sourceLine.variant!.id
        : line.sourceLine.productVariant.sku ||
          line.sourceLine.productVariant.id;

    const description =
      line.sourceLine.__typename === "OrderLine"
        ? line.sourceLine.productName
        : line.sourceLine.productVariant.name;

    return {
      id: String(index),
      chargeTaxes: line.chargeTaxes,
      taxCode: taxCode || DEFAULT_TAX_CODE,
      quantity: line.quantity,
      totalAmount: Number(line.totalPrice.amount),
      discounted: taxData.discounts.length !== 0,
      itemCode: itemCode,
      description: description,
    };
  });
  linesPayload.push({
    id: "",
    // FIXME: After introducing simple taxes we will be able to determine
    // this value by fetching tax settings for taxes.
    chargeTaxes: true,
    taxCode: "FR000000",
    quantity: 1,
    totalAmount: taxData.shippingPrice.amount,
    discounted: taxData.discounts.length !== 0,
    itemCode: "Shipping",
    description: "",
  });
  return linesPayload;
};

const prepareOrderCreatedLinesPayload = (
  order: OrderSubscriptionFragment
): Array<FetchTaxesLinePayload> => {
  const lines = order.lines;
  const linesPayload = lines.map((line, index) => {
    const taxCode =
      line.variant!.product.metafield ||
      line.variant!.product.productType.metafield;
    return {
      id: String(index),
      chargeTaxes: line.variant?.product.chargeTaxes || true,
      taxCode: taxCode || DEFAULT_TAX_CODE,
      quantity: line.quantity,
      totalAmount: line.totalPrice.gross.amount,
      itemCode: line.productSku || line.variant!.id,
      description: line.productName,
      discounted: order.discounts.length !== 0,
    };
  });
  linesPayload.push({
    id: "",
    chargeTaxes: true,
    taxCode: "FR000000",
    quantity: 1,
    totalAmount: order.shippingPrice.gross.amount,
    discounted: false,
    itemCode: "Shipping",
    description: "",
  });
  return linesPayload;
};
const calculateTaxes = async (
  taxData: TaxBaseSubscriptionFragment,
  avataxConfig: AvataxConfig
) => {
  const lines = prepareLinesPayload(taxData);
  const payload: FetchTaxesPayload = {
    address: {
      line1: taxData.address!.streetAddress1,
      line2: taxData.address!.streetAddress2,
      line3: "",
      city: taxData.address!.city,
      region: taxData.address!.countryArea,
      country: taxData.address!.country.code,
      postalCode: taxData.address!.postalCode,
      locationCode: "",
    },
    discount:
      taxData.discounts.reduce(
        (total, discount) => total + discount.amount.amount,
        0
      ) || 0,
    date: taxData.sourceObject.date,
    currency: taxData.currency,
    pricesEnteredWithTax: taxData.pricesEnteredWithTax,
    lines: lines,
  };
  try {
    const taxResponse =
      lines.length !== 0
        ? await fetchTaxes(payload, avataxConfig, "SalesOrder")
        : undefined;
    if (!taxResponse) {
      const data: ResponseTaxPayload = {
        shipping_price_gross_amount: String(taxData.shippingPrice.amount),
        shipping_price_net_amount: String(taxData.shippingPrice.amount),
        shipping_tax_rate: "0",
        lines: taxData.lines.map((line) => ({
          tax_rate: "0",
          total_gross_amount: String(line.totalPrice.amount),
          total_net_amount: String(line.totalPrice.amount),
        })),
      };
      return { body: { data: data }, status: 200 };
    }
    const shipping = taxResponse.lines.find(
      (line) => line.itemCode === "Shipping"
    );
    const shippingDiscount = shipping?.discountAmount || 0;
    const shippingNet =
      (shipping?.lineAmount
        ? shipping.lineAmount
        : taxData.shippingPrice.amount) - shippingDiscount;
    const shippingTax = shipping?.tax ? shipping.tax : 0;
    const taxRate = shipping?.details.reduce(
      (currentRate, detail) => currentRate + (detail?.rate || 0),
      0
    );
    const data: ResponseTaxPayload = {
      shipping_price_gross_amount: (shippingNet + shippingTax).toFixed(2),
      shipping_price_net_amount: shippingNet.toFixed(2),
      // Tax rate send to Saleor should be in decimal.
      // when tax rate is 23%, the value that we send should be
      // taxRate = 23
      shipping_tax_rate: ((taxRate || 0) * 100).toFixed(2),
      lines: lines
        .filter((line) => line.itemCode !== "Shipping")
        .map((line) => {
          const lineTax = taxResponse.lines.find(
            (taxLine) => taxLine?.lineNumber === line.id
          );
          const discountAmount = lineTax?.discountAmount || 0;
          const totalNetAmount =
            (lineTax?.lineAmount || line.totalAmount) - discountAmount;
          const totalTaxAmount = lineTax?.tax || 0;
          const totalGrossAmount = totalNetAmount + totalTaxAmount;
          const lineTaxRate = line.chargeTaxes
            ? lineTax?.details.reduce(
                (currentRate, detail) => currentRate + (detail?.rate || 0),
                0
              )
            : 0;
          return {
            total_gross_amount: totalGrossAmount.toFixed(2),
            total_net_amount: totalNetAmount.toFixed(2),
            // Tax rate send to Saleor should be in decimal.
            // when tax rate is 23%, the value that we send should be
            // taxRate = 23
            tax_rate: ((lineTaxRate || 0) * 100).toFixed(2),
          };
        }),
    };
    return { body: data, status: 200 };
  } catch (error) {
    const error_msg = `Failed to fetch Avatax response ${error}`;
    console.warn(error_msg);
    return { body: { error: { message: error_msg } }, status: 404 };
  }
};

export const calculateTaxesHandler = async (
  taxObject: TaxBaseSubscriptionFragment,
  saleorDomain: string
) => {
  const avataxConfig = await getAvataxConfig(
    saleorDomain,
    taxObject.channel.slug
  );
  const validData = avataxConfigIsValidToUse(avataxConfig);

  if (!validData.isValid) {
    return {
      body: { error: { message: validData.message } },
      status: validData.status,
    };
  }

  const validTaxObject = taxObjectIsValidToUse(taxObject);
  if (!validTaxObject.isValid) {
    return {
      body: { error: { message: validData.message } },
      status: validData.status,
    };
  }
  return await calculateTaxes(taxObject, avataxConfig);
};

export const createTransaction = async (
  order: OrderSubscriptionFragment,
  avataxConfig: AvataxConfig
) => {
  const lines = prepareOrderCreatedLinesPayload(order);
  const address = order.shippingAddress || order.billingAddress;
  const payload: FetchTaxesPayload = {
    code: order.number,
    address: {
      line1: address!.streetAddress1,
      line2: address!.streetAddress2,
      line3: "",
      city: address!.city,
      region: address!.countryArea,
      country: address!.country.code,
      postalCode: address!.postalCode,
      locationCode: "",
    },
    discount: 0,
    date: order.created,
    currency: order.total.currency,
    // FIXME: After introducing simple taxes we will be able to determine
    // this value by fetching tax settings for taxes.
    pricesEnteredWithTax: true,
    lines: lines,
  };
  try {
    await fetchTaxes(payload, avataxConfig, "SalesInvoice");
    return { body: {}, status: 200 };
  } catch (error) {
    const error_msg = `Failed to send order to Avatax: ${error}`;
    console.error(error_msg);
    return { body: { error: { message: error_msg } }, status: 404 };
  }
};
