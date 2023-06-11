import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import { useSession } from "next-auth/react";
import { Role, State } from "@prisma/client";
import ErrorScreen from "@/components/screen/ErrorScreen";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import StateCard from "@/components/card/StateCard";
import { useQuery } from "react-query";
import LoadingScreen from "@/components/screen/LoadingScreen";

function LegalPage() {
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  const { isLoading, error, data, refetch } = useQuery("townshipsData", () =>
    fetch("/api/townships?isAll=true").then((res) => {
      let json = res.json();
      return json;
    })
  );

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>Townships | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto max-w-screen-xl px-4 py-8">
        {data ? (
          <div className="grid grid-cols-4 gap-3 place-items-stretch">
            {data?.map((e: any, index: number) => (
              <StateCard
                key={index}
                parentState={e.id}
                name={e.name}
                nameMM={e.nameMM}
                districts={e.districts}
                color={e.color}
                prodCount={e.prodCount}
                sellerCount={e.sellerCount}
                buyerCount={e.buyerCount}
                updateFn={() => {
                  refetch();
                }}
              />
            ))}
          </div>
        ) : (
          !data && <LoadingScreen />
        )}
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

export default LegalPage;
