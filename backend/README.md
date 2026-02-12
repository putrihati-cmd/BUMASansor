# Backend BUMAS Ansor

## Stack

- NestJS + TypeScript
- Prisma + PostgreSQL
- JWT auth (access + refresh)
- Scheduler untuk overdue receivable

## Modul

- auth
- users
- categories
- suppliers
- warehouses
- products
- warungs
- stocks
- distribution
- sales
- finance
- reports

## Setup

1. `copy .env.example .env`
2. `npm install`
3. `npm run prisma:generate`
4. `npm run prisma:migrate`
5. `npm run prisma:seed`
6. `npm run start:dev`

## Endpoint docs

- Swagger: `http://localhost:3000/api/docs`

## Kredensial local seed

Lihat `../KREDENSIAL-LOGIN.md`.
