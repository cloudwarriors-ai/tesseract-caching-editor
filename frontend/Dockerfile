# Single-stage build using Vite dev server
FROM node:20-bookworm

WORKDIR /app

# Install additional troubleshooting tools
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    vim \
    nano \
    htop \
    net-tools \
    iputils-ping \
    dnsutils \
    jq \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port 5173 (Vite default)
EXPOSE 5173