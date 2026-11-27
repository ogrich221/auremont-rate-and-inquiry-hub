-- Allow primary administrator access with password authentication
CREATE OR REPLACE FUNCTION public.is_primary_administrator()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS(SELECT 1 FROM public.primary_administrator p WHERE p.user_id = auth.uid())
    AND public.has_role(auth.uid(), 'admin');
$$;

-- Allow require_primary_administrator to succeed with password login without demanding recent TOTP MFA
CREATE OR REPLACE FUNCTION public.require_primary_administrator(recent boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_primary_administrator() THEN
    RAISE EXCEPTION 'Primary administrator authentication required' USING ERRCODE = '42501';
  END IF;
END;
$$;
