import { firebaseAdmin } from "@/lib/firebaseAdmin";
import prisma from "@/prisma/prisma";
import { Role } from "@prisma/client";
import { NextApiRequest } from "next";
import { getSession } from "next-auth/react";

export default async function useAuth(req: NextApiRequest) {
  let session = await getSession({ req });

  if (session) {
    return session;
  } else {
    let headers = req.headers;
    try {
      if (headers.appid && headers.appsecret && headers.apptype === "email") {
        let appId: any = headers.appid;
        let s: any = {};
        let d = await fetch(
          process.env.NEXTAUTH_URL +
            "/api/user?isLogin=true&email=" +
            encodeURIComponent(appId)
        );

        if (d.status === 200) {
          let user = await d.json();
          if (user) {
            if (user.role === Role.Seller || user.role === Role.Trader) {
              s = { ...s, ...user, isAvailable: false };
            } else {
              s = { ...s, ...user, isAvailable: true };
            }
          }
          return s;
        }
      } else if (
        headers.appid &&
        headers.appsecret &&
        headers.apptype === "phone"
      ) {
        let appId: any = headers.appid;
        let s: any = {};

        let d = await fetch(
          process.env.NEXTAUTH_URL +
            "/api/user?isLogin=true&phone=" +
            encodeURIComponent(appId)
        );

        if (d.status === 200) {
          let user = await d.json();
          if (user) {
            if (user.role === Role.Seller || user.role === Role.Trader) {
              s = { ...s, ...user, isAvailable: false };
            } else {
              s = { ...s, ...user, isAvailable: true };
            }
          }
          return s;
        }
      }
    } catch (err) {
      return null;
    }
  }
}
