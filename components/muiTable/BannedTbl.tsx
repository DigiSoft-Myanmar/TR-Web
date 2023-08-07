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
import { Category, Product, Role, StockType, User } from "@prisma/client";
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
import { getHeaders } from "@/util/authHelper";
import { encryptPhone } from "@/util/encrypt";
import ExportCSVButton from "../presentational/ExportCSVButton";

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

const OtherTbl = ({
  data: parentData,
  refetch,
  type,
}: {
  data: any;
  refetch: Function;
  type: String;
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
              e.email?.toLowerCase().includes(value.toLowerCase()) ||
              e.phoneNum?.toLowerCase().includes(value.toLowerCase()) ||
              e.role?.toLowerCase().includes(value.toLowerCase())
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
      field: "username",
      headerName: "Username",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
            {row.username}
          </Typography>
        </Box>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      headerName: "E-mail",
      field: "email",
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">{row.email ? row.email : "-"}</Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      headerName: "Phone",
      field: "phoneNum",
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">{row.phoneNum}</Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      headerName: "Role",
      field: "role",
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">{row.role}</Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      headerName: "Last Login",
      field: "lastLogin",
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">
          {row.lastLogin
            ? new Date(row.lastLogin).toLocaleDateString("en-ca", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "Not Login"}
        </Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      headerName: "Status",
      field: "isBlocked",
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">
          {row.isBlocked || row.isDeleted ? (
            <span className="rounded-md bg-error/20 px-3 py-1 text-error">
              {row.isBlocked && row.isDeleted
                ? "Blocked & Deleted"
                : row.isBlocked
                ? "Blocked"
                : row.isDeleted
                ? "Deleted"
                : ""}
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
          {row.phoneNum && (
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
          )}
          {session &&
            (session.role === Role.Admin ||
              session.role === Role.Staff ||
              session.role === Role.SuperAdmin ||
              session.role === Role.Seller) &&
            row.phoneNum && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  component={Link}
                  href={`/account/${encodeURIComponent(
                    encryptPhone(row.phoneNum)
                  )}?action=edit`}
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
              <h3 className="text-xl font-semibold">{type} Users</h3>
            </div>
            <div className="flex flex-row items-center gap-3">
              <ExportCSVButton
                csvData={data.map((e: User) => {
                  return {
                    username: e.username,
                    "Display Name": e.displayName ? e.displayName : "-",
                    email: e.email ? e.email : "-",
                    role: e.role,
                    phone: e.phoneNum ? e.phoneNum : "-",
                    "Last Login": e.lastLogin
                      ? new Date(e.lastLogin).toLocaleDateString("en-ca", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        })
                      : "-",
                    Blocked: e.isBlocked ? "Yes" : "No",
                    Deleted: e.isDeleted ? "Yes" : "No",
                  };
                })}
                fileName={
                  type +
                  " data " +
                  new Date().toLocaleDateString("en-ca", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })
                }
                permission={""}
              />
            </div>
          </div>
          <div className="flex w-full flex-row flex-wrap items-center justify-between gap-3 p-5">
            <StatsCard
              label={"Total " + type + " Users"}
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
              label={type + " Buyers"}
              currentCount={
                data.filter((e: any) => e.role === Role.Buyer).length
              }
              prevCount={data.filter((e: any) => e.role === Role.Buyer).length}
              totalCount={data.filter((e: any) => e.role === Role.Buyer).length}
            />
            <StatsCard
              label={type + " Sellers"}
              currentCount={
                data.filter((e: any) => e.role === Role.Seller).length
              }
              prevCount={data.filter((e: any) => e.role === Role.Seller).length}
              totalCount={
                data.filter((e: any) => e.role === Role.Seller).length
              }
            />

            <StatsCard
              label={type + " Staffs"}
              currentCount={
                data.filter((e: any) => e.role === Role.Staff).length
              }
              prevCount={data.filter((e: any) => e.role === Role.Staff).length}
              totalCount={data.filter((e: any) => e.role === Role.Staff).length}
            />

            <StatsCard
              label={type + " Admins"}
              currentCount={
                data.filter((e: any) => e.role === Role.Admin).length
              }
              prevCount={data.filter((e: any) => e.role === Role.Admin).length}
              totalCount={data.filter((e: any) => e.role === Role.Admin).length}
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
                    placeholder={"Search Admins"}
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
              disableRowSelectionOnClick
            />
          )}
        </Card>
      </>
    )
  );
};

export default OtherTbl;
