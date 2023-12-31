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
import {
  formatAmount,
  formatDate,
  getInitials,
  getText,
} from "@/util/textHelper";
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
import { getHeaders } from "@/util/authHelper";
import { isTodayBetween } from "@/util/verify";
import Avatar from "../presentational/Avatar";
import { encryptPhone } from "@/util/encrypt";
import ExportCSVButton from "../presentational/ExportCSVButton";

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
              e.email?.toLowerCase().includes(value.toLowerCase())
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
      field: "Profile",
      headerName: "Profile",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar profile={row.profile} username={row.username} />
          <Box sx={{ display: "flex", flexDirection: "column", marginLeft: 1 }}>
            <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
              {row.username}
            </Typography>
            {row.displayName ? (
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                {row.displayName}
              </Typography>
            ) : (
              <></>
            )}
          </Box>
        </Box>
      ),
    },
    {
      flex: 0.3,
      minWidth: 100,
      headerName: "Contact",
      field: "Contact",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="caption">{row?.phoneNum}</Typography>
            {row?.email ? (
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                {row?.email}
              </Typography>
            ) : (
              <></>
            )}
          </Box>
        </Box>
      ),
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: "currentMembership",
      headerName: "Membership",
      renderCell: ({ row }: CellType) => {
        let endDate = new Date(row.memberStartDate);
        if (row.currentMembership) {
          endDate.setDate(endDate.getDate() + row.currentMembership.validity);
        }
        return (
          <Tooltip
            title={
              <div>
                <p>
                  Start Date :{" "}
                  {new Date(row.memberStartDate).toLocaleDateString("en-ca", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </p>
                <p>
                  End Date :{" "}
                  {endDate.toLocaleDateString("en-ca", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </p>
              </div>
            }
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                  {getText(
                    row.currentMembership?.name,
                    row.currentMembership?.nameMM,
                    locale
                  )}
                </Typography>

                <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                  {isTodayBetween(row.memberStartDate, endDate) ? (
                    <span className="mt-2 rounded-md bg-success/20 px-3 py-1 text-xs text-success">
                      Active
                    </span>
                  ) : (
                    <span className="mt-2 rounded-md bg-error/20 px-3 py-1 text-xs text-error">
                      Expired
                    </span>
                  )}
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        );
      },
    },
    {
      flex: 0.4,
      minWidth: 100,
      headerName: "Shipping Cost",
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
              <span className="text-xs">
                {formatAmount(
                  row.shippingInfo?.defaultShippingCost,
                  locale,
                  true
                )}
              </span>
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
      headerName: "Sell Allow",
      field: "sellAllow",
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">
          {row.sellAllow !== true ? (
            <span className="rounded-md bg-error/20 px-3 py-1 text-error">
              Disable
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
      field: "Actions",
      valueGetter(params: any) {
        return params.row;
      },
      headerName: "Action",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="View">
            <IconButton
              size="small"
              component={Link}
              href={`/account/${encodeURIComponent(
                encryptPhone(row.phoneNum)
              )}?action=view`}
            >
              <Icon icon="mdi:eye-outline" fontSize={20} />
            </IconButton>
          </Tooltip>
          {session &&
            (session.role === Role.Admin ||
              session.role === Role.Staff ||
              session.role === Role.SuperAdmin) && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  component={Link}
                  href={`/shipping%20Cost/${encodeURIComponent(
                    encryptPhone(row.phoneNum)
                  )}`}
                >
                  <Icon icon="mdi:edit" fontSize={20} />
                </IconButton>
              </Tooltip>
            )}
          {session &&
            (session.role === Role.Admin ||
              session.role === Role.Staff ||
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
                        fetch(`/api/user?id=${encodeURIComponent(row.id)}`, {
                          method: "DELETE",
                          headers: getHeaders(session),
                        }).then(async (data) => {
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
                Sellers / Traders Shipping Cost
              </h3>
            </div>
            <div className="flex flex-row items-center gap-3">
              <ExportCSVButton
                csvData={data?.map((row: any) => {
                  return {
                    Username: row.username,
                    "Display Name": row.displayName ? row.displayName : "-",
                    Email: row.email ? row.email : "-",
                    Phone: row.phoneNum ? row.phoneNum : "-",
                    Membership: row.currentMembership?.name
                      ? row.currentMembership?.name
                      : "-",
                    "Member Start Date": new Date(
                      row.memberStartDate
                    ).toLocaleDateString("en-ca", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    }),
                    "Shipping Cost":
                      row.freeShippingInfo?.shippingIncluded === false
                        ? "Excluded"
                        : row.freeShippingInfo?.isDiff === true
                        ? "Varies"
                        : row.freeShippingInfo?.isOfferFreeShipping === true
                        ? "Min " +
                          formatAmount(
                            row.freeShippingInfo?.freeShippingCost,
                            locale,
                            true
                          )
                        : "No Free Shipping",
                  };
                })}
                fileName={
                  "Shipping data " +
                  new Date().toLocaleDateString("en-ca", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })
                }
                permission={""}
              />
              {/* <button
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
              </button> */}
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
