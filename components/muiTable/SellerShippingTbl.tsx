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
import { PaymentStatus } from "@/types/orderTypes";
// ** Type Imports
import { Category, Product, Role, StockType } from "@prisma/client";
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
import { getPercentage } from "@/util/compareHelper";
import StatsCard from "../card/StatsCard";
import { sortBy } from "lodash";

interface CellType {
  row: any;
}
const Img = styled("img")(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: "10%",
  marginRight: theme.spacing(3),
  objectFit: "contain",
}));

const date = new Date();

const SellerShippingTbl = ({
  data: parentData,
  refetch,
}: {
  data: any;
  refetch: Function;
}) => {
  // ** State
  const [value, setValue] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(7);
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
              e.username.toLowerCase().includes(value.toLowerCase()) ||
              e.phoneNum.toLowerCase().includes(value.toLowerCase()) ||
              e.email.toLowerCase().includes(value.toLowerCase()) ||
              e.brand.brandName.toLowerCase().includes(value.toLowerCase())
          )
        );
      } else {
        setData(parentData);
      }
    }
  }, [parentData, value]);

  function getExpiredMembershipDate(currentDate: string) {
    let d = new Date(currentDate);
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString();
  }

  const columns = [
    {
      flex: 0.2,
      minWidth: 120,
      field: "brand",
      headerName: "Brand",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Img
            src={fileUrl + row.brand?.brandLogo}
            alt={`${row.brand?.brandName}`}
          />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Tooltip title={row.brand?.brandName}>
              <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                {row.brand?.brandName}
              </Typography>
            </Tooltip>
            <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
              {row.brand?.sellAllow === true ? (
                <span className="mt-2 rounded-md bg-success/20 px-3 py-1 text-xs text-success">
                  Active
                </span>
              ) : (
                <span className="mt-2 rounded-md bg-error/20 px-3 py-1 text-xs text-error">
                  Disabled
                </span>
              )}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      flex: 0.3,
      minWidth: 100,
      headerName: "Contact",
      field: "contact",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Tooltip
              title={row.contact?.username + " | " + row.contact?.phoneNum}
            >
              <Typography variant="caption">
                {row.contact?.username} | {row.contact?.phoneNum}
              </Typography>
            </Tooltip>
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              {row.contact?.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: "currentMembership",
      headerName: "Membership",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
              {getText(
                row.currentMembership?.name,
                row.currentMembership?.nameMM,
                locale
              )}
            </Typography>
            {/* 
            //TODO Update Payment
            <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
              {row.currentMembership?.MemberPayment.length > 0 ? (
                sortBy(
                  row.currentMembership?.MemberPayment,
                  (obj: any) => obj.memberStartDate,
                ).reverse()[0].paymentStatus === PaymentStatus.Verified ? (
                  <span className="mt-2 rounded-md bg-success/20 px-3 py-1 text-xs text-success">
                    Verified
                  </span>
                ) : (
                  <span className="mt-2 rounded-md bg-warning/20 px-3 py-1 text-xs text-warning">
                    {
                      sortBy(
                        row.currentMembership?.MemberPayment,
                        (obj: any) => obj.memberStartDate,
                      ).reverse()[0].paymentStatus
                    }
                  </span>
                )
              ) : (
                <span className="mt-2 rounded-md bg-error/20 px-3 py-1 text-xs text-error">
                  Expired
                </span>
              )}
            </Typography> */}
          </Box>
        </Box>
      ),
    },
    {
      flex: 0.4,
      minWidth: 100,
      headerName: "Shipping Info",
      field: "shippingInfo",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {row.shippingInfo?.shippingIncluded === false ? (
            <Typography variant="caption">
              Paid by recipient on delivery
            </Typography>
          ) : row.shippingInfo?.isDiff === true ? (
            <Typography variant="caption">Varies</Typography>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
              }}
            >
              <div className="flex flex-row items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                  />
                </svg>
                <span className="text-xs">
                  {formatAmount(
                    row.shippingInfo?.defaultShippingCost,
                    locale,
                    true
                  )}
                </span>
              </div>
              <div className="flex flex-row items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>

                <span className="text-xs">
                  {formatAmount(
                    row.shippingInfo?.carGateShippingCost,
                    locale,
                    true
                  )}
                </span>
              </div>
            </Box>
          )}
        </Box>
      ),
    },
    {
      flex: 0.2,
      minWidth: 100,
      headerName: "Free Shipping",
      field: "freeShippingInfo",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {row.freeShippingInfo?.shippingIncluded === false ? (
            <Typography variant="caption">Excluded</Typography>
          ) : row.freeShippingInfo?.isDiff === true ? (
            <Typography variant="caption">Varies</Typography>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
              }}
            >
              {row.freeShippingInfo?.isOfferFreeShipping === true ? (
                <span className="text-xs">
                  Min{" "}
                  {formatAmount(
                    row.freeShippingInfo?.freeShippingCost,
                    locale,
                    true
                  )}
                </span>
              ) : (
                <span className="text-xs">No Free Shipping</span>
              )}
            </Box>
          )}
        </Box>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      headerName: "Status",
      field: "isBlocked",
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">
          {row.isBlocked ? (
            <span className="rounded-md bg-error/20 px-3 py-1 text-error">
              Blocked
            </span>
          ) : (
            <span className="rounded-md bg-success/20 px-3 py-1 text-success">
              Active
            </span>
          )}
        </Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: "accInfo",
      headerName: "Action",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="View">
            <IconButton
              size="small"
              component={Link}
              href={`/account/${row.accInfo.phone}?action=view`}
            >
              <Icon icon="mdi:eye-outline" fontSize={20} />
            </IconButton>
          </Tooltip>
          {session &&
            (session.role === Role.Admin ||
              session.role === Role.Staff ||
              session.role === Role.SuperAdmin ||
              session.role === Role.Seller) && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  component={Link}
                  href={`/shipping%20Cost/${row.accInfo.phone}`}
                >
                  <Icon icon="mdi:edit" fontSize={20} />
                </IconButton>
              </Tooltip>
            )}
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
                          `/api/user?id=${encodeURIComponent(row.accInfo.id)}`,
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
              <h3 className="text-xl font-semibold">
                Sellers / Brands Shipping Cost
              </h3>
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
              label="Total Sellers"
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
              label={"Pending Sellers"}
              currentCount={
                data.filter(
                  (e: any) =>
                    !e.currentMembership?.MemberPayment ||
                    e.currentMembership?.MemberPayment === 0 ||
                    (e.currentMembership?.MemberPayment &&
                      e.currentMembership?.MemberPayment.length > 0 &&
                      getExpiredMembershipDate(
                        sortBy(
                          e.currentMembership?.MemberPayment,
                          (obj: any) => obj.memberStartDate
                        ).reverse()[0].memberStartDate
                      ) >= new Date().toISOString() &&
                      sortBy(
                        e.currentMembership?.MemberPayment,
                        (obj: any) => obj.memberStartDate
                      ).reverse()[0].paymentStatus !== PaymentStatus.Verified)
                ).length
              }
              prevCount={
                data.filter(
                  (e: any) =>
                    !e.currentMembership?.MemberPayment ||
                    e.currentMembership?.MemberPayment === 0 ||
                    (e.currentMembership?.MemberPayment &&
                      e.currentMembership?.MemberPayment.length > 0 &&
                      getExpiredMembershipDate(
                        sortBy(
                          e.currentMembership?.MemberPayment,
                          (obj: any) => obj.memberStartDate
                        ).reverse()[0].memberStartDate
                      ) >= new Date().toISOString() &&
                      sortBy(
                        e.currentMembership?.MemberPayment,
                        (obj: any) => obj.memberStartDate
                      ).reverse()[0].paymentStatus !== PaymentStatus.Verified)
                ).length
              }
              totalCount={
                data.filter(
                  (e: any) =>
                    !e.currentMembership?.MemberPayment ||
                    e.currentMembership?.MemberPayment === 0 ||
                    (e.currentMembership?.MemberPayment &&
                      e.currentMembership?.MemberPayment.length > 0 &&
                      getExpiredMembershipDate(
                        sortBy(
                          e.currentMembership?.MemberPayment,
                          (obj: any) => obj.memberStartDate
                        ).reverse()[0].memberStartDate
                      ) >= new Date().toISOString() &&
                      sortBy(
                        e.currentMembership?.MemberPayment,
                        (obj: any) => obj.memberStartDate
                      ).reverse()[0].paymentStatus !== PaymentStatus.Verified)
                ).length
              }
            />
            <StatsCard
              label={"Included"}
              currentCount={
                data.filter(
                  (e: any) => e.shippingInfo?.shippingIncluded === true
                ).length
              }
              prevCount={
                data.filter(
                  (e: any) => e.shippingInfo?.shippingIncluded === true
                ).length
              }
              totalCount={
                data.filter(
                  (e: any) => e.shippingInfo?.shippingIncluded === true
                ).length
              }
            />

            <StatsCard
              label={"Free Shipping"}
              currentCount={
                data.filter(
                  (e: any) => e.freeShippingInfo?.shippingIncluded === true
                ).length
              }
              prevCount={
                data.filter(
                  (e: any) => e.freeShippingInfo?.shippingIncluded === true
                ).length
              }
              totalCount={
                data.filter(
                  (e: any) => e.freeShippingInfo?.shippingIncluded === true
                ).length
              }
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
                    placeholder={"Search Sellers"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="rounded-md border-0 bg-white"
                  />
                </Box>
              </Box>
            </div>
          </CardContent>
          {data && <DataGrid autoHeight rows={data} columns={columns} />}
        </Card>
      </>
    )
  );
};

export default SellerShippingTbl;
