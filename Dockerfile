FROM node:latest

# Install + setup pulseaudio
RUN apt-get update
RUN apt-get install --yes pulseaudio-utils
COPY ./docker/pulse-client.conf /etc/pulse/client.conf
# RUN pulseaudio -D

# Install compile lib
RUN apt install -y ffmpeg
RUN apt-get install -y python3 make gcc g++

# Create the bot's directory
RUN mkdir -p /main/bot
WORKDIR /main/bot
ENV NODE_PATH=/usr/local/lib/node_modules
COPY package.json /main/bot

# Install and build bot
RUN npm i -g npm@latest
RUN npm cache clear --force
RUN npm install
COPY . /main/bot
RUN npm run build
LABEL name="azurdream" version="1.5"

# Start the bot.
CMD ["npm", "run", "start"]