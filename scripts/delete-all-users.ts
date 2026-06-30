// fallow-ignore-file unused-file
// fallow-ignore-file complexity
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

const KEEP_EMAIL = "demo@devvault.io";

async function main() {
  console.log(`Keeping user: ${KEEP_EMAIL}`);
  console.log("Deleting all other users and their contents...\n");

  const demoUser = await prisma.user.findUnique({ where: { email: KEEP_EMAIL } });
  if (!demoUser) {
    console.error(`Demo user (${KEEP_EMAIL}) not found. Aborting.`);
    process.exit(1);
  }

  const otherUsers = await prisma.user.findMany({
    where: { id: { not: demoUser.id } },
    select: { id: true, email: true },
  });

  if (otherUsers.length === 0) {
    console.log("No other users found. Nothing to delete.");
    return;
  }

  console.log(`Found ${otherUsers.length} user(s) to delete:`);
  for (const u of otherUsers) {
    console.log(`  - ${u.email} (${u.id})`);
  }
  console.log();

  for (const user of otherUsers) {
    console.log(`Deleting user ${user.email}...`);

    const itemIds = await prisma.item.findMany({
      where: { userId: user.id },
      select: { id: true },
    }).then((items) => items.map((i) => i.id));

    if (itemIds.length > 0) {
      await prisma.itemCollection.deleteMany({
        where: { itemId: { in: itemIds } },
      });
      console.log(`  Removed ${itemIds.length} item-collection links`);
    }

    await prisma.user.delete({ where: { id: user.id } });
    console.log(`  Deleted user and all cascaded data`);
  }

  const orphanedTags = await prisma.tag.findMany({
    where: { items: { none: {} } },
    select: { id: true, name: true },
  });

  if (orphanedTags.length > 0) {
    console.log(`\nCleaning up ${orphanedTags.length} orphaned tag(s)...`);
    await prisma.tag.deleteMany({
      where: { id: { in: orphanedTags.map((t) => t.id) } },
    });
    for (const t of orphanedTags) {
      console.log(`  Deleted tag: ${t.name}`);
    }
  }

  const remaining = await prisma.user.count();
  console.log(`\nDone. ${remaining} user(s) remaining.`);

  const demo = await prisma.user.findUnique({
    where: { email: KEEP_EMAIL },
    include: { items: true, collections: true },
  });
  if (demo) {
    console.log(`Demo user preserved: ${demo.items.length} item(s), ${demo.collections.length} collection(s)`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
