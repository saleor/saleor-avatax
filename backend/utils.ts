import { TaxBaseSubscriptionFragment } from "@/generated/graphql";
import { fetchChannelsSettings } from "./metaHandlers";
import { AvataxConfig } from "./types";

export const getAvataxConfig = async (
  saleorDomain: string,
  channelSlug: string
) => {
  const settings = await fetchChannelsSettings(saleorDomain, [channelSlug]);

  type ConfigurationPayloadKey = keyof typeof settings;
  const channelKey = channelSlug as ConfigurationPayloadKey;
  const channelSettings = settings?.[channelKey];

  const avataxConfig: AvataxConfig = {
    shipFrom: {
      fromCountry: channelSettings?.shipFromCountry || "",
      fromZip: channelSettings?.shipFromZip || "",
      fromState: channelSettings?.shipFromState || "",
      fromCity: channelSettings?.shipFromCity || "",
      fromStreet: channelSettings?.shipFromStreet || "",
    },
    account: channelSettings?.account || "",
    password: channelSettings?.password || "",
    sandbox: channelSettings?.sandbox || true,
    active: channelSettings?.active || false,
    companyCode: channelSettings?.companyCode || "DEFAULT",
  };
  return avataxConfig;
};

export const avataxConfigIsValidToUse = (avataxConfig: AvataxConfig) => {
  const defaultResponse = {
    isValid: true,
    status: 200,
    message: "",
  };

  if (!avataxConfig.active) {
    console.log("Avatax is not active.");
    return {
      ...defaultResponse,
      message: "Avatax is not active.",
      isValid: false,
    };
  } else if (!avataxConfig.password) {
    console.log("Avatax password was not provided.");

    return {
      message: "Avatax password was not provided.",
      status: 404,
      isValid: false,
    };
  }

  return {
    ...defaultResponse,
    message: "",
  };
};

export const taxObjectIsValidToUse = (
  taxObject: TaxBaseSubscriptionFragment
) => {
  const defaultResponse = {
    isValid: true,
    status: 200,
    message: "",
  };
  if (!taxObject.address) {
    console.log("Missing address in provided tax object");
    return {
      isValid: false,
      status: 404,
      message: "Missing address.",
    };
  }

  const orderLineWithoutVariant = taxObject.lines.filter(
    (line) =>
      line.sourceLine.__typename === "OrderLine" && !line.sourceLine.variant
  );
  if (orderLineWithoutVariant.length !== 0) {
    return {
      isValid: false,
      status: 404,
      message: "Can't calculate taxes. Variant doesn't exists.",
    };
  }
  return defaultResponse;
};
