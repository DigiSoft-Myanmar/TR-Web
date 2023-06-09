import clientPromise from "@/lib/mongodb";
import { SMTPClient, SMTPConnectionOptions } from "emailjs";
import { NextApiResponse } from "next";
import { decrypt } from "./encrypt";

export async function getSMTClient() {
  try {
    /* let db = (await clientPromise).db();
    const settings = await db.collection("settings").findOne({}); */
    let senderEmail = "heinhtoo.dev@gmail.com";
    let senderPwd = "qnuijnurypchxdsd";
    let host = "smtp.gmail.com";
    let port = 465;
    let isTSL: any = false;
    /* if (settings) {
      if (settings.senderEmail && settings.senderEmailPassword) {
        senderEmail = settings.senderEmail;
        senderPwd = decrypt(settings.senderEmailPassword);
      }
      if (settings.senderEmailHost) {
        host = settings.senderEmailHost;
      }
      if (settings.senderEmailTSL && settings.senderEmailTSL === true) {
        isTSL = true;
      }
      if (settings.senderEmailPort) {
        port = settings.senderEmailPort;
      }
    } */
    let clientInfo: Partial<SMTPConnectionOptions> = {
      user: senderEmail,
      password: senderPwd,
      host: host,
      timeout: 10000,
    };
    if (isTSL === true) {
      clientInfo.tls = true;
    } else {
      clientInfo.ssl = true;
    }
    if (port !== 0) {
      clientInfo.port = port;
    }

    const client = new SMTPClient(clientInfo);
    return { isSuccess: true, client: client, sendEmail: senderEmail };
  } catch (err) {
    return { isSuccess: false, error: err };
  }
}

export async function sendEmailFn(
  to: string,
  subject: string,
  htmlString: string,
) {
  try {
    let client = await getSMTClient();
    if (client.isSuccess === true && client.client && client.sendEmail) {
      client.client.send(
        {
          text: "Not supported. Please upgrade or update your browser.",
          from: "Treasure Rush <" + client.sendEmail + ">",
          to: to,
          subject: subject,
          attachment: [
            {
              data: htmlString,
              alternative: true,
            },
          ],
        },
        (err, message) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Success");
          }
        },
      );
    } else {
      console.log(client.error);
    }
  } catch (err) {
    console.log(err);
  }
}
