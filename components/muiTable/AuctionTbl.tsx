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
  WonList,
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

const AuctionTbl = ({ data: parentData }: { data: any }) => {
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
          [...parentData.newList, ...parentData.wonList].filter(
            (e: any) =>
              e.product.name?.toLowerCase().includes(value.toLowerCase()) ||
              e.product.nameMM?.toLowerCase().includes(value.toLowerCase()) ||
              e.name?.toLowerCase().includes(value.toLowerCase()) ||
              e.nameMM?.toLowerCase().includes(value.toLowerCase()) ||
              e.SKU?.toLowerCase().includes(value.toLowerCase()) ||
              e.auction.SKU?.toLowerCase().includes(value.toLowerCase()) ||
              e.status?.toLowerCase().includes(value.toLowerCase()) ||
              e.auction.createdBy?.username
                ?.toLowerCase()
                .includes(value.toLowerCase()) ||
              e.auction.createdBy?.displayName
                ?.toLowerCase()
                .includes(value.toLowerCase()) ||
              e.auction.createdBy?.phoneNum
                ?.toLowerCase()
                .includes(value.toLowerCase()) ||
              e.auction.createdBy?.email
                ?.toLowerCase()
                .includes(value.toLowerCase()) ||
              e.product.seller?.username
                ?.toLowerCase()
                .includes(value.toLowerCase()) ||
              e.product.seller?.displayName
                ?.toLowerCase()
                .includes(value.toLowerCase()) ||
              e.product.seller?.phoneNum
                ?.toLowerCase()
                .includes(value.toLowerCase()) ||
              e.product.seller?.email
                ?.toLowerCase()
                .includes(value.toLowerCase())
          )
        );
      } else {
        setData([...parentData.newList, ...parentData.wonList]);
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
          {row.isProduct === true ? (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Img src={fileUrl + row?.imgList[0]} alt={`${row.slug}`} />
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                  {getText(row.name, row.nameMM, locale)}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.disabled" }}>
                  {row.SKU}
                </Typography>
              </Box>
            </Box>
          ) : (
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
                  {row.auction.SKU}
                </Typography>
              </Box>
            </Box>
          )}
        </Link>
      ),
    },
    {
      flex: 0.2,
      field: "status",
      minWidth: 90,
      headerName: "Status",
      renderCell: ({ row }: CellType) =>
        row.isProduct ? (
          <div className="flex flex-row items-center gap-3 bg-warning/20 text-warning px-2 py-1 rounded-md font-semibold border">
            <span className="text-xs">Ended</span>
          </div>
        ) : (
          <div
            className={`flex flex-row items-center gap-3 ${
              row.status === AuctionStatus.AutoCancelled ||
              row.status === AuctionStatus.RejectByBuyer ||
              row.status === AuctionStatus.RejectBySeller
                ? "bg-error/20 text-error"
                : row.status === AuctionStatus.InCart
                ? "bg-info/20 text-info"
                : row.status === AuctionStatus.LowPrice ||
                  row.status === AuctionStatus.InCart
                ? "bg-warning/20 text-warning"
                : row.status === AuctionStatus.Purchased
                ? "bg-success/20 text-success"
                : ""
            } px-2 py-1 rounded-md font-semibold border`}
          >
            <span className="text-xs">{`${row.status}`}</span>
          </div>
        ),
    },
    {
      flex: 0.2,
      field: "Bid Amount",
      minWidth: 90,
      headerName: "Bid Amount",
      renderCell: ({ row }: CellType) => (
        <Typography>
          {formatAmount(row.auction.amount, locale, true, false)}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      field: "Estimated Amount",
      minWidth: 90,
      headerName: "Estimated Amount",
      renderCell: ({ row }: CellType) => (
        <Typography>
          {formatAmount(
            row.estimatedPrice ? row.estimatedPrice : row.estimatedAmount,
            locale,
            true,
            false
          )}
        </Typography>
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
            encodeURIComponent(encryptPhone(row.auction.createdBy.phoneNum))
          }
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              profile={row.auction.createdBy.profile}
              username={row.auction.createdBy.username}
            />

            <Box
              sx={{ display: "flex", flexDirection: "column", marginLeft: 1 }}
            >
              <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                {row.auction.createdBy.username}
              </Typography>
              {row.auction.createdBy.displayName ? (
                <Typography variant="caption" sx={{ color: "text.disabled" }}>
                  {row.auction.createdBy.displayName}
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
      headerName: "Created Date",
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">
          {new Date(
            row.isProduct ? row.auction.createdAt : row.createdAt
          ).toLocaleDateString("en-ca", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </Typography>
      ),
    },
    {
      flex: 0.25,
      minWidth: 90,
      field: "Action",
      headerName: "Action",
      renderCell: ({ row }: CellType) => (
        <div className="flex flex-row items-center gap-3 flex-wrap">
          {row.isProduct === true ? (
            <></>
          ) : (
            <Link
              href={"/api/auction/print/auction?id=" + row.id}
              target="_blank"
              className="px-3 py-2 rounded-md border bg-indigo-200 text-indigo-600 hover:bg-indigo-300 transition font-semibold"
            >
              <Tooltip title="Print">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
                  />
                </svg>
              </Tooltip>
            </Link>
          )}
          {(row.status === AuctionStatus.LowPrice ||
            row.isProduct === true) && (
            <button
              className="px-3 py-2 rounded-md border bg-green-200 text-green-600 hover:bg-green-300 transition font-semibold"
              type="button"
              onClick={() => {
                fetch("/api/auction/closeDeal?id=" + row.auction.id, {
                  method: "PUT",
                  body: JSON.stringify({ isAccept: true }),
                  headers: getHeaders(session),
                }).then(async (data) => {
                  if (data.status === 200) {
                    showSuccessDialog(
                      "The product is in bidder cart.",
                      "",
                      locale
                    );
                  } else {
                    let json = await data.json();
                    if (json.error) {
                      showErrorDialog(json.error, json.errorMM, locale);
                    } else {
                      showErrorDialog(JSON.stringify(json));
                    }
                  }
                });
              }}
            >
              <Tooltip title="Accept Offer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </Tooltip>
            </button>
          )}
          {(row.status === AuctionStatus.LowPrice ||
            row.status === AuctionStatus.InCart ||
            row.isProduct === true) && (
            <button
              className="px-3 py-2 rounded-md border bg-red-200 text-red-600 hover:bg-red-300 transition font-semibold"
              type="button"
              onClick={() => {
                fetch("/api/auction/closeDeal?id=" + row.auction.id, {
                  method: "PUT",
                  body: JSON.stringify({ isAccept: false }),
                  headers: getHeaders(session),
                }).then(async (data) => {
                  if (data.status === 200) {
                    showSuccessDialog(
                      "The product is in removed from bidder cart.",
                      "",
                      locale
                    );
                  } else {
                    let json = await data.json();
                    if (json.error) {
                      showErrorDialog(json.error, json.errorMM, locale);
                    } else {
                      showErrorDialog(JSON.stringify(json));
                    }
                  }
                });
              }}
            >
              <Tooltip title="Reject Offer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Tooltip>
            </button>
          )}
        </div>
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
      {data && (
        <div className="flex w-full flex-row flex-wrap items-center justify-between gap-3 p-5">
          <StatsCard
            label="Total Auctions"
            currentCount={
              data?.filter((e: any) => e.createdAt > prevYear.toISOString())
                .length
            }
            prevCount={
              data?.filter(
                (e: any) =>
                  e.createdAt < prevYear.toISOString() &&
                  e.createdAt > doublePrevYear.toISOString()
              ).length
            }
            totalCount={data?.length}
          />
          <StatsCard
            label="Total Purchased"
            currentCount={
              data?.filter(
                (e: any) =>
                  e.createdAt > prevYear.toISOString() &&
                  e.status === AuctionStatus.Purchased
              ).length
            }
            prevCount={
              data?.filter(
                (e: any) =>
                  e.createdAt < prevYear.toISOString() &&
                  e.createdAt > doublePrevYear.toISOString() &&
                  e.status === AuctionStatus.Purchased
              ).length
            }
            totalCount={
              data?.filter((e: any) => e.status === AuctionStatus.Purchased)
                .length
            }
          />
          <StatsCard
            label="Total Rejected"
            currentCount={
              data?.filter(
                (e: any) =>
                  e.createdAt > prevYear.toISOString() &&
                  (e.status === AuctionStatus.RejectByBuyer ||
                    e.status === AuctionStatus.RejectBySeller ||
                    e.status === AuctionStatus.AutoCancelled)
              ).length
            }
            prevCount={
              data?.filter(
                (e: any) =>
                  e.createdAt < prevYear.toISOString() &&
                  e.createdAt > doublePrevYear.toISOString() &&
                  (e.status === AuctionStatus.RejectByBuyer ||
                    e.status === AuctionStatus.RejectBySeller ||
                    e.status === AuctionStatus.AutoCancelled)
              ).length
            }
            totalCount={
              data?.filter(
                (e: any) =>
                  e.status === AuctionStatus.RejectByBuyer ||
                  e.status === AuctionStatus.RejectBySeller ||
                  e.status === AuctionStatus.AutoCancelled
              ).length
            }
          />
          <StatsCard
            label="Total Cart"
            currentCount={
              data?.filter(
                (e: any) =>
                  e.createdAt > prevYear.toISOString() &&
                  e.status === AuctionStatus.InCart
              ).length
            }
            prevCount={
              data?.filter(
                (e: any) =>
                  e.createdAt < prevYear.toISOString() &&
                  e.createdAt > doublePrevYear.toISOString() &&
                  e.status === AuctionStatus.InCart
              ).length
            }
            totalCount={
              data?.filter((e: any) => e.status === AuctionStatus.InCart).length
            }
          />
          <StatsCard
            label="Total Ended"
            currentCount={
              data?.filter(
                (e: any) => e.auction?.createdAt > prevYear.toISOString()
              ).length
            }
            prevCount={
              data?.filter(
                (e: any) =>
                  e.auction?.createdAt < prevYear.toISOString() &&
                  e.auction?.createdAt > doublePrevYear.toISOString()
              ).length
            }
            totalCount={data?.filter((e: any) => e.auction).length}
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
                placeholder={"Search Orders"}
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

export default AuctionTbl;
