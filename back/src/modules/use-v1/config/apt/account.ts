import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  SigningSchemeInput,
} from "@aptos-labs/ts-sdk";
import Panora, { PanoraConfig } from "@panoraexchange/swap-sdk";
import * as dotenv from "dotenv";
dotenv.config();

export const account = Account.fromDerivationPath({
  mnemonic: process.env.APTS_WORDS || "",
  path: "m/44'/637'/0'/0'/0'",
  scheme: SigningSchemeInput.Ed25519,
});
const config: PanoraConfig = {
  apiKey: "a4^KV_EaTf4MW#ZdvgGKX#HUD^3IFEAOV_kzpIE^3BQGA8pDnrkT7JcIy#HNlLGi",
};

const aptosConfig = new AptosConfig({ network: Network.MAINNET });
export const aptosClient = new Aptos(aptosConfig);

export const panoraClient = new Panora(config);
//   console.log(account.accountAddress.toString());
