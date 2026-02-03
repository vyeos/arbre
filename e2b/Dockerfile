FROM node:20-bookworm

USER root

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    build-essential \
    openjdk-17-jdk-headless \
    golang \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g typescript ts-node

WORKDIR /workspace

USER node
