const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminEmail = 'admin@prominno.com';
  const adminPassword = 'admin123';

  // Check if Admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const newAdmin = await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log('Default Admin user created successfully:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  } else {
    console.log(`Admin user with email ${adminEmail} already exists. Skipping.`);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
