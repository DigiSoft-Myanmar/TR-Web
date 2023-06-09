// ** React Imports
import React, { useState, useEffect } from "react";

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
import { Product, Role } from "@prisma/client";
import { fileUrl } from "@/types/const";
import { formatAmount, getText } from "@/util/textHelper";
import { useRouter } from "next/router";
import { IconButton, Tooltip } from "@mui/material";

import Icon from "@/components/presentational/Icon";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface CellType {
  row: any;
}
const Img = styled("img")(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  marginRight: theme.spacing(3),
}));

const date = new Date();

const ProductTbl = ({
  data: parentData,
  sellerId,
}: {
  data: any;
  sellerId: string;
}) => {
  // ** State
  const [value, setValue] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(7);
  const [data, setData] = React.useState<any>();
  const router = useRouter();
  const { locale } = router;
  const { data: session }: any = useSession();

  React.useEffect(() => {
    if (parentData) {
      if (value) {
        setData(
          parentData.filter(
            (e: any) =>
              e.name.toLowerCase().includes(value.toLowerCase()) ||
              e.nameMM.toLowerCase().includes(value.toLowerCase())
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
      field: "productInfo",
      headerName: "Product",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Img src={fileUrl + row.productInfo.img} alt={`${row.slug}`} />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
              {getText(row.productInfo.name, row.productInfo.nameMM, locale)}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              {row.productInfo.stock}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: "totalSales",
      headerName: "Total Sales",
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">
          {formatAmount(row.totalSales, locale, true, true)}
        </Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      headerName: "Unit Sold",
      field: "unitSold",
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">
          {formatAmount(row.unitSold, locale, false, true)}
        </Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: "totalViewed",
      headerName: "Total Viewed",
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">
          {formatAmount(row.totalViewed, locale, false, true)}
        </Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: "slug",
      headerName: "Action",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="View">
            <IconButton
              size="small"
              component={Link}
              href={`/products/${row.slug}`}
            >
              <Icon icon="mdi:eye-outline" fontSize={20} />
            </IconButton>
          </Tooltip>
          {session &&
            (session.role === Role.Admin ||
              session.role === Role.Staff ||
              session.role === Role.SuperAdmin ||
              (session.role === Role.Seller && session.id === sellerId)) && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  component={Link}
                  href={`/products/${row.slug}`}
                >
                  <Icon icon="mdi:edit" fontSize={20} />
                </IconButton>
              </Tooltip>
            )}
        </Box>
      ),
    },
  ];

  return (
    <Card>
      <h3 className="px-5 pt-5 text-lg font-semibold">{`Products List`}</h3>

      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" sx={{ mr: 2, flexGrow: 1 }}>
            All stats are based on{" "}
            <span className="font-semibold text-primary">
              {new Date().toLocaleDateString("en-ca", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </Typography>
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
            />
          </Box>
        </Box>
      </CardContent>
      {data && (
        <DataGrid
          autoHeight
          rows={data}
          columns={columns}
          disableRowSelectionOnClick
        />
      )}
    </Card>
  );
};

export default ProductTbl;
