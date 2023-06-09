import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { defaultDescription } from "@/types/const";
import { ProductProvider } from "@/context/ProductContext";
import ProductScreen from "@/components/screen/ProductScreen";
import { useSession } from "next-auth/react";
import { ProductType, Role } from "@prisma/client";
import ErrorScreen from "@/components/screen/ErrorScreen";

function NewProduct() {
  const { data: session }: any = useSession();

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Seller ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>New Product | Pyi Twin Phyit</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ProductProvider
        productDetail={
          session && session.role === Role.Seller
            ? {
                type: ProductType.Fixed,
                brand: session.brand,
                brandId: session.brand.id,
              }
            : {
                type: ProductType.Fixed,
              }
        }
      >
        <ProductScreen />
      </ProductProvider>
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

export default NewProduct;
