FROM node:alpine
# Create the bot's directory
RUN apk add python3 make gcc g++
RUN mkdir -p /main/bot
WORKDIR /main/bot
ENV NODE_PATH=/usr/local/lib/node_modules
COPY package.json /main/bot
RUN npm i -g npm@latest
RUN npm cache clear --force
RUN npm install
COPY . /main/bot
RUN npm run build
LABEL name="azurdream" version="1.5"
# Start the bot.
CMD ["npm", "run", "start"]