CREATE TABLE public.administrator_registration (
 singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
 email text NOT NULL CHECK (email = lower(trim(email)))
);
GRANT ALL ON public.administrator_registration TO service_role;
ALTER TABLE public.administrator_registration ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.administrator_registration_allowed(candidate_email text, confirmed boolean)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT confirmed IS TRUE AND EXISTS (
 SELECT 1 FROM public.administrator_registration r
 WHERE r.singleton AND r.email = lower(trim(candidate_email))
); $$;
REVOKE ALL ON FUNCTION public.administrator_registration_allowed(text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.administrator_registration_allowed(text, boolean) TO service_role;

CREATE FUNCTION public.assign_designated_administrator_on_confirmation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ BEGIN
 IF NOT public.administrator_registration_allowed(NEW.email, NEW.email_confirmed_at IS NOT NULL) THEN
  RETURN NEW;
 END IF;
 INSERT INTO public.primary_administrator(singleton,user_id) VALUES(true,NEW.id)
 ON CONFLICT(singleton) DO NOTHING;
 IF EXISTS(SELECT 1 FROM public.primary_administrator WHERE singleton AND user_id=NEW.id) THEN
  INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,'admin'::public.app_role)
  ON CONFLICT(user_id,role) DO NOTHING;
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.assign_designated_administrator_on_confirmation() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_designated_administrator_on_confirmation() TO service_role;
CREATE TRIGGER assign_designated_administrator_after_confirmation
AFTER INSERT OR UPDATE OF email_confirmed_at, email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_designated_administrator_on_confirmation();