# Changelog

All notable changes to the DevGuard Docker deployment are documented here.

This repository follows DevGuard's shared [versioning policy](VERSIONING.md): its major/minor version tracks the `devguard` and `devguard-web` minor version it is meant to be deployed with.

For API and web frontend changes see the [main DevGuard CHANGELOG](https://github.com/l3montree-dev/devguard/blob/main/CHANGELOG.md).

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
