FROM node:18-alpine
WORKDIR /opt/app
ADD package.json package.json
RUN npm install
ADD . .
RUN npm run build
RUN npm prune --production
EXPOSE 3002
EXPOSE 3001
CMD ["node", "dist/server.js"]
