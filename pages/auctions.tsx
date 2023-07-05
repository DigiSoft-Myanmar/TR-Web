import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import { isInternal } from "@/util/authHelper";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import ErrorScreen from "@/components/screen/ErrorScreen";
import AuctionTbl from "@/components/muiTable/AuctionTbl";

function Default() {
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  const router = useRouter();
  const { isLoading, error, data, refetch } = useQuery("auctionData", () =>
    fetch("/api/auction/list").then((res) => {
      let json = res.json();
      return json;
    })
  );

  return session ? (
    <div>
      <Head>
        <title>Auctions | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={`relative mx-auto ${!isInternal(session) ? "lg:p-10" : ""}`}
      >
        {data && <AuctionTbl data={data} />}
      </div>
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
