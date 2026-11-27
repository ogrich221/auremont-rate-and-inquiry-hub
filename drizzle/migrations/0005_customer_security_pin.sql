CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE TABLE public.customer_security_pins (
  user_id uuid PRIMARY KEY,
  pin_hash text NOT NULL,
  failed_attempts int NOT NULL DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.customer_security_pins TO service_role;
ALTER TABLE public.customer_security_pins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_security_pin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.customer_security_pins WHERE user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.set_security_pin(_pin text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF _pin !~ '^[0-9]{6}$' THEN RAISE EXCEPTION 'PIN must be exactly 6 digits'; END IF;
  IF EXISTS (SELECT 1 FROM public.customer_security_pins WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'A security PIN already exists';
  END IF;
  INSERT INTO public.customer_security_pins (user_id, pin_hash)
  VALUES (auth.uid(), extensions.crypt(_pin, extensions.gen_salt('bf')));
END $$;

CREATE OR REPLACE FUNCTION public.verify_security_pin(_pin text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.customer_security_pins;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT * INTO r FROM public.customer_security_pins WHERE user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RETURN 'missing'; END IF;
  IF r.locked_until IS NOT NULL AND r.locked_until > now() THEN RETURN 'locked'; END IF;
  IF r.pin_hash = extensions.crypt(_pin, r.pin_hash) THEN
    UPDATE public.customer_security_pins SET failed_attempts = 0, locked_until = NULL WHERE user_id = auth.uid();
    RETURN 'ok';
  END IF;
  UPDATE public.customer_security_pins
    SET failed_attempts = CASE WHEN r.failed_attempts + 1 >= 5 THEN 0 ELSE r.failed_attempts + 1 END,
        locked_until = CASE WHEN r.failed_attempts + 1 >= 5 THEN now() + interval '15 minutes' ELSE NULL END
    WHERE user_id = auth.uid();
  RETURN CASE WHEN r.failed_attempts + 1 >= 5 THEN 'locked' ELSE 'invalid' END;
END $$;

REVOKE ALL ON FUNCTION public.has_security_pin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_security_pin(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_security_pin(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_security_pin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_security_pin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_security_pin(text) TO authenticated;