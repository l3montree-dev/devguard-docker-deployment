#!/bin/sh
# One-time init: generates the app encryption key and downloads the Kratos
# config + DB init script into the mounted volumes. Safe to run repeatedly —
# existing files are left untouched.
set -eu

BASE=https://raw.githubusercontent.com/l3montree-dev/devguard/refs/heads/main

if [ ! -f /keys/app_side_encryption.key ]; then
  od -vN 32 -An -tx1 /dev/urandom | tr -dc 'a-f0-9' > /keys/app_side_encryption.key
  echo 'Generated new encryption key.'
else
  echo 'Encryption key already exists, skipping.'
fi

if [ ! -f /kratos/kratos.yml ]; then
  wget -qO /kratos/kratos.yml "$BASE/.kratos/kratos.example.yml"
  echo 'Downloaded kratos.yml.'
fi

if [ ! -f /kratos/identity.schema.json ]; then
  wget -qO /kratos/identity.schema.json "$BASE/.kratos/identity.schema.json"
  echo 'Downloaded identity.schema.json.'
fi

if [ ! -f /initdb/init.sql ]; then
  wget -qO /initdb/init.sql "$BASE/initdb.sql"
  echo 'Downloaded initdb.sql.'
fi

echo 'Generating secrets now...'

# Replace the default Kratos DB password in init.sql with the one from the .env file, if provided.
if [ -f /initdb/init.sql ] && [ -n "${POSTGRES_KRATOS_PASSWORD:-}" ]; then
  ESCAPED_KRATOS_PASSWORD=$(printf '%s' "$POSTGRES_KRATOS_PASSWORD" | sed 's/[\\/&]/\\&/g')
  sed -i "s/change-me-definitely-when-not-testing/$ESCAPED_KRATOS_PASSWORD/g" /initdb/init.sql
  echo 'Updated Kratos DB password in init.sql from POSTGRES_KRATOS_PASSWORD.'
fi

echo 'Setup complete.'
