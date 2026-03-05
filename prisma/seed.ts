import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 เริ่มการเพิ่ม Mockup Data...");

    // ล้างข้อมูลตาราง Component เก่าออกให้หมดก่อน (ถ้ามี)
    await prisma.component.deleteMany({});
    console.log("🧹 ล้างข้อมูลเดิมเรียบร้อย");

    // ข้อมูล CPU
    const cpus = [
        {
            name: "Intel Core i5-12400F",
            type: "CPU",
            brand: "Intel",
            price: 4990,
            image: "https://media.studio7thailand.com/74384/Intel-CPU-Core-i5-12400F-bx8071512400f-1-square_medium.jpg",
            socket: "LGA1700",
            ramType: "DDR4, DDR5",
            cpuSingleScore: 3500, // ค่าสมมติอิง Passmark
            cpuMultiScore: 19500, // ค่าสมมติอิง Passmark
        },
        {
            name: "AMD Ryzen 5 7600X",
            type: "CPU",
            brand: "AMD",
            price: 8500,
            image: "https://media.studio7thailand.com/77607/AMD-CPU-Ryzen-5-7600X-100-100000593WOF-1-square_medium.jpg",
            socket: "AM5",
            ramType: "DDR5",
            cpuSingleScore: 4200,
            cpuMultiScore: 28500,
        },
        {
            name: "Intel Core i7-14700K",
            type: "CPU",
            brand: "Intel",
            price: 15900,
            image: "https://media.studio7thailand.com/131711/Intel-CPU-Core-i7-14700k-bx8071514700k-1-square_medium.jpg",
            socket: "LGA1700",
            ramType: "DDR4, DDR5",
            cpuSingleScore: 4800,
            cpuMultiScore: 54000,
        }
    ];

    // ข้อมูล GPU
    const gpus = [
        {
            name: "NVIDIA GeForce RTX 3060 Ti",
            type: "GPU",
            brand: "Nvidia",
            price: 11900,
            image: "https://media-cdn.bnn.in.th/126284/Gigabyte-VGA-RTX-3060-Ti-GAMING-OC-8GB-GDDR6-256-bit-1-square_medium.jpg",
            gpuScore: 19800,
            vramGb: 8,
        },
        {
            name: "AMD Radeon RX 7800 XT",
            type: "GPU",
            brand: "AMD",
            price: 18500,
            image: "https://img.jib.co.th/jib_img/img_product/62534_00_pimg_20240904094056.jpg",
            gpuScore: 27500,
            vramGb: 16,
        },
        {
            name: "NVIDIA GeForce RTX 4070 Ti SUPER",
            type: "GPU",
            brand: "Nvidia",
            price: 32900,
            image: "https://media-cdn.bnn.in.th/406456/Asus-VGA-TUF-RTX4070TIS-O16G-GAMING-16GB-GDDR6X-256-bit-1-square_medium.jpg",
            gpuScore: 31500,
            vramGb: 16,
        }
    ];

    // ข้อมูล RAM
    const rams = [
        {
            name: "Corsair Vengeance LPX 16GB (8GBx2)",
            type: "RAM",
            brand: "Corsair",
            price: 1590,
            image: "https://media.studio7thailand.com/83273/Corsair-Ram-PC-DDR4-16GB3200-2x8GB-CL16-Vengeance-LPX-Black-1-square_medium.jpg",
            ramType: "DDR4",
            capacity: 16,
            ramSpeed: 3200,
        },
        {
            name: "Kingston FURY Beast 32GB (16GBx2)",
            type: "RAM",
            brand: "Kingston",
            price: 4500,
            image: "https://media.studio7thailand.com/71253/Kingston-Ram-PC-DDR5-32GB5200-2x16GB-C40-FURY-Beast-Black-1-square_medium.jpg",
            ramType: "DDR5",
            capacity: 32,
            ramSpeed: 5200,
        }
    ];

    // ข้อมูล Storage (SSD)
    const storages = [
        {
            name: "Samsung 980 PRO 1TB NVMe M.2",
            type: "STORAGE",
            brand: "Samsung",
            price: 3890,
            image: "https://media-cdn.bnn.in.th/120286/Samsung-SSD-1TB-M.2-PCIe-NVMe-980-Pro-1-square_medium.jpg",
            capacity: 1000,
            readWriteSpeed: 7000,
        },
        {
            name: "WD Blue SN580 500GB NVMe M.2",
            type: "STORAGE",
            brand: "Western Digital",
            price: 1590,
            image: "https://media-cdn.bnn.in.th/308117/WD-SSD-Blue-SN580-500GB-M.2-PCIe-NVMe-Gen-4-1-square_medium.jpg",
            capacity: 500,
            readWriteSpeed: 4000,
        }
    ];


    // รวมข้อมูลทั้งหมดเพื่อเอาเข้า DB รวดเดียว
    const allComponents = [...cpus, ...gpus, ...rams, ...storages];

    console.log(`กำลังสร้างสินค้าทั้งหมด ${allComponents.length} ชิ้น...`);

    for (const component of allComponents) {
        await prisma.component.create({
            data: component
        });
    }

    console.log("✅ เพิ่มข้อมูลลง Database สำเร็จ!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
