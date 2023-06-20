import prisma from "@/prisma/prisma";
import { Colors } from "@/types/color";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let data = require("./categories.json");
    for (let i = 0; i < data.length; i++) {
      /* let d = await prisma.category.upsert({
        where: {
          slug: data[i].slug,
        },
        create: {
          slug: data[i].slug,
          color: Colors.primary,
          icon: data[i].iconUrl,
          name: data[i].name,
          nameMM: data[i].nameMM,
        },
        update: {
          slug: data[i].slug,
          color: Colors.primary,
          icon: data[i].iconUrl,
          name: data[i].name,
          nameMM: data[i].nameMM,
        },
      });
      console.log(d.id); */
      if (data[i].subCategories) {
        for (let j = 0; j < data[i].subCategories.length; j++) {
          let subCat = data[i].subCategories[j];
          /* let category = await prisma.category.findFirst({
            where: {
              slug: data[i].slug,
            },
          });
          if (category) {
            await prisma.category.upsert({
              where: {
                slug: subCat.slug,
              },
              create: {
                slug: subCat.slug,
                color: Colors.primary,
                icon: subCat.iconUrl,
                name: subCat.name,
                nameMM: subCat.nameMM,
                parentId: category.id,
              },
              update: {
                slug: subCat.slug,
                color: Colors.primary,
                icon: subCat.iconUrl,
                name: subCat.name,
                nameMM: subCat.nameMM,
                parentId: category.id,
              },
            });
          } */
          if (data[i].subCategories[j].subCategories) {
            for (
              let m = 0;
              m < data[i].subCategories[j].subCategories.length;
              m++
            ) {
              let subCat2 = data[i].subCategories[j].subCategories[m];
              let category1 = await prisma.category.findFirst({
                where: {
                  slug: subCat.slug,
                },
              });

              if (category1 && subCat2 && subCat2.slug) {
                /* await prisma.category.upsert({
                  where: {
                    slug: subCat2.slug,
                  },
                  create: {
                    slug: subCat2.slug,
                    color: Colors.primary,
                    icon: subCat2.iconUrl,
                    name: subCat2.name,
                    nameMM: subCat2.nameMM,
                    parentId: category1.id,
                  },
                  update: {
                    slug: subCat2.slug,
                    color: Colors.primary,
                    icon: subCat2.iconUrl,
                    name: subCat2.name,
                    nameMM: subCat2.nameMM,
                    parentId: category1.id,
                  },
                }); */
              }
            }
          }
        }
      }
    }
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
