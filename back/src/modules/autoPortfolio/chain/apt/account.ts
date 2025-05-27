import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  SigningSchemeInput,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";
import Panora, { PanoraConfig } from "@panoraexchange/swap-sdk";
import { initHyperionSDK, HyperionSDK } from "@hyperionxyz/sdk";
import { getHolding_apt } from "./getHolding";
import { OnChainCoin } from "../../type";

import * as dotenv from "dotenv";
dotenv.config();

// export const account = Account.fromDerivationPath({
//   mnemonic: process.env.APTS_WORDS || "",
//   path: "m/44'/637'/0'/0'/0'",
//   scheme: SigningSchemeInput.Ed25519,
// });

// const privateKey = new Ed25519PrivateKey(process.env.APTS_SECRET_KEY || "");

// export const account = Account.fromPrivateKey({
//   privateKey: privateKey,
// });

// let aptosAccount: Account;

// export function getAptosAccount({
//   privateKey,
// }: {
//   privateKey: string;
// }): Account {
//   if (!aptosAccount) {
//     // const privateKey = new Ed25519PrivateKey(process.env.APTS_SECRET_KEY || "");
//     if (!privateKey) {
//       throw new Error("Private key is required to create an Aptos account.");
//     }
//     const ed25519PrivateKey = new Ed25519PrivateKey(privateKey);
//     aptosAccount = Account.fromPrivateKey({
//       privateKey: ed25519PrivateKey,
//     });
//   }
//   return aptosAccount;
// }

interface AptosAccountManagerConfig {
  privateKey: string;
  panoraApiKey?: string;
}
export class AptosAccountManager {
  public account: Account;
  public aptosClient: Aptos;
  public panoraClient: Panora;
  public hyperionSdk: HyperionSDK;

  constructor(config: AptosAccountManagerConfig) {
    if (!config.privateKey) {
      throw new Error("Private key is required to create an Aptos account.");
    }
    this.account = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(config.privateKey),
    });

    this.aptosClient = new Aptos(new AptosConfig({ network: Network.MAINNET }));
    this.panoraClient = new Panora({
      apiKey:
        config.panoraApiKey ||
        "a4^KV_EaTf4MW#ZdvgGKX#HUD^3IFEAOV_kzpIE^3BQGA8pDnrkT7JcIy#HNlLGi",
    });
    this.hyperionSdk = initHyperionSDK({ network: Network.MAINNET });
  }

  async getHolding({ selectPortfolio }: { selectPortfolio: OnChainCoin[] }) {
    const holding = await getHolding_apt(this, {
      select_portfolio: selectPortfolio,
    });
    return holding;
  }
}
