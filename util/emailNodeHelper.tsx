import prisma from "@/prisma/prisma";
import { render } from "@react-email/render";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import Email from "@/emails";
import { decrypt } from "./encrypt";

export async function sendEmailNodeFn(
  subject: string,
  emailHtml: string,
  sendList: string[]
) {
  const conf: any = await prisma.configuration.findFirst({});
  /*  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "heinhtoo.dev@gmail.com",
      pass: "qnuijnurypchxdsd",
    },
  }); */
  let transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: "sales@shweyeeoo.com",
      pass: "MsSyoAdmin@2023",
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
