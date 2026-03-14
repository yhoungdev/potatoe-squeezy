FROM node:20-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates bash unzip \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

COPY . .

WORKDIR /app/apps/server
RUN bun install --frozen-lockfile

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
