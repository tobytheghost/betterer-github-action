FROM node:16-alpine AS builder
WORKDIR /
COPY package.json /
RUN yarn install
COPY tsconfig.json /
COPY src/ src/
RUN yarn run build

FROM node:16-alpine
WORKDIR /
RUN apk add --no-cache tini
COPY --from=builder package.json .
COPY --from=builder build build/
COPY --from=builder node_modules node_modules/
COPY entrypoint.sh .

ENTRYPOINT [ "/sbin/tini", "--", "yarn", "run", "betterer" ]
