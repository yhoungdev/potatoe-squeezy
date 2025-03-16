FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y unzip

RUN curl -fsSL https://bun.sh/install | bash && \
    echo "export PATH=\"/root/.bun/bin:\$PATH\"" >> /root/.bashrc

ENV PATH="/root/.bun/bin:$PATH"
    
COPY package.json ./
COPY bun.lock* ./

RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "run", "src/index.ts"]
