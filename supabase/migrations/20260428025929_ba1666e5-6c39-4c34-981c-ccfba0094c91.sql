-- Revoke EXECUTE on internal trigger / admin functions from anon and authenticated roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.purge_old_soft_deleted() FROM anon, authenticated, public;