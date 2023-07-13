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
import { isSeller } from "@/util/authHelper";
import prisma from "@/prisma/prisma";

function NewProduct({ attributes }: { attributes: any }) {
  const { data: session }: any = useSession();

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Seller ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>New Product | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ProductProvider
        attributes={attributes}
        productDetail={
          isSeller(session)
            ? {
                type: ProductType.Fixed,
                seller: session,
                sellerId: session.id,
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
  const attributes = await prisma.attribute.findMany({
    include: {
      Term: true,
    },
  });

  return {
    props: {
      attributes: JSON.parse(JSON.stringify(attributes)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default NewProduct;
