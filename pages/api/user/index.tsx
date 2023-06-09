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
import { Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

async function getUser(req: NextApiRequest, res: NextApiResponse<any>) {
  const { isLogin, phone, type, email } = req.query;
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
    let user: any = await getAllUser(type?.toString());

    return res.status(200).json(user);
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
          if (data.role === Role.Seller) {
            user = await createSeller(data);
          } else {
            user = await prisma.user.create({
              data: b,
            });
          }
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
    } else if (data.brandName) {
      const user = await createSeller(data);
    } else {
      const user = await createBuyer(data);
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
    /*   case "PUT":
        return res.status(404).json(NotAvailable); */
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
