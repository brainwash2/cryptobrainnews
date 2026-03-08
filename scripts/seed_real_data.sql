-- 1. Create Airdrops Table
CREATE TABLE IF NOT EXISTS public.airdrops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'Medium',
  affiliate_url TEXT,
  status TEXT DEFAULT 'Active'
);

-- Enable RLS for Airdrops
ALTER TABLE public.airdrops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read airdrops" ON public.airdrops;
CREATE POLICY "Public read airdrops" ON public.airdrops FOR SELECT USING (true);

-- 2. Insert Real Events Data
INSERT INTO public.events (title, description, organizer, location_city, location_country, start_date, event_type, is_featured)
VALUES 
('TOKEN2049 Dubai', 'The premier crypto event in the Middle East, bringing together founders and executives of the leading Web3 companies.', 'TOKEN2049', 'Dubai', 'UAE', '2024-04-18T00:00:00Z', 'conference', true),
('Consensus 2024', 'The world’s largest, longest-running and most influential gathering that brings together all sides of the cryptocurrency community.', 'CoinDesk', 'Austin', 'USA', '2024-05-29T00:00:00Z', 'conference', true),
('ETHCC London', 'Global hackathon focused on building the future of Ethereum and decentralized applications.', 'ETH Global', 'London', 'UK', '2024-03-15T00:00:00Z', 'hackathon', false),
('Solana Breakpoint', 'The annual gathering of the Solana community, celebrating the builders and creators on the network.', 'Solana Foundation', 'Singapore', 'Singapore', '2024-09-19T00:00:00Z', 'summit', true),
('Bitcoin 2024', 'The largest Bitcoin gathering in the world, focused on hyperbitcoinization.', 'BTC Inc', 'Nashville', 'USA', '2024-07-25T00:00:00Z', 'conference', true);

-- 3. Insert Real Airdrops Data
INSERT INTO public.airdrops (title, description, difficulty, affiliate_url, status)
VALUES
('zkSync Era Mainnet', 'Interact with native dApps like SyncSwap and Mute.io, bridge funds via the official bridge, and maintain consistent monthly activity to qualify for the anticipated $ZKS token.', 'Hard', 'https://zksync.io', 'Active'),
('LayerZero', 'Use Stargate Finance to bridge assets across multiple chains (Arbitrum, Optimism, Polygon). Provide liquidity to pools to increase your on-chain footprint.', 'Medium', 'https://layerzero.network', 'Active'),
('Scroll Mainnet', 'Bridge ETH to Scroll network and interact with native AMMs. Deploying a basic smart contract significantly increases qualification chances.', 'Hard', 'https://scroll.io', 'Active'),
('EigenLayer Restaking', 'Restake your stETH or rETH directly on the EigenLayer platform to earn points toward the future protocol distribution.', 'Easy', 'https://eigenlayer.xyz', 'Active'),
('Hyperliquid', 'Trade perpetual contracts on the Hyperliquid DEX. Points are awarded weekly based on trading volume and liquidity provision.', 'Medium', 'https://hyperliquid.xyz', 'Active');
