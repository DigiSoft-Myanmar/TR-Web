import useAuth from "@/hooks/useAuth";
import prisma from "@/prisma/prisma";
import { Unauthorized } from "@/types/ApiResponseTypes";
import { OrderStatus } from "@/types/orderTypes";
import { isInternal } from "@/util/authHelper";
import { getCount } from "@/util/dashboardHelper";
import { Role } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

async function getStats(startDate: Date, endDate: Date) {
  let activeDate = new Date();
  activeDate.setMonth(activeDate.getMonth() - 3);

  return {};
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session: any = await useAuth(req);
  if (isInternal(session)) {
    const startDate = new Date(new Date().getFullYear(), 0, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(new Date().getFullYear(), 11, 31);
    endDate.setHours(23, 59, 59, 999);

    let data = await getStats(startDate, endDate);

    const prevStartDate = new Date(new Date().getFullYear() - 1, 0, 1);
    prevStartDate.setHours(0, 0, 0, 0);

    const prevEndDate = new Date(new Date().getFullYear() - 1, 11, 31);
    prevEndDate.setHours(23, 59, 59, 999);
    const prevStats = await getStats(prevStartDate, prevEndDate);

    return res.status(200).json({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      currentStats: data,
      prevStats: prevStats,
    });
  } else {
    return res.status(401).json(Unauthorized);
  }
}
