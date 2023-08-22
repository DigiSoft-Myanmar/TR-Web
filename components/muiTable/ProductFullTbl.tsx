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
  Category,
  Product,
  ProductType,
  Review,
  Role,
  StockType,
} from "@prisma/client";
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
import { AuctionAction, ProductAction } from "@/types/action";
import SetPriceModal from "../modal/sideModal/SetPriceModal";
import ModifyPriceModal from "../modal/sideModal/ModifyPriceModal";
import ScheduleModal from "../modal/sideModal/ScheduleModal";
import StockLevelModal from "../modal/sideModal/StocklevelModal";
import StockTypeModal from "../modal/sideModal/StockTypeModal";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
  showUnauthorizedDialog,
  showWarningDialog,
} from "@/util/swalFunction";
import StatsCard from "../card/StatsCard";
import {
  getHeaders,
  hasPermission,
  isInternal,
  isSeller,
} from "@/util/authHelper";
import Avatar from "../presentational/Avatar";
import { ProductPermission } from "@/types/permissionTypes";
import ExportCSVButton from "../presentational/ExportCSVButton";
import { getPricing } from "@/util/pricing";
import { sortBy } from "lodash";

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

const ProductFullTbl = ({
  data: parentData,
  refetch,
  isAuction,
}: {
  data: any;
  refetch: Function;
  isAuction: boolean;
}) => {
  // ** State
  const [value, setValue] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(7);
  const [data, setData] = React.useState<any>();
  const router = useRouter();
  const { locale } = router;
  const { type } = router.query;
  const { data: session }: any = useSession();
  const { t } = useTranslation("common");
  const [selectionModel, setSelectionModel] = React.useState<any>([]);
  const [action, setAction] = React.useState<any>(
    ProductAction.IncreaseRegularPrice
  );

  const [modifyPriceModalOpen, setModifyPriceModalOpen] = React.useState(false);
  const [modifySalePriceModalOpen, setModifySalePriceModalOpen] =
    React.useState(false);

  const [isIncrease, setIncrease] = React.useState(false);

  const [scheduleModalOpen, setScheduledModalOpen] = React.useState(false);
  const [stockLevelModalOpen, setStockLevelModalOpen] = React.useState(false);
  const [isSalePriceModalOpen, setSetSalePriceModalOpen] =
    React.useState(false);

  const doublePrevYear = new Date();
  doublePrevYear.setFullYear(new Date().getFullYear() - 2);

  const prevYear = new Date();
  prevYear.setFullYear(new Date().getFullYear() - 1);

  React.useEffect(() => {
    if (isAuction) {
      setAction(AuctionAction.Publish);
    } else {
      setAction(ProductAction.IncreaseRegularPrice);
    }
  }, [isAuction]);

  React.useEffect(() => {
    if (parentData) {
      if (value) {
        setData(
          parentData.filter(
            (e: any) =>
              e.name?.toLowerCase().includes(value.toLowerCase()) ||
              e.nameMM?.toLowerCase().includes(value.toLowerCase()) ||
              e.seller.username?.toLowerCase().includes(value.toLowerCase()) ||
              e.SKU?.toLowerCase().includes(value.toLowerCase()) ||
              e.categories.find(
                (z: any) =>
                  z.name.toLowerCase().includes(value.toLowerCase()) ||
                  z.nameMM.toLowerCase().includes(value.toLowerCase())
              ) ||
              e.seller?.displayName
                ?.toLowerCase()
                .includes(value.toLowerCase()) ||
              (value.toLowerCase() === "published" && e.isPublished === true) ||
              (value.toLowerCase() === "featured" && e.isFeatured === true) ||
              (value.toLowerCase() === "not featured" &&
                e.isFeatured === false) ||
              (value.toLowerCase() === "not published" &&
                e.isPublished === false)
          )
        );
      } else {
        setData(parentData);
      }
    }
  }, [parentData, value]);

  const columns =
    isAuction === true
      ? [
          {
            flex: 0.2,
            minWidth: 120,
            field: "productInfo",
            headerName: "Product",
            valueGetter(params: any) {
              return params.row.name;
            },
            renderCell: ({ row }: CellType) => (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Img src={fileUrl + row.productInfo?.img} alt={`${row.slug}`} />
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                    {getText(
                      row.productInfo.name,
                      row.productInfo.nameMM,
                      locale
                    )}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.disabled" }}>
                    {row.productInfo.brandName}
                  </Typography>
                </Box>
              </Box>
            ),
          },
          {
            flex: 0.2,
            minWidth: 120,
            field: "Seller",
            headerName: "Seller",
            valueGetter(params: any) {
              return params.row.seller.username;
            },
            renderCell: ({ row }: CellType) => (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  profile={row.seller.profile}
                  username={row.seller.username}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                    {row.seller.username}
                  </Typography>
                  {row.displayName ? (
                    <Typography
                      variant="caption"
                      sx={{ color: "text.disabled" }}
                    >
                      {row.seller.displayName}
                    </Typography>
                  ) : (
                    <></>
                  )}
                </Box>
              </Box>
            ),
          },
          {
            flex: 0.15,
            minWidth: 100,
            headerName: "SKU",
            field: "SKU",
            valueGetter(params: any) {
              return params.row.SKU;
            },
            renderCell: ({ row }: CellType) => (
              <Typography variant="body2">{row.SKU}</Typography>
            ),
          },
          {
            flex: 0.15,
            minWidth: 100,
            field: "categories",
            headerName: "Categories",
            valueGetter(params: any) {
              return params.row.categories
                .map((e: Category) => getText(e.name, e.nameMM, locale))
                .join(", ");
            },
            renderCell: ({ row }: CellType) => {
              return (
                <p
                  className="truncate"
                  title={row.categories
                    .map((e: Category) => getText(e.name, e.nameMM, locale))
                    .join(", ")}
                >
                  {row.categories
                    .map((e: Category) => getText(e.name, e.nameMM, locale))
                    .join(", ")}
                </p>
              );
            },
          },
          {
            flex: 0.15,
            minWidth: 100,
            field: "Opening Bid",
            headerName: "Opening Bid",
            valueGetter(params: any) {
              return params.row.openingBid;
            },
            renderCell: ({ row }: CellType) => (
              <Typography variant="body2">
                {formatAmount(row.openingBid, locale, true)}
              </Typography>
            ),
          },
          {
            flex: 0.15,
            minWidth: 100,
            field: "Estimated Price",
            headerName: "Estimated Price",
            valueGetter(params: any) {
              return params.row.estimatedPrice;
            },
            renderCell: ({ row }: CellType) => (
              <Typography variant="body2">
                {formatAmount(row.estimatedPrice, locale, true)}
              </Typography>
            ),
          },
          {
            flex: 0.15,
            minWidth: 180,
            field: "Auction Period",
            headerName: "Auction Period",
            valueGetter(params: any) {
              return new Date(params.row.startTime).getTime();
            },
            renderCell: ({ row }: CellType) => (
              <div className="flex flex-col gap-1 text-xs">
                <span>
                  {new Date(row.startTime).toLocaleDateString("en-ca", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>
                  {new Date(row.endTime).toLocaleDateString("en-ca", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ),
          },
          {
            flex: 0.15,
            minWidth: 100,
            field: "status",
            headerName: "Status",
            renderCell: ({ row }: CellType) => (
              <div className="flex flex-row items-center gap-1 text-primary">
                <Tooltip
                  title={row.status.isFeatured ? "Featured" : "Not Featured"}
                >
                  {row.status.isFeatured ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                    >
                      <path
                        d="M5.27997 18.65L5.84997 16.18C5.97997 15.6 5.74997 14.79 5.32997 14.37L2.84997 11.89C1.38997 10.43 1.85997 8.95001 3.89997 8.61001L7.08997 8.08001C7.61997 7.99001 8.25997 7.52002 8.49997 7.03001L10.26 3.51001C11.21 1.60001 12.77 1.60001 13.73 3.51001L15.49 7.03001C15.6 7.26001 15.81 7.48001 16.04 7.67001"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20.1 8.60999C22.14 8.94999 22.62 10.43 21.15 11.89L18.67 14.37C18.25 14.79 18.02 15.6 18.15 16.18L18.86 19.25C19.42 21.68 18.13 22.62 15.98 21.35L12.99 19.58C12.45 19.26 11.56 19.26 11.01 19.58L8.02002 21.35"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 2L2 22"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </Tooltip>
                <Tooltip
                  title={row.status.isPublished ? "Published" : "Not Published"}
                >
                  {row.status.isPublished ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6"
                    >
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                    >
                      <path
                        d="M14.53 9.47004L9.47004 14.53C8.82004 13.88 8.42004 12.99 8.42004 12C8.42004 10.02 10.02 8.42004 12 8.42004C12.99 8.42004 13.88 8.82004 14.53 9.47004Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.82 5.76998C16.07 4.44998 14.07 3.72998 12 3.72998C8.46997 3.72998 5.17997 5.80998 2.88997 9.40998C1.98997 10.82 1.98997 13.19 2.88997 14.6C3.67997 15.84 4.59997 16.91 5.59997 17.77"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.42004 19.5301C9.56004 20.0101 10.77 20.2701 12 20.2701C15.53 20.2701 18.82 18.1901 21.11 14.5901C22.01 13.1801 22.01 10.8101 21.11 9.40005C20.78 8.88005 20.42 8.39005 20.05 7.93005"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15.5099 12.7C15.2499 14.11 14.0999 15.26 12.6899 15.52"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.47 14.53L2 22"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 2L14.53 9.47"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </Tooltip>
                {session &&
                  (session.role === Role.Admin ||
                    session.role === Role.Staff ||
                    session.role === Role.SuperAdmin) && (
                    <Tooltip
                      title={
                        row.status.sellAllow ? "Sell Allow" : "Not Allowed"
                      }
                    >
                      {row.status.sellAllow ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-6 w-6"
                        >
                          <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                          <path
                            fillRule="evenodd"
                            d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                        >
                          <path
                            d="M2 8.5H15.24"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6 16.5H7.29"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M11 16.5H14.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7.97998 20.4999H17.56C21.12 20.4999 22 19.6199 22 16.1099V6.88989"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19.99 3.75C19.37 3.57 18.57 3.5 17.56 3.5H6.44C2.89 3.5 2 4.38 2 7.89V16.1C2 18.44 2.39 19.61 3.71 20.13"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M22 2L2 22"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </Tooltip>
                  )}
              </div>
            ),
          },
          {
            flex: 0.15,
            minWidth: 100,
            field: "action",
            headerName: "Action",
            renderCell: ({ row }: CellType) => (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Tooltip title="View">
                  <IconButton
                    size="small"
                    component={Link}
                    href={`/marketplace/${encodeURIComponent(row.action.slug)}`}
                  >
                    <Icon icon="mdi:eye-outline" fontSize={20} />
                  </IconButton>
                </Tooltip>
                {session &&
                  (session.role === Role.Admin ||
                    session.role === Role.Staff ||
                    session.role === Role.SuperAdmin ||
                    isSeller(session)) && (
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        component={Link}
                        href={`/products/${encodeURIComponent(
                          row.action.slug
                        )}?action=edit`}
                      >
                        <Icon icon="mdi:edit" fontSize={20} />
                      </IconButton>
                    </Tooltip>
                  )}
                {session &&
                  (session.role === Role.Admin ||
                    (session.role === Role.Staff &&
                      hasPermission(
                        session,
                        ProductPermission.productDeleteAllow
                      )) ||
                    session.role === Role.SuperAdmin) && (
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
                                `/api/products?id=${encodeURIComponent(
                                  row.action.id
                                )}`,
                                {
                                  method: "DELETE",
                                  headers: getHeaders(session),
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
                                  showErrorDialog(
                                    json.error,
                                    json.errorMM,
                                    locale
                                  );
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
        ]
      : [
          {
            flex: 0.2,
            minWidth: 120,
            field: "productInfo",
            headerName: "Product",
            valueGetter(params: any) {
              return params.row.name;
            },
            renderCell: ({ row }: CellType) => (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Img src={fileUrl + row.productInfo?.img} alt={`${row.slug}`} />
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                    {getText(
                      row.productInfo.name,
                      row.productInfo.nameMM,
                      locale
                    )}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.disabled" }}>
                    {row.productInfo.brandName}
                  </Typography>
                </Box>
              </Box>
            ),
          },
          {
            flex: 0.2,
            minWidth: 120,
            field: "Seller",
            headerName: "Seller",
            valueGetter(params: any) {
              return params.row.seller.username;
            },
            renderCell: ({ row }: CellType) => (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  profile={row.seller.profile}
                  username={row.seller.username}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                    {row.seller.username}
                  </Typography>
                  {row.displayName ? (
                    <Typography
                      variant="caption"
                      sx={{ color: "text.disabled" }}
                    >
                      {row.seller.displayName}
                    </Typography>
                  ) : (
                    <></>
                  )}
                </Box>
              </Box>
            ),
          },
          {
            flex: 0.15,
            minWidth: 100,
            headerName: "SKU",
            field: "SKU",
            renderCell: ({ row }: CellType) => (
              <Typography variant="body2">{row.SKU}</Typography>
            ),
          },
          {
            flex: 0.15,
            minWidth: 100,
            headerName: "Type",
            field: "Type",
            valueGetter(params: any) {
              return params.row.type;
            },
            renderCell: ({ row }: CellType) => (
              <Typography variant="body2">{row.type}</Typography>
            ),
          },
          {
            flex: 0.15,
            minWidth: 100,
            field: "categories",
            headerName: "Categories",
            valueGetter(params: any) {
              return params.row.categories
                .map((e: Category) => getText(e.name, e.nameMM, locale))
                .join(", ");
            },
            renderCell: ({ row }: CellType) => {
              return (
                <p
                  className="truncate"
                  title={row.categories
                    .map((e: Category) => getText(e.name, e.nameMM, locale))
                    .join(", ")}
                >
                  {row.categories
                    .map((e: Category) => getText(e.name, e.nameMM, locale))
                    .join(", ")}
                </p>
              );
            },
          },
          {
            flex: 0.2,
            minWidth: 150,
            field: "pricing",
            headerName: "Pricing",
            valueGetter(params: any) {
              return params.row.priceIndex;
            },
            renderCell: ({ row }: CellType) => {
              return row.type === ProductType.Auction ? (
                <div className="flex flex-row items-stretch gap-1 divide-x-[1px] divide-gray-800">
                  Auction
                </div>
              ) : (
                <>
                  {row.pricing.isPromotion === true ? (
                    <div className="flex flex-row items-stretch gap-1 divide-x-[1px] divide-gray-800">
                      <div className="flex flex-col gap-1">
                        {row.pricing.minRegPrice ? (
                          <>
                            <span className="text-xs line-through">
                              {row.pricing.minRegPrice ===
                              row.pricing.maxRegPrice
                                ? formatAmount(
                                    row.pricing.minRegPrice,
                                    locale,
                                    true
                                  )
                                : `${formatAmount(
                                    row.pricing.minRegPrice,
                                    locale,
                                    true
                                  )} - ${formatAmount(
                                    row.pricing.maxRegPrice,
                                    locale,
                                    true
                                  )}`}
                            </span>

                            <p className="text-sm font-semibold text-primary">
                              {row.pricing.minSalePrice ===
                              row.pricing.maxSalePrice
                                ? formatAmount(
                                    row.pricing.minSalePrice,
                                    locale,
                                    true
                                  )
                                : `${formatAmount(
                                    row.pricing.minSalePrice,
                                    locale,
                                    true
                                  )} - ${formatAmount(
                                    row.pricing.maxSalePrice,
                                    locale,
                                    true
                                  )}`}
                            </p>
                          </>
                        ) : (
                          <>
                            <span className="text-xs line-through">
                              {formatAmount(
                                row.pricing.regularPrice,
                                locale,
                                true
                              )}
                            </span>

                            <p className="text-sm font-semibold text-primary">
                              {formatAmount(
                                row.pricing.saleAmount,
                                locale,
                                true
                              )}
                            </p>
                          </>
                        )}
                      </div>
                      {row.pricing.startDate && (
                        <div className="flex flex-col items-center justify-between pl-1">
                          <>
                            <p className="text-xs font-semibold text-primary">
                              {new Date(
                                row.pricing.startDate
                              ).toLocaleDateString("en-ca", {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                              })}
                            </p>
                            <p className="text-xs font-semibold text-primary">
                              {new Date(row.pricing.endDate).toLocaleDateString(
                                "en-ca",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "2-digit",
                                }
                              )}
                            </p>
                          </>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {row.pricing.minRegPrice ? (
                        <>
                          <p className="text-sm font-semibold text-primary">
                            {row.pricing.minRegPrice === row.pricing.maxRegPrice
                              ? formatAmount(
                                  row.pricing.minRegPrice,
                                  locale,
                                  true
                                )
                              : `${formatAmount(
                                  row.pricing.minRegPrice,
                                  locale,
                                  true
                                )} - ${formatAmount(
                                  row.pricing.maxRegPrice,
                                  locale,
                                  true
                                )}`}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-primary">
                            {formatAmount(
                              row.pricing.regularPrice,
                              locale,
                              true
                            )}
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
            field: "stock",
            headerName: "Stock",
            renderCell: ({ row }: any) => {
              return <p className="truncate">{t(row.stock)}</p>;
            },
          },
          {
            flex: 0.15,
            minWidth: 100,
            field: "Review",
            headerName: "Rating",
            valueGetter(params: any) {
              return params.row.ratingIndex;
            },
            renderCell: ({ row }: CellType) => (
              <Typography variant="body2">
                {row.Review.length > 0
                  ? `${(
                      row.Review.map((e: Review) =>
                        e.rating ? e.rating : 0
                      ).reduce((a: number, b: number) => a + b, 0) /
                      row.Review.length
                    ).toFixed(1)} (${row.Review.length} ratings)`
                  : "No rating"}
              </Typography>
            ),
          },
          {
            flex: 0.15,
            minWidth: 100,
            field: "status",
            headerName: "Status",
            renderCell: ({ row }: CellType) => (
              <div className="flex flex-row items-center gap-1 text-primary">
                <Tooltip
                  title={row.status.isFeatured ? "Featured" : "Not Featured"}
                >
                  {row.status.isFeatured ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                    >
                      <path
                        d="M5.27997 18.65L5.84997 16.18C5.97997 15.6 5.74997 14.79 5.32997 14.37L2.84997 11.89C1.38997 10.43 1.85997 8.95001 3.89997 8.61001L7.08997 8.08001C7.61997 7.99001 8.25997 7.52002 8.49997 7.03001L10.26 3.51001C11.21 1.60001 12.77 1.60001 13.73 3.51001L15.49 7.03001C15.6 7.26001 15.81 7.48001 16.04 7.67001"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20.1 8.60999C22.14 8.94999 22.62 10.43 21.15 11.89L18.67 14.37C18.25 14.79 18.02 15.6 18.15 16.18L18.86 19.25C19.42 21.68 18.13 22.62 15.98 21.35L12.99 19.58C12.45 19.26 11.56 19.26 11.01 19.58L8.02002 21.35"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 2L2 22"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </Tooltip>
                <Tooltip
                  title={row.status.isPublished ? "Published" : "Not Published"}
                >
                  {row.status.isPublished ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6"
                    >
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                    >
                      <path
                        d="M14.53 9.47004L9.47004 14.53C8.82004 13.88 8.42004 12.99 8.42004 12C8.42004 10.02 10.02 8.42004 12 8.42004C12.99 8.42004 13.88 8.82004 14.53 9.47004Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.82 5.76998C16.07 4.44998 14.07 3.72998 12 3.72998C8.46997 3.72998 5.17997 5.80998 2.88997 9.40998C1.98997 10.82 1.98997 13.19 2.88997 14.6C3.67997 15.84 4.59997 16.91 5.59997 17.77"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.42004 19.5301C9.56004 20.0101 10.77 20.2701 12 20.2701C15.53 20.2701 18.82 18.1901 21.11 14.5901C22.01 13.1801 22.01 10.8101 21.11 9.40005C20.78 8.88005 20.42 8.39005 20.05 7.93005"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15.5099 12.7C15.2499 14.11 14.0999 15.26 12.6899 15.52"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.47 14.53L2 22"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 2L14.53 9.47"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </Tooltip>
                {session &&
                  (session.role === Role.Admin ||
                    session.role === Role.Staff ||
                    session.role === Role.SuperAdmin) && (
                    <Tooltip
                      title={
                        row.status.sellAllow ? "Sell Allow" : "Not Allowed"
                      }
                    >
                      {row.status.sellAllow ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-6 w-6"
                        >
                          <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                          <path
                            fillRule="evenodd"
                            d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                        >
                          <path
                            d="M2 8.5H15.24"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6 16.5H7.29"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M11 16.5H14.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7.97998 20.4999H17.56C21.12 20.4999 22 19.6199 22 16.1099V6.88989"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19.99 3.75C19.37 3.57 18.57 3.5 17.56 3.5H6.44C2.89 3.5 2 4.38 2 7.89V16.1C2 18.44 2.39 19.61 3.71 20.13"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M22 2L2 22"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </Tooltip>
                  )}
              </div>
            ),
          },
          {
            flex: 0.15,
            minWidth: 100,
            field: "action",
            headerName: "Action",
            renderCell: ({ row }: CellType) => (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Tooltip title="View">
                  <IconButton
                    size="small"
                    component={Link}
                    href={`/marketplace/${encodeURIComponent(row.action.slug)}`}
                  >
                    <Icon icon="mdi:eye-outline" fontSize={20} />
                  </IconButton>
                </Tooltip>
                {session &&
                  (session.role === Role.Admin ||
                    session.role === Role.Staff ||
                    session.role === Role.SuperAdmin ||
                    isSeller(session)) && (
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        component={Link}
                        href={`/products/${encodeURIComponent(
                          row.action.slug
                        )}?action=edit`}
                      >
                        <Icon icon="mdi:edit" fontSize={20} />
                      </IconButton>
                    </Tooltip>
                  )}
                {session &&
                  (session.role === Role.Admin ||
                    (session.role === Role.Staff &&
                      hasPermission(
                        session,
                        ProductPermission.productDeleteAllow
                      )) ||
                    session.role === Role.SuperAdmin) && (
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
                                `/api/products?id=${encodeURIComponent(
                                  row.action.id
                                )}`,
                                {
                                  method: "DELETE",
                                  headers: getHeaders(session),
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
                                  showErrorDialog(
                                    json.error,
                                    json.errorMM,
                                    locale
                                  );
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
              <h3 className="text-xl font-semibold">Products</h3>
            </div>
            <div className="flex flex-row items-center gap-3">
              <ExportCSVButton
                csvData={data?.map((row: any) => {
                  let common = {
                    Name: row.name,
                    NameMM: row.nameMM,
                    Type: row.type,
                    SKU:
                      row.type === ProductType.Variable
                        ? row.variations.map((z: any) => z.SKU).join(", ")
                        : row.SKU,
                    Categories: row.categories
                      .map((e: Category) => getText(e.name, e.nameMM, locale))
                      .join(", "),
                  };

                  let others = {};

                  if (row.type === ProductType.Auction) {
                    others = {
                      "Opening bid": formatAmount(row.openingBid, "en", true),
                      "Estimated Price": row.estimatedPrice
                        ? formatAmount(row.estimatedPrice, "en", true)
                        : "-",
                      "Start Time": row.startTime
                        ? new Date(row.startTime).toLocaleDateString("en-ca", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-",
                      "End Time": row.endTime
                        ? new Date(row.endTime).toLocaleDateString("en-ca", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-",
                    };
                  } else if (row.type === ProductType.Fixed) {
                    others = {
                      "Regular Price": formatAmount(
                        row.regularPrice,
                        "en",
                        true
                      ),
                      "Sale Price": row.salePrice
                        ? formatAmount(row.salePrice, "en", true)
                        : "-",
                      "Sale Period": row.isSalePeriod ? "Yes" : "No",
                      "Sale Start Date": row.saleStartDate
                        ? new Date(row.saleStartDate).toLocaleDateString(
                            "en-ca",
                            { year: "numeric", month: "short", day: "2-digit" }
                          )
                        : "-",
                      "Sale End Date": row.saleEndDate
                        ? new Date(row.saleEndDate).toLocaleDateString(
                            "en-ca",
                            { year: "numeric", month: "short", day: "2-digit" }
                          )
                        : "-",
                      "Stock Type": row.stockType,
                    };
                    if (row.stockType === StockType.StockLevel) {
                      others["Stock Level"] = row.stockLevel;
                    }
                  } else if (row.type === ProductType.Variable) {
                    let pricingInfo = getPricing(row);
                    others = {
                      "Min Regular Price": formatAmount(
                        pricingInfo.minRegPrice,
                        "en",
                        true
                      ),
                      "Max Regular Price": formatAmount(
                        pricingInfo.maxRegPrice,
                        "en",
                        true
                      ),

                      "Min Sale Price": pricingInfo.minSalePrice
                        ? formatAmount(pricingInfo.minSalePrice, "en", true)
                        : "-",
                      "Max Sale Price": pricingInfo.maxSalePrice
                        ? formatAmount(pricingInfo.maxSalePrice, "en", true)
                        : "-",

                      "Sale Period":
                        pricingInfo.minSaleStartDate &&
                        pricingInfo.maxSaleStartDate
                          ? "Yes"
                          : "No",
                      "Min Sale Start Date": pricingInfo.minSaleStartDate
                        ? new Date(
                            pricingInfo.minSaleStartDate
                          ).toLocaleDateString("en-ca", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })
                        : "-",
                      "Max Sale End Date": pricingInfo.minSaleEndDate
                        ? new Date(
                            pricingInfo.minSaleEndDate
                          ).toLocaleDateString("en-ca", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })
                        : "-",
                      "Stock Type": row.variations.find(
                        (z) => z.stockType === StockType.InStock
                      )
                        ? StockType.InStock
                        : row.variations.find(
                            (z) =>
                              z.stockType === StockType.OutOfStock ||
                              (z.stockType === StockType.StockLevel &&
                                z.stockLevel <= 0)
                          )
                        ? StockType.OutOfStock
                        : StockType.StockLevel,
                    };
                    if (others["Stock Type"] === StockType.StockLevel) {
                      others["Stock Level"] = sortBy(
                        row.variations
                          .filter(
                            (z) =>
                              z.stockType === StockType.StockLevel &&
                              z.stockLevel > 0
                          )
                          .map((z) => z.stockLevel),
                        (b) => b
                      ).reverse()[0];
                    }
                  }

                  let seller = {
                    Seller: row.seller.username,
                    "Seller Phone": row.seller.phoneNum,
                    "Seller Email": row.seller.email ? row.seller.email : "-",
                    Membership: row.seller.currentMembership
                      ? row.seller.currentMembership.name
                      : "-",
                    "Member Start Date": new Date(
                      row.seller.memberStartDate
                    ).toLocaleDateString("en-ca", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    }),
                    "Sell Allow": row.seller.sellAllow ? "Yes" : "No",
                    "Is Blocked?": row.seller.isBlocked ? "Yes" : "No",
                    "Is Deleted?": row.seller.isDeleted ? "Yes" : "No",
                  };
                  return {
                    ...common,
                    ...others,
                    "Is Published": row.isPublished ? "Yes" : "No",
                    "Is Featured": row.isFeatured ? "Yes" : "No",
                    ...seller,
                  };
                })}
                fileName={
                  (type ? "Products" : type) +
                  " data " +
                  new Date().toLocaleDateString("en-ca", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })
                }
                permission={ProductPermission.productExportAllow}
              />
              <button
                className="flex flex-row items-center gap-3 rounded-md bg-primary px-3 py-2 transition-colors hover:bg-primary-focus text-white"
                onClick={() => router.push("/products/newProduct")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                <span className="text-sm">Add Product</span>
              </button>
            </div>
          </div>
          <div className="flex w-full flex-row flex-wrap items-center justify-between gap-3 p-5">
            <StatsCard
              label="Total Products"
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
              label={"Published Products"}
              currentCount={
                data.filter(
                  (e: any) =>
                    e.isPublished === true &&
                    e.createdAt > prevYear.toISOString()
                ).length
              }
              prevCount={
                data.filter(
                  (e: any) =>
                    e.isPublished === true &&
                    e.createdAt < prevYear.toISOString() &&
                    e.createdAt > doublePrevYear.toISOString()
                ).length
              }
              totalCount={
                data.filter((e: any) => e.isPublished === true).length
              }
            />

            <StatsCard
              label={"Out of stock"}
              currentCount={
                data.filter((e: any) => e.stock === StockType.OutOfStock).length
              }
              totalCount={
                data.filter((e: any) => e.stock === StockType.OutOfStock).length
              }
            />

            <StatsCard
              label={"Low stock"}
              currentCount={
                data.filter((e: any) => e.stock === "Low Stock").length
              }
              totalCount={
                data.filter((e: any) => e.stock === "Low Stock").length
              }
            />
          </div>
          <CardContent>
            <div className="flex flex-row items-center justify-between">
              <div className="flex w-fit flex-row flex-wrap items-center gap-3">
                {selectionModel.length > 0 && isInternal(session) ? (
                  <>
                    <Listbox value={action} onChange={(e) => setAction(e)}>
                      <div className="relative mt-1">
                        <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                          <span className="block truncate">{action}</span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>
                        {data && (
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute z-20 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {Object.entries(
                                isAuction === true
                                  ? AuctionAction
                                  : ProductAction
                              ).map(([key, value]) => (
                                <Listbox.Option
                                  key={key}
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                      active
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-900"
                                    }`
                                  }
                                  value={value}
                                >
                                  {({ selected }) => (
                                    <div className="flex items-center gap-3">
                                      <span
                                        className={`block truncate ${
                                          selected
                                            ? "font-medium"
                                            : "font-normal"
                                        }`}
                                      >
                                        {value}
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                          <CheckIcon
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                          />
                                        </span>
                                      ) : null}
                                    </div>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        )}
                      </div>
                    </Listbox>
                    <button
                      className="rounded-md bg-white px-3 py-2 text-sm hover:bg-gray-300"
                      onClick={() => {
                        if (!getHeaders(session)) {
                          showUnauthorizedDialog(locale, () => {
                            router.push("/login");
                          });
                          return;
                        }
                        switch (action) {
                          case ProductAction.IncreaseRegularPrice:
                            setModifyPriceModalOpen(true);
                            setIncrease(true);
                            break;
                          case ProductAction.DecreaseRegularPrice:
                            setModifyPriceModalOpen(true);
                            setIncrease(false);
                            break;
                          case ProductAction.IncreaseSalesPrice:
                            setModifySalePriceModalOpen(true);
                            setIncrease(true);
                            break;
                          case ProductAction.DecreaseSalesPrice:
                            setModifySalePriceModalOpen(true);
                            setIncrease(false);
                            break;
                          case ProductAction.SetSalesPrice:
                            setSetSalePriceModalOpen(true);
                            break;
                          case ProductAction.SetSalesPeriod:
                            setScheduledModalOpen(true);
                            break;
                          case ProductAction.SetStock:
                            setStockLevelModalOpen(true);
                            break;
                          default:
                            if (session && session.role === Role.Seller) {
                              showErrorDialog(
                                "You are not allowed to perform this action",
                                "",
                                locale
                              );
                            } else {
                              fetch(
                                "/api/products/update?action=" +
                                  encodeURIComponent(action) +
                                  selectionModel
                                    .map((z) => "&id=" + z)
                                    .join(""),
                                {
                                  method: "PUT",
                                  body: JSON.stringify({ isUpdate: true }),
                                  headers: getHeaders(session),
                                }
                              )
                                .then((data) => data.json())
                                .then((json) => {
                                  if (json.successCount || json.failedCount) {
                                    if (json.successCount > 0) {
                                      showSuccessDialog(
                                        json.successCount +
                                          " products update successfully.",
                                        "",
                                        locale,
                                        () => {
                                          refetch();
                                        }
                                      );
                                    } else {
                                      showErrorDialog(
                                        "Update failed",
                                        "",
                                        locale
                                      );
                                    }
                                  } else if (json.error) {
                                    showErrorDialog(
                                      json.error,
                                      json?.errorMM,
                                      locale
                                    );
                                  } else {
                                    showErrorDialog(
                                      t("somethingWentWrong"),
                                      "",
                                      locale
                                    );
                                  }
                                });
                            }
                            break;
                        }
                      }}
                    >
                      Apply
                    </button>
                  </>
                ) : (
                  <></>
                )}
              </div>
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
                    placeholder="Search Product"
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
              rows={data}
              columns={columns}
              checkboxSelection
              onRowSelectionModelChange={(newSelectionModel) => {
                setSelectionModel(newSelectionModel);
              }}
              rowSelectionModel={selectionModel}
            />
          )}
        </Card>

        <ModifyPriceModal
          isModalOpen={modifyPriceModalOpen}
          setModalOpen={setModifyPriceModalOpen}
          title={
            isIncrease ? "Increase Regular Price" : "Decrease Regular Price"
          }
          setPrice={(e: number, isPercent: boolean) => {
            fetch(
              "/api/products/update?action=" +
                encodeURIComponent(action) +
                selectionModel.map((z) => "&id=" + z).join(""),
              {
                method: "PUT",
                body: JSON.stringify({
                  amount: e,
                  isPercent: isPercent,
                }),
                headers: getHeaders(session),
              }
            )
              .then((data) => data.json())
              .then((json) => {
                if (json.successCount || json.failedCount) {
                  if (json.successCount > 0) {
                    showSuccessDialog(
                      json.successCount + " products update successfully.",
                      "",
                      locale,
                      () => {
                        refetch();
                      }
                    );
                  } else {
                    showErrorDialog("Update failed", "", locale);
                  }
                } else if (json.error) {
                  showErrorDialog(json.error, json?.errorMM, locale);
                } else {
                  showErrorDialog(t("somethingWentWrong"), "", locale);
                }
              });
          }}
        />
        <ModifyPriceModal
          isModalOpen={modifySalePriceModalOpen}
          setModalOpen={setModifySalePriceModalOpen}
          title={isIncrease ? "Increase Sale Price" : "Decrease Sale Price"}
          setPrice={(e: number, isPercent: boolean) => {
            fetch(
              "/api/products/update?action=" +
                encodeURIComponent(action) +
                selectionModel.map((z) => "&id=" + z).join(""),
              {
                method: "PUT",
                body: JSON.stringify({
                  amount: e,
                  isPercent: isPercent,
                }),
                headers: getHeaders(session),
              }
            )
              .then((data) => data.json())
              .then((json) => {
                if (json.successCount || json.failedCount) {
                  if (json.successCount > 0) {
                    showSuccessDialog(
                      json.successCount + " products update successfully.",
                      "",
                      locale,
                      () => {
                        refetch();
                      }
                    );
                  } else {
                    showErrorDialog("Update failed", "", locale);
                  }
                } else if (json.error) {
                  showErrorDialog(json.error, json?.errorMM, locale);
                } else {
                  showErrorDialog(t("somethingWentWrong"), "", locale);
                }
              });
          }}
        />

        <ModifyPriceModal
          isModalOpen={isSalePriceModalOpen}
          setModalOpen={setSetSalePriceModalOpen}
          title={"Set Sale Price"}
          setPrice={(e: number, isPercent: boolean) => {
            fetch(
              "/api/products/update?action=" +
                encodeURIComponent(action) +
                selectionModel.map((z) => "&id=" + z).join(""),
              {
                method: "PUT",
                body: JSON.stringify({
                  amount: e,
                  isPercent: isPercent,
                }),
                headers: getHeaders(session),
              }
            )
              .then((data) => data.json())
              .then((json) => {
                if (json.successCount || json.failedCount) {
                  if (json.successCount > 0) {
                    showSuccessDialog(
                      json.successCount + " products update successfully.",
                      "",
                      locale,
                      () => {
                        refetch();
                      }
                    );
                  } else {
                    showErrorDialog("Update failed", "", locale);
                  }
                } else if (json.error) {
                  showErrorDialog(json.error, json?.errorMM, locale);
                } else {
                  showErrorDialog(t("somethingWentWrong"), "", locale);
                }
              });
          }}
        />

        <ScheduleModal
          isModalOpen={scheduleModalOpen}
          setModalOpen={setScheduledModalOpen}
          setSchedule={(startDate: string, endDate: string) => {
            fetch(
              "/api/products/update?action=" +
                encodeURIComponent(action) +
                selectionModel.map((z) => "&id=" + z).join(""),
              {
                method: "PUT",
                body: JSON.stringify({
                  saleStartDate: startDate,
                  saleEndDate: endDate,
                }),
                headers: getHeaders(session),
              }
            )
              .then((data) => data.json())
              .then((json) => {
                if (json.successCount || json.failedCount) {
                  if (json.successCount > 0) {
                    showSuccessDialog(
                      json.successCount + " products update successfully.",
                      "",
                      locale,
                      () => {
                        refetch();
                      }
                    );
                  } else {
                    showErrorDialog("Update failed", "", locale);
                  }
                } else if (json.error) {
                  showErrorDialog(json.error, json?.errorMM, locale);
                } else {
                  showErrorDialog(t("somethingWentWrong"), "", locale);
                }
              });
          }}
        />
        <StockTypeModal
          isModalOpen={stockLevelModalOpen}
          setModalOpen={setStockLevelModalOpen}
          setStock={(e: any) => {
            let { stockType, stockLevel } = e;

            fetch(
              "/api/products/update?action=" +
                encodeURIComponent(action) +
                selectionModel.map((z) => "&id=" + z).join(""),
              {
                method: "PUT",
                body: JSON.stringify({
                  stockType: stockType,
                  stockLevel: stockLevel,
                }),
                headers: getHeaders(session),
              }
            )
              .then((data) => data.json())
              .then((json) => {
                if (json.successCount || json.failedCount) {
                  if (json.successCount > 0) {
                    showSuccessDialog(
                      json.successCount + " products update successfully.",
                      "",
                      locale,
                      () => {
                        refetch();
                      }
                    );
                  } else {
                    showErrorDialog("Update failed", "", locale);
                  }
                } else if (json.error) {
                  showErrorDialog(json.error, json?.errorMM, locale);
                } else {
                  showErrorDialog(t("somethingWentWrong"), "", locale);
                }
              });
          }}
        />
      </>
    )
  );
};

export default ProductFullTbl;
