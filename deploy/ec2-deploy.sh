#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

: "${IMAGE:?IMAGE must be set in .env}"

docker compose -f docker-compose.ec2.yml pull app
docker compose -f docker-compose.ec2.yml up -d app
docker image prune -f

echo "Deployment complete: ${IMAGE}"