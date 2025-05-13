import { swap } from "./swap";
import { APT, USDC } from "@/src/modules/use-v2/config/apt/coin";

async function testUSDCtoAPT() {
  const inputAmount = 1;
  const fromCoinAddress = USDC.coinType;
  const toCoinAddress = APT.coinType;
  const fromDecimals = USDC.decimals;
  const fromName = USDC.coinName;
  const toName = APT.coinName;

  await swap({
    inputAmount,
    fromCoinAddress,
    toCoinAddress,
    fromDecimals,
    fromName,
    toName,
  });
}

testUSDCtoAPT();
