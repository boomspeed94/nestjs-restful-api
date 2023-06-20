<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://lecle-meet-test.s3.ap-southeast-1.amazonaws.com/download.jpeg" width="200" alt="Truong Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

### Prerequisites
```bash
# nodejs 18
# pnpm installed
```

## Installation

```bash
$ pnpm install
```

### Devlopment
```bash
# postgres
$ docker-compose --env-file ./.env.dev up -d
```

### Database migration
- Documentation: [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
```bash
# For Development, use when modify database schema
# Note: This script will create new database migration file in ./prisma/migrations
# The new file will be executed when run modify below 
# This comment will clean up the data
# Ref: https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production
# Ref: https://www.prisma.io/docs/guides/migrate/prototyping-schema-db-push
$ db:develop

# Do modify database base on migration histories
$ db:modify:dev
$ db:modify:test
$ db:modify:prod
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```