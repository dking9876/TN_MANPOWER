-- Add file columns to candidate_documents
ALTER TABLE public.candidate_documents
ADD COLUMN file_path TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_type TEXT;

-- Create candidate-documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-documents', 'candidate-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for storage
-- Allow authenticated users to view candidate-documents
CREATE POLICY "Enable read access for authenticated users on candidate-documents" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'candidate-documents');

-- Allow authenticated users to upload files to candidate-documents
CREATE POLICY "Enable insert for authenticated users on candidate-documents" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'candidate-documents');

-- Allow authenticated users to delete their files on candidate-documents
CREATE POLICY "Enable delete for authenticated users on candidate-documents" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'candidate-documents');
