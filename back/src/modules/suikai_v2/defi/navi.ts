import dotenv from "dotenv";
dotenv.config();
import { Sui, USDT, nUSDC, NAVX } from "navi-sdk/dist/address";
import { CoinInfo } from "navi-sdk";
import { account_v3, client } from "../config/account";

const account = account_v3;

const AutoDefi_Token: CoinInfo[] = [
  Sui,
  NAVX,
  nUSDC,
  // nUSDC就是通常意义上的USDC
];

export async function getNAVIPortfolio() {
  const portfolio = await account.getNAVIPortfolio(account.address);

  for (const coin of AutoDefi_Token) {
    const coinBalance = portfolio.get(coin.symbol)?.supplyBalance || 0;
  }
}

async function stakeAllCoins() {}

async function unstakeAllCoins() {}

async function test() {
  console.log("Account address:", account.address);

  //   Deposit 1 sui
  //   console.log("deposit 1 sui on navi");
  //   await account.depositToNavi(Sui, 1 * 10 ** Sui.decimal);

  //   Withdraw 1 sui
  //   console.log(`Withdraw 1 sui --`);
  //   await account.withdraw(Sui, 1 * 10 ** Sui.decimal);

  //   Claim all rewards
  //   console.log(`Claim all rewards --`);
  //   account.claimAllRewards();

  // Balance
  console.log(`Balance --`);
  const balance = await account.getWalletBalance();
  console.log(balance);

  console.log(`Navi Portfolio --`);
  const portfolio = await account.getNAVIPortfolio(account.address, true);
  // Retrieves NAVI positions for the specified address, or defaults to the account address
  portfolio.forEach((position, key) => {
    if (position.supplyBalance > 0) {
      console.log(key, position);
    }
  });

  //   console.log(`Health Factor --`);
  //   const healthFactor = await account.getHealthFactor(account.address);
  //   console.log(healthFactor);

  console.log(`Address available rewards --`);
  const rewards = await client.getAddressAvailableRewards(account.address);
  rewards.forEach((reward) => {
    console.log(reward);
  });

  //   console.log(`Pool info --`);
  //   //   boosted APY is wrong. Just use normal APY instead.
  //   const pool = await client.getPoolInfo();
  //   console.log(pool);
}
