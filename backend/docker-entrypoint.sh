#!/bin/sh
set -e

echo "[entrypoint] Running database migrations..."
bun run migrate

# Load the common-passwords table only if the wordlist is present in the image.
# The loader itself is a no-op when the table already has rows.
if [ -f ./10-million-passwords.txt ]; then
    echo "[entrypoint] Loading common passwords (skips if already loaded)..."
    bun run load:passwords
else
    echo "[entrypoint] 10-million-passwords.txt not found, skipping password load."
fi

echo "[entrypoint] Starting backend server..."
exec bun run src/index.ts
