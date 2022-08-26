import { OrderCreatedEventSubscriptionFragment } from "../../../generated/graphql";

import { withSaleorDomainMatch } from "@/lib/middlewares";
import { SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import {
  withSaleorEventMatch,
  withWebhookSignatureVerified,
} from "@saleor/app-sdk/middleware";
import type { Handler } from "retes";
import { toNextHandler } from "retes/adapter";
import { Response } from "retes/response";

const handler: Handler = (request) => {
  const saleorDomain = request.headers[SALEOR_DOMAIN_HEADER];

  const body: OrderCreatedEventSubscriptionFragment =
    typeof request.body === "string" ? JSON.parse(request.body) : request.body;

  if (body?.__typename === "OrderCreated") {
    console.log(body)    
  }
  return Response.BadRequest({
    success: false,
    message: "Incorrect payload event.",
  });
};

export default toNextHandler([
  withSaleorDomainMatch,
  withSaleorEventMatch("order_created"),
  withWebhookSignatureVerified(),
  handler,
]);

export const config = {
  api: {
    bodyParser: false,
  },
};
