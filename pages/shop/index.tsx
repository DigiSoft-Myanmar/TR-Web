import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React, { useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import prisma from "@/prisma/prisma";
import { Role } from "@prisma/client";
import { formatAmount } from "@/util/textHelper";
import { useRouter } from "next/router";
import Image from "next/image";
import ProductImg from "@/components/card/ProductImg";
import { useSession } from "next-auth/react";
import { isInternal } from "@/util/authHelper";

enum ShopTab {
  Home,
  Address,
  Ads,
  BuyerRating,
  SellerRating,
  Usage,
  Details,
}

function Default() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const { data: session }: any = useSession();
  const [currentTab, setCurrentTab] = React.useState<ShopTab>(ShopTab.Home);
  let seller: any = {
    role: Role.Trader,
  };

  useEffect(() => {
    const hash = router.asPath.split("#")[1];
    if (session) {
      switch (true) {
        case hash.includes("address") &&
          (session.id === seller?.id || isInternal(session)):
          setCurrentTab(ShopTab.Address);
          break;
        case hash.includes("ads") &&
          (session.id === seller?.id || isInternal(session)):
          setCurrentTab(ShopTab.Ads);
          break;
        case hash.includes("buyerRatings") &&
          (seller.role === Role.Buyer || seller.role === Role.Trader):
          setCurrentTab(ShopTab.BuyerRating);
          break;
        case hash.includes("sellerRatings") &&
          (seller.role === Role.Seller || seller.role === Role.Trader):
          setCurrentTab(ShopTab.SellerRating);
          break;
        case hash.includes("usage") &&
          (session.id === seller?.id || isInternal(session)):
          setCurrentTab(ShopTab.Usage);
          break;
        case hash.includes("details") &&
          (session.id === seller?.id || isInternal(session)):
          setCurrentTab(ShopTab.Details);
          break;
        default:
          setCurrentTab(ShopTab.Home);
          break;
      }
    } else {
      setCurrentTab(ShopTab.Home);
    }
  }, [router.asPath, session]);

  return (
    <div>
      <Head>
        <title>Shop | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative max-w-screen-2xl">
        <div className="flex flex-col bg-white px-10 pt-8 gap-5 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-md border shadow-sm py-3 px-5 flex flex-row items-start gap-10 col-span-2 w-fit">
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src="data:image/jpeg;base64,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" />
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-light">Akame </h3>
                <span className="text-xs font-semibold">
                  Akame of the Demon Sword Murasame
                </span>
                <span className="text-xs text-gray-600 mt-2">
                  97% Positive Feedback
                </span>
                <span className="text-xs text-gray-500 mt-2">
                  Active 8 mins ago
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:col-span-2 p-3 gap-3">
              <div className="flex flex-row items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
                <h3 className="text-sm">
                  Products:{" "}
                  <span className="font-semibold text-primary">3</span>
                </h3>
              </div>
              <div className="flex flex-row items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
                <h3 className="text-sm">
                  Auctions:{" "}
                  <span className="font-semibold text-primary">3</span>
                </h3>
              </div>
              <div className="flex flex-row items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>

                <h3 className="text-sm">
                  Ratings (as buyer):{" "}
                  <span className="font-semibold text-primary">3</span>
                </h3>
              </div>
              <div className="flex flex-row items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                  />
                </svg>

                <h3 className="text-sm">
                  Ratings (as seller):{" "}
                  <span className="font-semibold text-primary">3</span>
                </h3>
              </div>
              <div className="flex flex-row items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"
                  />
                </svg>

                <h3 className="text-sm">
                  Units sold:{" "}
                  <span className="font-semibold text-primary">3</span>
                </h3>
              </div>
              <div className="flex flex-row items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>

                <h3 className="text-sm">
                  Joined Date:{" "}
                  <span className="font-semibold text-primary">
                    {new Date().toLocaleDateString("en-ca", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </span>
                </h3>
              </div>
            </div>
          </div>
          <nav
            aria-label="Tabs"
            className="flex text-sm font-medium overflow-x-auto scrollbar-hide"
          >
            <a
              href=""
              className="-mb-px border-b-4 border-current p-4 text-primary whitespace-nowrap"
            >
              Home
            </a>

            <a
              href=""
              className="-mb-px border-b-4 border-transparent p-4 hover:text-primary whitespace-nowrap"
            >
              Address
            </a>

            <a
              href=""
              className="-mb-px border-b-4 border-transparent p-4 hover:text-primary whitespace-nowrap"
            >
              Ads
            </a>

            <a
              href=""
              className="-mb-px border-b-4 border-transparent p-4 hover:text-primary whitespace-nowrap"
            >
              Buyer Ratings
            </a>

            <a
              href=""
              className="-mb-px border-b-4 border-transparent p-4 hover:text-primary whitespace-nowrap"
            >
              Seller Ratings
            </a>

            <a
              href=""
              className="-mb-px border-b-4 border-transparent p-4 hover:text-primary whitespace-nowrap"
            >
              Usage
            </a>
            <a
              href=""
              className="-mb-px border-b-4 border-transparent p-4 hover:text-primary whitespace-nowrap"
            >
              Details
            </a>
          </nav>
        </div>
        <div
          className={`${
            isInternal(session)
              ? "py-5 flex flex-col gap-5"
              : "mx-6 px-4 py-5 flex flex-col gap-5"
          }`}
        >
          <div className="bg-white p-3 rounded-md border flex flex-col">
            <h3 className="text-lg ml-3 mt-3">Promo Codes</h3>
            <div className="p-3 mt-3 flex flex-row items-center gap-3 overflow-x-auto scrollbar-hide">
              {Array.from(Array(1000).keys()).map((b, index) => (
                <div
                  key={index}
                  className="bg-primary/5 border p-5 min-w-[200px] rounded-md"
                >
                  <h3 className="font-semibold whitespace-nowrap text-sm text-primary">
                    PROMO-{b}
                  </h3>
                  <p className="text-xs mt-1">
                    Min Spend -{" "}
                    <span className="text-primary font-semibold">
                      {formatAmount(10000, locale, true)}
                    </span>
                  </p>
                  <p className="text-xs mt-2 text-gray-500">
                    Valid till{" "}
                    <span className="font-semibold text-primary">
                      {new Date().toLocaleDateString("en-ca", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
          <h3 className="text-lg ml-3 mt-3">Products</h3>
          <div className="bg-white p-3 rounded-md border grid grid-cols-auto200 gap-3 place-items-center">
            {Array.from(Array(10).keys()).map((b, index) => (
              <div
                key={index}
                className="bg-white border min-w-[200px] max-w-[200px] rounded-md overflow-hidden cursor-pointer"
              >
                <div className="overflow-hidden">
                  <ProductImg
                    imgUrl="/assets/dummy/dummy_product.png"
                    width={200}
                    title=""
                    roundedAll={false}
                  />
                </div>
                <div className="m-3 flex flex-col">
                  <h4 className="text-sm line-clamp-2">Sweater</h4>
                  <h4 className="text-sm mt-1 font-semibold text-primary">
                    {formatAmount(5000, locale, true)}
                  </h4>

                  <span className="text-xs font-semibold text-success bg-success/20 rounded-md px-3 py-1 mt-1 w-fit">
                    In Stock
                  </span>
                </div>
              </div>
            ))}
          </div>
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
