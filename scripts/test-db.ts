import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Connecting to database...\n");

  // ─── User ───────────────────────────────────────────────────────────
  const user = await prisma.user.findFirst({
    where: { email: "demo@devvault.io" },
    include: { accounts: true },
  });
  if (user) {
    console.log("=== User ===");
    console.log(`  Name:  ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Pro:   ${user.isPro}`);
    console.log(`  Auth:  ${user.accounts.length} account(s)`);
  } else {
    console.log("No demo user found!");
  }

  // ─── Item Types ─────────────────────────────────────────────────────
  const itemTypes = await prisma.itemType.findMany({ orderBy: { name: "asc" } });
  console.log(`\n=== Item Types (${itemTypes.length}) ===`);
  for (const type of itemTypes) {
    const system = type.isSystem ? " [system]" : "";
    console.log(`  ${type.icon.padEnd(16)} ${type.name.padEnd(12)} ${type.color}${system}`);
  }

  // ─── Collections ────────────────────────────────────────────────────
  const collections = await prisma.collection.findMany({
    include: { items: { include: { item: true } } },
    orderBy: { name: "asc" },
  });
  console.log(`\n=== Collections (${collections.length}) ===`);
  for (const col of collections) {
    const fav = col.isFavorite ? " ★" : "";
    console.log(`\n  ${col.name}${fav}`);
    console.log(`  ${col.description || "(no description)"}`);
    console.log(`  Items: ${col.items.length}`);
    for (const ci of col.items) {
      console.log(`    - [${ci.item.itemTypeId}] ${ci.item.title}`);
    }
  }

  // ─── Items ──────────────────────────────────────────────────────────
  const items = await prisma.item.findMany({
    include: { itemType: true, tags: true, collections: { include: { collection: true } } },
    orderBy: { createdAt: "asc" },
  });
  console.log(`\n=== Items (${items.length}) ===`);
  for (const item of items) {
    console.log(`\n  [${item.itemType.icon}] ${item.title}`);
    console.log(`    Type:       ${item.itemType.name}`);
    console.log(`    Description: ${item.description || "(none)"}`);
    if (item.url) console.log(`    URL:        ${item.url}`);
    if (item.content) console.log(`    Content:    ${item.content.slice(0, 80)}...`);
    console.log(`    Tags:       ${item.tags.map((t) => t.name).join(", ") || "(none)"}`);
    console.log(`    Pinned:     ${item.isPinned} | Favorite: ${item.isFavorite}`);
    const colNames = item.collections.map((c) => c.collection.name).join(", ");
    console.log(`    Collections: ${colNames || "(none)"}`);
  }

  // ─── Summary ────────────────────────────────────────────────────────
  const tagCount = await prisma.tag.count();
  console.log("\n=== Summary ===");
  console.log(`  Users:        ${await prisma.user.count()}`);
  console.log(`  Item Types:   ${itemTypes.length}`);
  console.log(`  Collections:  ${collections.length}`);
  console.log(`  Items:        ${items.length}`);
  console.log(`  Tags:         ${tagCount}`);
  console.log("\nDatabase OK!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
