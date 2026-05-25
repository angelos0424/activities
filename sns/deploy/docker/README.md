# Activities Docker Compose

Docker Compose setup for the local Activities Discord bot service.

This MVP setup intentionally defines only the `bot` service. A database container is
not included because the first storage target is Google Sheets.

## Environment

Create a local env file before running the bot container:

```bash
cp sns/.env.example sns/.env
```

Fill in the Discord and Google Sheets values in `sns/.env`. Keep real secrets and
Google service account JSON files out of git.

For local file-backed credentials and bot data, place files under `sns/data`.
For example:

```text
GOOGLE_APPLICATION_CREDENTIALS=/app/data/google-service-account.json
SQLITE_PATH=/app/data/activities.sqlite
RECEIPT_STORAGE_DIR=/app/data/receipts
```

## Validate

```bash
docker compose -f sns/deploy/docker/docker-compose.yml config
```

The Compose file uses Docker Compose v2.24+ `env_file.required: false` so `config`
can validate the skeleton before local secrets exist. When `sns/.env` is present,
the `bot` service reads it.

## Run

```bash
docker compose -f sns/deploy/docker/docker-compose.yml up bot
```

Register slash commands from the same image:

```bash
docker compose -f sns/deploy/docker/docker-compose.yml run --rm bot npm run register-commands:prod
```
