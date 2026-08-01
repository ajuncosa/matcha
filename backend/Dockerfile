# Production image for the matcha backend (Bun + Express + Socket.IO).
FROM oven/bun:1.3

ENV NODE_ENV=production
WORKDIR /home/bun/app

# Install dependencies first for better layer caching.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the application source.
COPY . .

# The upload path is hardcoded to /home/bun/app/images; make sure it exists and
# is writable by the non-root "bun" user the image runs as.
USER root
RUN mkdir -p /home/bun/app/images \
    && chown -R bun:bun /home/bun/app \
    && chmod +x ./docker-entrypoint.sh
USER bun

EXPOSE 3000

# Runs migrations (and loads common passwords if the wordlist is present), then
# starts the server in production mode.
CMD ["./docker-entrypoint.sh"]
