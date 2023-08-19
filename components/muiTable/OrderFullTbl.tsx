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
import { Order, Role } from "@prisma/client";
import { formatAmount } from "@/util/textHelper";
import { useRouter } from "next/router";
import { OrderStatus } from "@/types/orderTypes";
import { Colors } from "@/types/color";
import { getOrderStatus } from "@/util/orderHelper";
import { useSession } from "next-auth/react";
import { CardContent, Divider, TextField } from "@mui/material";
import { showWarningDialog } from "@/util/swalFunction";
import StatsCard from "../card/StatsCard";
import { sortBy } from "lodash";
import { useTranslation } from "next-i18next";
import { isSeller } from "@/util/authHelper";
import ExportCSVButton from "../presentational/ExportCSVButton";
import { OrderPermission } from "@/types/permissionTypes";

interface Props {
  invoiceData: Order[];
}

interface InvoiceStatusObj {
  [key: string]: {
    icon: string;
    color: string;
  };
}
interface CellType {
  row: Order;
}

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.primary.main,
}));

// ** Vars
export const invoiceStatusObj: InvoiceStatusObj = {
  Shipped: { color: Colors.success, icon: "mdi:send" },
  Accepted: { color: Colors.secondary, icon: "mdi:check" },
  Verified: { color: Colors.success, icon: "mdi:credit-card-check" },
  "Order Received": { color: Colors.primary, icon: "mdi:message" },
  Rejected: { color: Colors.warning, icon: "mdi:thumb-down" },
  Completed: { color: Colors.success, icon: "mdi:check-circle" },
  "Auto Cancelled": { color: Colors.error, icon: "mdi:money-off" },
  Cancelled: { color: Colors.error, icon: "mdi:cancel" },
  Processing: { color: Colors.info, icon: "mi:clock" },
  Invalid: { color: Colors.error, icon: "mdi:cancel" },
};

const OrderFullTbl = ({
  data: parentData,
  isBuyer,
}: {
  data: any;
  isBuyer?: boolean;
}) => {
  // ** State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // ** Var
  const open = Boolean(anchorEl);
  const [value, setValue] = useState<string>("");
  const [data, setData] = React.useState<any>();
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
          parentData.filter((e: any) => {
            let data = e.invoiceStatus;
            let sellerId = e.sellerIds.find((z) => z === session.id);
            data = e.invoiceStatus.filter((z) =>
              sellerId ? z.seller.id === sellerId : true
            );
            let status = getOrderStatus(e, sellerId).status;

            return (
              e.orderNo
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()) ||
              e.orderBy.username.toLowerCase().includes(value.toLowerCase()) ||
              new Date(e.createdAt.username)
                .toLocaleDateString("en-ca", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                .includes(value.toLowerCase()) ||
              status.toLowerCase().includes(value.toLowerCase())
            );
          })
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
      field: "orderNo",
      minWidth: 90,
      headerName: "Order #",
      renderCell: ({ row }: CellType) => (
        <Typography>{`#${row.orderNo}`}</Typography>
      ),
    },
    {
      flex: 0.2,
      field: "orderBy",
      minWidth: 90,
      headerName: "Order By",
      valueGetter(params: any) {
        return params.row.orderBy.username;
      },
      renderCell: ({ row }: any) => (
        <Typography>{`${row.orderBy.username}`}</Typography>
      ),
    },
    {
      flex: 0.3,
      minWidth: 125,
      field: "createdAt",
      headerName: "Ordered Date",
      renderCell: ({ row }: any) => (
        <Typography variant="body2">
          {new Date(row.createdAt).toLocaleDateString("en-ca", {
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
      field: "total",
      headerName: "Sub Total",
      valueGetter(params: any) {
        return params.row.total;
      },
      renderCell: ({ row }: any) => (
        <Typography variant="body2">
          {formatAmount(row.total, locale, true, false)}
        </Typography>
      ),
    },

    {
      flex: 0.15,
      minWidth: 200,
      field: "invoiceStatus",
      renderHeader: () => "Status",
      valueGetter(params: any) {
        let row = params.row;
        let data = row.invoiceStatus;
        let status = "";
        if (data && data.length > 1) {
          let sellerId = row.sellerIds.find((z) => z === session.id);
          data = row.invoiceStatus.filter((z) =>
            sellerId ? z.seller.id === sellerId : true
          );
          status = getOrderStatus(row, sellerId).status;
        } else {
          status = data[0].status;
        }
        return status;
      },
      renderCell: ({ row }: any) => {
        let data = row.invoiceStatus;

        if (data && data.length > 1) {
          let sellerId = row.sellerIds.find((z) => z === session.id);
          data = row.invoiceStatus.filter((z) =>
            sellerId ? z.seller.id === sellerId : true
          );
          let status = getOrderStatus(row, sellerId).status;
          console.log(getOrderStatus(row, sellerId));
          const color = invoiceStatusObj[status]
            ? invoiceStatusObj[status].color
            : "primary";

          return (
            <Tooltip
              title={data.map((e: any, index: number) => (
                <React.Fragment key={index}>
                  <Typography
                    variant="caption"
                    sx={{ color: "common.white", fontWeight: 600 }}
                  >
                    {e.status}
                  </Typography>
                  <br />
                  <Typography
                    variant="caption"
                    sx={{ color: "common.white", fontWeight: 600 }}
                  >
                    Seller:
                  </Typography>{" "}
                  {e.seller.username}
                  <br />
                  <Typography
                    variant="caption"
                    sx={{ color: "common.white", fontWeight: 600 }}
                  >
                    Updated Date:
                  </Typography>{" "}
                  {new Date(e.updatedDate).toLocaleDateString("en-ca", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  <br />
                  {index !==
                    data.filter((e: any) =>
                      session && session.role === Role.Seller
                        ? e.seller.id === session.id
                        : true
                    ).length -
                      1 && <Divider color="#FFF" />}
                </React.Fragment>
              ))}
            >
              <div className="flex flex-row items-center gap-1">
                <Box
                  color={color}
                  sx={{
                    width: "1.875rem",
                    height: "1.875rem",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <Icon icon={invoiceStatusObj[status]?.icon} fontSize="1rem" />
                </Box>
                <span className="text-sm">{status}</span>
              </div>
            </Tooltip>
          );
        } else if (data && data.length === 1) {
          let status = data[0];
          const color = invoiceStatusObj[status.status]
            ? invoiceStatusObj[status.status].color
            : "primary";

          return (
            <Tooltip
              title={
                <>
                  <Typography
                    variant="caption"
                    sx={{ color: "common.white", fontWeight: 600 }}
                  >
                    {status.status}
                  </Typography>
                  <br />
                  <Typography
                    variant="caption"
                    sx={{ color: "common.white", fontWeight: 600 }}
                  >
                    Seller:
                  </Typography>{" "}
                  {status.seller.username}
                  <br />
                  <Typography
                    variant="caption"
                    sx={{ color: "common.white", fontWeight: 600 }}
                  >
                    Updated Date:
                  </Typography>{" "}
                  {new Date(status.updatedDate).toLocaleDateString("en-ca", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </>
              }
            >
              <div className="flex flex-row items-center gap-1">
                <Box
                  color={color}
                  sx={{
                    width: "1.875rem",
                    height: "1.875rem",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <Icon
                    icon={invoiceStatusObj[status.status]?.icon}
                    fontSize="1rem"
                  />
                </Box>
                <span className="text-sm">{status.status}</span>
              </div>
            </Tooltip>
          );
        } else {
          return (
            <div className="flex flex-row items-center gap-1">
              <Box
                color={invoiceStatusObj["Invalid"].color}
                sx={{
                  width: "1.875rem",
                  height: "1.875rem",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                <Icon
                  icon={invoiceStatusObj["Invalid"]?.icon}
                  fontSize="1rem"
                />
              </Box>
              <span className="text-sm">Invalid</span>
            </div>
          );
        }
      },
    },

    {
      flex: 0.1,
      minWidth: 130,
      sortable: false,
      field: "actions",
      headerName: "Actions",
      renderCell: ({ row }: any) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {session && session.role === Role.Buyer ? (
            <Tooltip title="View">
              <IconButton
                size="small"
                component={Link}
                href={`/orders/${row.actions}`}
              >
                <Icon icon="mdi:eye" fontSize={20} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Edit">
              <IconButton
                size="small"
                component={Link}
                href={`/orders/${row.actions}`}
              >
                <Icon icon="mdi:edit" fontSize={20} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    data && (
      <Card>
        <div className="flex w-full flex-row flex-wrap items-center px-5 pt-5">
          <div className="flex flex-grow flex-row items-end gap-3">
            <h3 className="text-xl font-semibold">
              {isBuyer ? "Purchased History" : "Sales History"}
            </h3>
          </div>
          <div className="flex flex-row items-center gap-3">
            <ExportCSVButton
              csvData={data?.map((row: any) => {
                let status = getOrderStatus(
                  row,
                  row.sellerIds.find((z: any) => z === session.id)
                    ? row.sellerIds.find((z: any) => z === session.id)
                    : ""
                ).status;

                return {
                  "Order #": row.orderNo,
                  Orderer: row.orderBy.username,
                  "Orderer Email": row.orderBy.email ? row.orderBy.email : "-",
                  "Orderer Phone": row.orderBy.phoneNum,
                  "Ordered Date": new Date(row.createdAt).toLocaleDateString(
                    "en-ca",
                    {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  ),
                  "Sub Total": formatAmount(row.total, locale, true, false),
                  Status: status,
                };
              })}
              fileName={
                "Orders data " +
                new Date().toLocaleDateString("en-ca", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })
              }
              permission={OrderPermission.orderExportAllow}
            />
            {/*  <button
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
            label="Total Orders"
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
            label={"Shipped Orders"}
            currentCount={
              data.filter(
                (e: any) =>
                  e.createdAt > prevYear.toISOString() &&
                  e.invoiceStatus.length > 0 &&
                  e.invoiceStatus.every(
                    (e: any) => e.status === OrderStatus.Shipped
                  )
              ).length
            }
            prevCount={
              data.filter(
                (e: any) =>
                  e.createdAt < prevYear.toISOString() &&
                  e.createdAt > doublePrevYear.toISOString() &&
                  e.invoiceStatus.length > 0 &&
                  e.invoiceStatus.every(
                    (e: any) => e.status === OrderStatus.Shipped
                  )
              ).length
            }
            totalCount={
              data.filter(
                (e: any) =>
                  e.invoiceStatus.length > 0 &&
                  e.invoiceStatus.every(
                    (e: any) => e.status === OrderStatus.Shipped
                  )
              ).length
            }
          />
          <StatsCard
            label={"Pending Orders"}
            currentCount={
              data.filter(
                (e: any) =>
                  e.createdAt > prevYear.toISOString() &&
                  e.invoiceStatus.every(
                    (e: any) =>
                      e.status !== OrderStatus.AutoCancelled &&
                      e.status !== OrderStatus.Completed &&
                      e.status !== OrderStatus.Rejected &&
                      e.status !== OrderStatus.Shipped
                  )
              ).length
            }
            prevCount={
              data.filter(
                (e: any) =>
                  e.createdAt < prevYear.toISOString() &&
                  e.createdAt > doublePrevYear.toISOString() &&
                  e.invoiceStatus.every(
                    (e: any) =>
                      e.status !== OrderStatus.AutoCancelled &&
                      e.status !== OrderStatus.Completed &&
                      e.status !== OrderStatus.Rejected &&
                      e.status !== OrderStatus.Shipped
                  )
              ).length
            }
            totalCount={
              data.filter((e: any) =>
                e.invoiceStatus.every(
                  (e: any) =>
                    e.status !== OrderStatus.AutoCancelled &&
                    e.status !== OrderStatus.Completed &&
                    e.status !== OrderStatus.Rejected &&
                    e.status !== OrderStatus.Shipped
                )
              ).length
            }
          />
          <StatsCard
            label={"Cancelled Orders"}
            currentCount={
              data.filter(
                (e: any) =>
                  e.createdAt > prevYear.toISOString() &&
                  e.invoiceStatus.some(
                    (e: any) =>
                      e.status === OrderStatus.AutoCancelled ||
                      e.status === OrderStatus.Rejected
                  )
              ).length
            }
            prevCount={
              data.filter(
                (e: any) =>
                  e.createdAt < prevYear.toISOString() &&
                  e.createdAt > doublePrevYear.toISOString() &&
                  e.invoiceStatus.some(
                    (e: any) =>
                      e.status === OrderStatus.AutoCancelled ||
                      e.status === OrderStatus.Rejected
                  )
              ).length
            }
            totalCount={
              data.filter((e: any) =>
                e.invoiceStatus.some(
                  (e: any) =>
                    e.status === OrderStatus.AutoCancelled ||
                    e.status === OrderStatus.Rejected
                )
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
    )
  );
};

export default OrderFullTbl;
