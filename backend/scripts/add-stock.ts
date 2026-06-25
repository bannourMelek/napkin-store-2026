/**
 * Add Stock Script
 * 
 * Usage: npx tsx scripts/add-stock.ts
 * 
 * Simply modify the STOCK_ITEMS array below with your stock data and run the script
 */

import { connectDB, getStockDB } from '@/config/database.js';
import logger from '@/utils/logger.js';
import { insert, find, generateId } from '@/utils/nedb-helper.js';
import type { StockItem } from '@/models/index.js';

// ============================================================================
// MODIFY THIS ARRAY TO ADD YOUR STOCK ITEMS
// ============================================================================

interface StockInput {
    stockA: number;
    stockB: number;
}

const STOCK_ITEMS: StockInput[] = [
    { stockA: 100, stockB: 100 },
];

// ============================================================================
// DO NOT MODIFY BELOW THIS LINE
// ============================================================================

async function addStock(): Promise<void> {
    try {
        await connectDB();
        const db = getStockDB();

        logger.info(`📝 Adding ${STOCK_ITEMS.length} stock item(s)...`);

        for (const stockData of STOCK_ITEMS) {
            try {
                // Create new stock item
                const newStock: StockItem = {
                    stockA: stockData.stockA || 10,
                    stockB: stockData.stockB || 10,
                };

                const stock = await insert(db, newStock);
                logger.info(`✅ Added stock item: ${stockData.stockA} (${stockData.stockB})`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                logger.error(`❌ Error adding stock item ${stockData.stockA} (${stockData.stockB}): ${message}`);
            }
        }

        // Show all stock items
        logger.info('\n📊 All stock items in database:');
        const allStock = await find(db, {});

        let totalValue = 0;
        allStock.forEach((item: any) => {
            const itemValue = (item.quantity || 0) * (item.price || 0);
            totalValue += itemValue;
            logger.info(
                `  • ${item.sku} - ${item.itemName} (Qty: ${item.quantity}, Price: $${item.price || 0})`
            );
        });

        logger.info(`\n📊 Stock Summary:`);
        logger.info(`   Total Items: ${allStock.length}`);
        logger.info(`   Total Value: $${totalValue.toFixed(2)}`);
        logger.info(`\n✅ Stock setup complete!`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`❌ Script failed: ${message}`);
        process.exit(1);
    }
}

addStock();
