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
        <title>Click Reports | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative max-w-screen-2xl mx-6 px-4 py-8">
        <section className="flex flex-col space-y-5">
          <div className="flex">Click Report</div>
          <div className="flex">Date</div>
          <div>
            Total Site visits, total products visits, total auction visits,
            total products click, total ads click
          </div>
          <div className="flex flex-col gap-3">
            <div>Ads Click - month / count</div>
            <div>Products Click - month / count</div>
          </div>
          <div>Ads Table</div>
          <div>ads / location / year / month / count</div>
          <div>Products Table</div>
          <div>img / name / seller / year / month / count</div>
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
