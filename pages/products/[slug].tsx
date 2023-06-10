import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { defaultDescription } from "@/types/const";
import { ProductProvider } from "@/context/ProductContext";
import ProductScreen from "@/components/screen/ProductScreen";
import { useSession } from "next-auth/react";
import { ProductType, Role } from "@prisma/client";
import prisma from "@/prisma/prisma";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { useRouter } from "next/router";
import ConfirmationSection from "@/components/section/product/ConfirmationSection";

function ProductDetails(param: any) {
  const { data: session }: any = useSession();
  const { action } = useRouter().query;

  return session ? (
    <div>
      <Head>
        <title>New Product | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {(session &&
        param &&
        param.product &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin)) ||
      (session.role === Role.Seller &&
        param &&
        param.product &&
        param.product.brandId === session.brand.id) ? (
        <>
          {action === "view" ? (
            <div className="bg-white">
              <ProductProvider productDetail={param.product}>
                <ConfirmationSection
                  isDisable={true}
                  backFn={() => {}}
                  currentStep={1}
                />
              </ProductProvider>
            </div>
          ) : (
            <ProductProvider productDetail={param.product}>
              <ProductScreen />
            </ProductProvider>
          )}
        </>
      ) : (
        <ErrorScreen statusCode={401} />
      )}
    </div>
  ) : (
    <ErrorScreen statusCode={401} />
  );
}

export async function getServerSideProps({ locale, params }: any) {
  let product: any = await prisma.product.findFirst({
    where: { slug: params.slug },
    include: {
      Brand: true,
      categories: true,
    },
  });
  if (product?.Brand.createdAt) {
    delete product.Brand.createdAt;
  }
  if (product?.Brand.updatedAt) {
    delete product.Brand.updatedAt;
  }
  if (product?.categories) {
    for (let i = 0; i < product.categories.length; i++) {
      if (product.categories[i].createdAt) {
        delete product.categories[i].createdAt;
      }
      if (product.categories[i].updatedAt) {
        delete product.categories[i].updatedAt;
      }
    }
  }
  if (product?.createdAt) {
    delete product.createdAt;
  }
  if (product?.updatedAt) {
    delete product.updatedAt;
  }
  if (product?.saleStartDate) {
    product.saleStartDate = new Date(product.saleStartDate).toLocaleDateString(
      "en-ca"
    );
  }
  if (product?.saleEndDate) {
    product.saleEndDate = new Date(product.saleEndDate).toLocaleDateString(
      "en-ca"
    );
  }
  if (product.variations) {
    for (let i = 0; i < product.variations.length; i++) {
      if (product.variations[i].saleStartDate) {
        product.variations[i].saleStartDate = new Date(
          product.variations[i].saleStartDate
        ).toLocaleDateString("en-ca");
      }
      if (product.variations[i].saleEndDate) {
        product.variations[i].saleEndDate = new Date(
          product.variations[i].saleEndDate
        ).toLocaleDateString("en-ca");
      }
    }
  }
  if (product.state) {
    for (let i = 0; i < product.state.length; i++) {
      if (product.state[i].createdAt) {
        delete product.state[i].createdAt;
      }
      if (product.state[i].updatedAt) {
        delete product.state[i].updatedAt;
      }
    }
  }
  return {
    props: {
      product,
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default ProductDetails;
