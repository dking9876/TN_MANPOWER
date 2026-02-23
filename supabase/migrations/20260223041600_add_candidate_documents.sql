-- Create Enums
CREATE TYPE candidate_document_type AS ENUM (
  'PASSPORT_COPIES',
  'IMMIGRATION_LETTER_COPIES',
  'ORIGINAL_IMMIGRATION_LETTER',
  'RED_RIBBON_DOCUMENT',
  'VISA_APPLICATION_FORM',
  'MEDICAL_REPORT',
  'POLICE_REPORT',
  'BIRTH_CERTIFICATE',
  'GS_CERTIFICATE',
  'PERSONAL_AFFIDAVIT',
  'NIC_COPY_APPLICANT_AND_SPOUSE',
  'ENGLISH_AGREEMENT',
  'LETTER_FROM_TRANSLATOR',
  'SINHALA_AGREEMENT',
  'PASSPORT_COPY',
  'IMMIGRATION_LETTER_COPY',
  'NIC_APPLICANT_AND_CANDIDATE'
);

CREATE TYPE candidate_document_status AS ENUM (
  'PENDING',
  'SUBMITTED',
  'EXPIRED'
);

-- Create candidate_documents table
CREATE TABLE public.candidate_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  type candidate_document_type NOT NULL,
  status candidate_document_status NOT NULL DEFAULT 'PENDING',
  country TEXT, -- Only used when type is 'POLICE_REPORT' and it's for a visited country
  expiration_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create a unique constraint so we don't have multiple rows for the same document type for the same candidate
-- Using COALESCE on country so NULL is treated as a unique value in the constraint
CREATE UNIQUE INDEX idx_unique_candidate_document 
ON public.candidate_documents (candidate_id, type, COALESCE(country, ''));

-- Set up RLS
ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;

-- Create policies (similar to candidates)
CREATE POLICY "Enable read access for all users" ON public.candidate_documents
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.candidate_documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.candidate_documents
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.candidate_documents
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.candidate_documents
  FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');
