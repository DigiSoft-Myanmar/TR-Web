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
import { Category, Product, Review, Role, StockType } from "@prisma/client";
import { fileUrl } from "@/types/const";
import { formatAmount, formatDate, getText } from "@/util/textHelper";
import { useRouter } from "next/router";
import {
  Button,
  Checkbox,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";

import Icon from "@/components/presentational/Icon";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { ProductAction } from "@/types/action";
import SetPriceModal from "../modal/sideModal/SetPriceModal";
import ModifyPriceModal from "../modal/sideModal/ModifyPriceModal";
import ScheduleModal from "../modal/sideModal/ScheduleModal";
import StockLevelModal from "../modal/sideModal/StocklevelModal";
import StockTypeModal from "../modal/sideModal/StockTypeModal";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "@/util/swalFunction";
import StatsCard from "../card/StatsCard";
import { getPricing } from "@/util/pricing";

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

const ReviewTbl = ({
  data: parentData,
  refetch,
}: {
  data: any;
  refetch: Function;
}) => {
  // ** State
  const [value, setValue] = useState<string>("");
  const [data, setData] = React.useState<any>();
  const router = useRouter();
  const { locale } = router;
  const { data: session }: any = useSession();
  const { t } = useTranslation("common");
  const doublePrevYear = new Date();
  doublePrevYear.setFullYear(new Date().getFullYear() - 2);

  const prevYear = new Date();
  prevYear.setFullYear(new Date().getFullYear() - 1);

  React.useEffect(() => {
    if (parentData) {
      if (value) {
        setData(
          parentData.filter(
            (e: any) =>
              e.product.name.toLowerCase().includes(value.toLowerCase()) ||
              e.product.nameMM.toLowerCase().includes(value.toLowerCase()) ||
              e.product.brand.brandName
                .toLowerCase()
                .includes(value.toLowerCase()) ||
              e.rating === value
          )
        );
      } else {
        setData(parentData);
      }
    }
  }, [parentData, value]);

  const columns = [
    {
      flex: 0.2,
      minWidth: 120,
      field: "product",
      headerName: "Product",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Img src={fileUrl + row.product?.imgList[0]} alt={`${row.slug}`} />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
              {getText(row.product.name, row.product.nameMM, locale)}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              {row.product.brand.brandName}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: "createdByUserId",
      headerName: "Pricing",
      renderCell: ({ row }: CellType) => {
        let pricing = getPricing(row.product);
        return (
          <>
            {pricing.isPromotion === true ? (
              <div className="flex flex-row items-stretch gap-1 divide-x-[1px] divide-gray-800">
                <div className="flex flex-col gap-1">
                  {pricing.minRegPrice ? (
                    <>
                      <span className="text-xs line-through">
                        {pricing.minRegPrice === pricing.maxRegPrice
                          ? formatAmount(pricing.minRegPrice, locale, true)
                          : `${formatAmount(
                              pricing.minRegPrice,
                              locale,
                              true
                            )} - ${formatAmount(
                              pricing.maxRegPrice,
                              locale,
                              true
                            )}`}
                      </span>

                      <p className="text-sm font-semibold text-primary">
                        {pricing.minSalePrice === pricing.maxSalePrice
                          ? formatAmount(pricing.minSalePrice, locale, true)
                          : `${formatAmount(
                              pricing.minSalePrice,
                              locale,
                              true
                            )} - ${formatAmount(
                              pricing.maxSalePrice,
                              locale,
                              true
                            )}`}
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-xs line-through">
                        {formatAmount(pricing.regularPrice, locale, true)}
                      </span>

                      <p className="text-sm font-semibold text-primary">
                        {formatAmount(pricing.saleAmount, locale, true)}
                      </p>
                    </>
                  )}
                </div>
                {pricing.startDate && (
                  <div className="flex flex-col items-center justify-between pl-1">
                    <>
                      <p className="text-xs font-semibold text-primary">
                        {new Date(pricing.startDate).toLocaleDateString(
                          "en-ca",
                          {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          }
                        )}
                      </p>
                      <p className="text-xs font-semibold text-primary">
                        {new Date(pricing.endDate).toLocaleDateString("en-ca", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        })}
                      </p>
                    </>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {pricing.minRegPrice ? (
                  <>
                    <p className="text-sm font-semibold text-primary">
                      {pricing.minRegPrice === pricing.maxRegPrice
                        ? formatAmount(pricing.minRegPrice, locale, true)
                        : `${formatAmount(
                            pricing.minRegPrice,
                            locale,
                            true
                          )} - ${formatAmount(
                            pricing.maxRegPrice,
                            locale,
                            true
                          )}`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-primary">
                      {formatAmount(pricing.regularPrice, locale, true)}
                    </p>
                  </>
                )}
              </div>
            )}
          </>
        );
      },
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: "rating",
      headerName: "Rating",
      renderCell: ({ row }: CellType) => (
        <Tooltip title={row.message}>
          <div className="flex flex-row items-center gap-3">
            <Typography variant="body2">{row.rating}</Typography>
            {row.message && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-3 w-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: "createdBy",
      headerName: "Rated by",
      renderCell: ({ row }: CellType) => (
        <Link href={"/account/" + encodeURIComponent(row.createdBy.phoneNum)}>
          <Typography variant="body2">{row.createdBy.username}</Typography>
        </Link>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: "createdAt",
      headerName: "Created At",
      renderCell: ({ row }: CellType) => (
        <Link href="/">
          <Typography variant="body2">
            {new Date(row.createdAt).toLocaleDateString("en-ca", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })}
          </Typography>
        </Link>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: "id",
      headerName: "Action",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {session &&
            (session.role === Role.Admin ||
              session.role === Role.Staff ||
              session.role === Role.SuperAdmin ||
              session.role === Role.Seller) && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => {
                    showConfirmationDialog(
                      t("deleteConfirmation"),
                      "",
                      locale,
                      () => {
                        fetch(
                          `/api/products/reviews?id=${encodeURIComponent(
                            row.id
                          )}`,
                          {
                            method: "DELETE",
                          }
                        ).then(async (data) => {
                          if (data.status === 200) {
                            showSuccessDialog(
                              t("delete") + " " + t("success"),
                              "",
                              locale,
                              () => {
                                refetch();
                              }
                            );
                          } else {
                            let json = await data.json();
                            showErrorDialog(json.error, json.errorMM, locale);
                          }
                        });
                      }
                    );
                  }}
                >
                  <Icon icon="mdi:delete" fontSize={20} />
                </IconButton>
              </Tooltip>
            )}
        </Box>
      ),
    },
  ];

  return (
    data && (
      <>
        <Card>
          <div className="flex w-full flex-row flex-wrap items-center px-5 pt-5">
            <div className="flex flex-grow flex-row items-end gap-3">
              <h3 className="text-xl font-semibold">Reviews</h3>
            </div>
            <div className="flex flex-row items-center gap-3">
              <button
                type="button"
                className="flex flex-row items-center gap-3 rounded-md border border-gray-800 bg-white px-3 py-2 transition-colors hover:bg-gray-200"
                onClick={() => {
                  showWarningDialog("Will implement later");
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  />
                </svg>
                <span className="text-sm">Download CSV</span>
              </button>
              <button
                type="button"
                className="flex flex-row items-center gap-3 rounded-md bg-info px-3 py-2 text-white transition-colors hover:bg-info-content hover:text-gray-800"
                onClick={() => {
                  showWarningDialog("Will implement later");
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                  />
                </svg>

                <span className="text-sm">Filter</span>
              </button>
            </div>
          </div>
          <div className="flex w-full flex-row flex-wrap items-center justify-between gap-3 p-5">
            <StatsCard
              label="Total Reviews"
              currentCount={
                data.filter((e: any) => e.createdAt > prevYear.toISOString())
                  .length
              }
              prevCount={
                data.filter(
                  (e: any) =>
                    e.createdAt < prevYear.toISOString() &&
                    e.createdAt > doublePrevYear.toISOString()
                ).length
              }
              totalCount={data.length}
            />
            <StatsCard
              label="Best Reviews"
              currentCount={
                data.filter(
                  (e: any) =>
                    e.rating === 5 && e.createdAt > prevYear.toISOString()
                ).length
              }
              prevCount={
                data.filter(
                  (e: any) =>
                    e.rating === 5 &&
                    e.createdAt < prevYear.toISOString() &&
                    e.createdAt > doublePrevYear.toISOString()
                ).length
              }
              totalCount={data.filter((e: any) => e.rating === 5).length}
            />
            <StatsCard
              label="Moderate Stars Reviews"
              currentCount={
                data.filter(
                  (e: any) =>
                    e.rating >= 2 &&
                    e.rating <= 4 &&
                    e.createdAt > prevYear.toISOString()
                ).length
              }
              prevCount={
                data.filter(
                  (e: any) =>
                    e.rating >= 2 &&
                    e.rating <= 4 &&
                    e.createdAt < prevYear.toISOString() &&
                    e.createdAt > doublePrevYear.toISOString()
                ).length
              }
              totalCount={
                data.filter((e: any) => e.rating >= 2 && e.rating <= 4).length
              }
            />
            <StatsCard
              label="Bad Reviews"
              currentCount={
                data.filter(
                  (e: any) =>
                    e.rating < 2 && e.createdAt > prevYear.toISOString()
                ).length
              }
              prevCount={
                data.filter(
                  (e: any) =>
                    e.rating < 2 &&
                    e.createdAt < prevYear.toISOString() &&
                    e.createdAt > doublePrevYear.toISOString()
                ).length
              }
              totalCount={data.filter((e: any) => e.rating < 2).length}
            />
          </div>
          <CardContent>
            <div className="flex flex-row items-center justify-between">
              <div className="flex w-fit flex-row flex-wrap items-center gap-3"></div>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    Search:
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Search Review"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="rounded-md border-0 bg-white"
                  />
                </Box>
              </Box>
            </div>
          </CardContent>
          {data && (
            <DataGrid
              autoHeight
              columns={columns}
              rows={data}
              disableRowSelectionOnClick
            />
          )}
        </Card>
      </>
    )
  );
};

export default ReviewTbl;
