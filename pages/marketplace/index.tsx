import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import AdsHere from "@/components/Ads/AdsHere";
import { AdsLocation, AdsPage } from "@/util/adsHelper";
import {
  Ads,
  Brand,
  Category,
  Condition,
  Content,
  ProductType,
} from "@prisma/client";
import { useQuery } from "react-query";
import prisma from "@/prisma/prisma";
import FilterSection from "@/components/section/FilterSection";
import { useRouter } from "next/router";
import Link from "next/link";
import { getPageNumbers } from "@/util/textHelper";
import AuctionCard from "@/components/card/AuctionCard";
import ProductCard from "@/components/card/ProductCard";
import { ProductNavType } from "@/types/productTypes";

function Default({
  content,
  categories,
  brands,
  conditions,
  orgCategories,
}: {
  content: Content;
  categories: Category[] & {
    subCategory: (Category & {
      subCategory: Category[];
    })[];
  };
  brands: Brand[];
  conditions: Condition[];
  orgCategories: Category[];
}) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const {
    page,
    brands: pathBrands,
    categories: pathCategories,
    startPrice,
    endPrice,
    type,
    conditions: pathConditions,
    qry,
    sort,
  } = router.query;

  const { data: adsData } = useQuery("adsDataProduct", () =>
    fetch("/api/siteManagement/ads?placement=" + AdsPage.Marketplace).then(
      (res) => {
        let json = res.json();
        return json;
      }
    )
  );

  const { data: productData } = useQuery(
    [
      "productData",
      page,
      pathBrands,
      pathCategories,
      startPrice,
      endPrice,
      pathConditions,
      type,
      qry,
      sort,
    ],
    () => {
      const params: any = {
        page: page ? page : 1,
        qry: qry ? qry : "",
        categories: pathCategories
          ? orgCategories
              .filter((z) =>
                typeof pathCategories === "string"
                  ? pathCategories === z.slug
                  : pathCategories.includes(z.slug)
              )
              .map((z) => z.id)
          : "",
        brands: pathBrands
          ? brands
              .filter((z) =>
                typeof pathBrands === "string"
                  ? pathBrands === z.name
                  : pathBrands.includes(z.name)
              )
              .map((z) => z.id)
          : "",
        conditions: pathConditions
          ? conditions
              .filter((z) =>
                typeof pathConditions === "string"
                  ? pathConditions === z.name
                  : pathConditions.includes(z.name)
              )
              .map((z) => z.id)
          : "",
        type: type ? type : "",
        startPrice:
          startPrice && typeof startPrice === "string"
            ? parseInt(startPrice.toString())
            : "",
        endPrice:
          endPrice && typeof endPrice === "string"
            ? parseInt(endPrice.toString())
            : "",
        sort: sort ? sort : "",
      };
      let d: any = new URLSearchParams(params).toString();

      console.log("/api/marketplace?" + d);

      return fetch("/api/marketplace?" + d).then((res) => {
        let json = res.json();
        return json;
      });
    }
  );

  return (
    <div>
      <Head>
        <title>Marketplace | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="relative max-w-screen-2xl mx-6 px-4 pb-5">
        <AdsHere
          column={1}
          adsLocations={[AdsLocation.Marketplace1]}
          defaultImg={content?.defaultAdsOneCol ? content.defaultAdsOneCol : ""}
          imgList={[
            adsData?.filter((z: Ads) =>
              z.adsLocations.find(
                (b: any) => b.location === AdsLocation.Marketplace1
              )
            ),
          ]}
        />
        <div className="flex flex-row items-stretch gap-5">
          <div className="w-1/5 min-w-[20%] max-w-[20%] lg:flex flex-col gap-3 hidden">
            <FilterSection
              brands={brands}
              categories={categories}
              conditions={conditions}
            />
          </div>
          {productData && productData.data && productData.data.length > 0 ? (
            <div className="flex-grow mx-6 lg:mx-0 px-4 py-8 flex flex-col gap-5">
              <div className="grid grid-cols-auto200 gap-5 w-full place-items-center lg:place-items-start">
                {productData.data.map((z: any, index) =>
                  z.type === ProductType.Auction ? (
                    <AuctionCard product={z} key={index} />
                  ) : (
                    <ProductCard product={z} key={index} />
                  )
                )}
              </div>

              {productData.totalPages > 1 && (
                <ol className="flex justify-center gap-1 text-xs font-medium">
                  {(router.query.page
                    ? parseInt(router.query.page.toString()) !== 1
                    : true) && (
                    <li>
                      <Link
                        href={{
                          pathname: "/marketplace",
                          query: {
                            page: page ? parseInt(page.toString()) - 1 : 1,
                            categories: pathCategories,
                            brands: pathBrands,
                            startPrice: startPrice,
                            endPrice: endPrice,
                            type: type,
                            conditions: pathConditions,
                            qry: qry,
                            sort: sort,
                          },
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180 hover:bg-primary/10 transition"
                      >
                        <span className="sr-only">Prev Page</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </li>
                  )}
                  {getPageNumbers(
                    page ? parseInt(page.toString()) : 1,
                    productData.totalPages
                  ).map((e, index) => (
                    <li key={index}>
                      <Link
                        href={{
                          pathname: "/marketplace",
                          query: {
                            page: e,
                            categories: pathCategories,
                            brands: pathBrands,
                            startPrice: startPrice,
                            endPrice: endPrice,
                            type: type,
                            conditions: pathConditions,
                            qry: qry,
                            sort: sort,
                          },
                        }}
                        className={`block h-8 w-8 rounded border border-gray-100 ${
                          (page ? e === parseInt(page.toString()) : e === 1)
                            ? "bg-primary text-white"
                            : "bg-white text-gray-900 hover:bg-primary/10"
                        } text-center leading-8 transition`}
                      >
                        {e}
                      </Link>
                    </li>
                  ))}
                  {(page
                    ? parseInt(page.toString()) !== productData.totalPages
                    : true) && (
                    <li>
                      <Link
                        href={{
                          pathname: "/marketplace",
                          query: {
                            page: page
                              ? parseInt(page.toString()) >=
                                productData.totalPages
                                ? parseInt(page.toString()) + 1
                                : parseInt(productData.totalPages)
                              : 0,
                            categories: pathCategories,
                            brands: pathBrands,
                            startPrice: startPrice,
                            endPrice: endPrice,
                            type: type,
                            conditions: pathConditions,
                            qry: qry,
                            sort: sort,
                          },
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180 hover:bg-primary/10 transition"
                      >
                        <span className="sr-only">Next Page</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </li>
                  )}
                </ol>
              )}
            </div>
          ) : (
            <div className="grid px-4 place-content-center flex-grow h-[50vh]">
              <h1 className="tracking-normal text-gray-500 uppercase text-3xl font-extralight">
                Sorry !
              </h1>
              <h1 className="tracking-widest text-gray-500 uppercase mt-1">
                There are no products available right now.
              </h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale }: any) {
  let content = await prisma.content.findFirst({});
  let orgCategories = await prisma.category.findMany({});
  let categories = await prisma.category.findMany({
    include: {
      subCategory: {
        include: {
          subCategory: true,
        },
      },
    },
    where: {
      parentId: {
        isSet: false,
      },
    },
  });
  let brands = await prisma.brand.findMany({});
  let conditions = await prisma.condition.findMany({});

  return {
    props: {
      orgCategories: JSON.parse(JSON.stringify(orgCategories)),
      content: JSON.parse(JSON.stringify(content)),
      categories: JSON.parse(JSON.stringify(categories)),
      brands: JSON.parse(JSON.stringify(brands)),
      conditions: JSON.parse(JSON.stringify(conditions)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Default;
