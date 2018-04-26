FROM node:8
WORKDIR app
CMD ["node", "index.js"]

RUN chown -R node:node /app

USER node

ADD --chown=node build .
ADD --chown=node package.json  .

RUN npm install --production
