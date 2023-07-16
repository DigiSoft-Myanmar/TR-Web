import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Product, ProductType, Role } from "@prisma/client";
import ErrorScreen from "@/components/screen/ErrorScreen";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import EmptyScreen from "@/components/screen/EmptyScreen";
import ProductCard from "@/components/card/ProductCard";
import ProductFullTbl from "@/components/muiTable/ProductFullTbl";
import { useQuery } from "react-query";
import LoadingScreen from "@/components/screen/LoadingScreen";
import { isSeller } from "@/util/authHelper";

function Index() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { data: session }: any = useSession();
  const { type } = router.query;
  const { isLoading, error, data, refetch } = useQuery(
    ["productsData", type],
    () =>
      fetch(type ? "/api/products?type=" + type : "/api/products").then(
        (res) => {
          let json = res.json();
          return json;
        }
      )
  );

  return session &&
    (session.role === Role.Admin ||
      isSeller(session) ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>Products | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        {!data ? (
          <LoadingScreen />
        ) : (
          <section
            className={`flex flex-col space-y-5 ${
              isSeller(session) ? "max-w-screen-xl mx-auto p-5" : ""
            }`}
          >
            {data && data.length > 0 ? (
              <ProductFullTbl
                data={data}
                refetch={() => {
                  refetch();
                }}
                isAuction={type === ProductType.Auction}
              />
            ) : (
              <EmptyScreen
                onClickFn={() => router.push("/products/newProduct")}
              />
            )}
          </section>
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

export default Index;
