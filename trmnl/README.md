# Kip diagnostics for TRMNL

This directory contains the import-ready Liquid layout for Kip's private TRMNL plugin.

## Plugin settings

- Polling URL: `https://kip.computer/api/trmnl.json`
- Poll interval: 30 minutes (use TRMNL's slower overnight schedule if configured per device)
- Markup: paste `kip-diagnostics.liquid` into the full-screen layout editor.
- Data: the endpoint is public, read-only, and contains only the same high-level diagnostics already exposed on `https://kip.computer/stats/`.

The layout uses TRMNL Framework 3.1 primitives: `layout`, `layout--row`, `layout--col`, `layout--between`, `title`, `value`, `label`, and `divider`.

## States

- `healthy`: every required source is fresh and no threshold is exceeded.
- `warning`: a non-critical job failed, Pi temperature is at least 80°C, or root-disk use is at least 80%.
- `critical`: an essential backup/sync/tailnet/Pi-health/voice job failed, Pi temperature is at least 85°C, root-disk use is at least 90%, or the voice service is offline.
- `unknown`: any required source is absent or stale. This deliberately takes precedence over the other states so an old good reading never looks healthy.

Fixtures are represented by `trmnlFixtures` in `src/lib/trmnl.ts`; the built endpoint is checked for schema validity by `scripts/verify-trmnl.mjs`.

## Device validation

The model has not yet been confirmed as an OG or X, so this is intentionally a full-screen responsive layout rather than a device-specific density claim. After creating the private plugin, review it on the physical display in each status state and adjust only the Liquid layout if the installed panel needs more or less density.
