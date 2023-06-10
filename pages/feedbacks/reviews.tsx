import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import prisma from "@/prisma/prisma";
import ReviewTbl from "@/components/muiTable/ReviewTbl";
import { useQuery } from "react-query";

function ReviewPage() {
  const { t } = useTranslation("common");
  const { isLoading, error, data, refetch } = useQuery("reviewData", () =>
    fetch("/api/products/reviews").then((res) => {
      let json = res.json();
      return json;
    })
  );
  return (
    <div>
      <Head>
        <title>Reviews | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto">
        {data && (
          <ReviewTbl
            data={data}
            refetch={() => {
              refetch();
            }}
          />
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default ReviewPage;
