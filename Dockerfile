FROM node:16-alpine AS builder
WORKDIR /
COPY package.json /
RUN yarn install
COPY tsconfig.json /
COPY src/ src/
RUN yarn run build

FROM node:16-alpine AS cli
ARG VERSION=2.6.0
RUN apk add --no-cache wget tar
RUN wget https://github.com/cli/cli/releases/download/v${VERSION}/gh_${VERSION}_linux_amd64.tar.gz
RUN tar -zxvf gh_${VERSION}_linux_amd64.tar.gz
RUN chmod a+x gh_${VERSION}_linux_amd64/bin/gh
RUN cp gh_${VERSION}_linux_amd64/bin/gh /usr/bin/gh

FROM node:16-alpine
WORKDIR /
RUN apk add --no-cache tini git
COPY --from=cli /usr/bin/gh /usr/bin/gh
COPY --from=builder package.json .
COPY --from=builder build build/
COPY --from=builder node_modules node_modules/
COPY entrypoint.sh .

RUN yarn global add @betterer/cli@5.1.5
RUN yarn global add @betterer/regexp@5.1.5
RUN yarn global add @betterer/tsquery@5.1.5
RUN yarn global add @betterer/typescript@5.1.5

ENTRYPOINT [ "/entrypoint.sh" ]
#ENTRYPOINT [ "/sbin/tini", "--" , "/node_modules/@betterer/cli/bin/betterer" ]
#ENTRYPOINT [ "/sbin/tini", "--" , "yarn", "run", "betterer" ]
# "yarn", "run", "betterer"
