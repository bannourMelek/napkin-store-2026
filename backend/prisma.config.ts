// Prisma configuration for SQLite
// This file is required for Prisma v7+ to specify the database URL

const databaseUrl = 'file:./prisma/dev.db';

export const datasources = {
    db: {
        url: databaseUrl,
    },
};
