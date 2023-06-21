import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";

function Default() {
  const { t } = useTranslation("common");
  return (
    <div>
      <Head>
        <title>Shop | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative max-w-screen-2xl">
        <div className="flex flex-col bg-white px-10 pt-8 gap-5 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-red-500 p-3">Seller Profile</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:col-span-2 p-3">
              <h3>Products</h3>
              <h3>Auctions Products </h3>
              <h3>Buyer Ratings + Buyer Count</h3>
              <h3>Seller Ratings + Seller</h3>
              <h3>Units Sold</h3>
              <h3>Joined Date</h3>
            </div>
          </div>
          <nav
            aria-label="Tabs"
            className="flex border-b-2 border-gray-100 text-sm font-medium"
          >
            <a
              href=""
              className="-mb-px border-b-2 border-current p-4 text-primary"
            >
              Home
            </a>

            <a
              href=""
              className="-mb-px border-b-2 border-transparent p-4 hover:text-primary"
            >
              Products
            </a>

            <a
              href=""
              className="-mb-px border-b-2 border-transparent p-4 hover:text-primary"
            >
              Ads
            </a>

            <a
              href=""
              className="-mb-px border-b-2 border-transparent p-4 hover:text-primary"
            >
              Buyer Ratings
            </a>

            <a
              href=""
              className="-mb-px border-b-2 border-transparent p-4 hover:text-primary"
            >
              Seller Ratings
            </a>

            <a
              href=""
              className="-mb-px border-b-2 border-transparent p-4 hover:text-primary"
            >
              Usage
            </a>
            <a
              href=""
              className="-mb-px border-b-2 border-transparent p-4 hover:text-primary"
            >
              Details
            </a>
          </nav>
        </div>
        <div className="mx-6 px-4 py-5 flex flex-col gap-5">
          <div className="bg-white p-3 rounded-md border">Promo Code</div>

          <div className="bg-white p-3 rounded-md border">Products</div>
        </div>
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
