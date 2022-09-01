/** @jest-environment setup-polly-jest/jest-environment-node */

import { PollyServer } from "@pollyjs/core";
import * as joseModule from "jose";
import { NextApiRequest, NextApiResponse } from "next";
import toNextHandler from "../../../pages/api/webhooks/order-created";
import { setupPollyMiddleware, setupRecording } from "../../pollySetup";
import {
  dummyOrderCreatedPayload,
  mockRequest,
  dummyFetchTaxesResponse,
} from "../../utils";
import Avatax from "ava-typescript";

jest.mock("next/dist/compiled/raw-body/index.js", () => ({
  __esModule: true,
  default: jest.fn((_) => ({
    toString: () => '{"dummy":12}',
  })),
}));

const testDomain = "localhost:8000";
describe("api/webhooks/order-created", () => {
  const context = setupRecording();
  beforeEach(() => {
    process.env.SALEOR_DOMAIN = testDomain;
    const server = context.polly.server;
    setupPollyMiddleware(server as unknown as PollyServer);
  });

  it("rejects when saleor domain is missing", async () => {
    const mockedCreateTransaction = jest
      .spyOn(Avatax.prototype, "createTransaction")
      .mockResolvedValue(dummyFetchTaxesResponse);

    const domain = undefined;
    const { req, res } = mockRequest({
      method: "POST",
      event: "order_created",
      domain,
    });

    const orderPayload = dummyOrderCreatedPayload;
    req.body = orderPayload;

    await toNextHandler(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse
    );

    expect(res.statusCode).toBe(400);
    expect(mockedCreateTransaction).not.toHaveBeenCalled();

    mockedCreateTransaction.mockRestore();
  });

  it("rejects when saleor event is missing", async () => {
    const mockedCreateTransaction = jest
      .spyOn(Avatax.prototype, "createTransaction")
      .mockResolvedValue(dummyFetchTaxesResponse);

    const event = undefined;
    const { req, res } = mockRequest({
      method: "POST",
      event,
      domain: testDomain,
    });

    const orderPayload = dummyOrderCreatedPayload;
    req.body = orderPayload;

    await toNextHandler(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse
    );

    expect(res.statusCode).toBe(400);
    expect(mockedCreateTransaction).not.toHaveBeenCalled();

    mockedCreateTransaction.mockRestore();
  });

  it.skip("rejects when saleor signature is empty", async () => {
    const mockedCreateTransaction = jest
      .spyOn(Avatax.prototype, "createTransaction")
      .mockResolvedValue(dummyFetchTaxesResponse);

    const signature = undefined;
    const { req, res } = mockRequest({
      method: "POST",
      event: "order_created",
      domain: testDomain,
      signature,
    });

    // set body to undefined as the webhook handler expects that
    // the processed body doesn't exist.
    req.body = undefined;

    await toNextHandler(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse
    );

    expect(res.statusCode).toBe(400);
    expect(mockedCreateTransaction).not.toHaveBeenCalled();

    mockedCreateTransaction.mockRestore();
  });

  it("rejects when saleor signature is incorrect", async () => {
    const mockedCreateTransaction = jest
      .spyOn(Avatax.prototype, "createTransaction")
      .mockResolvedValue(dummyFetchTaxesResponse);

    const orderPayload = dummyOrderCreatedPayload;
    // set mock on next built-in library that build the payload from stream.
    const rawBodyModule = require("next/dist/compiled/raw-body/index.js");
    rawBodyModule.default.mockReturnValue({
      toString: () => JSON.stringify(orderPayload),
    });

    const signature = "incorrect-sig";
    const { req, res } = mockRequest({
      method: "POST",
      event: "order_created",
      domain: testDomain,
      signature,
    });

    // set body to undefined as the webhook handler expects that
    // the processed body doesn't exist.
    req.body = undefined;

    await toNextHandler(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse
    );

    expect(res.statusCode).toBe(400);
    expect(mockedCreateTransaction).not.toHaveBeenCalled();

    mockedCreateTransaction.mockRestore();
  });

  it("creates transaction on Avatax side for new order", async () => {
    const { req, res } = mockRequest({
      method: "POST",
      event: "order_created",
      domain: testDomain,
      signature:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6..-Y1p0YWNAuX0kOPIhfjoNoyWAkvRl6iMxWQ",
    });

    const mockJose = jest
      .spyOn(joseModule, "flattenedVerify")
      .mockResolvedValue(
        {} as unknown as joseModule.FlattenedVerifyResult &
          joseModule.ResolvedKey
      );

    const orderPayload = dummyOrderCreatedPayload;

    // set mock on next built-in library that build the payload from stream.
    const rawBodyModule = require("next/dist/compiled/raw-body/index.js");
    rawBodyModule.default.mockReturnValue({
      toString: () => JSON.stringify(orderPayload),
    });
    // set body to undefined as the webhook handler expects that
    // the processed body doesn't exist.
    req.body = undefined;

    await toNextHandler(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse
    );

    expect(res.statusCode).toBe(200);

    mockJose.mockRestore();
  });
});
