import prisma from "@/prisma/prisma";
import { render } from "@react-email/render";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import Email from "@/emails";
import { decrypt } from "./encrypt";
import { Order } from "@prisma/client";
import { addCartItems } from "@/pages/api/orders";
import OrderEmail from "@/emails/order";
import { getAdminEmailList, getStaffEmailList } from "./notiHelper";
import { OrderPermission } from "@/types/permissionTypes";
import async from "async";

export async function sendEmailNodeFn(
  subject: string,
  emailHtml: string,
  sendList: string[]
) {
  const conf: any = await prisma.configuration.findFirst({});
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "sales@treasurerush.com.mm",
      pass: "gniplgskhalnkbnf",
    },
    debug: true,
    logger: true,
  });
  if (
    conf &&
    conf.senderEmailHost &&
    conf.senderEmailPort &&
    conf.senderEmail &&
    conf.senderEmailPassword
  ) {
    const clientPassword = decrypt({
      iv: conf.senderEmailPassword.iv,
      encryptedData: conf.senderEmailPassword.encryptedData,
    });
    if (conf.senderEmailTSL === true) {
      transporter = nodemailer.createTransport({
        host: conf.senderEmailHost,
        port: conf.senderEmailPort,
        secure: false,
        tls: {
          ciphers: "SSLv3",
          rejectUnauthorized: false,
        },
        requireTLS: true,
        auth: {
          user: conf.senderEmail,
          pass: clientPassword,
        },
        debug: true,
        logger: true,
      });
    } else {
      transporter = nodemailer.createTransport({
        host: conf.senderEmailHost,
        port: conf.senderEmailPort,
        secure: false,
        auth: {
          user: conf.senderEmail,
          pass: clientPassword,
        },
        debug: true,
        logger: true,
      });
    }
  }

  if (sendList.filter((z) => z !== conf.senderEmail).length > 0) {
    let emailRes = await transporter.sendMail({
      from: "Treasure Rush <" + conf.senderEmail + ">",
      to: sendList.filter((z) => z !== conf.senderEmail),
      subject: subject,
      html: emailHtml,
      replyTo: conf.senderEmail,
    });
    let acceptedResult = emailRes.accepted;
    let rejectedResult = emailRes.rejected;
    let pendingResult = emailRes.pending;

    return {
      accepted: acceptedResult,
      rejected: rejectedResult,
      pending: pendingResult,
    };
  } else {
    return {
      accepted: [],
      rejected: [],
      pending: [],
    };
  }
}

export async function sendOrderEmail(sendOrder: Order, title: string) {
  let order: any = await prisma.order.findFirst({
    include: {
      orderBy: true,
      promoCodes: true,
    },
    where: {
      orderNo: sendOrder.orderNo,
    },
  });

  for (let i = 0; i < order.sellerResponse.length; i++) {
    let orderResponse: any = order.sellerResponse[i];
    let seller = await prisma.user.findFirst({
      where: {
        id: orderResponse.sellerId,
      },
    });
    if (seller) {
      orderResponse.seller = seller;
    }
  }

  const attributes = await prisma.attribute.findMany({
    include: {
      Term: true,
    },
  });

  const content = await prisma.content.findFirst({});

  if (order.billingAddress) {
    let state = await prisma.state.findFirst({
      where: {
        id: order.billingAddress.stateId,
      },
    });
    order.billingAddress.stateStr = state.name;

    let district = await prisma.district.findFirst({
      where: {
        id: order.billingAddress.districtId,
      },
    });
    order.billingAddress.districtStr = district.name;

    let township = await prisma.township.findFirst({
      where: {
        id: order.billingAddress.townshipId,
      },
    });
    order.billingAddress.townshipStr = township.name;
  }
  if (order.shippingAddress) {
    let state = await prisma.state.findFirst({
      where: {
        id: order.shippingAddress.stateId,
      },
    });
    order.shippingAddress.stateStr = state.name;

    let district = await prisma.district.findFirst({
      where: {
        id: order.shippingAddress.districtId,
      },
    });
    order.shippingAddress.districtStr = district.name;

    let township = await prisma.township.findFirst({
      where: {
        id: order.shippingAddress.townshipId,
      },
    });
    order.shippingAddress.townshipStr = township.name;
  }

  order = await addCartItems(order);

  const emailHtml = render(
    <OrderEmail content={content!} order={order!} attributes={attributes} />
  );

  let adminEmail = await getAdminEmailList();
  let staffEmail = await getStaffEmailList(OrderPermission.orderEmailAllow);
  let emailSendList = [...adminEmail, ...staffEmail];
  if (order.orderBy.email) {
    emailSendList.push(order.orderBy.email);
  }
  let sellerList = await prisma.user.findMany({
    where: {
      id: {
        in: order.sellerIds,
      },
      email: {
        isSet: true,
      },
    },
  });
  emailSendList = [...emailSendList, ...sellerList.map((z) => z.email)];

  async.each(
    emailSendList,
    function (email: any, callback) {
      sendEmailNodeFn(title, emailHtml, [email]);
    },
    function (error) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email Sent Successfully.");
      }
    }
  );
}
