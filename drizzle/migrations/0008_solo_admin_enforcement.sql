-- Enforce skybridgeairline@gmail.com as the only administrator and remove any other staff or roles
CREATE OR REPLACE FUNCTION public.is_primary_administrator()
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Extract user email from JWT claims or auth.users
  v_email := lower(trim(coalesce(auth.jwt()->>'email', '')));
  IF v_email = '' THEN
    SELECT lower(trim(email)) INTO v_email FROM auth.users WHERE id = auth.uid();
  END IF;

  RETURN v_email = 'skybridgeairline@gmail.com';
END;
$$;

CREATE OR REPLACE FUNCTION public.require_primary_administrator(recent boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_primary_administrator() THEN
    RAISE EXCEPTION 'Primary administrator access required: only skybridgeairline@gmail.com is authorized' USING ERRCODE = '42501';
  END IF;
END;
$$;

-- Clean up any other administrators or staff roles
DO $$
DECLARE
  v_solo_id uuid;
BEGIN
  SELECT id INTO v_solo_id FROM auth.users WHERE lower(trim(email)) = 'skybridgeairline@gmail.com' LIMIT 1;

  -- Ensure administrator_registration strictly points to skybridgeairline@gmail.com
  INSERT INTO public.administrator_registration (singleton, email)
  VALUES (true, 'skybridgeairline@gmail.com')
  ON CONFLICT (singleton) DO UPDATE
  SET email = 'skybridgeairline@gmail.com';

  -- If user exists, assign primary_administrator and admin role
  IF v_solo_id IS NOT NULL THEN
    DELETE FROM public.primary_administrator WHERE user_id <> v_solo_id;
    INSERT INTO public.primary_administrator(singleton, user_id)
    VALUES(true, v_solo_id)
    ON CONFLICT(singleton) DO UPDATE SET user_id = EXCLUDED.user_id;

    DELETE FROM public.user_roles WHERE role = 'admin' AND user_id <> v_solo_id;
    INSERT INTO public.user_roles(user_id, role)
    VALUES(v_solo_id, 'admin'::public.app_role)
    ON CONFLICT(user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.primary_administrator;
    DELETE FROM public.user_roles WHERE role = 'admin';
  END IF;
END $$;
