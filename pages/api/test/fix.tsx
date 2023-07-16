import { firebaseAdmin } from "@/lib/firebaseAdmin";
import prisma from "@/prisma/prisma";
import { ProductType, Role } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    /* let seller = await prisma.user.findFirst({
      where: {
        role: Role.Seller,
      },
    });

    let body = {
      email: "727minimartmdy@gmail.com",
      emailVerified: false,
      phoneNumber: seller.phoneNum,
      password: "123456",
      disabled: false,
    };
    let result = await firebaseAdmin.auth().createUser(body);
    return res.status(200).json(result); */

    let data = require("./brands.json");
    await prisma.productView.deleteMany({});
    await prisma.product.deleteMany({
      where: {
        type: ProductType.Variable,
      },
    });
    return res.status(200).json({ prodCount: data.length });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
