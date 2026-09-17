FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV="production"
ENV PORT="3000"
ENV HOSTNAME="0.0.0.0"
ENV CHROME_PATH="/usr/bin/chromium"
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"
ENV SMARK_REPORT_PYTHON="/opt/smark-report-venv/bin/python"

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        git-crypt \
        chromium \
        fonts-dejavu-core \
        fonts-liberation \
        libharfbuzz0b \
        libharfbuzz-subset0 \
        libjpeg62-turbo \
        libopenjp2-7 \
        libpango-1.0-0 \
        libpangoft2-1.0-0 \
        python3 \
        python3-pip \
        python3-venv \
        shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable \
    && corepack prepare pnpm@11.19.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# @prisma/client may run `prisma generate` during install. Copy the schema
# before installing so that lifecycle hook never runs against an empty image.
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

COPY . .

ARG GIT_CRYPT_KEY
RUN if [ -n "$GIT_CRYPT_KEY" ]; then \
      echo "$GIT_CRYPT_KEY" | base64 -d > /tmp/git-crypt.key && \
      git-crypt unlock /tmp/git-crypt.key && \
      rm -f /tmp/git-crypt.key; \
    fi

RUN python3 -m venv /opt/smark-report-venv \
    && /opt/smark-report-venv/bin/pip install --no-cache-dir --upgrade pip \
    && /opt/smark-report-venv/bin/pip install --no-cache-dir -r requirements-report.txt

RUN test -f /app/prisma/schema.prisma
RUN pnpm exec prisma generate --schema=/app/prisma/schema.prisma
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
