# Changelog

All notable changes to the DevGuard Docker deployment are documented here.

This repository follows DevGuard's shared [versioning policy](VERSIONING.md): its major/minor version tracks the `devguard` and `devguard-web` minor version it is meant to be deployed with.

For API and web frontend changes see the [main DevGuard CHANGELOG](https://github.com/l3montree-dev/devguard/blob/main/CHANGELOG.md).

## [v1.17.0] — 2026-10-26

### Added

- SLSA build provenance signing: the guided setup (`dev/setup.ts`) now generates an EC (prime256v1) signing key at `slsa-private-key.pem` next to the app-side encryption key. Existing keys are kept on re-runs. Keep the key stable — verifiers trust signatures made with its public key.
- New SLSA settings in `.env.example` and passed to the `devguard` service in `compose.yaml`:
  - `SLSA_PRIVATE_KEY_PATH` (defaults to `/keys/slsa-private-key.pem`)
  - `SLSA_OIDC_TRUSTED_ISSUERS` (optional) — comma-separated OIDC issuers whose CI workload identity tokens are accepted. Empty accepts every https issuer.
  - `SLSA_OIDC_AUDIENCE` (optional) — defaults to `DEVGUARD_API_URL` and must match `devguard_api_url` of the CI components.
  - `SLSA_REKOR_URL` (optional) — Rekor transparency log the signed provenance is uploaded to. Empty disables the upload.
- `riverui` service: dashboard for the API's background job queue. It can cancel, retry and delete jobs, so it is not exposed by default; the commented-out port mapping binds to `127.0.0.1:4040` only (e.g. for access through an SSH tunnel).
- `API_URL` is now passed to the `devguard` service (set to `DEVGUARD_API_URL`).

### Upgrade notes

- Existing deployments: re-run the guided setup to generate the SLSA signing key, otherwise the API cannot find `SLSA_PRIVATE_KEY_PATH`. Copy the new SLSA variables from `.env.example` into your `.env`.
- `riverui` builds its database URL from `POSTGRES_DEVGUARD_PASSWORD`, so the password must not contain URL-reserved characters.

---

## [v1.16.1] — 2026-10-11

### Changed

- Bumped default DevGuard image versions: `devguard` to `v1.16.1`, `devguard-web` to `v1.16.1`

---

## [v1.15.0] — 2026-10-01

### Changed

- Bumped default DevGuard image versions: `devguard` / `postgresql` / `kratos` to `v1.15.0`, `devguard-web` to `v1.15.0`

---

## [v1.14.1] — 2026-09-19

### Changed

- Bumped default DevGuard image versions: `devguard` to `v1.14.2`, `devguard-web` to `v1.14.1`

---

## [v1.14.0] — 2026-09-17

### Changed

- Bumped default DevGuard image versions: `devguard` / `postgresql` / `kratos` to `v1.14.0`, `devguard-web` to `v1.14.0`

---

## [v1.13.4] — 2026-09-11

### Changed

- Bumped default DevGuard image versions: `devguard` / `postgresql` / `kratos` to `v1.13.7`, `devguard-web` to `v1.13.2`

---

## [v1.13.3] — 2026-09-08

### Changed

- Bumped default DevGuard image versions: `devguard` / `postgresql` / `kratos` to `v1.13.6`, `devguard-web` to `v1.13.2`

---

## [v1.13.2] — 2026-09-08

### Changed

- Bumped default DevGuard image versions: `devguard` / `postgresql` / `kratos` to `v1.13.4`, `devguard-web` to `v1.13.2`

---

## [v1.13.1] - 2026-08-31

### Changed

- `kratos` and `kratos-migrate` now use l3montree's own Kratos image (`ghcr.io/l3montree-dev/devguard/kratos`) instead of the upstream `oryd/kratos` image
- Replaced the `ORY_KRATOS_TAG` environment variable with `KRATOS_TAG` to select the new image's tag

## [v1.13.0] - 2026-08-24

First release of this dedicated deployment repository, replacing the `docker-compose.yaml` / `docker-compose-try-it` setup previously maintained inside the main [devguard](https://github.com/l3montree-dev/devguard) repository. Versioned as v1.13.0 to align with the DevGuard v1.13.0 minor release per the [versioning policy](VERSIONING.md).

### Added

- Standalone Compose-based deployment for DevGuard: PostgreSQL, Ory Kratos, `devguard-api`/`devguard-migrate`, `devguard-web`, and a bundled Traefik reverse proxy with TLS support
- `dev/setup.ts`, a `bun`-based configure script that generates secrets, Kratos config, and encryption keys on first run and performs a one-time VulnDB import, replacing the old ad hoc `container-setup.sh` script
- `DEPENDENCY_PROXY_CACHE_MAX_SIZE_MB` environment variable to size the dependency proxy's on-disk file cache (matches the shared dependency-proxy cache introduced in devguard v1.13.0)

### Changed

- Compose project uses a static project name (`devguard`) so volume names no longer depend on the directory the repo was cloned into
- Improved and hardened the Traefik configuration
- README updated with clone instructions and an updated `devguard-maint` Helm release workflow matching this Docker-based deployment
