# Task Manager

## Description
Task Manager is a backend service built with **Node.js**, **Express.js**, **PostgreSQL**, and **Prisma ORM**.  
It provides a REST API for managing tasks, projects, and users, featuring:
- Authentication and authorization (JWT-based).
- Task assignment and status updates.
- Project and task management.
- Work time tracking for developers.

## Technologies
- **Node.js**: Programming platform for creating server applications in JavaScript/TypeScript
- **Express.js**: Node.js framework for creating back-end applications
- **PostgreSQL**: Relational database management system
- **PrismORM**: Object-relational mapping for modeling and interaction
- **Winston**: Logging library
- **Jest**: Testing framework

## Installation

## Environment
- Run command cp .env.example .env

```bash
# development
$ npm install
```

## Running the app

```bash
# development
$ npm run dev
```

## Running migrations

```bash
# development
$ npx prisma migrate dev
```

## Testing the app

```bash
# development
$ npm run test
```

## Testing Endpoints with HTTP Requests

For easier testing of API endpoints, a `requests.http` file is included in the src folder. This file is compatible with IDEs such as WebStorm or GoLand etc., which support HTTP and other request files

### How to use

1. Open the project, for example, in WebStorm or another compatible IDE.
2. Navigate to the `requests.http` file.
3. Ensure that the app is running (use `npm run dev` or `npm run start`).
4. Click on the `Send Request` button above each HTTP request in the file to test the corresponding endpoint.


