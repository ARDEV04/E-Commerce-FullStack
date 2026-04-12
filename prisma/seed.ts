import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const connectionString = process.env.DATABASE_URL ?? "";
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding database...");

  const categories = [
    { name: "Electronics", description: "Phones, laptops, gadgets and more" },
    { name: "Fashion", description: "Clothing, shoes, accessories" },
    { name: "Home & Garden", description: "Furniture, decor, garden tools" },
    { name: "Sports & Outdoors", description: "Fitness, camping, outdoor gear" },
    { name: "Books & Media", description: "Books, music, movies, games" },
    { name: "Health & Beauty", description: "Skincare, supplements, wellness" },
    { name: "Toys & Games", description: "Toys for all ages" },
    { name: "Automotive", description: "Car parts, accessories, tools" },
  ];

  for (const cat of categories) {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { ...cat, slug },
    });
  }
  console.log(`✓ Created ${categories.length} categories`);

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@shophub.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123456";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(`✓ Admin user created: ${adminEmail}`);

  console.log("Seeding complete!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
