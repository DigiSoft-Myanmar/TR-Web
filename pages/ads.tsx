import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription, fileUrl } from "@/types/const";
import CategoryModal from "@/components/modal/sideModal/CategoryModal";
import Image from "next/image";
import CategoryCard from "@/components/card/CategoryCard";
import { useSession } from "next-auth/react";
import { Ads, Category, Role } from "@prisma/client";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { useQuery } from "react-query";
import EmptyScreen from "@/components/screen/EmptyScreen";
import LoadingScreen from "@/components/screen/LoadingScreen";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import { useRouter } from "next/router";
import AdsModal from "@/components/modal/sideModal/AdsModal";
import AdsTable from "@/components/muiTable/AdsTable";
import AdsPlacementScreen from "@/components/screen/AdsPlacementScreen";

function AdsPage() {
  const { isLoading, error, data, refetch } = useQuery("adsData", () =>
    fetch("/api/siteManagement/ads").then((res) => {
      let json = res.json();
      return json;
    })
  );
  const [isModalOpen, setModalOpen] = React.useState(false);
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  const [title, setTitle] = React.useState("Create Ads");
  const [ads, setAds] = React.useState<any>();
  const { locale } = useRouter();
  const [isPlacement, setPlacement] = React.useState(false);

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>Ads | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto">
        {data && data.length > 0 ? (
          <>
            {isPlacement === true ? (
              <AdsPlacementScreen
                data={data}
                onBackPress={() => {
                  setPlacement(false);
                  refetch();
                }}
              />
            ) : (
              <section className="flex flex-col space-y-5">
                <AdsTable
                  data={data}
                  refetch={() => {
                    refetch();
                  }}
                />
              </section>
            )}
          </>
        ) : !data ? (
          <LoadingScreen />
        ) : (
          <EmptyScreen
            onClickFn={() => {
              setAds(undefined);
              setModalOpen(true);
              setTitle("Create Ads");
            }}
          />
        )}
        {data && data.length > 0 && (
          <button
            className="fixed right-3 bottom-16 rounded-full bg-primary p-3 text-white"
            onClick={() => {
              if (isPlacement === true) {
                refetch();
              }
              setPlacement((prevValue) => !prevValue);
            }}
          >
            {isPlacement === true ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
            )}
          </button>
        )}

        <button
          className="fixed right-3 bottom-3 rounded-full bg-primary p-3 text-white"
          onClick={() => {
            setAds(undefined);
            setModalOpen(true);
            setTitle("Create Ads");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        </button>
      </div>

      <AdsModal
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        refetch={() => {
          refetch();
        }}
        title={title}
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

export default AdsPage;
