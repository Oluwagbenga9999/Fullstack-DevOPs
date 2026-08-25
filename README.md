# ShipIt Board

A small full-stack task board for practicing DevOps fundamentals. The Node.js API and plain browser frontend run as separate services: the API listens on `3001`, while the frontend listens on `3000` and proxies API requests to the backend. Data is intentionally in memory, so restarting the backend resets the board.

## Run locally

```bash
npm install
npm run dev
```

Run the backend in one terminal with `npm run dev:api`, then the frontend in another with `npm run dev`. Open http://localhost:3000. The API is available directly at http://localhost:3001.

## Run with Docker

```bash
docker compose up --build
```

Compose runs separate `backend` and `frontend` containers. The frontend is on port `3000`, the API is on port `3001`, and the backend health check is available at http://localhost:3001/health. Set `PORT` or `API_PORT` in `.env` to change the host ports.

## Deploy to AWS EC2

The `main` branch deploys automatically through GitHub Actions:

1. Create an Ubuntu EC2 instance with Docker Engine and the Docker Compose plugin installed. Allow inbound TCP `80` (or `3000` while learning) in its security group. Keep port `3001` private unless you specifically need direct API access.
2. If the GitHub Container Registry package is private, create a GitHub token with `read:packages` and log in on the instance:

	```bash
	echo "$GHCR_READ_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
	```

3. On the instance, create `~/shipit-board/.env` with `IMAGE=ghcr.io/YOUR_OWNER/shipit-board:latest` and `PORT=3000`.
4. Add these GitHub repository secrets: `EC2_HOST` (public IP or DNS), `EC2_USER` (usually `ubuntu`), and `EC2_SSH_KEY` (the private SSH key used for the instance).
5. Push to `main`, or run **Build and deploy** manually from the Actions tab.

The workflow runs lint and tests, publishes the image to GHCR, copies the Compose and deploy script to EC2, pulls the new image, and restarts the service. For a real public deployment, add a reverse proxy with HTTPS instead of exposing port `3000` directly.

## API

- `GET /health` returns service status.
- `GET /api/tasks` lists tasks.
- `POST /api/tasks` accepts `{ "title": "..." }`.
- `PATCH /api/tasks/:id` accepts `{ "done": true }`.
- `DELETE /api/tasks/:id` removes a task.

## Practice ladder

1. Add a persistent database and a migration step.
2. Build and tag the image in CI, then publish it to a registry.
3. Add a staging deployment with environment-specific configuration.
4. Put the service behind a reverse proxy with HTTPS.
5. Add structured logs, metrics, and an alert for failed health checks.

## Checks

```bash
npm run lint
npm test
```
