import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import OrderFullTbl from "@/components/muiTable/OrderFullTbl";
import EmptyScreen from "@/components/screen/EmptyScreen";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { Role } from "@prisma/client";
import { isInternal } from "@/util/authHelper";

function OrderPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { data: session }: any = useSession();
  const { data } = useSWR("/api/orders?isBuyer=true", fetcher);

  return session ? (
    <div>
      <Head>
        <title>Purchased History | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={`flex flex-col space-y-5 ${
          isInternal(session) ? "" : "max-w-screen-xl mx-auto p-5"
        }`}
      >
        {data && <OrderFullTbl data={data} isBuyer={true} />}
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

export default OrderPage;
