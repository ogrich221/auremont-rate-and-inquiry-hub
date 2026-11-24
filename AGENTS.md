<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.

<!-- LOVABLE:END -->

## Application structure

- Keep bank presentation in `src/components/bank` and distinct content in leaf routes; shared navigation is mounted in the root so every page uses the same identity.
- Store configurable public website content in `site_content`; validate with the shared schemas and use role-protected server functions for changes so visitors cannot grant themselves permissions.
- Persist contact inquiries through a validated server function into a private inbox; do not report delivery when only browser state changed.
- Authentication creates website-only demo access; financial operations remain disabled independently of session state to prevent confusing simulations with banking services.
- Central administration lives in the authenticated route subtree with its own bank shell; public pages retain the shared website shell.
- Private administration uses a singleton designated identity plus the protected admin role and AAL2 in database policies and server functions; status, review and archival actions require recent MFA.
- Administrator signup reserves an email in a service-only configuration table; an auth confirmation trigger assigns the singleton and role only to that confirmed email, never client metadata or the first signup.
- Legacy application listing and decision functions must use the same database administrator guard before accessing the file store; decision audit actors come from the verified session, never caller input.
- Customer and application mutations run through atomic guarded database functions with trigger-written audit history and optimistic customer versions; customer deletion means archival, never audit erasure.
- Administration clears private query caches before sign-out and signs out after fifteen minutes without browser interaction; sensitive operations still enforce recent MFA in the database.
- Router-derived sitemap: every route declares staticData.sitemap; private subtrees use "exclude-subtree" so new pages make an explicit search decision.
