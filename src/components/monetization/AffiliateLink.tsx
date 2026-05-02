// src/components/monetization/AffiliateLink.tsx
import React from 'react';

const AFFILIATES: Record<string, string> = {
  binance: 'https://accounts.binance.com/register?ref=YOUR_REF',
  bybit: 'https://www.bybit.com/register?affiliate_id=YOUR_REF',
  mexc: 'https://www.mexc.com/register?inviteCode=YOUR_REF',
  changenow: 'https://changenow.io/?link_id=YOUR_REF',
  coinbase: 'https://coinbase.com/join/YOUR_REF',
  kraken: 'https://kraken.com/refer/YOUR_REF'
};

interface AffiliateLinkProps {
  exchange: string;
  children: React.ReactNode;
  className?: string;
}

export default function AffiliateLink({ exchange, children, className }: AffiliateLinkProps) {
  const url = AFFILIATES[exchange.toLowerCase()] || '#';
  return (
    <a
      href={url}
      target="_blank"
      rel="nofollow noopener sponsored"
      data-sponsored="true"
      data-partner={exchange.toLowerCase()}
      className={`text-[#22c55e] hover:underline font-bold transition-colors ${className || ''}`}
    >
      {children}
    </a>
  );
}
