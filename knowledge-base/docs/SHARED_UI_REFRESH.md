# Tessa shared interface refresh

The existing pages now use the Prelim standards visual system: navy primary actions, warm orange accents, light slate canvas, white borderless cards, consistent typography and rounded controls.

## Coverage

- Shared section navigation: Title guidance, Procedures, Prelim help, How to use Tessa, and role-gated Admin. Title guidance and Procedures select their respective existing workspaces directly; the duplicate header workspace switcher is removed.
- Underwriting and operations home: matching headers, search/filter styling, contextual banner and responsive action rows.
- SOP creation/editing, document upload/review/confirmation, administration, help and account settings inherit shared panels, form controls and section context.
- Login uses the same light palette and navy actions.
- Activity is collapsed initially; opening it on a narrow screen uses an overlay rather than squeezing the content. Closed controls are inert.
- Keyboard focus remains visible. Risk, approval and error colors remain distinct from ordinary navigation styling.

No database migrations, permission changes, AI prompt changes or replacement approval workflows are part of this refresh. Existing form submissions and API endpoints are preserved. It does not introduce the reference library's versioned approvals into other modules.

## Verification

`tests/shared-ui.mjs` uses synthetic local API fixtures; it never connects to production. It checks search, workspace switching, activity controls, desktop page rendering, mobile horizontal overflow and runtime errors. Preview images are generated with that synthetic data. Run with Playwright installed and a local Next server on port 3130; optionally set `TESSA_TEST_URL`, `CHROME_PATH` and `TESSA_SCREENSHOTS`.

Global presentation lives in `app/globals.css` and shared UI components. The small legacy-card selector intentionally styles existing rounded cards without changing status banners, table divisions or upload drop targets. Content-specific widths remain intact for readable forms and guidance.
