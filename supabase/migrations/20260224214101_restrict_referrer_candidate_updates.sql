-- Drop the permissive policy
DROP POLICY IF EXISTS "candidates_update" ON public.candidates;

-- Create the restricted policy where only Admins and Recruiters can update
CREATE POLICY "candidates_update" ON public.candidates 
FOR UPDATE 
TO public 
USING (is_active_user())
WITH CHECK (is_active_user());
