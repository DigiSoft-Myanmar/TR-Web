import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React, { useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Menu from "@mui/material/Menu";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, TextField, Typography } from "@mui/material";
import { useQuery } from "react-query";
import CustomIcon from "@/components/presentational/CustomIcon";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { getHeaders, hasPermission, isInternal } from "@/util/authHelper";
import TextModal from "@/components/modal/sideModal/TextModal";
import { BrandPermission } from "@/types/permissionTypes";

interface CellType {
  row: any;
}

function Default() {
  const { data: session }: any = useSession();
  const { locale } = useRouter();
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [brand, setBrand] = React.useState<any>(undefined);
  const [value, setValue] = useState<string>("");
  const { t }: any = useTranslation("common");
  const { data: parentData, refetch } = useQuery("brandData", () =>
    fetch("/api/products/brands").then((res) => {
      let json = res.json();
      return json;
    })
  );
  const [data, setData] = React.useState<any>([]);

  React.useEffect(() => {
    if (parentData) {
      if (value) {
        setData(
          parentData.filter(
            (e: any) =>
              e.name.toLowerCase().includes(value.toLowerCase()) ||
              e.nameMM?.toLowerCase().includes(value.toLowerCase())
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
      field: "name",
      minWidth: 90,
      headerName: "Name (EN)",
      renderCell: ({ row }: CellType) => (
        <Typography>{`${row.name}`}</Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 80,
      field: "nameMM",
      headerName: "Name (MM)",
      renderCell: ({ row }: any) => (
        <Typography>{`${row.nameMM ? row.nameMM : "-"}`}</Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 80,
      field: "prodCount",
      headerName: "# of Products",
      renderCell: ({ row }: any) => (
        <Typography>{`${row.prodCount}`}</Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: "id",
      headerName: "Action",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => {
                setBrand({
                  id: row.id,
                  name: row.name,
                  nameMM: row.nameMM,
                });
                setModalOpen(true);
              }}
            >
              <CustomIcon icon="mdi:edit" fontSize={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                showConfirmationDialog(
                  t("deleteConfirmation"),
                  "",
                  locale,
                  () => {
                    fetch(
                      `/api/products/brands?id=${encodeURIComponent(row.id)}`,
                      {
                        method: "DELETE",
                        headers: getHeaders(session),
                      }
                    ).then(async (data) => {
                      if (data.status === 200) {
                        refetch();
                        showSuccessDialog(
                          t("delete") + " " + t("success"),
                          "",
                          locale
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
              <CustomIcon icon="mdi:delete" fontSize={20} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return isInternal(session) &&
    hasPermission(session, BrandPermission.brandViewAllow) ? (
    <div>
      <Head>
        <title>Brands | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative px-4 py-8 bg-white rounded-md shadow-md">
        <h3 className="mb-5 text-lg font-semibold">Brands</h3>
        <div className="flex flex-row items-center justify-between mb-5 gap-3">
          <div></div>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <TextField
              size="small"
              type="search"
              placeholder="Search..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button
              type="button"
              className="px-3 py-3 bg-primary hover:bg-primary-focus transition rounded-md text-sm text-white flex items-center gap-2"
              onClick={() => {
                setBrand(undefined);
                setModalOpen(true);
              }}
            >
              <span>Create</span>
            </button>
          </Box>
        </div>
        {data && (
          <DataGrid
            autoHeight
            columns={columns}
            rows={data}
            disableRowSelectionOnClick
            sx={{ "& .MuiDataGrid-columnHeaders": { borderRadius: 0 } }}
          />
        )}
      </div>
      <TextModal
        isColor={false}
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        data={brand}
        apiPath="/api/products/brands"
        type="Brands"
        updateFn={() => {
          refetch();
        }}
      />
    </div>
  ) : (
    <ErrorScreen statusCode={401} />
  );
}

export async function getServerSideProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Default;
