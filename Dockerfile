FROM node:latest

# Install compile lib + audio lib
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update
RUN apt-get install -y ffmpeg pulseaudio
RUN apt-get install -y python3 make gcc g++ npm
COPY ./docker/entrypoint.sh /opt/bin/entrypoint.sh
# COPY ./docker/pulseaudio.client.conf /etc/pulse/client.conf

# add root user to group for pulseaudio access
RUN adduser root pulse-access

# Create the bot's directory
RUN mkdir -p /main/bot
WORKDIR /main/bot
ENV NODE_PATH=/usr/local/lib/node_modules
COPY package.json /main/bot

# Install and build bot
RUN npm i -g npm@latest
RUN npm install
COPY . /main/bot
RUN npm run build
LABEL name="azurdream" version="1.5"

# Start the bot + audio services
ENTRYPOINT /opt/bin/entrypoint.sh