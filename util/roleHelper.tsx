import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { Role, User } from "@prisma/client";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export async function canAccess(req: NextApiRequest, permission: any) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session: any = await useAuth(req);
  if (session && session.role === Role.Staff) {
    let role = await prisma.userDefinedRole.findFirst({
      where: {
        id: session.userDefinedId,
      },
    });
    if (role) {
      if (role.permission.find((e: any) => e === permission)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return true;
  }
}
