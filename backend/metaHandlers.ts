import { graphQLUrl } from "@saleor/app-sdk/urls";
import {
  FetchAppMetafieldsDocument,
  FetchAppMetafieldsQuery,
  FetchAppMetafieldsQueryVariables,
} from "../generated/graphql";
import { getAuthToken } from "../lib/environment";
import { createClient } from "../lib/graphql";

import { MetadataInput } from "@/generated/graphql";
import {
  ChannelConfigurationPayload,
  ConfigurationMetadata,
  ConfigurationPayload,
} from "@/types/api";
import { reduce } from "lodash";
import {
  decryptConfiguration,
  encryptConfiguration,
  PLACEHOLDER,
} from "./encryption";

export const prepareMetadataFromRequest = (
  input: ConfigurationPayload,
  currentChannelsConfigurations: ConfigurationPayload | null
): MetadataInput[] => {
  return Object.entries(input).map(([channelSlug, configuration]) => {
    const encryptedConfiguration = encryptConfiguration(
      reduce(
        configuration,
        (result, value, key) => {
          const currentConfiguration =
            currentChannelsConfigurations?.[channelSlug];
          if (
            currentConfiguration?.password &&
            configuration.password.startsWith(PLACEHOLDER) &&
            key === "password"
          ) {
            value = currentConfiguration.password;
          }
          return {
            ...result,
            [key as keyof ChannelConfigurationPayload]: value,
          };
        },
        {} as ChannelConfigurationPayload
      )
    );
    return { key: channelSlug, value: JSON.stringify(encryptedConfiguration) };
  });
};
export const prepareResponseFromMetadata = (
  input: ConfigurationMetadata,
  channelsIds: string[],
  obfuscateEncryptedData: boolean
): ConfigurationPayload => {
  if (!channelsIds) {
    return {};
  }

  return channelsIds.reduce((config, channelSlug) => {
    const item = input[channelSlug];
    const parsedConfiguration = item ? JSON.parse(item) : {};
    const {
      active,
      account,
      password,
      sandbox,
      shipFromCity,
      shipFromCountry,
      shipFromState,
      shipFromStreet,
      shipFromZip,
    } = decryptConfiguration(parsedConfiguration, obfuscateEncryptedData);

    return {
      ...config,
      [channelSlug]: {
        active: active || false,
        account: account || "",
        password: password || "",
        sandbox: sandbox || true,
        shipFromCity: shipFromCity || "",
        shipFromCountry: shipFromCountry || "",
        shipFromState: shipFromState || "",
        shipFromStreet: shipFromStreet || "",
        shipFromZip: shipFromZip || "",
      },
    };
  }, {} as ConfigurationPayload);
};

export const fetchChannelsSettings = async (
  saleorDomain: string,
  channelSlugs: string[]
) => {
  const saleorUrl = graphQLUrl(saleorDomain);
  const client = createClient(
    saleorUrl,
    async () => await Promise.resolve({ token: getAuthToken() })
  );

  const privateMetadata = (
    await client
      .query<FetchAppMetafieldsQuery, FetchAppMetafieldsQueryVariables>(
        FetchAppMetafieldsDocument,
        {
          keys: channelSlugs,
        }
      )
      .toPromise()
  ).data?.app?.privateMetafields;
  return privateMetadata
    ? prepareResponseFromMetadata(privateMetadata, channelSlugs, false)
    : null;
};

export const validateConfigurationBeforeSave = (
  channelsConfiguration: ConfigurationPayload
) => {
  const activeWithoutApiKeys = Object.entries(channelsConfiguration)
    .filter(
      ([, configuration]) =>
        configuration.active &&
        (!configuration.password || configuration.password === PLACEHOLDER)
    )
    .map(([channelSlug]) => channelSlug);
  if (activeWithoutApiKeys.length !== 0) {
    console.log(
      "Avatax cannot be active for the channel as password is missing."
    );
    return {
      message: `Avatax App cannot be active for channel: ${activeWithoutApiKeys.toString()}. The password is missing.`,
      isValid: false,
    };
  }
  return {
    isValid: true,
  };
};
