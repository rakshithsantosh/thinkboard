# Think Board

Think Board is a writing-first workspace that combines:

- A Kanban board for execution
- A Confluence-like documentation area for durable knowledge

The app is built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Prisma, and PostgreSQL on Neon.

Prisma ORM v7 uses Neon's driver adapter in application code, so the project expects `@prisma/adapter-neon` alongside `@prisma/client`.

## What Is Included

- Fixed Kanban flow: `Ideation`, `To Do`, `In Progress`, `Implemented`, `Go Live`
- Full task CRUD with persisted PostgreSQL storage
- Drag and drop across columns with optimistic UI updates
- Long-form task detail panel with a Tiptap rich-text editor
- Documentation workspace with page creation, editing, deletion, and optional nesting
- Prisma schema, seed data, and an initial SQL migration
- Server actions for task and document writes

## Tech Stack

- Frontend: Next.js App Router, Tailwind CSS, Framer Motion
- Backend: Next.js server actions
- Database: PostgreSQL (Neon)
- ORM: Prisma
- Language: TypeScript

## Project Structure

```text
app/
  board/page.tsx
  documents/page.tsx
  globals.css
  layout.tsx
  page.tsx
actions/
  documents.ts
  tasks.ts
components/
  board/
    BoardColumn.tsx
    CreateTaskDialog.tsx
    TaskCard.tsx
    TaskDetailDialog.tsx
    ThinkBoardView.tsx
  documents/
    DocumentsWorkspace.tsx
    DocumentTree.tsx
  editor/
    editor.css
    TiptapEditor.tsx
  ui/
    button.tsx
    card.tsx
    dialog.tsx
    input.tsx
    textarea.tsx
  Sidebar.tsx
lib/
  constants.ts
  editor.ts
  prisma.ts
  queries/
    documents.ts
    tasks.ts
  types.ts
  utils.ts
prisma/
  migrations/
    20260327000000_init_think_board/migration.sql
    migration_lock.toml
  schema.prisma
  seed.ts
```

## Database Model

### `Task`

- `id`
- `title`
- `summary`
- `content` as JSON rich text
- `status` as a Prisma enum
- `order`
- `createdAt`
- `updatedAt`

### `Document`

- `id`
- `title`
- `content` as JSON rich text
- `parentId`
- `position`
- `createdAt`
- `updatedAt`

## Server Actions

### Tasks

- `actions/tasks.ts`
  - `createTaskAction`
  - `updateTaskAction`
  - `updateTaskPositionsAction`
  - `deleteTaskAction`

### Documents

- `actions/documents.ts`
  - `createDocumentAction`
  - `updateDocumentAction`
  - `deleteDocumentAction`

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Copy the environment template and add your Neon connection strings.

```bash
Copy-Item .env.example .env
```

Set `DATABASE_URL` to your Neon pooled PostgreSQL URL for the app runtime.

Set `DIRECT_URL` to your Neon direct, non-pooled PostgreSQL URL for Prisma CLI commands such as migrations. If you only have one URL available, the project falls back to `DATABASE_URL`.

3. Generate the Prisma client.

```bash
npx prisma generate
```

4. Apply the migration.

```bash
npx prisma migrate deploy
```

For local iteration after schema changes, you can also use:

```bash
npx prisma migrate dev
```

5. Seed sample data.

```bash
npm run db:seed
```

6. Start the app.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Vercel Deployment

1. Import the project in Vercel as a `Next.js` app.
2. If the repository contains multiple apps, set the Root Directory to the folder that contains this project's `package.json`.
3. Add `DATABASE_URL` in Vercel using your Neon pooled connection string.
4. Optionally add `DIRECT_URL` using your Neon direct connection string for production Prisma schema commands.
5. Redeploy after saving environment variables.
6. Initialize the production database once with either:

```bash
npx prisma migrate deploy
```

or, for an empty new database:

```bash
npx prisma db push
```

If Vercel shows its plain white `404: NOT_FOUND` screen, that usually means the deployment itself is unavailable or failed before going live. That is different from the in-app Next.js not-found page.

## Neon Notes

- Create a Neon project and database.
- Copy the pooled connection string from the Neon dashboard into `DATABASE_URL`.
- Copy the direct connection string into `DIRECT_URL` for migrations when Neon provides one.
- Run the Prisma migration and seed commands before opening the app.

## Core UX Decisions

- Every task has a short summary plus a dedicated long-form writing surface.
- The Kanban board is fixed to the requested workflow so the app feels opinionated and clear.
- Documents are separated from tasks, but use the same rich editor for consistency.
- The document tree supports optional hierarchy without forcing deep nesting.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run db:seed`

## Notes

- Authentication is intentionally not included yet, so the current app behaves like a single shared workspace.
- Rich text is stored as JSON for future editor extensibility.
- The included seed creates sample tasks and documents so the UI is populated immediately after setup.
