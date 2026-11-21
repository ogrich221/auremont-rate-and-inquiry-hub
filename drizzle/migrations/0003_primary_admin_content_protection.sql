DROP POLICY admin_content ON public.site_content;
CREATE POLICY admin_content ON public.site_content FOR ALL TO authenticated USING(public.is_primary_administrator()) WITH CHECK(public.is_primary_administrator());
DROP POLICY admin_inbox ON public.contact_submissions;
CREATE POLICY admin_inbox ON public.contact_submissions FOR SELECT TO authenticated USING(public.is_primary_administrator());
CREATE FUNCTION public.audit_admin_content() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN PERFORM public.require_primary_administrator(false); INSERT INTO public.admin_audit(actor_id,entity_type,action,reason,old_values,new_values) VALUES(auth.uid(),'site_content','Updated',NEW.key,CASE WHEN TG_OP='UPDATE' THEN to_jsonb(OLD) ELSE NULL END,to_jsonb(NEW)); RETURN NEW; END; $$;
REVOKE ALL ON FUNCTION public.audit_admin_content() FROM PUBLIC;
CREATE TRIGGER site_content_audit AFTER INSERT OR UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.audit_admin_content();