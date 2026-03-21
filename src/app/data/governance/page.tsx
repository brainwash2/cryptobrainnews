import ComingSoon from '../_components/ComingSoon';

export const metadata = {
  title: 'Governance | CryptoBrainNews',
  description: 'DAO governance votes, proposals, and voting metrics.',
};

/**
 * Phase 45 · C1 — Governance page converted to ComingSoon.
 *
 * Root cause: Dune query IDs 6705858 (UNISWAP_GOVERNANCE) and 6705938 (DAO_ACTIVITY)
 * contain stub SQL that returns fabricated zeros / hardcoded strings. GovernanceClient
 * was also rendering its own MOCK_DAOS array, never calling Dune at all.
 *
 * Resolution: This page is marked ComingSoon until both Dune queries are authored
 * with real SQL (Tally/Snapshot on-chain governance data) and GovernanceClient is
 * rewritten to consume live DuneRow[] results.
 *
 * See: audit-report.md § C1, DUNE_QUERIES.md Q20 / Q22.
 */
export default function GovernancePage() {
  return (
    <ComingSoon
      title="Governance"
      description="DAO votes, proposals & governance token metrics"
      dataSource="Dune Analytics (Tally / Snapshot)"
      targetPhase="Phase 45 — Query IDs 6705858 / 6705938 require real SQL"
    />
  );
}
