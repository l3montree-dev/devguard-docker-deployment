# DevGuard Docker Deployment

## Deployment Options

- **Localhost**
  - Best for simple initial DevGuard test on localhost.
- **OrbStack**
  - Also great for localhost testing if you are using OrbStack. Advantage over Localhost deployment is that you get SSL support out of the box through [OrbStacks zero-config SSL certificates](https://docs.orbstack.dev/docker/domains#https).
- **Traefik**
  - In case you want to make DevGuard accessible from other computers this is the recommended way.

## Setup

Clone this repo first.

```bash
git clone git@github.com:l3montree-dev/devguard-docker-deployment.git
```

### Guided / Automatic

The easiest way to get started is the interactive setup which let's you
pick a deployment option (Localhost, OrbStack, or Traefik). It writes `.env`
and generates the encryption key, the Kratos config and the database init
script. Re-running it keeps existing secrets and files.

```bash
# Run configuration script
docker compose -f compose.configure.yaml run --rm configure
```

### Manual

See [Manual Setup](#manual-setup) Instructions in the "Details" Section at the end of this file.

## What to Backup

You should perform regular dumps (e.g. using pgdump) of the `devguard` and `kratos` databases. Ensure also
to store a copy of the app-side encryption key generated during setup.

## Reset

In case you want to start over you can reset everything by running the following command

> [!CAUTION]
> This will remove all volumes and the corresponding data!

```bash
docker compose down -v --remove-orphans # after this you need to run the initial setup again
```

<details>

# Manual Setup

## Prepare Config

Copy [`.env.example`](.env.example) to `.env` and edit it — the configure script
keeps every value that is no longer set to `change-me`, so it only fills in the
gaps and the generated files.

## Init Encryption Keys, Database etc.

```bash
# Generates the encryption key + configs.
docker compose -f compose.configure.yaml run --rm configure

# Initializes the database.
docker compose -f compose.yaml -f compose.setup.yaml up postgresql
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

</details>
