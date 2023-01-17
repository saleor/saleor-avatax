export type FetchTaxesLinePayload = {
  id: string;
  quantity: number;
  taxCode?: string | null;
  discounted: boolean;
  chargeTaxes: boolean;
  totalAmount: number;
  itemCode: string;
  description: string;
};
export type FetchTaxesPayload = {
  code?: string;
  address: FetchTaxesAddressPayload;
  discount: number;
  date: string;
  currency: string;
  pricesEnteredWithTax: boolean;
  lines: Array<FetchTaxesLinePayload>;
};
export type FetchTaxesAddressPayload = {
  line1: string;
  line2: string;
  line3: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  locationCode: string;
};
export interface LineTaxResponsePayload {
  total_gross_amount: string;
  total_net_amount: string;
  tax_rate: string;
}

export interface ResponseTaxPayload {
  shipping_price_gross_amount: string;
  shipping_price_net_amount: string;
  shipping_tax_rate: string;
  lines: Array<LineTaxResponsePayload>;
}

// FIXME:
export interface AvataxAddress {
  fromCountry: string;
  fromZip: string;
  fromState: string;
  fromCity: string;
  fromStreet: string;
}

export interface AvataxConfig {
  shipFrom: AvataxAddress;
  account: string;
  password: string;
  companyCode: string;
  sandbox: boolean;
  active: boolean;
}
