import { TaxBaseSubscriptionFragment } from "@/generated/graphql";
import { createMocks, RequestMethod } from "node-mocks-http";
import { AvataxConfig, FetchTaxesPayload } from "../backend/types";
import { DocumentType } from "ava-typescript/lib/enums/DocumentType";
import { TransactionModel } from "ava-typescript/models";
import { BoundaryLevel } from "ava-typescript/lib/enums/BoundaryLevel";
import { DocumentStatus } from "ava-typescript/lib/enums/DocumentStatus";
import { JurisdictionType } from "ava-typescript/lib/enums/JurisdictionType";
import { RateType } from "ava-typescript/lib/enums/RateType";

type RequestConfiguration = {
  method: RequestMethod;
  event?: string;
  domain?: string;
  signature?: string;
};
export const mockRequest = (configuration: RequestConfiguration) => {
  const method = configuration.method;
  const { req, res } = createMocks({ method });
  req.headers = {
    "content-type": "application/json",
  };
  if (configuration.domain !== undefined) {
    req.headers["saleor-domain"] = configuration.domain;
  }
  if (configuration.event !== undefined) {
    req.headers["saleor-event"] = configuration.event;
  }
  if (configuration.signature !== undefined) {
    req.headers["saleor-signature"] = configuration.signature;
  }

  return { req, res };
};
export const dummyCalculateTaxesPayloadForCheckout: TaxBaseSubscriptionFragment =
  {
    currency: "USD",
    channel: { slug: "default-channel" },
    pricesEnteredWithTax: true,
    sourceObject: {
      __typename: "Checkout",
      id: "Q2hlY2tvdXQ6NzA0MzFhMDQtNWQzYy00YTdmLTlmNjItM2UzZmE3NzY1ZWZl",
      date: "2022-08-31T07:10:25.385722+00:00",
    },
    discounts: [],
    address: {
      streetAddress1: "Teczowa 777",
      streetAddress2: "",
      city: "Wroclaw",
      country: { code: "PL" },
      countryArea: "",
      postalCode: "53-601",
    },
    shippingPrice: { amount: 12.3 },
    lines: [
      {
        chargeTaxes: true,
        sourceLine: {
          __typename: "CheckoutLine",
          id: "Q2hlY2tvdXRMaW5lOmEyYzdiZWY1LWY4NjUtNDQ1OS05NWIyLTk5Yjg3YzcyZDQ5MQ==",
          productVariant: {
            id: "UHJvZHVjdFZhcmlhbnQ6MzQ4",
            sku: "328223580",
            name: "S",
            product: { metafield: null, productType: { metafield: null } },
          },
        },
        quantity: 3,
        totalPrice: { amount: 60 },
      },
    ],
  };

export const dummyCalculateTaxesPayloadForOrder: TaxBaseSubscriptionFragment = {
  currency: "USD",
  channel: { slug: "default-channel" },
  pricesEnteredWithTax: true,
  sourceObject: {
    __typename: "Order",
    id: "T3JkZXI6MGUwMzNiYjktNWJhMy00ZmVmLWI2OGMtYmNiNzQ0ZjAyNGMz",
    date: "2022-08-31T10:26:05.832256+00:00",
  },
  discounts: [],
  address: {
    streetAddress1: "Teczowa 777",
    streetAddress2: "",
    city: "Wroclaw",
    country: { code: "PL" },
    countryArea: "",
    postalCode: "53-601",
  },
  shippingPrice: { amount: 12.3 },
  lines: [
    {
      chargeTaxes: true,
      sourceLine: {
        __typename: "OrderLine",
        id: "T3JkZXJMaW5lOmEwYTM0MWJmLWI3ZjMtNDIzYS04MjJiLTZhYTdkMTYzNDllOQ==",
        productSku: "328223580",
        productName: "Monospace Tee",
        variant: {
          id: "UHJvZHVjdFZhcmlhbnQ6MzQ4",
          product: { metafield: null, productType: { metafield: null } },
        },
      },
      quantity: 3,
      totalPrice: { amount: 60 },
    },
  ],
};

export const dummyFetchTaxesPayload: FetchTaxesPayload = {
  code: "234",
  address: {
    line1: "Teczowa 777",
    line2: "",
    line3: "",
    city: "Wroclaw",
    region: "Dolnoslaskie",
    country: "PL",
    postalCode: "53-601",
    locationCode: "",
  },
  discount: 10,
  date: "2022-05-04",
  currency: "USD",
  pricesEnteredWithTax: true,
  lines: [
    {
      id: "1",
      quantity: 1,
      taxCode: "",
      discounted: true,
      chargeTaxes: true,
      totalAmount: 20,
      itemCode: "sku123",
      description: "Apple Juice",
    },
    {
      id: "",
      quantity: 1,
      taxCode: "FR000000",
      discounted: true,
      chargeTaxes: true,
      totalAmount: 10,
      itemCode: "Shipping",
      description: "",
    },
  ],
};

export const dummyFetchTaxesResponse: TransactionModel = {
  id: 0,
  code: "cef4769e-4aff-401d-9d0b-460b40a687201",
  companyId: 7799660,
  date: new Date("2022-05-04"),
  paymentDate: new Date("2022-05-04"),
  status: DocumentStatus.Temporary,
  type: DocumentType.SalesOrder,
  batchCode: "",
  currencyCode: "GBP",
  exchangeRateCurrencyCode: "GBP",
  customerUsageType: "",
  entityUseCode: "",
  customerVendorCode: "0",
  customerCode: "0",
  exemptNo: "",
  reconciled: false,
  locationCode: "",
  reportingLocationCode: "",
  purchaseOrderNo: "",
  referenceCode: "",
  salespersonCode: "",
  totalAmount: 18.82,
  totalExempt: 0.0,
  totalDiscount: 0.0,
  totalTax: 1.18,
  totalTaxable: 18.82,
  totalTaxCalculated: 1.18,
  locked: false,
  version: 1,
  exchangeRateEffectiveDate: new Date("2022-05-04"),
  exchangeRate: 1.0,
  email: "admin@example.com",
  modifiedDate: new Date("2022-05-04"),
  modifiedUserId: 6479978,
  taxDate: new Date("2022-05-04"),
  lines: [
    {
      id: 0,
      transactionId: 0,
      lineNumber: "1",
      customerUsageType: "",
      entityUseCode: "",
      description: "Apple Juice2",
      discountAmount: 0.0,
      exemptAmount: 0.0,
      exemptCertId: 0,
      exemptNo: "",
      isItemTaxable: true,
      itemCode: "21438541",
      lineAmount: 9.41,
      quantity: 1.0,
      ref1: "",
      ref2: "",
      reportingDate: new Date("2022-05-04"),
      tax: 0.59,
      taxableAmount: 9.41,
      taxCalculated: 0.59,
      taxCode: "PH400834",
      taxCodeId: 37453,
      taxDate: new Date("2022-05-04"),
      taxIncluded: true,
      details: [
        //@ts-ignore, avatax typing requires a fields that
        // doesn't exist in the response fetched from the API directly
        // The below line details are limited only to the fields that we use
        {
          id: 0,
          rate: 0.0625,
          tax: 0.59,
          taxableAmount: 9.41,
        },
      ],
      nonPassthroughDetails: [],
      hsCode: "",
      costInsuranceFreight: 0.0,
      vatCode: "",
      vatNumberTypeId: 0,
    },
    {
      id: 0,
      transactionId: 0,
      lineNumber: "2",
      customerUsageType: "",
      entityUseCode: "",
      description: "None",
      discountAmount: 0.0,
      exemptAmount: 0.0,
      exemptCertId: 0,
      exemptNo: "",
      isItemTaxable: true,
      itemCode: "Shipping",
      lineAmount: 9.41,
      quantity: 1.0,
      ref1: "",
      ref2: "",
      reportingDate: new Date("2022-05-04"),
      tax: 0.59,
      taxableAmount: 9.41,
      taxCalculated: 0.59,
      taxCode: "FR000000",
      taxCodeId: 8550,
      taxDate: new Date("2022-05-04"),
      taxIncluded: true,
      details: [
        //@ts-ignore, avatax typing requires a fields that
        // doesn't exist in the response fetched from the API directly
        // The below line details are limited only to the fields that we use
        {
          id: 0,
          rate: 0.0625,
          tax: 0.59,
          taxableAmount: 9.41,
        },
      ],
      nonPassthroughDetails: [],
      hsCode: "",
      costInsuranceFreight: 0.0,
      vatCode: "",
      vatNumberTypeId: 0,
    },
  ],
  addresses: [
    {
      id: 0,
      transactionId: 0,
      boundaryLevel: BoundaryLevel.Zip5,
      line1: "69 Place de la Gare",
      line2: "",
      line3: "",
      city: "Colomiers",
      region: "TX",
      postalCode: "78923",
      country: "US",
      taxRegionId: 200144,
      latitude: "",
      longitude: "",
      jurisdictions: [],
    },
    {
      id: 0,
      transactionId: 0,
      boundaryLevel: BoundaryLevel.Zip5,
      line1: "29 High Street",
      line2: "",
      line3: "",
      city: "New York",
      region: "NY",
      postalCode: "10001",
      country: "US",
      taxRegionId: 2088629,
      latitude: "40.748465",
      longitude: "-73.99311",
      jurisdictions: [],
    },
  ],
  summary: [
    {
      country: "US",
      region: "TX",
      jurisType: JurisdictionType.State,
      jurisCode: "48",
      jurisName: "TEXAS",
      taxAuthorityType: 45,
      stateAssignedNo: "",
      taxType: "Use",
      taxSubType: "U",
      taxName: "TX STATE TAX",
      rateType: RateType.General,
      taxable: 18.82,
      rate: 0.0625,
      tax: 1.18,
      taxCalculated: 1.18,
      nonTaxable: 0.0,
      exemption: 0.0,
      rateTypeCode: "",
      taxGroup: "",
    },
  ],
};

export const dummyOrderCreatedPayload = {
  __typename: "OrderCreated",
  order: {
    id: "T3JkZXI6MWUyZDNmZTItZWQyNy00OTY4LTk4ZmItNjg2YmI0YmExMTE0",
    userEmail: "brandon.ruiz@example.com",
    number: "29",
    created: "2022-08-25T06:48:12.681067+00:00",
    channel: { id: "Q2hhbm5lbDox", slug: "default-channel" },
    shippingAddress: {
      streetAddress1: "Teczowa 7",
      streetAddress2: "",
      city: "WROCLAW",
      countryArea: "",
      postalCode: "53-601",
      country: { code: "PL" },
    },
    billingAddress: {
      streetAddress1: "Teczowa 7",
      streetAddress2: "",
      city: "WROCLAW",
      countryArea: "",
      postalCode: "53-601",
      country: { code: "PL" },
    },
    discounts: [],
    total: { currency: "USD", net: { amount: 14.13 }, tax: { amount: 3.25 } },
    shippingPrice: { gross: { amount: 15.78 } },
    lines: [
      {
        productSku: null,
        productName: "Carrot Juice",
        quantity: 1,
        variant: {
          id: "UHJvZHVjdFZhcmlhbnQ6Mzg3",
          product: {
            chargeTaxes: false,
            metafield: null,
            productType: { metafield: null },
          },
        },
        totalPrice: { net: { amount: 1.3 }, gross: { amount: 1.6 } },
      },
    ],
  },
};

export const dummyAvataxConfig: AvataxConfig = {
  shipFrom: {
    fromCountry: "PL",
    fromZip: "50-601",
    fromState: "",
    fromCity: "Wroclaw",
    fromStreet: "Teczowa 7",
  },
  account: "12345",
  password: "dummyKey",
  companyCode: "DEFAULT",
  active: true,
  sandbox: true,
};
