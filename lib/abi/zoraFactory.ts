import { parseAbi, parseAbiParameters } from "viem";

// Shared human-readable parameters (kept exactly as used with Index Supply)
export const COIN_CREATED_V4_PARAMETERS =
  "address indexed caller, address indexed payoutRecipient, address indexed platformReferrer, address currency, string uri, string name, string symbol, address coin, (address,address,uint24,int24,address) poolKey, bytes32 poolKeyHash, string version" as const;

// Index Supply expects just the signature without the `event` keyword
export const INDEX_SUPPLY_EVENT_SIGNATURE =
  `CoinCreatedV4 (${COIN_CREATED_V4_PARAMETERS})` as const;

export const CoinCreatedV4Abi = parseAbi([
  `event CoinCreatedV4(${COIN_CREATED_V4_PARAMETERS})`,
]);

// Non-indexed parameters only, in order – matches original tuple syntax
export const CoinCreatedV4NonIndexedParams = parseAbiParameters(
  "address currency, string uri, string name, string symbol, address coin, (address,address,uint24,int24,address) poolKey, bytes32 poolKeyHash, string version",
);

export const CoinCreatedV4EventName = "CoinCreatedV4" as const;
