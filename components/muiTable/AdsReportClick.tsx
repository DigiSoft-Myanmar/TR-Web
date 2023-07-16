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
import { fileUrl } from "@/types/const";

interface CellType {
  row: any;
}

const Img = styled("img")(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: "10%",
  marginRight: theme.spacing(3),
}));

const AdsReportClick = ({ data }: { data: any }) => {
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
      field: "ads",
      minWidth: 90,
      headerName: "Ads",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Img src={fileUrl + row.ads.adsImg} alt={`${row.ads.adsImg}`} />
        </Box>
      ),
    },
    {
      flex: 0.15,
      minWidth: 80,
      field: "location",
      renderHeader: () => "Location",
      renderCell: ({ row }: any) => (
        <Typography variant="body2">{row.adsLocation}</Typography>
      ),
    },

    {
      flex: 0.3,
      minWidth: 125,
      field: "createdAt",
      headerName: "Clicked Date",
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
  ];

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card>
      <h3 className="p-5 text-lg font-semibold">{`Ads Click List`}</h3>
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

export default AdsReportClick;
