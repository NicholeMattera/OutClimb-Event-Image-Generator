#!/bin/sh

echo "🧹 Cleaning up temp directory"
rm -rf /tmp/outclimb-event-image-generator

echo "📦 Downloading the latest"
git clone --depth 1 https://github.com/NicholeMattera/OutClimb-Event-Image-Generator.git /tmp/outclimb-event-image-generator
cd /tmp/outclimb-event-image-generator

echo "🛠️ Building"
docker compose build --no-cache

echo "🪦 Bringing down and removing old container"
docker container stop outclimb-event-image-generator-web
docker container rm outclimb-event-image-generator-web

echo "💡 Bringing up new container"
docker compose up --detach

echo "🧹 Cleaning up old images and temp directory"
docker image prune --all --force
rm -rf /tmp/outclimb-event-image-generator
