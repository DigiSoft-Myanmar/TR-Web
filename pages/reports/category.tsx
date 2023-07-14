import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import MyanmarMap from "@/components/presentational/MyanmarMap";

function Default() {
  const { t } = useTranslation("common");
  return (
    <div>
      <Head>
        <title>Category Reports | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative max-w-screen-2xl mx-6 px-4 py-8">
        <section className="flex flex-col space-y-5">
          <div className="flex">Category Report</div>
          <div className="flex">Date, Seller, Category</div>
          <div>
            Total Amount, Total Orders, Total Unit Sold, Total Unique Buyers,
            Total Auctions
          </div>
          <div className="flex flex-col gap-3">
            <div>Order Count - month / count</div>
            <div>Units Sold - month / count</div>
            <div>Profits - month / amount</div>
          </div>
          <div>Order Table</div>
        </section>
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

export default Default;
