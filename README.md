# This is Repo of AITOS

To start your AITOS, please do these step by step:

## create .env file

AITOS use .env file to set environment varibles.

## edit .env fild to set these varibless

```
# --- DB---
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# --- AI Provider ---
# Recommend use HUOSHAN as provider for its speed.
QWEN_API_KEY =
OPENAI_API_KEY=
DEEPSEEK_API_KEY=
HUOSHAN_API_KEY =


# --- APT ---
# mnemonic of APTS
APTS_WORDS =
# APT Address
NEXT_PUBLIC_APTOS_ADDRESS =


# --- TG Module ---
# Bot Token
TELEGRAM_TOKEN=

# Channel Id(If you want to use TG module in channel, you should have this)
USER_CHAT_ID=


# CoinMarketCap API (use in market analysis)
CMC_API_KEY =
```

## Run front & back

use `pnpm run front` and `pnpm run back` to start both front and back.

## Then enjoy
