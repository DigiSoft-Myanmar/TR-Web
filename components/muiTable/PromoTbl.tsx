// ** React Imports
import React, { MouseEvent, useState } from "react";

// ** Next Import
import Link from "next/link";

// ** MUI Imports
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Menu from "@mui/material/Menu";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid } from "@mui/x-data-grid";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

// ** Icon Imports
import Icon from "@/components/presentational/Icon";
import { Order, PromoCode, Role } from "@prisma/client";
import { formatAmount, getInitials } from "@/util/textHelper";
import { useRouter } from "next/router";
import { OrderStatus } from "@/types/orderTypes";
import { Colors } from "@/types/color";
import { getOrderStatus } from "@/util/orderHelper";
import { useSession } from "next-auth/react";
import { CardContent, Divider, TextField } from "@mui/material";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "@/util/swalFunction";
import StatsCard from "../card/StatsCard";
import { sortBy } from "lodash";
import { useTranslation } from "next-i18next";
import { PromoType, isBetween, isTodayBetween } from "@/util/verify";
import { fileUrl } from "@/types/const";
import PromotionModal from "../modal/sideModal/PromotionModal";
import Avatar from "../presentational/Avatar";

const Img = styled("img")(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: "10%",
  marginRight: theme.spacing(3),
}));

interface Props {
  invoiceData: PromoCode[];
}

interface InvoiceStatusObj {
  [key: string]: {
    icon: string;
    color: string;
  };
}
interface CellType {
  row: PromoCode;
}

const PromoTbl = ({
  data: parentData,
  refetch,
}: {
  data: PromoCode[];
  refetch: Function;
}) => {
  // ** State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // ** Var
  const open = Boolean(anchorEl);
  const [value, setValue] = useState<string>("");
  const [data, setData] = React.useState<PromoCode[]>();
  const router = useRouter();
  const { data: session }: any = useSession();
  const { t } = useTranslation("common");
  const doublePrevYear = new Date();
  doublePrevYear.setFullYear(new Date().getFullYear() - 2);

  const prevYear = new Date();
  prevYear.setFullYear(new Date().getFullYear() - 1);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [promotion, setPromotion] = React.useState<any>();

  React.useEffect(() => {
    if (parentData) {
      if (value) {
        setData(
          parentData.filter(
            (e) =>
              e.promoCode.toLowerCase().includes(value.toLowerCase()) ||
              (e.startDate &&
                new Date(e.startDate)
                  .toLocaleDateString("en-ca", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  .includes(value.toLowerCase())) ||
              (e.endDate &&
                new Date(e.endDate)
                  .toLocaleDateString("en-ca", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  .includes(value.toLowerCase()))
          )
        );
      } else {
        setData(parentData);
      }
    }
  }, [parentData, value]);

  const { locale } = useRouter();

  const columns = [
    {
      flex: 0.2,
      field: "promoCode",
      minWidth: 90,
      headerName: "Promo Code",
      renderCell: ({ row }: CellType) => (
        <Typography>{`${row.promoCode.toUpperCase()}`}</Typography>
      ),
    },
    {
      flex: 0.2,
      field: "img",
      minWidth: 90,
      headerName: "Status",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {row.isScheduled === true && row.startDate && row.endDate ? (
            <>
              {isTodayBetween(row.startDate, row.endDate) ===
              PromoType.Active ? (
                <div className="bg-primary text-white px-2 py-1 rounded-md text-xs font-semibold">
                  Active
                </div>
              ) : isTodayBetween(row.startDate, row.endDate) ===
                PromoType.Expired ? (
                <div className="bg-warning text-white px-2 py-1 rounded-md text-xs font-semibold">
                  Expired
                </div>
              ) : (
                <div className="bg-info text-white px-2 py-1 rounded-md text-xs font-semibold">
                  Not Started
                </div>
              )}
            </>
          ) : (
            <div className="bg-primary text-white px-2 py-1 rounded-md text-xs font-semibold">
              Active
            </div>
          )}
        </Box>
      ),
    },
    {
      flex: 0.2,
      field: "Orders",
      minWidth: 90,
      headerName: "Used Count",
      renderCell: ({ row }: any) => (
        <Typography>{`${formatAmount(row.usage, locale)}`}</Typography>
      ),
    },
    {
      flex: 0.2,
      field: "discount",
      minWidth: 90,
      headerName: "Discount",
      renderCell: ({ row }: CellType) => (
        <Typography>{`${
          row.isPercent === true
            ? row.discount + "%"
            : formatAmount(row.discount, locale, true)
        }`}</Typography>
      ),
    },
    {
      flex: 0.2,
      field: "usage",
      minWidth: 90,
      headerName: "Usage",
      renderCell: ({ row }: any) => (
        <Typography>{`${
          row.isCouponUsageInfinity === true
            ? "Infinity"
            : row.couponUsage - row.usage
        }`}</Typography>
      ),
    },
    {
      flex: 0.2,
      field: "isScheduled",
      minWidth: 90,
      headerName: "Schedule",
      renderCell: ({ row }: CellType) => (
        <Typography typography={"caption"}>{`${
          row.isScheduled === true && row.startDate && row.endDate
            ? new Date(row.startDate).toLocaleDateString("en-ca", {
                year: "2-digit",
                month: "short",
                day: "2-digit",
              }) +
              " to " +
              new Date(row.endDate).toLocaleDateString("en-ca", {
                year: "2-digit",
                month: "short",
                day: "2-digit",
              })
            : "No Duration"
        }`}</Typography>
      ),
    },
    {
      flex: 0.2,
      field: "seller",
      minWidth: 90,
      headerName: "Seller",
      renderCell: ({ row }: any) => (
        <div
          className="cursor-pointer"
          onClick={() => {
            router.push("/account/" + encodeURIComponent(row.seller.phoneNum));
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              profile={row.seller.profile}
              username={row.seller.username}
            />
            <Box
              sx={{ display: "flex", flexDirection: "column", marginLeft: 1 }}
            >
              <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                {row.seller.username}
              </Typography>
              {row.displayName ? (
                <Typography variant="caption" sx={{ color: "text.disabled" }}>
                  {row.seller.displayName}
                </Typography>
              ) : (
                <></>
              )}
            </Box>
          </Box>
        </div>
      ),
    },
    {
      flex: 0.1,
      minWidth: 130,
      sortable: false,
      field: "actions",
      headerName: "Actions",
      renderCell: ({ row }: any) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => {
                setPromotion(row);
                setModalOpen(true);
              }}
            >
              <Icon icon="mdi:edit" fontSize={20} />
            </IconButton>
          </Tooltip>
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
                          `/api/promoCode?id=${encodeURIComponent(row.id)}`,
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
  return data ? (
    <Card>
      <div className="flex w-full flex-row flex-wrap items-center px-5 pt-5">
        <div className="flex flex-grow flex-row items-end gap-3">
          <h3 className="text-xl font-semibold">Promo Codes</h3>
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
          label="Total Promo Code"
          currentCount={
            data.filter((e: any) => e.createdAt > prevYear.toISOString()).length
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
          label={"Used Promo Code"}
          currentCount={
            data.filter(
              (e: any) =>
                e.isCouponUsageInfinity === false && e.usage === e.couponUsage
            ).length
          }
          prevCount={
            data.filter(
              (e: any) =>
                e.isCouponUsageInfinity === false && e.usage === e.couponUsage
            ).length
          }
          totalCount={
            data.filter(
              (e: any) =>
                e.isCouponUsageInfinity === false && e.usage === e.couponUsage
            ).length
          }
        />
        <StatsCard
          label={"Expired Promo Code"}
          currentCount={
            data.filter(
              (e: PromoCode) =>
                e.isScheduled === true &&
                e.startDate &&
                e.endDate &&
                isBetween(
                  new Date(e.startDate).toLocaleDateString("en-ca"),
                  new Date(e.endDate).toLocaleDateString("en-ca")
                )
            ).length
          }
          prevCount={
            data.filter(
              (e: PromoCode) =>
                e.isScheduled === true &&
                e.startDate &&
                e.endDate &&
                isBetween(
                  new Date(e.startDate).toLocaleDateString("en-ca"),
                  new Date(e.endDate).toLocaleDateString("en-ca")
                )
            ).length
          }
          totalCount={
            data.filter(
              (e: PromoCode) =>
                e.isScheduled === true &&
                e.startDate &&
                e.endDate &&
                isBetween(
                  new Date(e.startDate).toLocaleDateString("en-ca"),
                  new Date(e.endDate).toLocaleDateString("en-ca")
                ) === false
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
                placeholder={"Search Promo Codes"}
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
          sx={{ "& .MuiDataGrid-columnHeaders": { borderRadius: 0 } }}
        />
      )}
      <PromotionModal
        title={"Update Promo Code"}
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        promotion={promotion}
        setUpdate={() => {
          refetch();
        }}
      />
    </Card>
  ) : (
    <></>
  );
};

export default PromoTbl;
