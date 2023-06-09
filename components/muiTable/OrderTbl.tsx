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
import { Divider } from "@mui/material";

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
const invoiceStatusObj: InvoiceStatusObj = {
  Shipped: { color: Colors.success, icon: "mdi:send" },
  Accepted: { color: Colors.secondary, icon: "mdi:check" },
  "Order Received": { color: Colors.primary, icon: "mdi:message" },
  Rejected: { color: Colors.warning, icon: "mdi:thumb-down" },
  Completed: { color: Colors.success, icon: "mdi:check-circle" },
  Refund: { color: Colors.error, icon: "mdi:money-off" },
  Cancelled: { color: Colors.error, icon: "mdi:cancel" },
  Details: { color: Colors.info, icon: "mi:list" },
};

const OrderSmallTbl = ({ data }: { data: any }) => {
  // ** State
  const [pageSize, setPageSize] = useState<number>(7);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: session }: any = useSession();
  // ** Var
  const open = Boolean(anchorEl);

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
      flex: 0.15,
      minWidth: 80,
      field: "invoiceStatus",
      renderHeader: () => "Status",
      renderCell: ({ row }: any) => {
        const data = row.invoiceStatus;

        if (data.length > 1) {
          let status = getOrderStatus(
            data.filter((e: any) =>
              session && session.role === Role.Seller
                ? e.brandId === session.brand.id
                : true
            )
          );
          const color = invoiceStatusObj[status]
            ? invoiceStatusObj[status].color
            : "primary";

          return (
            <Tooltip
              title={data
                .filter((e: any) =>
                  session && session.role === Role.Seller
                    ? e.brand === session.brand.brandName
                    : true
                )
                .map((e: any, index: number) => (
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
                      Brand:
                    </Typography>{" "}
                    {e.brand}
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
                          ? e.brand === session.brand.brandName
                          : true
                      ).length -
                        1 && <Divider color="#FFF" />}
                  </React.Fragment>
                ))}
            >
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
            </Tooltip>
          );
        } else {
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
                    Brand:
                  </Typography>{" "}
                  {status.brand}
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
            </Tooltip>
          );
        }
      },
    },

    {
      flex: 0.25,
      minWidth: 90,
      field: "total",
      headerName: "Sub Total",
      renderCell: ({ row }: any) => (
        <Typography variant="body2">
          {formatAmount(row.total, locale, true, false)}
        </Typography>
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
              component={Link}
              href={`/orders/${row.actions}`}
            >
              <Icon icon="mdi:edit" fontSize={20} />
            </IconButton>
          </Tooltip>
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
    <Card>
      <h3 className="p-5 text-lg font-semibold">
        {`Orders List (${new Date().toLocaleDateString("en-ca", {
          year: "numeric",
          month: "long",
        })})`}
      </h3>
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
  );
};

export default OrderSmallTbl;
