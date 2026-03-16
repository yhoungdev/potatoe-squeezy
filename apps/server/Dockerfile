FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y unzip curl ca-certificates && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://bun.sh/install | bash && \
    echo "export PATH=\"/root/.bun/bin:\$PATH\"" >> /root/.bashrc

ENV PATH="/root/.bun/bin:$PATH"
    
COPY package.json ./
COPY bun.lock* ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web-app/package.json apps/web-app/package.json
COPY apps/github-bot/package.json apps/github-bot/package.json
COPY apps/extension/package.json apps/extension/package.json
COPY libs/common/package.json libs/common/package.json
COPY libs/common/example/package.json libs/common/example/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared packages/shared

RUN bun install --frozen-lockfile

COPY . .

WORKDIR /app/apps/server
CMD ["bun", "run", "src/index.ts"]
