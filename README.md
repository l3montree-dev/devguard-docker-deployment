# DevGuard Docker Deployment - WiP

> **DISCLAIMER: Work in Progress. This repo will change.**

## Initial Setup:

1. Configure the `.env` file. The easiest way is the interactive setup, which
   copies `.env.example`, generates all secrets, and fills in the domain /
   protocol for the mode you pick (localhost, OrbStack, or Traefik).

   ```bash
   # Run configuration script
   docker compose -f compose.configure.yaml run --rm configure
   ```

   Prefer to do it by hand? Copy [`.env.example`](.env.example) to `.env` and edit it

1. Launch Initial Setup

   ```bash
   # Generates the encryption key + configs and initializes the database.
   docker compose -f compose.yaml -f compose.setup.yaml up devguard-setup postgresql
   ```

# Launch DevGuard

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
