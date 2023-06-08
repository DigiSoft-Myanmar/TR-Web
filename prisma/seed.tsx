import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function seedUsers() {
  await prisma.user.upsert({
    where: { username: "heinhtoo" },
    update: {
      username: "heinhtoo",
      email: "heinhtoozaw99@gmail.com",
      role: Role.SuperAdmin,
      iv: "bda25b5cc9eff9754bb26598cfbb3ee4",
      encryptedData: "36a52ef4779b9dca51bf930896740dbc",
    },
    create: {
      username: "heinhtoo",
      email: "heinhtoozaw99@gmail.com",
      role: Role.SuperAdmin,
      iv: "bda25b5cc9eff9754bb26598cfbb3ee4",
      encryptedData: "36a52ef4779b9dca51bf930896740dbc",
    },
  });

  await prisma.user.upsert({
    where: { username: "hninyu" },
    update: {
      username: "hninyu",
      email: "hninyushwe@gmail.com",
      role: Role.SuperAdmin,
      iv: "bda25b5cc9eff9754bb26598cfbb3ee4",
      encryptedData: "36a52ef4779b9dca51bf930896740dbc",
    },
    create: {
      username: "hninyu",
      email: "hninyushwe@gmail.com",
      role: Role.SuperAdmin,
      iv: "bda25b5cc9eff9754bb26598cfbb3ee4",
      encryptedData: "36a52ef4779b9dca51bf930896740dbc",
    },
  });

  await prisma.user.upsert({
    where: { username: "thandar" },
    update: {
      username: "thandar",
      email: "thandarphyu@gmail.com",
      role: Role.SuperAdmin,
      iv: "bda25b5cc9eff9754bb26598cfbb3ee4",
      encryptedData: "36a52ef4779b9dca51bf930896740dbc",
    },
    create: {
      username: "thandar",
      email: "thandarphyu@gmail.com",
      role: Role.SuperAdmin,
      iv: "bda25b5cc9eff9754bb26598cfbb3ee4",
      encryptedData: "36a52ef4779b9dca51bf930896740dbc",
    },
  });
}

async function seedTownships() {
  let data = require("./data.json");
  data.data.forEach(async (elem: any) => {
    const state = await prisma.state.upsert({
      where: { name: elem.eng },
      update: {
        name: elem.eng,
        nameMM: elem.mm,
        lat: elem.lat,
        lng: elem.lng,
        capital: elem.capital,
      },
      create: {
        name: elem.eng,
        nameMM: elem.mm,
        lat: elem.lat,
        lng: elem.lng,
        capital: elem.capital,
      },
    });
    elem.districts.forEach(async (d: any) => {
      const district = await prisma.district.upsert({
        where: { name: d.eng },
        update: {
          name: d.eng,
          nameMM: d.mm,
          stateId: state.id,
        },
        create: {
          name: d.eng,
          nameMM: d.mm,
          stateId: state.id,
        },
      });

      d.townships.forEach(async (t: any) => {
        const township = await prisma.township.upsert({
          where: { name: t.eng },
          update: {
            name: t.eng,
            nameMM: t.mm,
            districtId: district.id,
          },
          create: {
            name: t.eng,
            nameMM: t.mm,
            districtId: district.id,
          },
        });
      });
    });
  });
}

async function main() {
  seedTownships();
  seedUsers();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
