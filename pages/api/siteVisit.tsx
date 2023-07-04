import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { otherPermission } from "@/types/permissionTypes";
import { canAccess } from "@/util/roleHelper";
import { Role } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

async function getSiteVisit(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let allowPermission = await canAccess(req, otherPermission.dashboardView);
    if (allowPermission === false) {
      return res.status(401).json(Unauthorized);
    }
    let date = new Date();
    date.setDate(1);
    let thisMonth = new Date(date);
    thisMonth.setMonth(date.getMonth() + 1);
    let prevMonth = new Date(date);
    prevMonth.setMonth(date.getMonth() - 1);

    /*  let db = (await clientPromise).db();
    let count = await db.collection("siteVisit").countDocuments({
      visitDate: {
        $gte: date.toLocaleDateString("en-ca"),
        $lte: thisMonth.toLocaleDateString("en-ca"),
      },
    });
    let mobileCount = await db.collection("siteVisit").countDocuments({
      isMobile: true,
      visitDate: {
        $gte: date.toLocaleDateString("en-ca"),
        $lte: thisMonth.toLocaleDateString("en-ca"),
      },
    });

    let prevDayCount = await db.collection("siteVisit").countDocuments({
      visitDate: {
        $gte: prevMonth.toLocaleDateString("en-ca"),
        $lte: date.toLocaleDateString("en-ca"),
      },
    });

    let percentage = ((count - prevDayCount) / prevDayCount) * 100; 
    
    return res.status(200).json({
      mobileVisits: mobileCount,
      desktopVisits: count - mobileCount,
      totalVisits: count,
      analysis: percentage,
    });
    */

    let data = await prisma.siteVisit.findMany({});
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}

async function addSiteVisit(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { ip: queryIp } = req.query;
    let data: any = {};
    if (typeof req.body === "object") {
      data = req.body;
    } else {
      data = JSON.parse(req.body);
    }

    if (data) {
      let b: any = {
        ipAddress: queryIp?.toString(),
        visitDate: new Date().toLocaleDateString("en-ca"),
      };
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const session = await useAuth(req);

      if (session) {
        let filter: any = {
          phoneNum: session.phoneNum,
        };
        if (session.email) {
          filter = {
            email: session.email,
          };
        }
        let u = await prisma.user.update({
          where: filter,
          data: {
            lastLogin: new Date().toISOString(),
          },
        });
        b.userId = u.id;
      }

      let exists = await prisma.siteVisit.findFirst({
        where: {
          visitDate: new Date().toLocaleDateString("en-ca"),
          ipAddress: queryIp?.toString(),
        },
      });

      if (exists) {
        //update
        if (session && exists.userId === session.id) {
        } else if (session) {
          await prisma.siteVisit.create({
            data: {
              detailsInfo: data,
              ...b,
            },
          });
        }
      } else {
        await prisma.siteVisit.create({
          data: {
            detailsInfo: data,
            ...b,
          },
        });
      }

      return res.status(200).json(Success);
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const session = await useAuth(req);
  switch (req.method) {
    case "GET": {
      if (
        session &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin)
      ) {
        return getSiteVisit(req, res);
      } else {
        return res.status(401).json(Unauthorized);
      }
    }
    case "POST": {
      return addSiteVisit(req, res);
    }
    default:
      return res.status(405).json(NotAvailable);
  }
}
