// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import {
  BadRequest,
  NotAvailable,
  Success,
  Unauthorized,
} from "@/types/ApiResponseTypes";
import { Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

async function updateShippingCost(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let data: any = {};
    if (typeof req.body === "object") {
      data = req.body;
    } else {
      data = JSON.parse(req.body);
    }
    let { sellerId, state, district, township } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let session = await useAuth(req);
    if (session) {
      let filter: any = {};
      if (
        sellerId &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin)
      ) {
        filter.sellerId = sellerId.toString();
      } else {
        filter.sellerId = session.id;
      }
      if (state) {
        filter.stateId = state.toString();
      }
      if (district) {
        filter.districtId = district.toString();
      } else {
        filter.districtId = undefined;
      }
      if (township) {
        filter.townshipId = township.toString();
      } else {
        filter.townshipId = undefined;
      }
      if (state || district || township) {
        let d = await prisma.shippingCost.findFirst({
          where: filter,
        });

        if (data.id) {
          delete data.id;
        }
        if (d) {
          await prisma.shippingCost.update({
            where: {
              id: d.id,
            },
            data: data,
          });
        } else {
          await prisma.shippingCost.create({
            data: { ...filter, ...data },
          });
        }
        return res.status(200).json(Success);
      } else {
        let sellId: any =
          session &&
          (session.role === Role.Admin ||
            session.role === Role.Staff ||
            session.role === Role.SuperAdmin)
            ? sellerId!.toString()
            : session.id;
        await prisma.user.update({
          where: {
            id: sellId,
          },
          data: data,
        });

        return res.status(200).json(Success);
      }
    } else {
      return res.status(401).json(Unauthorized);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    const { sellerId, isFreeShipping, isDisable } = req.query;
    if (sellerId) {
      let b = await prisma.user.findFirst({
        where: {
          id: sellerId.toString(),
        },
      });

      if (b) {
        switch (req.method) {
          case "GET":
            let { state, district, township, parentDistrict, parentState } =
              req.query;
            let filter: any = {
              stateId: undefined,
              districtId: undefined,
              townshipId: undefined,
            };
            if (session) {
              if (
                sellerId &&
                (session.role === Role.Admin ||
                  session.role === Role.Staff ||
                  session.role === Role.SuperAdmin)
              ) {
                filter.sellerId = sellerId.toString();
              } else if (session.role === Role.Seller) {
                filter.sellerId = session.id;
              }
            }
            if (sellerId) {
              filter.sellerId = sellerId;
            }
            if (township) {
              filter.townshipId = township.toString();
            } else if (district) {
              filter.districtId = district.toString();
            } else if (state) {
              filter.stateId = state.toString();
            }
            if (state || district || township) {
              const data = await prisma.shippingCost.findFirst({
                where: filter,
              });
              if (data) {
                if (data.shippingCost! >= 0) {
                  return res.status(200).json(data);
                } else if (township) {
                  const t = await prisma.shippingCost.findFirst({
                    where: {
                      districtId: parentDistrict?.toString(),
                      sellerId: filter.sellerId,
                    },
                  });

                  if (t) {
                    return res.status(200).json({
                      shippingIncluded: t.shippingIncluded,
                      defaultShippingCost: t.shippingCost,

                      isOfferFreeShipping: t.isOfferFreeShipping,
                      freeShippingCost: t.freeShippingCost,
                    });
                  }
                } else if (district) {
                  const d: any = await prisma.shippingCost.findFirst({
                    where: {
                      stateId: parentState?.toString(),
                      sellerId: filter.sellerId,
                    },
                  });
                  if (d) {
                    return res.status(200).json({
                      shippingIncluded: d.shippingIncluded,
                      defaultShippingCost: d.shippingCost,

                      isOfferFreeShipping: d.isOfferFreeShipping,
                      freeShippingCost: d.freeShippingCost,
                    });
                  }
                } else {
                  if (data && data.shippingIncluded) {
                    return res.status(200).json({
                      shippingIncluded: b.shippingIncluded,
                      defaultShippingCost: b.defaultShippingCost,

                      isOfferFreeShipping: b.isOfferFreeShipping,
                      freeShippingCost: b.freeShippingCost,
                    });
                  } else {
                    return res.status(200).json({
                      shippingIncluded: false,
                    });
                  }
                }
              } else if (state) {
                const d: any = await prisma.shippingCost.findFirst({
                  where: {
                    stateId: state.toString(),
                    sellerId: filter.sellerId,
                  },
                });
                if (d) {
                  return res.status(200).json({
                    shippingIncluded: d.shippingIncluded,
                    defaultShippingCost: d.shippingCost,

                    isOfferFreeShipping: d.isOfferFreeShipping,
                    freeShippingCost: d.freeShippingCost,
                  });
                }
              } else if (district) {
                const d: any = await prisma.shippingCost.findFirst({
                  where: {
                    stateId: parentState?.toString(),
                    sellerId: filter.sellerId,
                  },
                });
                if (d) {
                  return res.status(200).json({
                    shippingIncluded: d.shippingIncluded,
                    defaultShippingCost: d.shippingCost,

                    isOfferFreeShipping: d.isOfferFreeShipping,
                    freeShippingCost: d.freeShippingCost,
                  });
                }
              } else if (township) {
                const t = await prisma.shippingCost.findFirst({
                  where: {
                    districtId: parentDistrict?.toString(),
                    sellerId: filter.sellerId,
                  },
                });

                if (t) {
                  return res.status(200).json({
                    shippingIncluded: t.shippingIncluded,
                    defaultShippingCost: t.shippingCost,

                    isOfferFreeShipping: t.isOfferFreeShipping,
                    freeShippingCost: t.freeShippingCost,
                  });
                } else {
                  const d = await prisma.shippingCost.findFirst({
                    where: {
                      stateId: parentDistrict?.toString(),
                      sellerId: filter.sellerId,
                    },
                  });

                  if (d) {
                    return res.status(200).json({
                      shippingIncluded: d.shippingIncluded,
                      defaultShippingCost: d.shippingCost,

                      isOfferFreeShipping: d.isOfferFreeShipping,
                      freeShippingCost: d.freeShippingCost,
                    });
                  }
                }
              }

              if (b && b.shippingIncluded === true) {
                return res.status(200).json({
                  shippingIncluded: b.shippingIncluded,
                  defaultShippingCost: b.defaultShippingCost,

                  isOfferFreeShipping: b.isOfferFreeShipping,
                  freeShippingCost: b.freeShippingCost,
                });
              } else {
                return res.status(200).json({
                  shippingIncluded: true,
                });
              }
            } else {
              if (b && b.shippingIncluded === true) {
                return res.status(200).json({
                  shippingIncluded: b.shippingIncluded,
                  isOfferFreeShipping: b.isOfferFreeShipping,

                  freeShippingCost: b.freeShippingCost,
                  defaultShippingCost: b.defaultShippingCost,
                });
              } else {
                return res.status(200).json({
                  shippingIncluded: true,
                });
              }
            }
            break;
          case "POST":
            if (session.role !== Role.Buyer) {
              if (isFreeShipping && isFreeShipping === "true") {
                await prisma.user.update({
                  where: {
                    id: b.id,
                  },
                  data: {
                    isOfferFreeShipping: !b.isOfferFreeShipping,
                  },
                });
                return res.status(200).json(Success);
              } else if (isFreeShipping && isFreeShipping !== "true") {
                await prisma.user.update({
                  where: {
                    id: b.id,
                  },
                  data: {
                    isOfferFreeShipping: !b.isOfferFreeShipping,
                  },
                });
                return res.status(200).json(Success);
              } else if (isDisable && isDisable === "true") {
                await prisma.user.update({
                  where: {
                    id: b.id,
                  },
                  data: {
                    shippingIncluded: !b.shippingIncluded,
                  },
                });
                return res.status(200).json(Success);
              } else if (isDisable && isDisable !== "true") {
                await prisma.user.update({
                  where: {
                    id: b.id,
                  },
                  data: {
                    shippingIncluded: !b.shippingIncluded,
                  },
                });
                return res.status(200).json(Success);
              } else {
                return updateShippingCost(req, res);
              }
            } else {
              return res.status(401).json(Unauthorized);
            }
        }
      } else {
        return res.status(404).json(NotAvailable);
      }
    } else {
      return res.status(400).json(BadRequest);
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
