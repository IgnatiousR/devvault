import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Connecting to database...");

  const itemTypes = await prisma.itemType.findMany();
  console.log(`\nItem types (${itemTypes.length}):`);
  for (const type of itemTypes) {
    console.log(`  ${type.icon} ${type.name} (${type.color})`);
  }

  const userCount = await prisma.user.count();
  console.log(`\nUsers: ${userCount}`);

  const itemCount = await prisma.item.count();
  console.log(`Items: ${itemCount}`);

  const collectionCount = await prisma.collection.count();
  console.log(`Collections: ${collectionCount}`);

  console.log("\nDatabase connection OK!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
