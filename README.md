# ShipIt Board

A small full-stack task board for practicing DevOps fundamentals. The Node.js/Express server serves a plain browser frontend and a REST API. Data is intentionally in memory, so restarting the app resets the board.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Use `npm start` for a production-style local run.

## Run with Docker

```bash
docker compose up --build
```

The container runs as a non-root user and exposes a health check at `/health`. Set `PORT` in `.env` to change the host port.

## Deploy to AWS EC2

The `main` branch deploys automatically through GitHub Actions:

1. Create an Ubuntu EC2 instance with Docker Engine and the Docker Compose plugin installed. Allow inbound TCP `80` (or `3000` while learning) in its security group.
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
