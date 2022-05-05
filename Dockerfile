FROM node:16 AS builder

# Create app directory
WORKDIR /usr/src/api

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# Files required by pnpm install
COPY package.json pnpm-lock.yaml ./

# Install app dependencies
RUN pnpm install --frozen-lockfile --prod

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]
