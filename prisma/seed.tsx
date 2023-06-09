import { Gender, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function seedUsers() {
  await prisma.user.upsert({
    where: { email: "heinhtoozaw99@gmail.com" },
    update: {
      username: "Hein Htoo",
      email: "heinhtoozaw99@gmail.com",
      role: Role.SuperAdmin,
    },
    create: {
      username: "Hein Htoo",
      email: "heinhtoozaw99@gmail.com",
      role: Role.SuperAdmin,
      gender: Gender.Male,
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
