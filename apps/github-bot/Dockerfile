FROM oven/bun:1.3.10

WORKDIR /app

COPY package.json ./
RUN bun install --production

ENV NODE_ENV="production"

COPY . .

CMD ["bun", "run", "start"]
