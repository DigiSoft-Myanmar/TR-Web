// ** React Imports
import React, { useState, useEffect, MouseEvent, Fragment } from "react";

// ** MUI Imports
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { DataGrid, GridRowSelectionModel } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import { PaymentStatus } from "@/types/orderTypes";
// ** Type Imports
import { Category, Product, Role, StockType, User } from "@prisma/client";
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
import { RoleNav } from "@/types/role";
import { SellerPermission, TraderPermission } from "@/types/permissionTypes";
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

const SellerTbl = ({
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
  const { type } = router.query;
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
      field: "profile",
      headerName: "Profile",
      valueGetter(params: any) {
        return params.row.username;
      },
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
      valueGetter(params: any) {
        return params.row.phoneNum;
      },
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
      valueGetter(params: any) {
        return params.row.currentMembership?.name;
      },
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
      flex: 0.15,
      minWidth: 100,
      headerName: "# Products",
      field: "prodCount",
      valueGetter(params: any) {
        return params.row.prodCount;
      },
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">{formatAmount(row.prodCount)}</Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      headerName: "State",
      field: "State",
      valueGetter(params: any) {
        return params.row.state?.name;
      },
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">
          {row?.state?.name
            ? getText(row?.state?.name, row?.state?.nameMM, locale)
            : "-"}
        </Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      headerName: "District",
      field: "District",
      valueGetter(params: any) {
        return params.row.district?.name;
      },
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">
          {row?.district?.name
            ? getText(row?.district?.name, row?.district?.nameMM, locale)
            : "-"}
        </Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      headerName: "Township",
      field: "Township",
      valueGetter(params: any) {
        return params.row.township?.name;
      },
      renderCell: ({ row }: CellType) => (
        <Typography variant="body2">
          {row?.township?.name
            ? getText(row?.township?.name, row?.township?.nameMM, locale)
            : "-"}
        </Typography>
      ),
    },
    {
      flex: 0.25,
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
              <h3 className="text-xl font-semibold">{type}</h3>
            </div>
            <div className="flex flex-row items-center gap-3">
              <ExportCSVButton
                csvData={data.map((e: any) => {
                  return {
                    username: e.username,
                    "Display Name": e.displayName ? e.displayName : "-",
                    email: e.email ? e.email : "-",
                    role: e.role,
                    phone: e.phoneNum ? e.phoneNum : "-",
                    membership: e.currentMembership
                      ? e.currentMembership.name
                      : "-",
                    "member start date": e.memberStartDate
                      ? new Date(e.memberStartDate).toLocaleDateString(
                          "en-ca",
                          {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          }
                        )
                      : "-",
                    "# Products": formatAmount(e.prodCount),
                    State: e.state?.name ? e.state.name : "-",
                    District: e.district?.name ? e.district.name : "-",
                    Township: e.township?.name ? e.township.name : "-",
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
                  (type === RoleNav.Sellers ? Role.Seller : Role.Trader) +
                  " data " +
                  new Date().toLocaleDateString("en-ca", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })
                }
                permission={
                  type === RoleNav.Sellers
                    ? SellerPermission.sellerExportAllow
                    : TraderPermission.traderExportAllow
                }
              />
              <button
                className="flex flex-row items-center gap-3 rounded-md bg-primary px-3 py-2 transition-colors hover:bg-primary-focus text-white"
                onClick={() =>
                  router.push(
                    "/users/create?role=" +
                      (type === RoleNav.Sellers ? Role.Seller : Role.Trader)
                  )
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                <span className="text-sm">
                  Add {type === RoleNav.Sellers ? "Seller" : "Trader"}
                </span>
              </button>
            </div>
          </div>
          <div className="flex w-full flex-row flex-wrap items-center justify-between gap-3 p-5">
            <StatsCard
              label={`Total ${type}`}
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
              label={`Pending ${type}`}
              currentCount={
                data.filter((e: any) => e.sellAllow === false).length
              }
              prevCount={data.filter((e: any) => e.sellAllow === false).length}
              totalCount={data.filter((e: any) => e.sellAllow === false).length}
            />

            <StatsCard
              label={"No products"}
              currentCount={data.filter((e: any) => e.prodCount === 0).length}
              prevCount={data.filter((e: any) => e.prodCount === 0).length}
              totalCount={data.filter((e: any) => e.prodCount === 0).length}
            />

            <StatsCard
              label={`Active ${type} (${new Date().getFullYear()})`}
              currentCount={
                data.filter(
                  (e: any) =>
                    e.lastLogin && e.lastLogin > prevYear.toISOString()
                ).length
              }
              prevCount={
                data.filter(
                  (e: any) =>
                    e.lastLogin &&
                    e.lastLogin < prevYear.toISOString() &&
                    e.lastLogin > doublePrevYear.toISOString()
                ).length
              }
              totalCount={
                data.filter(
                  (e: any) =>
                    e.lastLogin && e.lastLogin > prevYear.toISOString()
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

export default SellerTbl;
