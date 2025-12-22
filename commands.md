# Commands Reference

## General NPM Commands

```bash
npm install
```
Install all dependencies

```bash
npm install <package>
```
Install a specific package

```bash
npm install <package> --save-dev
```
Install a package as dev dependency

```bash
npm update
```
Update all packages to latest versions

```bash
npm uninstall <package>
```
Remove a package

---

## Server Commands

```bash
cd server
```
Navigate to server directory

```bash
npm run dev
```
Start development server with hot reload

```bash
npm run build
```
Compile TypeScript to JavaScript

```bash
npm start
```
Start production server

---

## Desktop Client Commands

```bash
cd desktop-client
```
Navigate to desktop client directory

```bash
npm run dev
```
Start Vite development server

```bash
npm run build
```
Build production bundle

```bash
npm run build:dev
```
Build development bundle

```bash
npm run lint
```
Run ESLint to check code quality

```bash
npm run preview
```
Preview production build locally

```bash
npm run electron
```
Run Electron app (requires built files)

```bash
npm run electron:dev
```
Run Electron app with dev server

```bash
npm run electron:build
```
Build Electron app for distribution

```bash
npm run electron:dist
```
Create Electron installer

---

## Prisma Commands

```bash
npm run prisma:generate
```
Generate Prisma Client from schema

```bash
npm run prisma:migrate
```
Create and apply new migration

```bash
npm run prisma:migrate:deploy
```
Apply pending migrations in production

```bash
npm run prisma:studio
```
Open Prisma Studio database GUI

```bash
npm run prisma:push
```
Push schema changes to database without migrations

```bash
npx prisma migrate dev --name <migration-name>
```
Create a new migration with custom name

```bash
npx prisma migrate reset
```
Reset database and apply all migrations

```bash
npx prisma db pull
```
Pull database schema into Prisma schema

```bash
npx prisma db seed
```
Run database seed script

---

## Database Commands

```bash
psql <connection-string>
```
Connect to PostgreSQL database

```bash
psql <connection-string> -f migrations/001_create_tables.sql
```
Run SQL migration file

---

## Git Commands

```bash
git status
```
Check repository status

```bash
git add .
```
Stage all changes

```bash
git commit -m "message"
```
Commit changes with message

```bash
git push
```
Push commits to remote repository

```bash
git pull
```
Pull latest changes from remote

```bash
git branch
```
List all branches

```bash
git checkout <branch-name>
```
Switch to a branch

---

## Environment Setup

```bash
cp .env.example .env
```
Create environment file from template

```bash
echo $DATABASE_URL
```
View DATABASE_URL environment variable (Linux/Mac)

```bash
echo %DATABASE_URL%
```
View DATABASE_URL environment variable (Windows)

