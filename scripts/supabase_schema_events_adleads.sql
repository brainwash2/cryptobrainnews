-- ═══════════════════════════════════════════════════════════
-- EVENTS TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  organizer TEXT,
  url TEXT,
  location_city TEXT,
  location_country TEXT,
  venue TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  event_type TEXT NOT NULL DEFAULT 'conference'
    CHECK (event_type IN ('conference', 'hackathon', 'meetup', 'summit', 'workshop', 'webinar', 'protocol_milestone')),
  is_online BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'manual',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events (start_date ASC);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events (event_type);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events (is_featured) WHERE is_featured = TRUE;

-- RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated insert events" ON public.events;
CREATE POLICY "Authenticated insert events" ON public.events
  FOR INSERT TO authenticated WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- AD_LEADS TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ad_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT NOT NULL CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  telegram TEXT,
  website TEXT,
  budget_range TEXT NOT NULL
    CHECK (budget_range IN ('$1k-$5k', '$5k-$15k', '$15k-$50k', '$50k+')),
  package_interest TEXT NOT NULL
    CHECK (package_interest IN ('signal', 'alpha', 'institutional', 'event')),
  message TEXT,
  source_page TEXT DEFAULT '/advertise',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ad_leads_created ON public.ad_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_leads_status ON public.ad_leads (status);

-- RLS: Anyone can insert (form submission), only authenticated can read
ALTER TABLE public.ad_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert ad_leads" ON public.ad_leads;
CREATE POLICY "Public insert ad_leads" ON public.ad_leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated read ad_leads" ON public.ad_leads;
CREATE POLICY "Authenticated read ad_leads" ON public.ad_leads
  FOR SELECT TO authenticated USING (true);
