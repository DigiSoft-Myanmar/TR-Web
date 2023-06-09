import type { NextApiRequest, NextApiResponse } from "next";
import { sendEmail } from "@/lib/email";
import useAuth from "@/hooks/useAuth";
import {
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";

import prisma from "@/prisma/prisma";
import { OrderStatus, PaymentStatus } from "@/types/orderTypes";
import { sortBy } from "lodash";
import { CartItem } from "@/prisma/models/cartItems";
import { getTotal } from "@/util/orderHelper";
import { getOrderStatus } from "@/util/orderHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      let { orderNo } = req.query;
      let body = JSON.parse(req.body);
      let email = body?.email;
      let phoneNum = body?.phoneNum;
      if (orderNo && email && phoneNum) {
        let n = parseInt(orderNo!.toString());
        let order = await prisma.order.findFirst({
          where: {
            orderNo: n,
          },
        });
        if (order) {
          let b: any = order.billingAddress;

          if (b && b.email === email && b.phoneNum === phoneNum) {
            const statusArr: any = [];
            for (let i = 0; i < order.sellerResponse.length; i++) {
              let item: any = order.sellerResponse[i];
              let s = sortBy(
                item.statusHistory,
                (obj: any) => obj.updatedDate
              ).reverse()[0];
              let b = await prisma.user.findFirst({
                where: {
                  id: item.brandId,
                },
              });
              statusArr.push({
                seller: b,
                status: s.status,
                updatedDate: s.updatedDate,
              });
            }
            let status = getOrderStatus(statusArr);

            let returnBody = {
              orderNo: order.orderNo,
              email: email,
              phoneNum: phoneNum,
              currentStatus: status,
              updatedDate: order.updatedAt,
              details: statusArr,
            };
            return res.status(200).json(returnBody);
          } else {
            return res.status(400).json({
              error:
                "Order #" +
                orderNo +
                " is not ordered with " +
                email +
                " and " +
                phoneNum,
              errorMM:
                "အော်ဒါနံပါတ် #" +
                orderNo +
                " သည် " +
                email +
                " နှင့် " +
                phoneNum +
                " တို့ဖြင့်မှာယူထားခြင်းမဟုတ်ပါ။",
            });
          }
        } else {
          return res.status(404).json(NotAvailable);
        }
      } else {
        return res.status(400).json(BadRequest);
      }
    } else {
      return res.status(405).json(NotAvailable);
    }
  } catch (err) {
    console.log(err);
    return res.status(400);
  }
}
