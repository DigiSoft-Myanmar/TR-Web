// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import { createTerm, deleteTerm, updateTerm } from "@/prisma/models/product";
import prisma from "@/prisma/prisma";
import {
  AlreadyExists,
  BadRequest,
  Exists,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { isBuyer, isInternal, isSeller } from "@/util/authHelper";
import { ProductType, Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let { phoneNum } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (phoneNum) {
      switch (req.method) {
        case "GET":
          let user = await prisma.user.findFirst({
            where: {
              phoneNum: phoneNum.toString(),
            },
            include: {
              UserAddress: {
                include: {
                  state: true,
                  district: true,
                  township: true,
                },
              },
            },
          });
          if (user) {
            let addressInfo = {
              billingAddress: undefined,
              shippingAddress: [],
            };
            if (user.UserAddress && user.UserAddress.length > 0) {
              addressInfo.billingAddress = user.UserAddress.find(
                (z) => z.isBillingAddress === true
              );
              addressInfo.shippingAddress = user.UserAddress.filter(
                (z) => z.isBillingAddress === false
              );
            }

            if (addressInfo.billingAddress) {
            } else {
              if (
                user.username &&
                user.phoneNum &&
                user.email &&
                user.districtId &&
                user.townshipId &&
                user.houseNo &&
                user.stateId &&
                user.street
              ) {
                let address = await prisma.userAddress.create({
                  data: {
                    name: user.username,
                    phoneNum: user.phoneNum,
                    email: user.email,
                    districtId: user.districtId,
                    townshipId: user.townshipId,
                    houseNo: user.houseNo,
                    isBillingAddress: true,
                    stateId: user.stateId,
                    street: user.street,
                    userId: user.id,
                  },
                  include: {
                    state: true,
                    district: true,
                    township: true,
                  },
                });
                addressInfo.billingAddress = address;
              }
            }

            return res.status(200).json(addressInfo);
          } else {
            return res.status(404).json(NotAvailable);
          }
        case "PUT":
          let { id } = req.query;
          let body = JSON.parse(req.body);
          console.log(id);
          if (id) {
            await prisma.userAddress.update({
              where: {
                id: id.toString(),
              },
              data: body,
            });
          } else {
            await prisma.userAddress.create({
              data: body,
            });
          }

          return res.status(200).json(Success);
        case "DELETE":
          let { id: deleteId } = req.query;
          if (deleteId) {
            let a = await prisma.userAddress.delete({
              where: {
                id: deleteId.toString(),
              },
            });
            console.log(a);
          }
          return res.status(200).json(Success);

        default:
          return res.status(501).json(NotAvailable);
      }
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
