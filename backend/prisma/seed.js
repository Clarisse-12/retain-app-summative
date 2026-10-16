const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // ── Admin user ────────────────────────────────────────────
  const adminEmail = "admin@retain.app";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  let admin;
  if (existing) {
    // Ensure role is ADMIN in case it was created as USER
    admin = await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "ADMIN" },
    });
    console.log("Admin user already exists — role confirmed ADMIN:", admin.email);
  } else {
    admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: await bcrypt.hash("Admin1234!", 10),
        role: "ADMIN",
      },
    });
    console.log("Created admin user:", admin.email);
  }

  // ── Seed categories owned by admin ───────────────────────
  const categoryNames = [
    "Food & Dining",
    "Transport",
    "Housing",
    "Entertainment",
    "Health",
    "Shopping",
    "Education",
    "Utilities",
    "Travel",
    "Uncategorised",
  ];

  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name_userId: { name, userId: admin.id } },
      update: {},
      create: { name, userId: admin.id },
    });
  }
  console.log(`Seeded ${categoryNames.length} categories.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
