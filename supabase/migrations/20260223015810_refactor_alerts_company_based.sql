-- 1. Add company_id column (nullable initially for data migration)
ALTER TABLE public.alerts
ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;

-- 2. Backfill company_id from the candidate's company
UPDATE public.alerts a
SET company_id = c.company_id
FROM public.candidates c
WHERE a.candidate_id = c.id AND c.company_id IS NOT NULL;

-- 3. Delete alerts for candidates with no company (per new rules)
DELETE FROM public.alerts WHERE company_id IS NULL;

-- 4. Make company_id NOT NULL now that data is clean
ALTER TABLE public.alerts ALTER COLUMN company_id SET NOT NULL;

-- 5. Drop old RLS policies FIRST (they depend on assigned_to)
DROP POLICY IF EXISTS "alerts_select" ON public.alerts;
DROP POLICY IF EXISTS "alerts_update" ON public.alerts;

-- 6. Drop old assigned_to column and FK
ALTER TABLE public.alerts DROP CONSTRAINT IF EXISTS alerts_assigned_to_fkey;
ALTER TABLE public.alerts DROP COLUMN assigned_to;

-- 7. Create new RLS policies
CREATE POLICY "alerts_select" ON public.alerts
FOR SELECT USING (
    public.is_admin()
    OR
    EXISTS (
        SELECT 1 FROM public.recruiter_companies rc
        WHERE rc.recruiter_id = auth.uid()
        AND rc.company_id = alerts.company_id
    )
);

CREATE POLICY "alerts_update" ON public.alerts
FOR UPDATE USING (
    public.is_admin()
    OR
    EXISTS (
        SELECT 1 FROM public.recruiter_companies rc
        WHERE rc.recruiter_id = auth.uid()
        AND rc.company_id = alerts.company_id
    )
);
