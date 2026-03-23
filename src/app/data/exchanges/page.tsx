import React, { Suspense } from "react";
import { getDexVolumes } from "@/lib/defi-data";
import ExchangesClient   from "./_components/ExchangesClient";
import { DataHeader }    from "../_components/DataHeader";

export const metadata = {
  title: "DEX Volumes | CryptoBrainNews",
  description: "Decentralized exchange trading volumes by protocol - live from DefiLlama.",
};

export const revalidate = 1800;

async function ExchangesData() {
  const dexes = await getDexVolumes(50).catch(() => []);

  return (
    <div className="space-y-8">
      <DataHeader
        title="DEX Volumes"
        description="Decentralized exchange trading activity and volume - Source: DefiLlama."
      />
      <ExchangesClient dexes={dexes} />
    </div>
  );
}

export default function ExchangesPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<div className="animate-pulse h-64 bg-[#0a0a0a] border border-[#1a1a1a]" />}>
        <ExchangesData />
      </Suspense>
    </main>
  );
}