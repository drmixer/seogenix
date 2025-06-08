/*
  # Competitive Analysis Database Schema

  1. New Tables
    - `competitor_sites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `site_id` (uuid, foreign key to sites - the user's site being compared against)
      - `url` (text, competitor website URL)
      - `name` (text, competitor name)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `competitor_audits`
      - `id` (uuid, primary key)
      - `competitor_site_id` (uuid, foreign key to competitor_sites)
      - `ai_visibility_score` (integer)
      - `schema_score` (integer)
      - `semantic_score` (integer)
      - `citation_score` (integer)
      - `technical_seo_score` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own competitor data
*/

-- Create competitor_sites table
CREATE TABLE IF NOT EXISTS competitor_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  url text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create competitor_audits table
CREATE TABLE IF NOT EXISTS competitor_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_site_id uuid NOT NULL REFERENCES competitor_sites(id) ON DELETE CASCADE,
  ai_visibility_score integer NOT NULL,
  schema_score integer NOT NULL,
  semantic_score integer NOT NULL,
  citation_score integer NOT NULL,
  technical_seo_score integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE competitor_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_audits ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS competitor_sites_user_id_idx ON competitor_sites(user_id);
CREATE INDEX IF NOT EXISTS competitor_sites_site_id_idx ON competitor_sites(site_id);
CREATE INDEX IF NOT EXISTS competitor_audits_competitor_site_id_idx ON competitor_audits(competitor_site_id);

-- RLS Policies for competitor_sites
CREATE POLICY "Users can view their own competitor sites"
  ON competitor_sites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create competitor sites for their own sites"
  ON competitor_sites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM sites 
      WHERE sites.id = competitor_sites.site_id 
      AND sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own competitor sites"
  ON competitor_sites
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own competitor sites"
  ON competitor_sites
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for competitor_audits
CREATE POLICY "Users can view audits for their competitor sites"
  ON competitor_audits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM competitor_sites 
      WHERE competitor_sites.id = competitor_audits.competitor_site_id 
      AND competitor_sites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create audits for their competitor sites"
  ON competitor_audits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM competitor_sites 
      WHERE competitor_sites.id = competitor_audits.competitor_site_id 
      AND competitor_sites.user_id = auth.uid()
    )
  );