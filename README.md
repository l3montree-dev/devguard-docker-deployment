# DevGuard Docker Deployment - WiP

> **DISCLAIMER: Work in Progress. This repo will change.**

## Deployment Options

- **Localhost**
  - Best for simple initial DevGuard test on localhost.
- **OrbStack**
  - Also great for localhost testing if you are using OrbStack. Advantage over Localhost deployment is that you get SSL support out of the box through [OrbStacks zero-config SSL certificates](https://docs.orbstack.dev/docker/domains#https).
- **Traefik**
  - In case you want to make DevGuard accessible from other computers this is the recommended way.

## Setup

### Guided / Automatic

The easiest way to get started is the interactive setup which let's you
pick a deployment option (Localhost, OrbStack, or Traefik).

```bash
# Run configuration script
docker compose -f compose.configure.yaml run --rm configure
```

### Manual

Copy [`.env.example`](.env.example) to `.env` and edit it

```bash
# Generates the encryption key + configs and initializes the database.
docker compose -f compose.yaml -f compose.setup.yaml up devguard-setup postgresql
```

## Launch DevGuard

```bash
# Launch with Localhost / HTTP
docker compose -f compose.yaml -f compose.localhost.yaml up -d --remove-orphans

# Launch with Reverse Proxy (Traefik)
docker compose -f compose.yaml -f compose.traefik.yaml up -d --remove-orphans

# Launch with Reverse Proxy (OrbStack)
docker compose -f compose.yaml -f compose.orbstack.yaml up -d --remove-orphans
```

## Reset

```bash
docker compose down -v --remove-orphans # after this you need to run the initial setup again
```
