// ** React Imports
import React, { MouseEvent, useState } from "react";

// ** Next Import
import Link from "next/link";

// ** MUI Imports
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

// ** Icon Imports
import Icon from "@/components/presentational/Icon";
import { Ads, Role } from "@prisma/client";
import { formatAmount, getInitials, getText } from "@/util/textHelper";
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
import Avatar from "../presentational/Avatar";
import AdsDetailDialog from "../modal/dialog/AdsDetailDialog";
import { encryptPhone } from "@/util/encrypt";
import LoadingScreen from "../screen/LoadingScreen";
import ExportCSVButton from "../presentational/ExportCSVButton";
import { checkExpire, checkPlaced } from "@/util/adsHelper";

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
  row: Ads;
}

const AdsTable = ({
  data: parentData,
  refetch,
}: {
  data: Ads[];
  refetch: Function;
}) => {
  // ** State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // ** Var
  const open = Boolean(anchorEl);
  const [value, setValue] = useState<string>("");
  const [data, setData] = React.useState<Ads[]>(undefined);
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
          parentData?.filter(
            (e: any) =>
              e.seller.username.toLowerCase().includes(value.toLowerCase()) ||
              e.seller.displayName
                ?.toLowerCase()
                .includes(value.toLowerCase()) ||
              e.seller.phoneNum?.toLowerCase().includes(value.toLowerCase()) ||
              e.seller.email?.toLowerCase().includes(value.toLowerCase())
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
      field: "img",
      minWidth: 90,
      headerName: "Ads Image",
      renderCell: ({ row }: any) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Img src={fileUrl + row.adsImg} alt={`${row.adsImg}`} />
          {row.adsLocations.length > 0 &&
          row.adsLocations.find((b: any) =>
            checkPlaced(b, row.seller.currentMembership)
          ) ? (
            <div className="bg-primary text-white px-2 py-1 rounded-md text-xs font-semibold">
              Placed
            </div>
          ) : row.adsLocations.length > 0 ? (
            <div className="bg-info text-white px-2 py-1 rounded-md text-xs font-semibold">
              Expired
            </div>
          ) : (
            <div className="bg-warning text-white px-2 py-1 rounded-md text-xs font-semibold">
              Not Placed
            </div>
          )}
        </Box>
      ),
    },
    {
      flex: 0.2,
      field: "dimensions",
      minWidth: 90,
      headerName: "Dimensions",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
            {row.adsPlacement}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {row.adsWidth}px x {row.adsHeight}px
          </Typography>
        </Box>
      ),
    },

    {
      flex: 0.2,
      field: "membership",
      minWidth: 90,
      headerName: "Membership",
      renderCell: ({ row }: any) => {
        let endDate = new Date(row.seller.memberStartDate);
        if (row.seller.currentMembership) {
          endDate.setDate(
            endDate.getDate() + row.seller.currentMembership.validity
          );
        }

        return (
          <Tooltip
            title={
              <div>
                <p>
                  Start Date :{" "}
                  {new Date(row.seller.memberStartDate).toLocaleDateString(
                    "en-ca",
                    {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    }
                  )}
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
                    row.seller?.currentMembership?.name,
                    row.seller?.currentMembership?.nameMM,
                    locale
                  )}
                </Typography>

                <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                  {isTodayBetween(row.seller.memberStartDate, endDate) ? (
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
      flex: 0.2,
      field: "seller",
      minWidth: 90,
      headerName: "Seller",
      renderCell: ({ row }: any) => (
        <div
          className="cursor-pointer"
          onClick={() => {
            router.push(
              "/account/" +
                encodeURIComponent(encryptPhone(row.seller.phoneNum))
            );
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
      flex: 0.2,
      field: "createdAt",
      minWidth: 90,
      headerName: "Upload Date",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
            {new Date(row.createdAt).toLocaleDateString("en-ca", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })}
          </Typography>
        </Box>
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
                          `/api/siteManagement/ads?id=${encodeURIComponent(
                            row.id
                          )}`,
                          {
                            method: "DELETE",
                          }
                        ).then(async (data) => {
                          if (data?.status === 200) {
                            showSuccessDialog(
                              t("delete") + " " + t("success"),
                              "",
                              locale,
                              () => {
                                refetch();
                              }
                            );
                          } else {
                            let json = await data?.json();
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
          <h3 className="text-xl font-semibold">Ads</h3>
        </div>
        <div className="flex flex-row items-center gap-3">
          <ExportCSVButton
            csvData={data.map((e: any) => {
              return {
                adsImg: e.adsImg,
                placed: e.adsLocations.length > 0 ? "Placed" : "Not Placed",
                "upload date": new Date(e.createdAt).toLocaleDateString(
                  "en-ca",
                  {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  }
                ),
                membership: e.seller.currentMembership
                  ? e.seller.currentMembership.name
                  : "-",
                "member start date": e.seller.memberStartDate
                  ? new Date(e.seller.memberStartDate).toLocaleDateString(
                      "en-ca",
                      {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      }
                    )
                  : "-",
                username: e.seller.username,
                "Display Name": e.seller.displayName
                  ? e.seller.displayName
                  : "-",
                email: e.seller.email ? e.seller.email : "-",
                phone: e.seller.phoneNum ? e.seller.phoneNum : "-",
              };
            })}
            fileName={
              "Ads data " +
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
      {data && (
        <div className="flex w-full flex-row flex-wrap items-center justify-between gap-3 p-5">
          <StatsCard
            label="Total Ads"
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
            label={"Ads Placed"}
            currentCount={
              data?.filter((e: Ads) => e.adsLocations?.length > 0).length
            }
            prevCount={
              data?.filter((e: any) => e.adsLocations?.length > 0).length
            }
            totalCount={
              data?.filter((e: any) => e.adsLocations?.length > 0).length
            }
          />
          <StatsCard
            label={"Ads not placed"}
            currentCount={
              data?.filter((e: Ads) => e.adsLocations?.length === 0).length
            }
            prevCount={
              data?.filter((e: Ads) => e.adsLocations?.length === 0).length
            }
            totalCount={
              data?.filter((e: Ads) => e.adsLocations?.length === 0).length
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
                placeholder={"Search Ads"}
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
      <AdsDetailDialog
        ads={promotion}
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        refetch={() => {
          refetch();
        }}
        isEditMode={true}
      />
      {/* <PromotionModal
        title={"Update Promo Code"}
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        promotion={promotion}
        setUpdate={() => {
          refetch();
        }}
      /> */}
    </Card>
  ) : (
    <LoadingScreen />
  );
};

export default AdsTable;
