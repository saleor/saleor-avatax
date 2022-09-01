import Avatax from "ava-typescript";
import { AvataxConfig, FetchTaxesPayload } from "./types";
import { DocumentType } from "ava-typescript/lib/enums/DocumentType";

const getAvataxClient = (avataxConfig: AvataxConfig) =>
  new Avatax({
    appName: "Saleor",
    appVersion: "1.0",
    environment: avataxConfig.sandbox ? "sandbox" : "production",
    machineName: "Saleor-Avatax",
    timeout: 4000,
  }).withSecurity({
    username: avataxConfig.account,
    password: avataxConfig.password,
  });

export const fetchTaxes = async (
  taxPayload: FetchTaxesPayload,
  avataxConfig: AvataxConfig,
  transactionType: string
) => {
  const type =
    transactionType === "SalesInvoice"
      ? DocumentType.SalesInvoice
      : DocumentType.SalesOrder;
  const client = getAvataxClient(avataxConfig);
  const address = taxPayload.address!;
  const response = await client.createTransaction({
    model: {
      type: type,
      companyCode: avataxConfig.companyCode,
      code: taxPayload.code || "",
      date: new Date(taxPayload.date),
      customerCode: "0",
      discount: taxPayload.discount,
      commit: false,
      currencyCode: taxPayload.currency,
      // @ts-ignore Avatax typing requires unneeded fields as mandatory.
      lines: taxPayload.lines.map((line) => ({
        number: line.id,
        quantity: line.quantity,
        amount: line.totalAmount,
        itemCode: line.itemCode,
        taxCode: line.taxCode,
        description: line.description,
        taxIncluded: taxPayload.pricesEnteredWithTax,
        discounted: line.discounted,
        taxOverride: !line.chargeTaxes
          ? {
              type: "taxAmount",
              taxAmount: 0,
              reason: "Charge taxes for this product are turned off.",
            }
          : undefined,
      })),
      // @ts-ignore Avatax typing requires to provide not mandatory fields.
      addresses: {
        shipTo: address,
        // @ts-ignore Avatax typing requires to provide not mandatory fields.
        shipFrom: {
          line1: avataxConfig.shipFrom.fromStreet,
          line2: "",
          line3: "",
          city: avataxConfig.shipFrom.fromCity,
          region: avataxConfig.shipFrom.fromState,
          country: avataxConfig.shipFrom.fromCountry,
          postalCode: avataxConfig.shipFrom.fromZip,
        },
      },
    },
  });
  return response;
};
