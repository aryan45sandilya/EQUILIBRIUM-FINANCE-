import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const hash = await bcrypt.hash('password123', 12);

  const alex = await prisma.user.upsert({
    where: { email: 'alex@equilibrium.dev' },
    update: {},
    create: { name: 'Alex', email: 'alex@equilibrium.dev', passwordHash: hash },
  });

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@equilibrium.dev' },
    update: {},
    create: { name: 'Sarah', email: 'sarah@equilibrium.dev', passwordHash: hash },
  });

  const mike = await prisma.user.upsert({
    where: { email: 'mike@equilibrium.dev' },
    update: {},
    create: { name: 'Mike', email: 'mike@equilibrium.dev', passwordHash: hash },
  });

  const john = await prisma.user.upsert({
    where: { email: 'john@equilibrium.dev' },
    update: {},
    create: { name: 'John', email: 'john@equilibrium.dev', passwordHash: hash },
  });

  // Create group
  const group = await prisma.group.upsert({
    where: { id: 'seed-group-1' },
    update: {},
    create: {
      id: 'seed-group-1',
      name: 'Europe Trip 2024',
      description: 'All expenses for our Europe trip',
      currency: 'INR',
      members: {
        create: [
          { userId: alex.id, role: 'ADMIN' },
          { userId: sarah.id },
          { userId: mike.id },
          { userId: john.id },
        ],
      },
    },
  });

  // Create sample expense
  await prisma.expense.upsert({
    where: { id: 'seed-exp-1' },
    update: {},
    create: {
      id: 'seed-exp-1',
      groupId: group.id,
      title: 'Airbnb Luxury Loft',
      amount: 12500,
      category: 'Housing',
      splitType: 'EQUAL',
      paidById: alex.id,
      splits: {
        create: [
          { userId: alex.id, amount: 3125 },
          { userId: sarah.id, amount: 3125 },
          { userId: mike.id, amount: 3125 },
          { userId: john.id, amount: 3125 },
        ],
      },
    },
  });

  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
