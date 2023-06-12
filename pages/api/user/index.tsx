// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import {
  createBuyer,
  createSeller,
  createUser,
  deleteUser,
  getAllUser,
  getUserByEmail,
  getUserByPhone,
} from "@/prisma/models/user";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { RoleNav } from "@/types/role";
import { Gender, Role, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

async function addShippingInfo(user: any) {
  if (user.role === Role.Seller || user.role === Role.Trader) {
    const shippingFees = await prisma.shippingCost.findMany({
      where: {
        sellerId: user.id,
        shippingCost: {
          not: user.defaultShippingCost ? user.defaultShippingCost : 0,
        },
      },
    });
    user.shippingInfo = {
      shippingIncluded: user.shippingIncluded,
      defaultShippingCost: user.defaultShippingCost,
      isDiff: shippingFees.length > 0 ? true : false,
    };
    const freeShippingFees = await prisma.shippingCost.findMany({
      where: {
        sellerId: user.id,
        freeShippingCost: {
          not: user.freeShippingCost ? user.freeShippingCost : 0,
        },
      },
    });
    user.freeShippingInfo = {
      shippingIncluded: user.shippingIncluded,
      isOfferFreeShipping: user.isOfferFreeShipping,
      freeShippingCost: user.freeShippingCost,
      isDiff: freeShippingFees.length > 0 ? true : false,
    };
  }
  return user;
}

async function getUser(req: NextApiRequest, res: NextApiResponse<any>) {
  const { isLogin, phone, type, email, isSeller } = req.query;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  if (isLogin && phone) {
    let user = await getUserByPhone(phone.toString());
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json(NotAvailable);
    }
  } else if (isLogin && email) {
    let user = await getUserByEmail(email.toString());
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json(NotAvailable);
    }
  } else if (
    session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin)
  ) {
    if (isSeller?.toString() === "true") {
      let user = await prisma.user.findMany({
        where: {
          role: {
            in: [Role.Seller, Role.Trader],
          },
        },
      });
      for (let i = 0; i < user.length; i++) {
        let shippingInfo = await addShippingInfo(user[i]);
        user[i] = { ...user[i], ...shippingInfo };
      }
      return res.status(200).json(user);
    } else {
      let user: any = await getAllUser(type?.toString());

      return res.status(200).json(user);
    }
  } else {
    return res.status(400).json(BadRequest);
  }
}

async function addUser(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let data = JSON.parse(req.body);
    if (data.role) {
      let body = {
        email: data.email,
        emailVerified: false,
        phoneNumber: data.phoneNum,
        password: data.password,
        disabled: false,
      };
      let result = await firebaseAdmin
        .auth()
        .createUser(body)
        .then(async (a) => {
          let user = undefined;
          let b = { ...data };
          if (b.password) {
            delete b.password;
          }
          if (b.confirmPassword) {
            delete b.confirmPassword;
          }
          if (!b.gender) {
            b.gender = Gender.Male;
          }
          user = await prisma.user.create({
            data: b,
          });
          return { isError: false, data: user };
        })
        .catch((err) => {
          return { isError: true, data: err };
        });
      if (result.isError === true) {
        return res.status(400).json(result.data);
      } else {
        return res.status(200).json(Success);
      }
    }
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const session = await useAuth(req);

  switch (req.method) {
    case "GET":
      return getUser(req, res);
    case "POST":
      return addUser(req, res);
    case "PUT":
      let { id } = req.query;
      let data = JSON.parse(req.body);
      if (id) {
        let user = await prisma.user.findFirst({
          where: {
            id: id.toString(),
          },
        });
        if (user) {
          let u = await prisma.user.update({
            where: {
              id: user.id,
            },
            data: data,
          });
          return res.status(200).json(Success);
        } else {
          return res.status(404).json(NotAvailable);
        }
      } else {
        return res.status(400).json(BadRequest);
      }

    case "DELETE":
      if (
        session &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin)
      ) {
        let { id, type } = req.query;
        if (type === RoleNav.Subscribe && id) {
          await prisma.subscribe.delete({
            where: {
              id: id.toString(),
            },
          });
          return res.status(200).json(Success);
        } else if (id) {
          let d = await deleteUser(id?.toString());
          if (d.success === true) {
            return res.status(200).json(Success);
          } else {
            return res.status(400).json(d.data);
          }
        } else {
          return res.status(400).json(BadRequest);
        }
      } else {
        return res.status(401).json(Unauthorized);
      }
    default:
      return res.status(405).json(NotAvailable);
  }
}
