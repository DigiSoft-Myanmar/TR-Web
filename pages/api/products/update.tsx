// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import useAuth from "@/hooks/useAuth";
import clientPromise from "@/lib/mongodb";
import prisma from "@/prisma/prisma";
import { ProductAction } from "@/types/action";
import { BadRequest } from "@/types/ApiResponseTypes";
import { ProductType, Role, StockType } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { id, action } = req.query;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = await useAuth(req);
    const body = JSON.parse(req.body);
    if (session && session.role !== Role.Buyer) {
      if (action && id) {
        let idList = [];
        if (typeof id === "string") {
          idList = [id];
        } else {
          idList = id;
        }
        const prods = await prisma.product.findMany({
          where: {
            id: {
              in: idList,
            },
          },
        });
        let successCnt = 0;
        for (let i = 0; i < prods.length; i++) {
          if (
            session.role === Role.Seller &&
            prods[i].sellerId !== session.id
          ) {
          } else {
            if (
              action === ProductAction.Publish ||
              action === ProductAction.Unpublish ||
              action === ProductAction.Featured ||
              action === ProductAction.NotFeatured
            ) {
              switch (action) {
                case ProductAction.Publish:
                  await prisma.product.update({
                    where: {
                      id: prods[i].id,
                    },
                    data: { isPublished: true },
                  });
                  successCnt++;
                  break;
                case ProductAction.Unpublish:
                  await prisma.product.update({
                    where: {
                      id: prods[i].id,
                    },
                    data: { isPublished: false },
                  });
                  successCnt++;
                  break;
                case ProductAction.Featured:
                  await prisma.product.update({
                    where: {
                      id: prods[i].id,
                    },
                    data: { isFeatured: true },
                  });
                  successCnt++;
                  break;
                case ProductAction.NotFeatured:
                  await prisma.product.update({
                    where: {
                      id: prods[i].id,
                    },
                    data: { isFeatured: false },
                  });
                  successCnt++;
                  break;
              }
            } else {
              if (prods[i].type === ProductType.Fixed) {
                switch (action) {
                  case ProductAction.IncreaseRegularPrice:
                    let incAmt = 0;
                    if (body.isPercent === true) {
                      incAmt =
                        prods[i].regularPrice! +
                        (prods[i].regularPrice! * body.amount) / 100;
                    } else {
                      incAmt = prods[i].regularPrice! + body.amount;
                    }
                    await prisma.product.update({
                      where: {
                        id: prods[i].id,
                      },
                      data: { regularPrice: parseInt(incAmt.toFixed(0)) },
                    });
                    successCnt++;
                    break;
                  case ProductAction.DecreaseRegularPrice:
                    let dcAmt = 0;
                    if (body.isPercent === true) {
                      dcAmt =
                        prods[i].regularPrice! -
                        (prods[i].regularPrice! * body.amount) / 100;
                    } else {
                      dcAmt = prods[i].regularPrice! - body.amount;
                    }
                    let sAmt = prods[i].salePrice;
                    if (sAmt && sAmt > 0) {
                      if (prods[i].isPercent === true) {
                        sAmt =
                          prods[i].regularPrice! -
                          Math.ceil((prods[i].regularPrice! * sAmt!) / 100);
                      }
                    }
                    if (dcAmt > 0) {
                      if (sAmt === null || dcAmt > sAmt) {
                        await prisma.product.update({
                          where: {
                            id: prods[i].id,
                          },
                          data: { regularPrice: parseInt(dcAmt.toFixed(0)) },
                        });
                      }
                    }
                    successCnt++;
                    break;
                  case ProductAction.SetSalesPrice:
                    let salePrice = 0;
                    if (body.isPercent === true) {
                      salePrice =
                        prods[i].regularPrice! -
                        Math.ceil(
                          (prods[i].regularPrice! * body.amount!) / 100
                        );
                    } else {
                      salePrice = body.amount;
                    }
                    if (
                      parseInt(salePrice.toFixed()) < prods[i].regularPrice!
                    ) {
                      await prisma.product.update({
                        where: {
                          id: prods[i].id,
                        },
                        data: {
                          salePrice: parseInt(salePrice.toFixed()),
                          isPercent: false,
                        },
                      });
                      successCnt++;
                    }
                    break;
                  case ProductAction.IncreaseSalesPrice:
                    let incSAmt = 0;
                    let saleAmt = prods[i].salePrice;
                    if (saleAmt && saleAmt > 0) {
                      if (prods[i].isPercent === true) {
                        saleAmt =
                          prods[i].regularPrice! -
                          Math.ceil((prods[i].regularPrice! * saleAmt!) / 100);
                      }
                      if (body.isPercent === true) {
                        incSAmt = saleAmt! + (saleAmt! * body.amount) / 100;
                      } else {
                        incSAmt = saleAmt! + body.amount;
                      }
                      if (
                        parseInt(incSAmt.toFixed()) < prods[i].regularPrice!
                      ) {
                        await prisma.product.update({
                          where: {
                            id: prods[i].id,
                          },
                          data: {
                            salePrice: parseInt(incSAmt.toFixed()),
                            isPercent: false,
                          },
                        });
                        successCnt++;
                      }
                    }
                    break;
                  case ProductAction.DecreaseSalesPrice:
                    let dcAmt1 = 0;
                    let saleAmt1 = prods[i].salePrice;
                    if (saleAmt1 && saleAmt1 > 0) {
                      if (prods[i].isPercent === true) {
                        saleAmt1 =
                          prods[i].regularPrice! -
                          Math.ceil((prods[i].regularPrice! * saleAmt1!) / 100);
                      }
                      if (body.isPercent === true) {
                        dcAmt1 =
                          saleAmt1 - (prods[i].salePrice! * body.amount) / 100;
                      } else {
                        dcAmt1 = saleAmt1 - body.amount;
                      }
                      if (dcAmt1 > 0) {
                        await prisma.product.update({
                          where: {
                            id: prods[i].id,
                          },
                          data: {
                            salePrice: parseInt(dcAmt1.toFixed()),
                            isPercent: false,
                          },
                        });
                        successCnt++;
                      }
                    }
                    break;
                  case ProductAction.SetSalesPeriod:
                    if (prods[i].salePrice) {
                      await prisma.product.update({
                        where: {
                          id: prods[i].id,
                        },
                        data: {
                          isSalePeriod: true,
                          saleStartDate: body.saleStartDate,
                          saleEndDate: body.saleEndDate,
                        },
                      });
                      successCnt++;
                    }
                    break;
                  case ProductAction.SetStock:
                    if (body.stockType === StockType.StockLevel) {
                      await prisma.product.update({
                        where: {
                          id: prods[i].id,
                        },
                        data: {
                          stockType: StockType.StockLevel,
                          stockLevel: body.stockLevel,
                        },
                      });
                      successCnt++;
                    } else {
                      await prisma.product.update({
                        where: {
                          id: prods[i].id,
                        },
                        data: {
                          stockType: body.stockType,
                        },
                      });
                      successCnt++;
                    }
                    break;
                }
              } else {
                switch (action) {
                  case ProductAction.IncreaseRegularPrice:
                    let incAmt = 0;
                    let ch = 0;
                    let v: any = [...prods[i].variations];
                    for (let j = 0; j < v.length; j++) {
                      if (body.isPercent === true) {
                        incAmt =
                          v[j].regularPrice! +
                          (v[j].regularPrice! * body.amount) / 100;
                      } else {
                        incAmt = v[j].regularPrice! + body.amount;
                      }
                      v[j].regularPrice = parseInt(incAmt.toFixed());
                      ch++;
                    }
                    if (ch > 0) {
                      await prisma.product.update({
                        where: {
                          id: prods[i].id,
                        },
                        data: { variations: v },
                      });
                      successCnt++;
                    }
                    break;
                  case ProductAction.DecreaseRegularPrice:
                    let dcAmt = 0;
                    let ch1 = 0;
                    let v1: any = [...prods[i].variations];
                    for (let j = 0; j < v1.length; j++) {
                      if (body.isPercent === true) {
                        dcAmt =
                          v1[j].regularPrice! -
                          (v1[j].regularPrice! * body.amount) / 100;
                      } else {
                        dcAmt = v1[j].regularPrice! - body.amount;
                      }
                      let sAmta = v1[j].salePrice;
                      if (sAmta && sAmta > 0) {
                        if (v1[j].isPercent === true) {
                          sAmta =
                            v1[j].regularPrice! -
                            Math.ceil((v1[j].regularPrice! * sAmta!) / 100);
                        }
                      }
                      if (dcAmt > 0) {
                        if (sAmta === null || dcAmt > sAmta) {
                          v1[j].regularPrice = parseInt(dcAmt.toFixed());
                          ch1++;
                        }
                      }
                    }
                    if (ch1 > 0) {
                      await prisma.product.update({
                        where: {
                          id: prods[i].id,
                        },
                        data: { variations: v1 },
                      });
                      successCnt++;
                    }
                    break;
                  case ProductAction.SetSalesPrice:
                    let chS = 0;
                    let vS: any = [...prods[i].variations];
                    let salePrice = 0;
                    for (let j = 0; j < vS.length; j++) {
                      if (body.isPercent === true) {
                        salePrice =
                          vS[i].regularPrice! -
                          Math.ceil((vS[i].regularPrice! * body.amount!) / 100);
                      } else {
                        salePrice = body.amount;
                      }
                      if (parseInt(salePrice.toFixed()) < vS[i].regularPrice!) {
                        vS[j].salePrice = parseInt(salePrice.toFixed());
                        vS[j].isPercent = false;
                        chS++;
                      }
                    }
                    if (chS > 0) {
                      await prisma.product.update({
                        where: {
                          id: prods[i].id,
                        },
                        data: { variations: vS },
                      });
                      successCnt++;
                    }
                    break;
                  case ProductAction.IncreaseSalesPrice:
                    let incSAmt = 0;
                    let ch2 = 0;
                    let v2: any = [...prods[i].variations];
                    for (let j = 0; j < v2.length; j++) {
                      let saleAmt = v2[j].salePrice;
                      if (saleAmt && saleAmt > 0) {
                        if (v2[j].isPercent === true) {
                          saleAmt =
                            v2[j].regularPrice! -
                            Math.ceil((v2[j].regularPrice! * saleAmt!) / 100);
                        }
                        if (body.isPercent === true) {
                          incSAmt =
                            saleAmt + (v2[j].salePrice! * body.amount) / 100;
                        } else {
                          incSAmt = saleAmt + body.amount;
                        }
                        if (parseInt(incSAmt.toFixed()) < v2[j].regularPrice) {
                          v2[j].salePrice = parseInt(incSAmt.toFixed());
                          v2[j].isPercent = false;
                          ch2++;
                        }
                      }
                    }
                    if (ch2 > 0) {
                      await prisma.product.update({
                        where: {
                          id: prods[i].id,
                        },
                        data: { variations: v2 },
                      });
                      successCnt++;
                    }
                    break;
                  case ProductAction.DecreaseSalesPrice:
                    let dcAmt1 = 0;
                    let ch3 = 0;
                    let v3: any = [...prods[i].variations];
                    for (let j = 0; j < v3.length; j++) {
                      let saleAmt1 = v3[j].salePrice;

                      if (saleAmt1 && saleAmt1 > 0) {
                        if (v3[j].isPercent === true) {
                          saleAmt1 =
                            v3[j].regularPrice! -
                            Math.ceil((v3[j].regularPrice! * saleAmt1!) / 100);
                        }
                        if (body.isPercent === true) {
                          dcAmt1 =
                            saleAmt1 - (v3[j].salePrice! * body.amount) / 100;
                        } else {
                          dcAmt1 = saleAmt1 - body.amount;
                        }
                        if (dcAmt1 > 0) {
                          v3[j].salePrice = parseInt(dcAmt1.toFixed());
                          v3[j].isPercent = false;
                          ch3++;
                        }
                      }
                    }
                    if (ch3 > 0) {
                      await prisma.product.update({
                        where: {
                          id: prods[i].id,
                        },
                        data: { variations: v3 },
                      });
                      successCnt++;
                    }
                    break;
                  case ProductAction.SetSalesPeriod:
                    let ch4 = 0;
                    let v4: any = [...prods[i].variations];
                    for (let j = 0; j < v4.length; j++) {
                      if (v4[j].salePrice) {
                        v4[j].isSalePeriod = true;
                        v4[j].saleStartDate = body.saleStartDate;
                        v4[j].saleEndDate = body.saleEndDate;
                        ch4++;
                      }
                    }
                    if (ch4 > 0) {
                      await prisma.product.update({
                        where: {
                          id: prods[i].id,
                        },
                        data: { variations: v4 },
                      });
                      successCnt++;
                    }
                    break;
                  case ProductAction.SetStock:
                    let ch5 = 0;
                    let v5: any = [...prods[i].variations];
                    for (let j = 0; j < v5.length; j++) {
                      if (body.stockType === StockType.StockLevel) {
                        v5[j].stockType = StockType.StockLevel;
                        v5[j].stockLevel = body.stockLevel;
                        ch5++;
                      } else {
                        v5[j].stockType = body.stockType;
                        ch5++;
                      }
                    }
                    if (ch5 > 0) {
                      await prisma.product.update({
                        where: {
                          id: prods[i].id,
                        },
                        data: { variations: v5 },
                      });
                      successCnt++;
                    }
                    break;
                }
              }
            }
          }
        }
        return res.status(200).json({
          successCount: successCnt,
          failedCount: prods.length - successCnt,
        });
      } else {
        return res.status(400).json(BadRequest);
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}
