#!/bin/sh
set -e

# On a fresh/empty database, load the bundled seed dump. No-op once the schema
# exists, so it only runs on the very first boot. (Runs before migrations; the
# dump already contains the schema + migration records, so migrate becomes a no-op.)
echo "[entrypoint] Restoring seed data if the database is empty..."
bun run restore:seed

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

# Download & extract the seed profile images once — only when the images volume
# is still empty (first boot). Failure is non-fatal; the app runs without them.
IMAGES_DIR=./images
IMAGES_ZIP_URL="${IMAGES_ZIP_URL:-https://github.com/ajuncosa/matcha/releases/download/release/images.zip}"
if [ -z "$(ls -A "$IMAGES_DIR" 2>/dev/null)" ]; then
    echo "[entrypoint] Images directory empty — downloading seed images from $IMAGES_ZIP_URL ..."
    if curl -fsSL -o /tmp/images.zip "$IMAGES_ZIP_URL"; then
        rm -rf /tmp/img_extract && mkdir -p /tmp/img_extract
        unzip -oq /tmp/images.zip -d /tmp/img_extract
        # Support both zip layouts: files at the root, or nested under an images/ folder.
        if [ -d /tmp/img_extract/images ]; then
            cp -a /tmp/img_extract/images/. "$IMAGES_DIR"/
        else
            cp -a /tmp/img_extract/. "$IMAGES_DIR"/
        fi
        rm -rf /tmp/images.zip /tmp/img_extract
        echo "[entrypoint] Seed images ready ($(ls -1 "$IMAGES_DIR" | wc -l) files)."
    else
        echo "[entrypoint] WARNING: could not download seed images — continuing without them."
    fi
else
    echo "[entrypoint] Images directory already populated, skipping image download."
fi

echo "[entrypoint] Starting backend server..."
exec bun run src/index.ts
