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
import {
  AuctionStatus,
  Auctions,
  Order,
  Product,
  Role,
  User,
} from "@prisma/client";
import { formatAmount, getText } from "@/util/textHelper";
import { useRouter } from "next/router";
import { OrderStatus } from "@/types/orderTypes";
import { Colors } from "@/types/color";
import { getOrderStatus } from "@/util/orderHelper";
import { useSession } from "next-auth/react";
import { CardContent, Divider, TextField } from "@mui/material";
import {
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "@/util/swalFunction";
import StatsCard from "../card/StatsCard";
import { sortBy } from "lodash";
import { useTranslation } from "next-i18next";
import { fileUrl } from "@/types/const";
import { encryptPhone } from "@/util/encrypt";
import Avatar from "../presentational/Avatar";
import { getHeaders, isInternal, isSeller } from "@/util/authHelper";
import LoadingScreen from "../screen/LoadingScreen";

const Img = styled("img")(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: "10%",
  marginRight: theme.spacing(3),
}));

interface InvoiceStatusObj {
  [key: string]: {
    icon: string;
    color: string;
  };
}
interface CellType {
  row: any;
}
AuctionStatus.RejectBySeller;

const BidTbl = ({ data: parentData }: { data: any }) => {
  // ** State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // ** Var
  const open = Boolean(anchorEl);
  const [value, setValue] = useState<string>("");
  const [data, setData] = React.useState<any>(undefined);
  const router = useRouter();
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
              e.orderNo.toLowerCase().includes(value.toLowerCase()) ||
              e.orderBy.username.toLowerCase().includes(value.toLowerCase()) ||
              new Date(e.createdAt.username)
                .toLocaleDateString("en-ca", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                .includes(value.toLowerCase())
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
      field: "Product",
      minWidth: 90,
      headerName: "Product",
      renderCell: ({ row }: CellType) => (
        <Link
          href={
            isInternal(session) ||
            (row.isProduct === true
              ? row.sellerId === session.id
              : row.product.sellerId === session.id)
              ? "/products/" +
                encodeURIComponent(
                  row.isProduct === true ? row.slug : row.product.slug
                ) +
                "?action=view"
              : "/marketplace/" +
                encodeURIComponent(
                  row.isProduct === true ? row.slug : row.product.slug
                )
          }
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Img
              src={fileUrl + row.product?.imgList[0]}
              alt={`${row.product.slug}`}
            />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                {getText(row.product.name, row.product.nameMM, locale)}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                {row.SKU}
              </Typography>
            </Box>
          </Box>
        </Link>
      ),
    },
    {
      flex: 0.2,
      field: "status",
      minWidth: 90,
      headerName: "Status",
      renderCell: ({ row }: CellType) => (
        <div
          className={`flex flex-row items-center gap-3 ${
            new Date(row.product.endTime) <= new Date()
              ? "bg-info/20 text-info"
              : new Date(row.product.endTime) > new Date()
              ? "bg-success/20 text-success"
              : ""
          } px-2 py-1 rounded-md font-semibold border`}
        >
          <span className="text-xs">
            {new Date(row.product.endTime) <= new Date()
              ? "Ended"
              : new Date(row.product.endTime) > new Date()
              ? "Live"
              : ""}
          </span>
        </div>
      ),
    },
    {
      flex: 0.2,
      field: "Bid Amount",
      minWidth: 90,
      headerName: "Bid Amount",
      renderCell: ({ row }: CellType) => (
        <Typography>{formatAmount(row.amount, locale, true, false)}</Typography>
      ),
    },

    {
      flex: 0.2,
      field: "Bidder",
      minWidth: 90,
      headerName: "Bidder",
      renderCell: ({ row }: CellType) => (
        <Link
          href={
            "/account/" +
            encodeURIComponent(encryptPhone(row.createdBy.phoneNum))
          }
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              profile={row.createdBy.profile}
              username={row.createdBy.username}
            />

            <Box
              sx={{ display: "flex", flexDirection: "column", marginLeft: 1 }}
            >
              <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                {row.createdBy.username}
              </Typography>
              {row.createdBy.displayName ? (
                <Typography variant="caption" sx={{ color: "text.disabled" }}>
                  {row.createdBy.displayName}
                </Typography>
              ) : (
                <></>
              )}
            </Box>
          </Box>
        </Link>
      ),
    },
    {
      flex: 0.3,
      minWidth: 125,
      field: "createdAt",
      headerName: "Bid Time",
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">
          {new Date(row.createdAt).toLocaleDateString("en-ca", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      ),
    },
  ];
  return data ? (
    <Card>
      <div className="flex w-full flex-row flex-wrap items-center px-5 pt-5">
        <div className="flex flex-grow flex-row items-end gap-3">
          <h3 className="text-xl font-semibold">Auctions</h3>
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
      {data && data.length > 0 && (
        <div className="flex w-full flex-row flex-wrap items-center justify-between gap-3 p-5">
          <StatsCard
            label="Total Products"
            currentCount={
              data?.filter((e: any) => e.createdAt > prevYear.toISOString())
                .length
            }
            prevCount={
              data?.filter((e: any) => e.createdAt > prevYear.toISOString())
                .length
            }
            totalCount={data?.length}
          />
          <StatsCard
            label="Total Ended Products"
            currentCount={
              data?.filter(
                (e: any) =>
                  e.createdAt > prevYear.toISOString() &&
                  new Date(e.product.endTime).getTime() < new Date().getTime()
              ).length
            }
            prevCount={
              data?.filter(
                (e: any) =>
                  e.createdAt < prevYear.toISOString() &&
                  e.createdAt > doublePrevYear.toISOString() &&
                  new Date(e.product.endTime).getTime() < new Date().getTime()
              ).length
            }
            totalCount={
              data?.filter(
                (e: any) =>
                  new Date(e.product.endTime).getTime() < new Date().getTime()
              ).length
            }
          />
          <StatsCard
            label="Total Live Products"
            currentCount={
              data?.filter(
                (e: any) =>
                  e.createdAt > prevYear.toISOString() &&
                  new Date(e.product.endTime).getTime() >= new Date().getTime()
              ).length
            }
            prevCount={
              data?.filter(
                (e: any) =>
                  e.createdAt < prevYear.toISOString() &&
                  e.createdAt > doublePrevYear.toISOString() &&
                  new Date(e.product.endTime).getTime() >= new Date().getTime()
              ).length
            }
            totalCount={
              data?.filter(
                (e: any) =>
                  new Date(e.product.endTime).getTime() >= new Date().getTime()
              ).length
            }
          />
        </div>
      )}
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
                placeholder={"Search Bids"}
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
    </Card>
  ) : (
    <LoadingScreen />
  );
};

export default BidTbl;
