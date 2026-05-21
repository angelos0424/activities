# SNS Docker Compose

Docker Compose skeleton for the SNS Discord bot service.

This MVP setup intentionally defines only the `bot` service. A database container is
not included because the first storage target is Google Sheets.

## Environment

Create a local env file before running the bot container:

```bash
cp sns/.env.example sns/.env
```

Fill in the Discord and Google Sheets values in `sns/.env`. Keep real secrets and
Google service account JSON files out of git.

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

The current command is a placeholder that keeps the container alive. Actual Discord
bot behavior and the final runtime command are intentionally out of scope for this
skeleton.
