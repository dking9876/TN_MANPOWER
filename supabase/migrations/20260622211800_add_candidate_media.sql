-- Create candidate_media table
CREATE TABLE candidate_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    title TEXT,
    original_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Set up RLS for candidate_media table
ALTER TABLE candidate_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read candidate_media"
    ON candidate_media FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert candidate_media"
    ON candidate_media FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update candidate_media"
    ON candidate_media FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to delete candidate_media"
    ON candidate_media FOR DELETE
    TO authenticated
    USING (true);

-- Insert bucket into storage.buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-media', 'candidate-media', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for storage.objects on the candidate-media bucket
CREATE POLICY "Allow authenticated users to read candidate-media objects"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'candidate-media');

CREATE POLICY "Allow authenticated users to insert candidate-media objects"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'candidate-media');

CREATE POLICY "Allow authenticated users to update candidate-media objects"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'candidate-media');

CREATE POLICY "Allow authenticated users to delete candidate-media objects"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'candidate-media');
