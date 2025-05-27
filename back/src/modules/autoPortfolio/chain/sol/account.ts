import { Keypair } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import base58 from "bs58";

export const accountSOL = Keypair.fromSecretKey(
  base58.decode(process.env.SOL_PRIVATE_KEY || "")
);

export const connection = new Connection(
  "https://api.mainnet-beta.solana.com",
  "confirmed"
);
console.log("🔌 Connected to Devnet");
