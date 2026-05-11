const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.pCBuild.findMany({
    orderBy: { createdAt: 'desc' },
}).then(async builds => {
    const componentIds = Array.from(new Set(
        builds.flatMap(b => [b.cpuId, b.gpuId, b.ramId, b.motherboardId, b.storageId, b.psuId, b.caseId])
    )).filter(Boolean);

    const components = await prisma.component.findMany({
        where: { id: { in: componentIds } }
    });

    const compMap = Object.fromEntries(components.map(c => [c.id, c]));

    const enrichedBuilds = builds.map(b => ({
        ...b,
        specs: {
            "Processor": compMap[b.cpuId || ""]?.name || "-",
            "Graphics Card": compMap[b.gpuId || ""]?.name || "-",
            "Memory": compMap[b.ramId || ""]?.name || "-",
            "Motherboard": compMap[b.motherboardId || ""]?.name || "-",
            "Storage": compMap[b.storageId || ""]?.name || "-",
            "Power Supply": compMap[b.psuId || ""]?.name || "-",
            "Case": compMap[b.caseId || ""]?.name || "-"
        }
    }));
    console.log(JSON.stringify(enrichedBuilds, null, 2));
    prisma.$disconnect();
});
