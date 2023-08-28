// ** React Imports
import React, { useState, useEffect, MouseEvent, Fragment } from "react";

// ** MUI Imports
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";

// ** Type Imports
import {
  Attribute,
  AttrType,
  Category,
  Product,
  Role,
  StockType,
  Term,
} from "@prisma/client";
import { fileUrl } from "@/types/const";
import { formatAmount, formatDate, getText } from "@/util/textHelper";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { ProductAction } from "@/types/action";
import Image from "next/image";
import { isCartValid } from "@/util/orderHelper";

interface CellType {
  row: any;
}
const Img = styled("img")(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: "10%",
  marginRight: theme.spacing(3),
}));

const date = new Date();

const OrderCartTbl = ({
  data: parentData,
  attributeList,
  sellerResponse,
}: {
  data: any;
  attributeList: any[];
  sellerResponse: any[];
}) => {
  // ** State
  const router = useRouter();
  const { locale } = router;
  const { data: session }: any = useSession();
  const { t } = useTranslation("common");

  const doublePrevYear = new Date();
  doublePrevYear.setFullYear(new Date().getFullYear() - 2);

  const prevYear = new Date();
  prevYear.setFullYear(new Date().getFullYear() - 1);

  const columns = [
    {
      flex: 0.3,
      minWidth: 120,
      field: "productInfo",
      headerName: getText("Product", "ပစ္စည်း", locale),
      renderCell: ({ row }: CellType) => {
        return (
          <div className="flex max-h-[100px] items-center overflow-auto">
            <Img
              src={
                row.variation?.img
                  ? fileUrl + row.variation?.img
                  : fileUrl + row.productInfo?.imgList[0]
              }
              alt={`${row.slug}`}
            />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                sx={{
                  color: isCartValid(
                    sellerResponse.find((e: any) => e.sellerId === row.sellerId)
                  )
                    ? "text.primary"
                    : "text.disabled",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  textDecoration: isCartValid(
                    sellerResponse.find((e: any) => e.sellerId === row.sellerId)
                  )
                    ? "none"
                    : "line-through",
                }}
              >
                {getText(row.productInfo.name, row.productInfo.nameMM, locale)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isCartValid(
                    sellerResponse.find((e: any) => e.sellerId === row.sellerId)
                  )
                    ? "text.secondary"
                    : "text.disabled",
                  textDecoration: isCartValid(
                    sellerResponse.find((e: any) => e.sellerId === row.sellerId)
                  )
                    ? "none"
                    : "line-through",
                }}
              >
                {t("brand")} -{" "}
                {getText(
                  row.productInfo.Brand.name,
                  row.productInfo.Brand.nameMM,
                  locale
                )}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isCartValid(
                    sellerResponse.find((e: any) => e.sellerId === row.sellerId)
                  )
                    ? "text.secondary"
                    : "text.disabled",
                  textDecoration: isCartValid(
                    sellerResponse.find((e: any) => e.sellerId === row.sellerId)
                  )
                    ? "none"
                    : "line-through",
                }}
              >
                {t("condition")} -{" "}
                {getText(
                  row.productInfo.Condition.name,
                  row.productInfo.Condition.nameMM,
                  locale
                )}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isCartValid(
                    sellerResponse.find((e: any) => e.sellerId === row.sellerId)
                  )
                    ? "text.secondary"
                    : "text.disabled",
                  textDecoration: isCartValid(
                    sellerResponse.find((e: any) => e.sellerId === row.sellerId)
                  )
                    ? "none"
                    : "line-through",
                }}
              >
                {t("seller")} - {row.productInfo.seller.username}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isCartValid(
                    sellerResponse.find((e: any) => e.sellerId === row.sellerId)
                  )
                    ? "text.secondary"
                    : "text.disabled",
                  textDecoration: isCartValid(
                    sellerResponse.find((e: any) => e.sellerId === row.sellerId)
                  )
                    ? "none"
                    : "line-through",
                }}
              >
                SKU -{" "}
                {row.variation?.SKU ? row.variation.SKU : row.productInfo.SKU}
              </Typography>
              {row.productInfo.variation ? (
                <>
                  {row.productInfo.variation.attributes.map(
                    (e: any, index: number) => (
                      <div
                        key={index}
                        className="flex flex-row items-center gap-3"
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: isCartValid(
                              sellerResponse.find(
                                (e: any) => e.sellerId === row.sellerId
                              )
                            )
                              ? "text.secondary"
                              : "text.disabled",
                            display: "flex",
                            alignItems: "center",
                            textDecoration: isCartValid(
                              sellerResponse.find(
                                (e: any) => e.sellerId === row.sellerId
                              )
                            )
                              ? "none"
                              : "line-through",
                          }}
                        >
                          {getText(
                            attributeList.find((z) => z.id === e.attributeId)
                              ?.name,
                            attributeList.find((z) => z.id === e.attributeId)
                              ?.nameMM,
                            locale
                          )}{" "}
                          -{" "}
                          {attributeList.find((z) => z.id === e.attributeId)
                            ?.type === AttrType.Color ? (
                            <div
                              className={`ml-1 h-3 w-3 rounded`}
                              style={{ backgroundColor: e.value }}
                            >
                              {" "}
                            </div>
                          ) : attributeList.find((z) => z.id === e.attributeId)
                              ?.type === AttrType.Image ? (
                            <Image
                              src={fileUrl + e.value}
                              alt={e.value!}
                              width={12}
                              height={12}
                              className="ml-1 h-3 w-3 rounded"
                            />
                          ) : (
                            getText(e.name, e.nameMM, locale)
                          )}{" "}
                        </Typography>
                      </div>
                    )
                  )}
                </>
              ) : (
                <></>
              )}
            </Box>
          </div>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 100,
      headerName: getText("Unit Price", "၁ခုချင်းစျေးနှုန်း", locale),
      field: "unitPrice",
      renderCell: ({ row }: CellType) => (
        <Typography
          variant="body2"
          sx={{
            color: isCartValid(
              sellerResponse.find((e: any) => e.sellerId === row.sellerId)
            )
              ? "text.primary"
              : "text.disabled",
            textDecoration: isCartValid(
              sellerResponse.find((e: any) => e.sellerId === row.sellerId)
            )
              ? "none"
              : "line-through",
          }}
        >
          {formatAmount(
            row.salePrice ? row.salePrice : row.normalPrice,
            locale
          )}
        </Typography>
      ),
    },

    {
      flex: 0.1,
      minWidth: 50,
      headerName: getText("Qty", "အရေအတွက်", locale),
      field: "quantity",
      renderCell: ({ row }: CellType) => (
        <Typography
          variant="body2"
          sx={{
            color: isCartValid(
              sellerResponse.find((e: any) => e.sellerId === row.sellerId)
            )
              ? "text.primary"
              : "text.disabled",
            textDecoration: isCartValid(
              sellerResponse.find((e: any) => e.sellerId === row.sellerId)
            )
              ? "none"
              : "line-through",
          }}
        >
          {formatAmount(row.quantity, locale)}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      minWidth: 100,
      headerName: getText("Total", "ကျသင့်ငွေ", locale),
      field: "total",
      renderCell: ({ row }: CellType) => (
        <Typography
          variant="body2"
          sx={{
            color: isCartValid(
              sellerResponse.find((e: any) => e.sellerId === row.sellerId)
            )
              ? "text.primary"
              : "text.disabled",
            textDecoration: isCartValid(
              sellerResponse.find((e: any) => e.sellerId === row.sellerId)
            )
              ? "none"
              : "line-through",
          }}
        >
          {formatAmount(
            row.salePrice
              ? row.salePrice * row.quantity
              : row.normalPrice * row.quantity,
            locale
          )}
        </Typography>
      ),
    },
  ];

  return (
    <DataGrid
      rowHeight={120}
      autoHeight
      rows={parentData}
      columns={columns}
      disableRowSelectionOnClick
      hideFooter={true}
    />
  );
};

export default OrderCartTbl;
