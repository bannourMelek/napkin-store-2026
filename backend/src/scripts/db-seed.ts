/**
 * Database Seeding Script
 * Inserts sample data for testing
 *
 * Usage:
 *   npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import logger from '@/utils/logger.js';

const prisma = new PrismaClient();

async function seedDatabase(): Promise<void> {
  try {
    logger.info('🔌 Connecting to SQLite database...');

    logger.info('📝 Clearing existing data...');
    
    // Delete in order to respect foreign keys
    await prisma.gPIOLog.deleteMany({});
    await prisma.admin.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.stock.deleteMany({});

    logger.info('✅ Cleared existing data');

    // ============================================================================
    // USERS
    // ============================================================================
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await prisma.user.createMany({
      data: [
        {
          email: 'john.doe@example.com',
          username: 'john_doe',
          passwordHash: hashedPassword,
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          role: 'user',
          status: 'active',
        },
        {
          email: 'jane.smith@example.com',
          username: 'jane_smith',
          passwordHash: hashedPassword,
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1987654321',
          role: 'user',
          status: 'active',
        },
        {
          email: 'admin@example.com',
          username: 'admin_user',
          passwordHash: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          phone: '+1777777777',
          role: 'admin',
          status: 'active',
        },
        {
          email: 'superadmin@example.com',
          username: 'superadmin',
          passwordHash: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          phone: '+1888888888',
          role: 'admin',
          status: 'active',
        },
      ],
    });

    logger.info(`✅ Created ${users.count} users`);

    // ============================================================================
    // ADMIN PROFILES
    // ============================================================================
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    });

    const admins = await prisma.admin.createMany({
      data: adminUsers.map((user, index) => ({
        userId: user.id,
        adminLevel: index === 0 ? 'superadmin' : 'moderator',
        permissions: JSON.stringify(['read', 'write', 'delete']),
        department: index === 0 ? 'Management' : 'Support',
      })),
    });

    logger.info(`✅ Created ${admins.count} admin profiles`);

    // ============================================================================
    // STOCK
    // ============================================================================
    const stock = await prisma.stock.createMany({
      data: [
        {
          itemName: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse with 2.4GHz connection',
          sku: 'MOUSE-W001',
          quantity: 150,
          reorderLevel: 50,
          unit: 'piece',
          price: 25.99,
          supplier: 'TechSupply Inc.',
          location: 'Shelf A1',
          category: 'Electronics',
          images: JSON.stringify(['mouse-1.jpg', 'mouse-2.jpg']),
          tags: JSON.stringify(['wireless', 'mouse', 'computer']),
        },
        {
          itemName: 'USB-C Cable',
          description: '2m USB-C charging and data cable',
          sku: 'CABLE-USB-C-2M',
          quantity: 300,
          reorderLevel: 100,
          unit: 'piece',
          price: 12.99,
          supplier: 'CableWorld',
          location: 'Shelf B2',
          category: 'Cables',
          images: JSON.stringify(['cable-1.jpg']),
          tags: JSON.stringify(['usb-c', 'cable', 'charging']),
        },
        {
          itemName: 'Laptop Stand',
          description: 'Adjustable aluminum laptop stand',
          sku: 'STAND-LAP-001',
          quantity: 75,
          reorderLevel: 20,
          unit: 'piece',
          price: 45.99,
          supplier: 'TechFurniture Ltd.',
          location: 'Shelf C3',
          category: 'Accessories',
          images: JSON.stringify(['stand-1.jpg', 'stand-2.jpg', 'stand-3.jpg']),
          tags: JSON.stringify(['stand', 'laptop', 'desk']),
        },
      ],
    });

    logger.info(`✅ Created ${stock.count} stock items`);

    // ============================================================================
    // GPIO LOGS
    // ============================================================================
    const gpioLogs = await prisma.gPIOLog.createMany({
      data: [
        {
          deviceId: 'device-001',
          channel: 1,
          action: 'triggered',
          relayPin: 16,
          relayState: 'HIGH',
          duration: 1500,
          metadata: JSON.stringify({ sensor: 'motion', zone: 'entrance' }),
        },
        {
          deviceId: 'device-002',
          channel: 2,
          action: 'pressed',
          relayPin: 21,
          relayState: 'LOW',
          duration: 200,
        },
      ],
    });

    logger.info(`✅ Created ${gpioLogs.count} GPIO logs`);

    logger.info('🎉 Database seeding complete!');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Database seeding failed: ${message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();

      {
        userId: users[4]._id?.toString() || '',
        adminLevel: 'moderator',
        permissions: ['view_users', 'view_stock', 'edit_stock', 'view_logs'],
        department: 'Inventory Management',
        approvals: [],
      },
      {
        userId: users[5]._id?.toString() || '',
        adminLevel: 'superadmin',
        permissions: ['all'],
        department: 'Management',
        approvals: [],
      },
    ]);

    logger.info(`✅ Created ${adminProfiles.length} admin profiles`);

    // ============================================================================
    // STOCK ITEMS
    // ============================================================================
    const stockItems = await Stock.insertMany([
      {
        itemName: 'Standard White Napkin Pack',
        description: 'Pack of 100 standard white napkins, 2-ply',
        sku: 'NAP-001',
        quantity: 50,
        reorderLevel: 20,
        unit: 'pack',
        price: 5.99,
        supplier: 'Local Supplier Co.',
        location: 'Shelf A1',
        category: 'Napkins',
        batchNumber: 'BATCH-2024-001',
        tags: ['napkins', 'standard', 'disposable', 'white'],
        lastRestocked: new Date('2024-06-01'),
      },
      {
        itemName: 'Premium Colored Napkin Pack',
        description: 'Pack of 50 premium colored napkins, 3-ply',
        sku: 'NAP-002',
        quantity: 30,
        reorderLevel: 15,
        unit: 'pack',
        price: 8.99,
        supplier: 'Premium Supplies Ltd.',
        location: 'Shelf A2',
        category: 'Napkins',
        batchNumber: 'BATCH-2024-002',
        tags: ['napkins', 'premium', 'colored', 'disposable'],
        lastRestocked: new Date('2024-06-05'),
      },
      {
        itemName: 'Dinner Napkin Pack',
        description: 'Pack of 30 large dinner napkins, 2-ply linen',
        sku: 'NAP-003',
        quantity: 15,
        reorderLevel: 10,
        unit: 'pack',
        price: 6.99,
        supplier: 'Local Supplier Co.',
        location: 'Shelf A3',
        category: 'Napkins',
        batchNumber: 'BATCH-2024-003',
        tags: ['napkins', 'dinner', 'linen', 'disposable'],
        lastRestocked: new Date('2024-06-10'),
      },
      {
        itemName: 'Eco-Friendly Bamboo Napkins',
        description: 'Pack of 60 eco-friendly bamboo napkins',
        sku: 'NAP-004',
        quantity: 25,
        reorderLevel: 12,
        unit: 'pack',
        price: 9.99,
        supplier: 'Green Products Inc.',
        location: 'Shelf B1',
        category: 'Napkins',
        batchNumber: 'BATCH-2024-004',
        tags: ['napkins', 'eco-friendly', 'bamboo', 'sustainable'],
        lastRestocked: new Date('2024-06-08'),
      },
      {
        itemName: 'Travel Size Napkin Pack',
        description: 'Pack of 200 compact travel napkins',
        sku: 'NAP-005',
        quantity: 40,
        reorderLevel: 25,
        unit: 'pack',
        price: 3.99,
        supplier: 'Budget Supplies LLC',
        location: 'Shelf B2',
        category: 'Napkins',
        batchNumber: 'BATCH-2024-005',
        tags: ['napkins', 'travel', 'compact', 'budget'],
        lastRestocked: new Date('2024-06-15'),
      },
    ]);

    logger.info(`✅ Created ${stockItems.length} stock items`);

    // ============================================================================
    // GPIO LOGS
    // ============================================================================
    const gpioLogs = await GPIOLog.insertMany([
      {
        deviceId: 'DEVICE-001',
        channel: 1,
        action: 'pressed',
        relayPin: 17,
        relayState: 'HIGH',
        duration: 2,
        timestamp: new Date('2024-06-22T10:00:00Z'),
        status: 'success',
        userId: users[0]._id?.toString() || '',
        metadata: { location: 'Point A' },
      },
      {
        deviceId: 'DEVICE-001',
        channel: 2,
        action: 'triggered',
        relayPin: 27,
        relayState: 'ON',
        duration: 5,
        timestamp: new Date('2024-06-22T10:15:00Z'),
        status: 'success',
        userId: users[1]._id?.toString() || '',
        metadata: { location: 'Point B' },
      },
      {
        deviceId: 'DEVICE-002',
        channel: 1,
        action: 'released',
        relayPin: 22,
        relayState: 'LOW',
        duration: 3,
        timestamp: new Date('2024-06-22T10:30:00Z'),
        status: 'success',
        userId: users[2]._id?.toString() || '',
        metadata: { location: 'Point C' },
      },
      {
        deviceId: 'DEVICE-001',
        channel: 1,
        action: 'pressed',
        relayPin: 17,
        relayState: 'HIGH',
        timestamp: new Date('2024-06-22T11:00:00Z'),
        status: 'failed',
        errorMessage: 'GPIO pin timeout',
        userId: users[3]._id?.toString() || '',
        metadata: { location: 'Point A' },
      },
    ]);

    logger.info(`✅ Created ${gpioLogs.length} GPIO logs`);

    // ============================================================================
    // ORDERS
    // ============================================================================
    const orders = await Order.insertMany([
      {
        orderNumber: 'ORD-2024-001',
        userId: users[0]._id?.toString() || '',
        items: [
          { stockId: stockItems[0]._id?.toString() || '', quantity: 2, price: 5.99 },
          { stockId: stockItems[1]._id?.toString() || '', quantity: 1, price: 8.99 },
        ],
        totalAmount: 20.97,
        status: 'delivered',
        createdAt: new Date('2024-06-10T08:00:00Z'),
        updatedAt: new Date('2024-06-20T14:00:00Z'),
        deliveryDate: new Date('2024-06-20'),
      },
      {
        orderNumber: 'ORD-2024-002',
        userId: users[1]._id?.toString() || '',
        items: [{ stockId: stockItems[2]._id?.toString() || '', quantity: 3, price: 6.99 }],
        totalAmount: 20.97,
        status: 'confirmed',
        createdAt: new Date('2024-06-18T09:00:00Z'),
        updatedAt: new Date('2024-06-19T10:00:00Z'),
      },
      {
        orderNumber: 'ORD-2024-003',
        userId: users[2]._id?.toString() || '',
        items: [{ stockId: stockItems[3]._id?.toString() || '', quantity: 2, price: 9.99 }],
        totalAmount: 19.98,
        status: 'pending',
        createdAt: new Date('2024-06-21T11:00:00Z'),
        updatedAt: new Date('2024-06-21T11:00:00Z'),
      },
    ]);

    logger.info(`✅ Created ${orders.length} orders`);

    // ============================================================================
    // TRANSACTIONS
    // ============================================================================
    const transactions = await Transaction.insertMany([
      {
        transactionId: 'TXN-2024-001',
        userId: users[0]._id?.toString() || '',
        amount: 20.97,
        type: 'purchase',
        status: 'completed',
        orderId: orders[0]._id?.toString() || '',
        paymentMethod: 'credit_card',
        timestamp: new Date('2024-06-20T14:00:00Z'),
        metadata: { cardLast4: '4242', reference: 'PAY-REF-001' },
      },
      {
        transactionId: 'TXN-2024-002',
        userId: users[1]._id?.toString() || '',
        amount: 20.97,
        type: 'purchase',
        status: 'pending',
        orderId: orders[1]._id?.toString() || '',
        paymentMethod: 'bank_transfer',
        timestamp: new Date('2024-06-19T10:00:00Z'),
        metadata: { bankName: 'Example Bank', reference: 'PAY-REF-002' },
      },
      {
        transactionId: 'TXN-2024-003',
        userId: users[0]._id?.toString() || '',
        amount: -5.00,
        type: 'refund',
        status: 'completed',
        timestamp: new Date('2024-06-21T15:00:00Z'),
        metadata: { reason: 'Item damaged', originalTransaction: 'TXN-2024-001' },
      },
    ]);

    logger.info(`✅ Created ${transactions.length} transactions`);

    // ============================================================================
    // SUMMARY
    // ============================================================================
    logger.info('');
    logger.info('🎉 Database seeding complete!');
    logger.info(`   📊 Summary:`);
    logger.info(`   ├─ Users: ${users.length}`);
    logger.info(`   ├─ Admins: ${adminProfiles.length}`);
    logger.info(`   ├─ Stock Items: ${stockItems.length}`);
    logger.info(`   ├─ GPIO Logs: ${gpioLogs.length}`);
    logger.info(`   ├─ Orders: ${orders.length}`);
    logger.info(`   └─ Transactions: ${transactions.length}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Database seeding failed: ${message}`);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seedDatabase();
