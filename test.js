const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.pCBuild.findMany().then(b => {
    console.log(JSON.stringify(b, null, 2));
    prisma.$disconnect();
});
