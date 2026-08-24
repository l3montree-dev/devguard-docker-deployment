# Versioning Policy

This repository follows DevGuard's shared versioning policy: **all components share the same major and minor version**, patch releases are independent per component. See the canonical policy in the [devguard repository](https://github.com/l3montree-dev/devguard/blob/main/VERSIONING.md).

## Compatibility Rule

> Any `vX.Y.*` release of this deployment repo is compatible with any `vX.Y.*` release of the other DevGuard components it deploys.

| Component | Repository |
|-----------|------------|
| DevGuard (API/backend) | [devguard](https://github.com/l3montree-dev/devguard) |
| DevGuard Web (frontend) | [devguard-web](https://github.com/l3montree-dev/devguard-web) |
| Helm chart | [devguard-helm-chart](https://github.com/l3montree-dev/devguard-helm-chart) |
| CI Components | [devguard-ci-component](https://github.com/l3montree-dev/devguard-ci-component) |
| Docker Deployment (this repo) | [devguard-docker-deployment](https://github.com/l3montree-dev/devguard-docker-deployment) |

## Rules

- **Major/Minor versions are synchronized.** A tagged release of this repo bumps its major/minor version in lockstep with the DevGuard component release it's meant to be used with.
- **Patch versions are independent.** A fix to this repo's Compose files, Traefik config, or setup scripts ships as a new patch here without requiring a new release of the other components.
- **`DEVGUARD_API_TAG` and `DEVGUARD_WEB_TAG` in `.env.example` track the matching minor version.** When this repo is tagged `vX.Y.Z`, the example tags should point at `vX.Y.*` releases of `devguard` and `devguard-web`.
- When upgrading, ensure this repo and the components it deploys share the **same minor version**. Patch versions do not need to match.

## Releases

Each tagged release of this repo describes only what changed in the deployment configuration (Compose files, Traefik config, setup/configure scripts, docs) — not in the DevGuard components themselves. See the [main DevGuard CHANGELOG](https://github.com/l3montree-dev/devguard/blob/main/CHANGELOG.md) for API/web changes.
