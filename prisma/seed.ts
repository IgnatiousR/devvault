import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  const systemItemTypes = [
    { name: "Snippet", icon: "💻", color: "#ef4444", isSystem: true },
    { name: "Prompt", icon: "✨", color: "#f97316", isSystem: true },
    { name: "Command", icon: "⌨️", color: "#f59e0b", isSystem: true },
    { name: "Note", icon: "📝", color: "#fde047", isSystem: true },
    { name: "Link", icon: "🔗", color: "#10b981", isSystem: true },
    { name: "File", icon: "📄", color: "#6b7280", isSystem: true },
    { name: "Image", icon: "🖼️", color: "#ec4899", isSystem: true },
  ];

  for (const itemType of systemItemTypes) {
    await prisma.itemType.upsert({
      where: { id: itemType.name.toLowerCase() },
      update: {},
      create: {
        id: itemType.name.toLowerCase(),
        ...itemType,
      },
    });
  }

  console.log("Seeded system item types");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
