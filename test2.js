const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.component.findMany({take: 5}).then(c => {
    console.log(JSON.stringify(c, null, 2));
    prisma.$disconnect();
});
