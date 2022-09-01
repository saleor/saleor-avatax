import { AvataxConfig } from "../../backend/types";
import {
  dummyFetchTaxesPayload,
  dummyFetchTaxesResponse,
  dummyAvataxConfig,
} from "../utils";
import Avatax from "ava-typescript";
import { fetchTaxes } from "../../backend/avataxApi";

describe("Avatax API handlers", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("fetches taxes from avatax", async () => {
    const mockedCreateTransaction = jest
      .spyOn(Avatax.prototype, "createTransaction")
      .mockResolvedValue(dummyFetchTaxesResponse);

    const payload = dummyFetchTaxesPayload;
    const config: AvataxConfig = dummyAvataxConfig;

    await fetchTaxes(payload, config, "SalesOrder");

    expect(mockedCreateTransaction).toHaveBeenCalledWith({
      model: {
        type: 0,
        companyCode: "DEFAULT",
        code: "234",
        date: new Date("2022-05-04"),
        customerCode: "0",
        discount: 10,
        commit: false,
        currencyCode: "USD",
        lines: [
          {
            amount: 20,
            number: "1",
            description: "Apple Juice",
            discounted: true,
            itemCode: "sku123",
            quantity: 1,
            taxCode: "",
            taxIncluded: true,
            taxOverride: undefined,
          },
          {
            number: "",
            amount: 10,
            description: "",
            discounted: true,
            itemCode: "Shipping",
            quantity: 1,
            taxCode: "FR000000",
            taxIncluded: true,
          },
        ],
        addresses: {
          shipTo: {
            city: "Wroclaw",
            country: "PL",
            line1: "Teczowa 777",
            line2: "",
            line3: "",
            postalCode: "53-601",
            region: "Dolnoslaskie",
            locationCode: "",
          },
          shipFrom: {
            city: "Wroclaw",
            country: "PL",
            line1: "Teczowa 7",
            line2: "",
            line3: "",
            postalCode: "50-601",
            region: "",
          },
        },
      },
    });
    mockedCreateTransaction.mockRestore();
  });

  it("creates invoice on Avatax side", async () => {
    const mockedCreateTransaction = jest
      .spyOn(Avatax.prototype, "createTransaction")
      .mockResolvedValue(dummyFetchTaxesResponse);

    const payload = dummyFetchTaxesPayload;
    const config: AvataxConfig = dummyAvataxConfig;

    await fetchTaxes(payload, config, "SalesInvoice");

    expect(mockedCreateTransaction).toHaveBeenCalledWith({
      model: {
        type: 1,
        companyCode: "DEFAULT",
        code: "234",
        date: new Date("2022-05-04"),
        customerCode: "0",
        discount: 10,
        commit: false,
        currencyCode: "USD",
        lines: [
          {
            number: "1",
            amount: 20,
            description: "Apple Juice",
            discounted: true,
            itemCode: "sku123",
            quantity: 1,
            taxCode: "",
            taxIncluded: true,
          },
          {
            number: "",
            amount: 10,
            description: "",
            discounted: true,
            itemCode: "Shipping",
            quantity: 1,
            taxCode: "FR000000",
            taxIncluded: true,
          },
        ],
        addresses: {
          shipTo: {
            city: "Wroclaw",
            country: "PL",
            line1: "Teczowa 777",
            line2: "",
            line3: "",
            postalCode: "53-601",
            region: "Dolnoslaskie",
            locationCode: "",
          },
          shipFrom: {
            city: "Wroclaw",
            country: "PL",
            line1: "Teczowa 7",
            line2: "",
            line3: "",
            postalCode: "50-601",
            region: "",
          },
        },
      },
    });
    mockedCreateTransaction.mockRestore();
  });
});
