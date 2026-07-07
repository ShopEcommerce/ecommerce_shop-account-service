import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import pino from 'pino';

dotenv.config();

const logger = pino();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL must be defined');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const users = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    profileId: '00000000-0000-0000-0000-000000001001',
    email: 'admin@teleshop.com',
    username: 'admin',
    fullName: 'Teleshop Admin',
    phone: '0900000001',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    profileId: '00000000-0000-0000-0000-000000001002',
    email: 'seller@teleshop.com',
    username: 'seller',
    fullName: 'Teleshop Seller',
    phone: '0900000002',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    profileId: '00000000-0000-0000-0000-000000001003',
    email: 'customer@teleshop.com',
    username: 'customer',
    fullName: 'Teleshop Customer',
    phone: '0900000003',
  },
];

async function main() {
  logger.info('Seeding Account Service Database...');

  await prisma.address.deleteMany({});
  await prisma.userProfile.deleteMany({});
  await prisma.processedEvent.deleteMany({});

  await prisma.userProfile.createMany({
    data: users.map((user) => ({
      id: user.profileId,
      userId: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      phone: user.phone,
    })),
  });

  await prisma.address.create({
    data: {
      profileId: '00000000-0000-0000-0000-000000001003',
      receiverName: 'Teleshop Customer',
      receiverPhone: '0900000003',
      street: '123 Nguyen Trai',
      ward: 'Ben Thanh',
      district: 'District 1',
      city: 'Ho Chi Minh City',
      isDefault: true,
      type: 'HOME',
    },
  });

  logger.info('Account seed complete: profiles and default address created.');
}

main()
  .catch((error) => {
    logger.error(error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
