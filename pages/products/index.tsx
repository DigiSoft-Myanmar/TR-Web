import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Product, Role } from "@prisma/client";
import ErrorScreen from "@/components/screen/ErrorScreen";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import EmptyScreen from "@/components/screen/EmptyScreen";
import ProductCard from "@/components/card/ProductCard";
import ProductFullTbl from "@/components/muiTable/ProductFullTbl";
import { useQuery } from "react-query";
import LoadingScreen from "@/components/screen/LoadingScreen";

function Index() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { data: session }: any = useSession();
  const { isLoading, error, data, refetch } = useQuery("productsData", () =>
    fetch("/api/products").then((res) => {
      let json = res.json();
      return json;
    }),
  );

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Seller ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>Products | Pyi Twin Phyit</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        {!data ? (
          <LoadingScreen />
        ) : (
          <section className="flex flex-col space-y-5">
            {data && data.length > 0 ? (
              <ProductFullTbl
                data={data}
                refetch={() => {
                  refetch();
                }}
              />
            ) : (
              <EmptyScreen
                onClickFn={() => router.push("/products/newProduct")}
              />
            )}
          </section>
        )}
        <button
          className="fixed right-3 bottom-3 rounded-full bg-primary p-3 text-white"
          onClick={() => router.push("/products/newProduct")}
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
