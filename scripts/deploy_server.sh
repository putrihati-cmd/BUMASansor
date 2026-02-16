#!/bin/bash
set -e

# Default Configuration
SERVER_HOST="server.infiatin.cloud"
SERVER_USER="tholib_server"
PROXY_CMD="cloudflared access ssh --hostname server.infiatin.cloud"
REMOTE_DIR="/home/tholib_server/bumas-ansor/backend"
IMAGE_NAME="ghcr.io/putrihati-cmd/bumas-ansor-backend:latest"

echo "Deploying to $SERVER_USER@$SERVER_HOST..."

# 1. Ensure remote directory exists
echo "Creating remote directory..."
ssh -o ProxyCommand="$PROXY_CMD" $SERVER_USER@$SERVER_HOST "mkdir -p $REMOTE_DIR/nginx"

# 2. Add GHCR Token to docker login on server (Interactive or setup beforehand)
# We assume the user has logged in to GHCR on the server, or the image is public.
# If private, user needs to run `docker login ghcr.io` on server once.

# 3. Copy files using SCP with ProxyCommand
echo "Copying configuration files..."

# Copy docker-compose.prod.yml
scp -o ProxyCommand="$PROXY_CMD" backend/docker-compose.prod.yml $SERVER_USER@$SERVER_HOST:$REMOTE_DIR/docker-compose.prod.yml

# Copy .env.production
scp -o ProxyCommand="$PROXY_CMD" backend/.env.production $SERVER_USER@$SERVER_HOST:$REMOTE_DIR/.env.production

# Copy nginx configuration
scp -o ProxyCommand="$PROXY_CMD" -r backend/nginx/* $SERVER_USER@$SERVER_HOST:$REMOTE_DIR/nginx/

# 4. Run Docker commands on server
echo "Running Docker Compose on server..."
ssh -o ProxyCommand="$PROXY_CMD" $SERVER_USER@$SERVER_HOST <<EOF
  cd $REMOTE_DIR
  
  # Export image name just in case it's used in compose (it is)
  export BACKEND_IMAGE=$IMAGE_NAME
  
  # Pull latest images
  echo "Pulling latest backend image: \$BACKEND_IMAGE"
  docker pull \$BACKEND_IMAGE
  
  # Start services
  echo "Starting services..."
  BACKEND_IMAGE=\$BACKEND_IMAGE docker compose -f docker-compose.prod.yml up -d --remove-orphans
  
  # Wait for DB to be healthy
  echo "Waiting for database..."
  sleep 10
  
  # Run migrations
  echo "Running migrations..."
  BACKEND_IMAGE=\$BACKEND_IMAGE docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy
  
  # Prune old images
  docker image prune -f
EOF

echo "Deployment complete!"
