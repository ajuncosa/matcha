#!/usr/bin/env bash
# Starts the development stack (source-mounted bun containers) defined in
# compose.dev.yaml. Any extra arguments are forwarded to `docker compose up`.
#
#   ./run-dev.sh          # start in the foreground
#   ./run-dev.sh -d       # start detached
#
# The dev containers run `bash` and mount your source, so after they are up you
# exec into them to run the dev servers, e.g.:
#   docker exec -it matcha-back  bun run dev
#   docker exec -it matcha-front bun run dev
set -e

cd "$(dirname "$0")"
exec docker compose -f compose.dev.yaml up "$@"
