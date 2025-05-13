import { NAVISDKClient } from "navi-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const mnemonic = process.env.SUI_WORDS;
const rpc = process.env.RPC;
export const client = new NAVISDKClient({
  mnemonic: mnemonic,
  networkType: rpc,
});

export const account_v3 = client.accounts[0];
