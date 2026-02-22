-- Add the new role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'REFERRER';

-- Create an is_referrer helper function
CREATE OR REPLACE FUNCTION public.is_referrer()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_active = true AND role::text = 'REFERRER'
  );
$function$;

-- Re-define is_active_user to exclude REFERRERs, so they don't get blanket access
CREATE OR REPLACE FUNCTION public.is_active_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_active = true AND role::text IN ('ADMIN', 'RECRUITER')
  );
$function$;

-- Allow REFERRERs to insert candidates
CREATE POLICY "Referrers can insert candidates" ON public.candidates
  FOR INSERT
  WITH CHECK (public.is_referrer());
