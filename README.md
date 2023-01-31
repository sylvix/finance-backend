# Finance tracker backend
## Dependencies

* NodeJS 16+
* PostgreSQL 15

## Installation

```bash
$ npm install
```

## Preparation

Before running the app ensure you have PostgreSQL server up and running.

Copy `.env.development` file into `.env.local` and edit database settings.

Run migrations:
```shell
$ npm run migration:run
```

Load fixtures (for more see `fixtures` module):
```shell
$ npm run cli seed
```

## Running the app

```shell
# development mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Swagger

Available only in development at: http://localhost:8000/api/swagger

## Migrations

### Generate
Generate a new migration based on entity changes (replace `MigrationName` 
with what it should be called):

```shell
$ npm run migration:generate --name=MigrationName
```

**Warning!** This procedure will replace the contents of `src/database/migrations.ts` file!
This file is auto-generated based on files in the `src/database/migrations` folder and is automatically updated when you generate new migration.

### Create an empty migration
If you need to create a migration manually, you can run:

```shell
$ npm run migration:create --name=MigrationName
```

After that you can run this update script to handle automatic addition to DataSource config for you:

```shell
$ npx ts-node ./src/database/updateMigrations.ts
```

### Run
```shell
$ npm run migration:run
```

### Revert

Revert last migration
```shell
$ npm run migration:revert
```

## Timezone
Since Postgres doesn't save the timezone with the dates, UTC timezone is assumed.
That's why for correct dates backend should also use UTC timezone.
And that's the reason for the `UTC=TZ` env variable in `.env` file.

## HTTPS in development
Since cookies are used for token authentication, some browsers (Safari) 
don't save Secure cookies from non-secure servers (including localhost).

So if you need to use the dev site on Safari you'll need to set `ENABLE_DEV_HTTPS=true` in your `.env.local` file.

Generate certificates yourself:
```shell
$ cd certs
$ openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout cert-dev.key -out cert-dev.pem -config req.cnf -sha256
```

Nest will then use certificates in `certs` directory, so you might want to add `certs/cert-dev.pem` certificate
to your system keychain. 

You will also need to change `VITE_API_URL` in frontend to `https://` instead of `http://`.