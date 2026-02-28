#!/bin/bash

ROUTES=(
  "markets/cme-cots|CME COTs|Commitments of Traders data"
  "markets/companies|Companies|Public company treasury and equity data"
  "markets/exchange-tokens|Exchange Tokens|CEX and DEX token performance"
  "markets/sports-tokens|Sports Tokens|Fan token analytics"
  "etfs/solana|Solana ETFs|SOL ETF flows"
  "etfs/xrp|XRP ETFs|XRP ETF flows"
  "etfs/crypto|Crypto ETFs|Broad crypto ETF metrics"
  "treasuries/bitcoin|Bitcoin Treasuries|Corporate BTC holdings"
  "treasuries/ethereum|Ethereum Treasuries|Corporate ETH holdings"
  "treasuries/solana|Solana Treasuries|Corporate SOL holdings"
  "treasuries/crypto|Crypto Treasuries|Corporate crypto holdings"
  "stablecoins/non-usd|Non-USD Pegged|Euro, GBP, and other fiat stablecoins"
  "stablecoins/non-fiat|Non-Fiat Pegged|Commodity and algorithmic stablecoins"
  "onchain/avalanche|Avalanche On-Chain|AVAX network metrics"
  "onchain/aptos|Aptos On-Chain|APT network metrics"
  "onchain/comparison|Network Comparison|Cross-chain metrics"
  "scaling/l1-evm|EVM Blockchains|Layer 1 EVM data"
  "scaling/l1-non-evm|Non-EVM Blockchains|Layer 1 alternative VM data"
  "scaling/data-availability|Data Availability|Celestia and DA layer metrics"
  "defi/restaking|Restaking|EigenLayer and liquid restaking"
  "defi/launchpads|Launchpads|IDO and token generation events"
  "defi/prediction|Prediction Markets|Polymarket and betting volumes"
  "defi/derivatives|Derivatives|On-chain perps and options"
  "defi/rwa|Real World Assets|Tokenized treasuries and assets"
  "defi/exploits|Exploits & Hacks|DeFi security tracker"
  "defi/social|SocialFi|Farcaster and Lens metrics"
  "nfts/art|Art & Collectibles|PFP and generative art volumes"
  "nfts/gaming|Web3 Gaming|GameFi asset metrics"
  "nfts/marketplaces|NFT Marketplaces|Blur, OpenSea, and MagicEden comparison"
)

for ROUTE in "${ROUTES[@]}"; do
  IFS="|" read PATH_NAME TITLE DESC <<< "$ROUTE"
  mkdir -p "src/app/data/$PATH_NAME"
  cat > "src/app/data/$PATH_NAME/page.tsx" << INNER_EOF
import React from 'react';
import { DataHeader } from '../../_components/DataHeader';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export const metadata = { title: '${TITLE} | CryptoBrainNews' };

export default function PremiumPage() {
  return (
    <div className="space-y-8 pb-20">
      <DataHeader title="${TITLE}" description="${DESC}" />
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] flex flex-col items-center justify-center py-32 px-4 text-center rounded-xl shadow-2xl">
        <div className="w-16 h-16 bg-[#111] border border-[#333] rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Lock className="text-[#FABF2C] w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Premium Institutional Feed</h2>
        <p className="text-[#888] font-mono text-xs max-w-md mx-auto mb-8 leading-relaxed">
          Access to real-time ${TITLE} requires a CryptoBrain Alpha subscription.
        </p>
        <Link href="/go-alpha" className="bg-[#FABF2C] text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors rounded-sm">
          Unlock Alpha Access
        </Link>
      </div>
    </div>
  );
}
INNER_EOF
  echo "Created: src/app/data/$PATH_NAME/page.tsx"
done
