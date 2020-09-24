FROM node:12-alpine as builder
WORKDIR /home/node

COPY --chown=node:node . build

# Scripts not ignored in npm ci because of node-sass
RUN apk add -U --no-cache --virtual .build-deps git sudo \
  && sudo -u node sh -c 'cd build && npm ci && npm run build && rm -rf node_modules' \
  && sudo -u node sh -c 'cp -r build/dist/* build/package.json build/package-lock.json .' \
  && sudo -u node sh -c 'npm ci --production'

FROM node:12-alpine
CMD ["/usr/local/bin/node", "index.js"]
WORKDIR /home/node
USER node

COPY --from=builder /home/node/build/dist/ .
COPY --from=builder /home/node/node_modules node_modules
COPY --from=builder /home/node/package.json .
COPY --from=builder /home/node/package-lock.json .