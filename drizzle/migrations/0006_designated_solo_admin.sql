-- Designate skybridgeairline@gmail.com as the solo primary administrator
INSERT INTO public.administrator_registration (singleton, email)
VALUES (true, 'skybridgeairline@gmail.com')
ON CONFLICT (singleton) DO UPDATE
SET email = 'skybridgeairline@gmail.com';

-- Ensure confirmation trigger assigns singleton primary admin and role to skybridgeairline@gmail.com
CREATE OR REPLACE FUNCTION public.assign_designated_administrator_on_confirmation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ BEGIN
 IF NOT public.administrator_registration_allowed(NEW.email, NEW.email_confirmed_at IS NOT NULL) THEN
  RETURN NEW;
 END IF;
 INSERT INTO public.primary_administrator(singleton,user_id) VALUES(true,NEW.id)
 ON CONFLICT(singleton) DO UPDATE SET user_id = EXCLUDED.user_id;
 IF EXISTS(SELECT 1 FROM public.primary_administrator WHERE singleton AND user_id=NEW.id) THEN
  INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,'admin'::public.app_role)
  ON CONFLICT(user_id,role) DO NOTHING;
 END IF;
 RETURN NEW;
END; $$;

-- If a user with skybridgeairline@gmail.com already exists in auth.users, promote immediately
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'skybridgeairline@gmail.com' LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.primary_administrator(singleton, user_id)
    VALUES(true, v_user_id)
    ON CONFLICT(singleton) DO UPDATE SET user_id = EXCLUDED.user_id;

    INSERT INTO public.user_roles(user_id, role)
    VALUES(v_user_id, 'admin'::public.app_role)
    ON CONFLICT(user_id, role) DO NOTHING;
  END IF;
END $$;
