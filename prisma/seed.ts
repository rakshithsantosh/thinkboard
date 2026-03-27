import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string before running the seed script.",
    );
  }

  return databaseUrl;
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: getDatabaseUrl(),
  }),
  log: ["warn", "error"],
});

const emptyParagraph = () => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});

async function main() {
  await prisma.document.deleteMany();
  await prisma.task.deleteMany();

  await Promise.all([
    prisma.task.create({
      data: {
        title: "Shape the launch messaging",
        summary: "Clarify the story that connects task execution with long-form thinking.",
        status: "IDEATION",
        order: 0,
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Angles to explore" }],
            },
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Position Think Board as execution plus reflection." }] }],
                },
                {
                  type: "listItem",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Lead with the writing-first task detail experience." }] }],
                },
              ],
            },
          ],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: "Draft onboarding checklist",
        summary: "Give first-time users a clear path from setup to first task.",
        status: "TODO",
        order: 0,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Capture the minimum steps: connect Neon, run migrations, seed sample data, and create the first document.",
                },
              ],
            },
          ],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: "Build the board interactions",
        summary: "Polish drag-and-drop behavior and the task detail panel.",
        status: "IN_PROGRESS",
        order: 0,
        content: {
          type: "doc",
          content: [
            {
              type: "taskList",
              content: [
                {
                  type: "taskItem",
                  attrs: { checked: true },
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Support column moves." }] }],
                },
                {
                  type: "taskItem",
                  attrs: { checked: false },
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Make editing feel quiet and focused." }] }],
                },
              ],
            },
          ],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: "Finalize Prisma migration",
        summary: "Keep the schema simple and friendly for a Neon-backed setup.",
        status: "IMPLEMENTED",
        order: 0,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Tasks and documents now live in purpose-built tables with timestamps and ordering." }],
            },
          ],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: "Prepare production handoff",
        summary: "Document deployment steps and environment variables.",
        status: "GO_LIVE",
        order: 0,
        content: emptyParagraph(),
      },
    }),
  ]);

  const productStrategy = await prisma.document.create({
    data: {
      title: "Think Board product strategy",
      position: 0,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Why this product matters" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Most tools separate delivery work from structured thinking. Think Board keeps them together so execution and reflection reinforce each other.",
              },
            ],
          },
        ],
      },
    },
  });

  await Promise.all([
    prisma.document.create({
      data: {
        title: "Writing principles",
        parentId: productStrategy.id,
        position: 0,
        content: {
          type: "doc",
          content: [
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Start with clarity, not formatting." }] }],
                },
                {
                  type: "listItem",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Use documents for durable knowledge and task notes for active thinking." }] }],
                },
              ],
            },
          ],
        },
      },
    }),
    prisma.document.create({
      data: {
        title: "Launch checklist",
        position: 1,
        content: {
          type: "doc",
          content: [
            {
              type: "taskList",
              content: [
                {
                  type: "taskItem",
                  attrs: { checked: false },
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Set DATABASE_URL to the Neon pooled connection string." }] }],
                },
                {
                  type: "taskItem",
                  attrs: { checked: false },
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Run migrations before the first deploy." }] }],
                },
              ],
            },
          ],
        },
      },
    }),
  ]);

  console.log("Seeded Think Board sample workspace.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
