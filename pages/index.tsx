import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import React from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Image from "next/image";
import prisma from "@/prisma/prisma";
import { Ads, Category, Role, User } from "@prisma/client";
import Head from "next/head";
import { defaultDescription } from "@/types/const";
import { useSession } from "next-auth/react";
import { formatAmount } from "@/util/textHelper";
import { isInternal } from "@/util/authHelper";
import { AdsLocation } from "@/util/adsHelper";
import OneColAds from "@/components/Ads/OneColAds";
import AdsHere from "@/components/Ads/AdsHere";
import PricingDetail from "@/components/presentational/PricingDetail";
import FourColAds from "@/components/Ads/FourColAds";
import TwoColsAds from "@/components/Ads/TwoColAds";
import AuctionHome from "@/components/section/Home/AuctionHome";
import MyanmarMap from "@/components/presentational/MyanmarMapDistrict";

export function IndexPage({
  sellerList,
  categories,
  totalReview,
}: {
  sellerList: User[];
  categories: (Category & {
    subCategory: Category[];
  })[];
  totalReview: number;
}) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { data: session }: any = useSession();
  const adsData = [];
  const totalAuction = 0;
  const totalBuyNow = 0;
  const auctionFeaturedCount = 0;
  const buyNowFeaturedCount = 0;
  const totalPromotion = 0;
  let membershipSettings: any = {};

  if (isInternal(session)) {
    return (
      <div className="flex min-h-screen flex-col pb-10">
        <Head>
          <title>Dashboard | Treasure Rush</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="description" content={defaultDescription} />
        </Head>
        <MyanmarMap />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col pb-10">
      <Head>
        <title>Home | Treasure Rush</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content={defaultDescription} />
      </Head>

      <main className="flex w-full flex-1 flex-col">
        <section className="px-10 md:px-20 py-10 bg-primary">
          <div className="max-w-screen-xl px-4 mx-auto sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="relative h-full overflow-hidden rounded-lg lg:h-full lg:order-last items-center justify-center flex flex-col md:pb-14">
                <img src="/assets/images/TopBanner.png" />
                <div className="md:absolute md:bottom-0 px-10 py-5 bg-white shadow-md flex flex-col rounded-md space-y-3 mt-5 z-20">
                  <div className="flex -space-x-4">
                    {sellerList.slice(0, 4).map((e: any, index: number) => (
                      <img
                        key={index}
                        className="w-10 h-10 rounded-full border-2 border-white"
                        src={"/api/files/" + encodeURIComponent(e.profile)}
                        alt=""
                      />
                    ))}
                    {sellerList.length > 4 && (
                      <span className="flex justify-center items-center w-10 h-10 text-xs font-medium text-white bg-gray-700 rounded-full border-2 border-white">
                        + {sellerList.length - 4}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-center">
                    {formatAmount(
                      sellerList?.length,
                      router.locale,
                      false,
                      true
                    )}{" "}
                    {t("sellers")}{" "}
                  </h3>
                  {totalReview > 0 && (
                    <div className="flex flex-wrap items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-7 w-7 text-primary"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <h3>
                        {formatAmount(
                          parseFloat(
                            (totalReview / sellerList.length).toFixed(2)
                          ),
                          router.locale
                        )}{" "}
                        ({formatAmount(totalReview, router.locale)}{" "}
                        {t("reviews")})
                      </h3>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:py-16">
                <img src="/assets/logo_white_full.png" className="w-2/3" />
                <h2 className="text-3xl font-bold sm:text-4xl leading-loose sm:leading-loose"></h2>

                <p className="mt-4 text-white">{t("heroDescription1")}</p>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {session &&
                  (session.role === Role.Seller ||
                    session.role === Role.Trader) ? (
                    <Link
                      href="/products"
                      className="inline-flex items-center px-8 py-5 mt-8 text-primary bg-white border border-white rounded hover:bg-transparent hover:text-white active:text-white focus:outline-none focus:ring"
                    >
                      <span className="font-medium">{t("sellNow")}</span>

                      <svg
                        className="w-5 h-5 ml-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                  ) : session && session.role === Role.Buyer ? (
                    <Link
                      href="/marketplace"
                      className="inline-flex items-center px-8 py-5 mt-8 text-primary bg-white border border-white rounded hover:bg-transparent hover:text-white active:text-white focus:outline-none focus:ring"
                    >
                      <span className="font-medium line-clamp-1">
                        {t("buyNow")}
                      </span>

                      <svg
                        className="w-5 h-5 ml-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                  ) : (
                    <Link
                      href="/register"
                      className="inline-flex items-center px-8 py-5 mt-8 text-primary bg-white border border-white rounded hover:bg-transparent hover:text-white active:text-white focus:outline-none focus:ring"
                    >
                      <span className="font-medium">{t("joinNow")}</span>

                      <svg
                        className="w-5 h-5 ml-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        {adsData &&
        adsData.filter((e: any) =>
          e.adsLocations.find((z: any) => z.location === AdsLocation.HomeAds1)
        ).length > 0 ? (
          <OneColAds
            adsList={adsData.filter((e: any) =>
              e.adsLocations.find(
                (z: any) => z.location === AdsLocation.HomeAds1
              )
            )}
            adsLocations={[AdsLocation.HomeAds1]}
          />
        ) : (
          <AdsHere />
        )}

        {totalAuction > 0 && (
          <>
            <section className="px-10 md:px-20">
              <div className="max-w-screen-xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:gap-16 lg:grid-cols-2">
                  <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:h-full lg:order-last">
                    <img src="/assets/images/Bid.png" />
                  </div>

                  <div className="lg:py-24">
                    <h2 className="text-3xl font-bold sm:text-4xl leading-loose sm:leading-loose">
                      {t("heroHeader21")}{" "}
                      <span className="text-primary">{t("heroHeader22")}</span>{" "}
                      {t("heroHeader23")}
                    </h2>

                    <p className="mt-4 text-gray-600 leading-8">
                      {/* {t("heroDescription21") &&
                        t("heroDescription21").replace(
                          "{data}",
                          totalAuction > 100
                            ? numberWithCommas(totalAuction, router.locale) +
                                "+"
                            : numberWithCommas(totalAuction, router.locale)
                        )}{" "}
                      {t("heroDescription22")} */}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            {/* //TODO Auction Home 
            {auctionFeaturedCount > 0 && <AuctionHome />} */}
          </>
        )}
        {adsData &&
        adsData.filter((e: any) =>
          e.adsLocations.find(
            (z: any) =>
              z.location === AdsLocation.HomeAds21 ||
              z.location === AdsLocation.HomeAds22
          )
        ).length > 0 ? (
          <TwoColsAds
            adsList1={adsData.filter((e: any) =>
              e.adsLocations.find(
                (z: any) => z.location === AdsLocation.HomeAds21
              )
            )}
            adsList2={adsData.filter((e: any) =>
              e.adsLocations.find(
                (z: any) => z.location === AdsLocation.HomeAds22
              )
            )}
            adsLocations={[AdsLocation.HomeAds21, AdsLocation.HomeAds22]}
          />
        ) : (
          <AdsHere />
        )}
        {totalBuyNow > 0 && (
          <>
            <section className="px-10 md:px-20">
              <div className="max-w-screen-xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:gap-16 lg:grid-cols-2">
                  <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:h-full lg:order-last">
                    <img src="/assets/images/Feature.png" />
                  </div>

                  <div className="lg:py-24">
                    <h2 className="text-3xl font-bold sm:text-4xl leading-loose sm:leading-loose">
                      {t("heroHeader31")}{" "}
                      <span className="text-primary">{t("heroHeader32")}</span>{" "}
                    </h2>

                    <p className="mt-4 text-gray-600 leading-8">
                      {/*  {t("heroDescription31") &&
                        t("heroDescription31").replace(
                          "{data}",
                          totalBuyNow > 100
                            ? numberWithCommas(totalBuyNow, router.locale) + "+"
                            : numberWithCommas(totalBuyNow, router.locale)
                        )}{" "}
                      {t("heroDescription32")} */}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            {/* //TODO Buy Now
             {buyNowFeaturedCount > 0 && <BuyNowHome />} */}
          </>
        )}
        {adsData &&
        adsData.filter((e: any) =>
          e.adsLocations.find(
            (z: any) =>
              z.location === AdsLocation.HomeAds31 ||
              z.location === AdsLocation.HomeAds32 ||
              z.location === AdsLocation.HomeAds33 ||
              z.location === AdsLocation.HomeAds34
          )
        ).length > 0 ? (
          <FourColAds
            adsList1={adsData.filter((e: any) =>
              e.adsLocations.find(
                (z: any) => z.location === AdsLocation.HomeAds31
              )
            )}
            adsList2={adsData.filter((e: any) =>
              e.adsLocations.find(
                (z: any) => z.location === AdsLocation.HomeAds32
              )
            )}
            adsList3={adsData.filter((e: any) =>
              e.adsLocations.find(
                (z: any) => z.location === AdsLocation.HomeAds33
              )
            )}
            adsList4={adsData.filter((e: any) =>
              e.adsLocations.find(
                (z: any) => z.location === AdsLocation.HomeAds34
              )
            )}
            adsLocations={[
              AdsLocation.HomeAds31,
              AdsLocation.HomeAds32,
              AdsLocation.HomeAds33,
              AdsLocation.HomeAds34,
            ]}
          />
        ) : (
          <AdsHere />
        )}
        {totalPromotion > 0 && (
          <>
            <section className="px-10 md:px-20">
              <div className="max-w-screen-xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:gap-16 lg:grid-cols-2">
                  <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:h-full lg:order-last">
                    <img src="/assets/images/Sale.png" />
                  </div>

                  <div className="lg:py-24">
                    <h2 className="text-3xl font-bold sm:text-4xl leading-loose sm:leading-loose">
                      {t("heroHeaderPromo")}
                      <br />
                      <span className="text-primary">
                        {t("heroHeaderPromo2")}
                      </span>{" "}
                    </h2>

                    <p className="mt-4 text-gray-600 leading-8">
                      {t("heroDescriptionPromo")}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            {/* //TODO Promo
            <PromotionHome promotionList={data.promotionList} /> */}
          </>
        )}
        {adsData &&
        adsData.filter((e: any) =>
          e.adsLocations.find(
            (z: any) =>
              z.location === AdsLocation.HomeAds41 ||
              z.location === AdsLocation.HomeAds42 ||
              z.location === AdsLocation.HomeAds43 ||
              z.location === AdsLocation.HomeAds44
          )
        ).length > 0 ? (
          <FourColAds
            adsList1={adsData.filter((e: any) =>
              e.adsLocations.find(
                (z: any) => z.location === AdsLocation.HomeAds41
              )
            )}
            adsList2={adsData.filter((e: any) =>
              e.adsLocations.find(
                (z: any) => z.location === AdsLocation.HomeAds42
              )
            )}
            adsList3={adsData.filter((e: any) =>
              e.adsLocations.find(
                (z: any) => z.location === AdsLocation.HomeAds43
              )
            )}
            adsList4={adsData.filter((e: any) =>
              e.adsLocations.find(
                (z: any) => z.location === AdsLocation.HomeAds44
              )
            )}
            adsLocations={[
              AdsLocation.HomeAds41,
              AdsLocation.HomeAds42,
              AdsLocation.HomeAds43,
              AdsLocation.HomeAds44,
            ]}
          />
        ) : (
          <AdsHere />
        )}

        {!session && (
          <section className="px-10 md:px-20">
            <div className="max-w-screen-xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
              <div className="max-w-lg mx-auto text-center">
                <h2 className="text-3xl font-bold sm:text-4xl">
                  {t("heroHeader41")}
                </h2>

                <p className="mt-4 text-gray-600 leading-8">
                  {t("heroDescription41")}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 mt-8 md:grid-cols-2 lg:grid-cols-3">
                <Link
                  href="/memberships"
                  className="block p-8 transition border border-gray-500 hover:border-primary hover:shadow-xl rounded-xl hover:shadow-primary/20 bg-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>

                  <h3 className="mt-4 text-xl font-bold">{t("ads")}</h3>

                  <div className="mt-1 text-sm text-gray-600">
                    <PricingDetail
                      detail={membershipSettings?.adsDetail}
                      detailMM={membershipSettings?.adsDetailMM}
                    />
                  </div>
                </Link>

                <Link
                  href="/memberships"
                  className="block p-8 transition border border-gray-500 hover:border-primary hover:shadow-xl rounded-xl hover:shadow-primary/20 bg-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>

                  <h3 className="mt-4 text-xl font-bold">{t("saleReport")}</h3>

                  <div className="mt-1 text-sm text-gray-600">
                    <PricingDetail
                      detail={membershipSettings?.saleReportDetail}
                      detailMM={membershipSettings?.saleReportDetailMM}
                    />
                  </div>
                </Link>
                <Link
                  href="/memberships"
                  className="block p-8 transition border border-gray-500 hover:border-primary hover:shadow-xl rounded-xl hover:shadow-primary/20 bg-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>

                  <h3 className="mt-4 text-xl font-bold">{t("search")}</h3>

                  <div className="mt-1 text-sm text-gray-600">
                    <PricingDetail
                      detail={membershipSettings?.topSearchDetails}
                      detailMM={membershipSettings?.topSearchDetailsMM}
                    />
                  </div>
                </Link>

                <Link
                  href="/memberships"
                  className="block p-8 transition border border-gray-500 hover:border-primary hover:shadow-xl rounded-xl hover:shadow-primary/20 bg-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>

                  <h3 className="mt-4 text-xl font-bold">{t("onBoarding")}</h3>

                  <div className="mt-1 text-sm text-gray-600">
                    <PricingDetail
                      detail={membershipSettings?.onBoardingDetail}
                      detailMM={membershipSettings?.onBoardingDetailMM}
                    />
                  </div>
                </Link>

                <Link
                  href="/memberships"
                  className="block p-8 transition border border-gray-500 hover:border-primary hover:shadow-xl rounded-xl hover:shadow-primary/20 bg-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <h3 className="mt-4 text-xl font-bold">
                    {t("customerService")}
                  </h3>

                  <div className="mt-1 text-sm text-gray-600">
                    <PricingDetail
                      detail={membershipSettings?.customerServiceDetail}
                      detailMM={membershipSettings?.customerServiceDetailMM}
                    />
                  </div>
                </Link>
                <Link
                  href="/memberships"
                  className="block p-8 transition border border-gray-500 hover:border-primary hover:shadow-xl rounded-xl hover:shadow-primary/20 bg-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                    />
                  </svg>

                  <h3 className="mt-4 text-xl font-bold">Other Features</h3>

                  <p className="mt-1 text-sm text-gray-600">
                    {router && router.locale === "mm"
                      ? "တွဲဖက်ဒက်ရှ်ဘုတ်များသည် သင့်စတိုးကို စီမံခန့်ခွဲရန် လွယ်ကူစေသည်။ ၎င်းတွင် ထုတ်ကုန်ထုတ်ဝေခြင်းနှင့် အမှာစာလုပ်ဆောင်ခြင်း၊ ငွေပေးချေမှုစီမံခန့်ခွဲခြင်းနှင့် အစီရင်ခံခြင်းတို့ ပါဝင်သည်။"
                      : "The affiliates dashboard makes it easy to manage your store. This includes product publishing and order processing, payment management and reporting."}
                  </p>
                </Link>
              </div>

              <div className="mt-12 text-center">
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-5 mt-8 text-white bg-primary border border-primary rounded hover:bg-transparent hover:text-primary active:text-primary focus:outline-none focus:ring"
                >
                  <span className="font-medium">{t("joinNow")}</span>

                  <svg
                    className="w-5 h-5 ml-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  const sellerList = await prisma.user.findMany({
    where: {
      sellAllow: true,
      isBlocked: false,
      isDeleted: false,
      role: {
        in: [Role.Seller, Role.Trader],
      },
    },
    include: {
      Review: true,
    },
  });
  const content = await prisma.content.findFirst({});
  const categories = await prisma.category.findMany({
    include: {
      subCategory: true,
    },
  });
  const totalReview = sellerList
    .map((z) => z.Review.map((b) => b.rating).reduce((a, b) => a + b, 0))
    .reduce((a, b) => a + b, 0);

  return {
    props: {
      categories: JSON.parse(JSON.stringify(categories)),
      sellerList: JSON.parse(JSON.stringify(sellerList)),
      content: JSON.parse(JSON.stringify(content)),
      totalReview: totalReview,
      ...(await serverSideTranslations(locale, ["common"])),
      // Will be passed to the page component as props
    },
  };
}

export default IndexPage;
