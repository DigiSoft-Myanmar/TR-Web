import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React, { useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import prisma from "@/prisma/prisma";
import { FeedbackType, Role, User } from "@prisma/client";
import { calculateRating, formatAmount, getNotiTime } from "@/util/textHelper";
import { useRouter } from "next/router";
import Image from "next/image";
import ProductImg from "@/components/card/ProductImg";
import { useSession } from "next-auth/react";
import { isBuyer, isInternal, isSeller } from "@/util/authHelper";
import UserHomeSection from "@/components/section/user/UserHomeSection";
import UserAddressSection from "@/components/section/user/UserAddressSection";
import UserAdsSection from "@/components/section/user/UserAdsSection";
import UserBuyerRatingSection from "@/components/section/user/UserBuyerRatingSection";
import UserDetailsSection from "@/components/section/user/UserDetailsSection";
import UserSellerRatingSection from "@/components/section/user/UserSellerRatingSection";
import UserUsageSection from "@/components/section/user/UserUsageSection";
import Avatar from "@/components/presentational/Avatar";
import { useQuery } from "react-query";
import { has } from "lodash";
import ReportDialog from "../modal/dialog/ReportDialog";
import { showErrorDialog } from "@/util/swalFunction";

enum ShopTab {
  Home,
  Address,
  Ads,
  BuyerRating,
  SellerRating,
  Usage,
  Details,
}

export default function UserScreen({ user }: { user: any }) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const { data: session }: any = useSession();
  const [currentTab, setCurrentTab] = React.useState<ShopTab>(ShopTab.Home);
  const [isReportOpen, setReportOpen] = React.useState(false);
  const { isLoading, error, data, refetch } = useQuery(
    ["userStats", user.phoneNum],
    () =>
      fetch("/api/user/" + user.phoneNum + "/stats").then((res) => {
        let json = res.json();
        return json;
      })
  );
  useEffect(() => {
    const hash = router.asPath.split("#")[1];
    if (hash) {
      if (session) {
        switch (true) {
          case hash.includes("address") &&
            isBuyer(user) &&
            (isInternal(session) || session.id === user.id):
            setCurrentTab(ShopTab.Address);
            break;
          case hash.includes("ads") &&
            isSeller(user) &&
            (isInternal(session) || session.id === user.id):
            setCurrentTab(ShopTab.Ads);
            break;
          case hash.includes("buyerRatings") && isBuyer(user):
            setCurrentTab(ShopTab.BuyerRating);
            break;
          case hash.includes("sellerRatings") && isSeller(user):
            setCurrentTab(ShopTab.SellerRating);
            break;
          case hash.includes("usage") &&
            isSeller(user) &&
            (isInternal(session) || session.id === user.id):
            setCurrentTab(ShopTab.Usage);
            break;
          case hash.includes("details") &&
            (session.id === user?.id || isInternal(session)):
            setCurrentTab(ShopTab.Details);
            break;
          default:
            setCurrentTab(ShopTab.Home);
            break;
        }
      } else {
        switch (true) {
          case hash.includes("buyerRatings") && isBuyer(user):
            setCurrentTab(ShopTab.BuyerRating);
            break;
          case hash.includes("sellerRatings") &&
            (user?.role === Role.Seller || user?.role === Role.Trader):
            setCurrentTab(ShopTab.SellerRating);
            break;
          default:
            setCurrentTab(ShopTab.Home);
            break;
        }
      }
    } else {
      setCurrentTab(ShopTab.Home);
    }
  }, [router.asPath, session]);

  return (
    <>
      <div>
        <div className="relative max-w-screen-2xl">
          <div className="flex flex-col bg-white px-10 pt-8 gap-5 shadow-sm">
            {data && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 place-items-start">
                <div className="col-span-2 flex flex-col gap-3 items-start">
                  <div className="bg-white rounded-md border shadow-sm py-3 px-5 flex flex-row items-start gap-10 w-fit">
                    <Avatar
                      profile={user?.profile}
                      username={user.username}
                      isLarge={true}
                    />
                    <div className="flex flex-col">
                      <h3 className="text-lg font-light">{user.username} </h3>

                      <span className="text-xs font-semibold">
                        {user.displayName}
                      </span>
                      {isInternal(user) ? (
                        <></>
                      ) : (
                        <>
                          <span className="text-xs text-gray-600 mt-2 flex flex-row items-center gap-1">
                            {user.role === Role.Buyer
                              ? calculateRating(
                                  data.buyerReview,
                                  data.buyerTotalReview
                                )
                              : user.role === Role.Seller
                              ? calculateRating(
                                  data.sellerReview,
                                  data.sellerTotalReview
                                )
                              : user.role === Role.Trader
                              ? calculateRating(
                                  data.buyerReview + data.sellerReview,
                                  data.buyerTotalReview + data.sellerTotalReview
                                )
                              : ""}{" "}
                            Ratings{" . "}
                            {formatAmount(
                              data.buyerTotalReview + data.sellerTotalReview,
                              locale,
                              false,
                              true
                            )}{" "}
                            Reviews
                          </span>
                        </>
                      )}
                      <span className="text-xs text-gray-500 mt-2">
                        {data.lastOnlineTime
                          ? getNotiTime(data.lastOnlineTime, locale)
                          : user.lastLogin
                          ? "Active Now"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>
                  {user.id !== session.id && (
                    <button
                      className="text-xs text-gray-500 flex flex-wrap items-center gap-3 pb-[1px] w-full px-3"
                      type="button"
                      onClick={() => {
                        if (session) {
                          setReportOpen(true);
                        } else {
                          showErrorDialog(
                            "Please login to continue.",
                            "ရှေ့ဆက်ရန် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ။",
                            locale,
                            () => {
                              router.push("/login");
                            }
                          );
                        }
                      }}
                    >
                      <span>Any problem with this user? </span>
                      <span className="flex flex-row items-center gap-0.5 cursor-pointer text-primary pb-[1px] hover:pb-0 hover:border-b hover:border-b-current">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-3 h-3"
                        >
                          <path d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0v-4.392l1.657-.348a6.449 6.449 0 014.271.572 7.948 7.948 0 005.965.524l2.078-.64A.75.75 0 0018 12.25v-8.5a.75.75 0 00-.904-.734l-2.38.501a7.25 7.25 0 01-4.186-.363l-.502-.2a8.75 8.75 0 00-5.053-.439l-1.475.31V2.75z" />
                        </svg>
                        <span className="text-xs font-medium transition-all">
                          Report
                        </span>
                      </span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 lg:col-span-2 p-3 gap-3">
                  {isSeller(user) && (
                    <>
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
                          <span className="font-semibold text-primary">
                            {formatAmount(data.noOfProducts, locale)}
                          </span>
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
                          <span className="font-semibold text-primary">
                            {formatAmount(data.noOfAuctions, locale)}
                          </span>
                        </h3>
                      </div>
                    </>
                  )}
                  {isBuyer(user) && (
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
                        <span className="font-semibold text-primary">
                          {calculateRating(
                            data.buyerReview,
                            data.buyerTotalReview
                          )}
                        </span>
                      </h3>
                    </div>
                  )}
                  {isSeller(user) && (
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
                        <span className="font-semibold text-primary">
                          {calculateRating(
                            data.sellerReview,
                            data.sellerTotalReview
                          )}
                        </span>
                      </h3>
                    </div>
                  )}
                  {isSeller(user) && (
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
                        <span className="font-semibold text-primary">
                          {formatAmount(data.noOfUnitSold, locale)}
                        </span>
                      </h3>
                    </div>
                  )}
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
                        {new Date(user.createdAt).toLocaleDateString("en-ca", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        })}
                      </span>
                    </h3>
                  </div>
                </div>
              </div>
            )}
            <nav
              aria-label="Tabs"
              className="flex text-sm font-medium overflow-x-auto scrollbar-hide"
            >
              <div
                className={`-mb-px border-b-4 ${
                  currentTab === ShopTab.Home
                    ? "border-current text-primary"
                    : "border-transparent hover:text-primary"
                } p-4 whitespace-nowrap cursor-pointer`}
                onClick={() => {
                  router.replace(
                    {
                      pathname: router.pathname,
                      query: router.query,
                      hash: "home",
                    },
                    undefined,
                    { shallow: true }
                  );
                }}
              >
                Home
              </div>

              {isBuyer(user) &&
                (isInternal(session) || session?.id === user.id) && (
                  <div
                    className={`-mb-px border-b-4 ${
                      currentTab === ShopTab.Address
                        ? "border-current text-primary"
                        : "border-transparent hover:text-primary"
                    } p-4 whitespace-nowrap cursor-pointer`}
                    onClick={() => {
                      router.replace(
                        {
                          pathname: router.pathname,
                          query: router.query,
                          hash: "address",
                        },
                        undefined,
                        { shallow: true }
                      );
                    }}
                  >
                    Address
                  </div>
                )}

              {isSeller(user) &&
                (isInternal(session) || session?.id === user.id) && (
                  <div
                    className={`-mb-px border-b-4 ${
                      currentTab === ShopTab.Ads
                        ? "border-current text-primary"
                        : "border-transparent hover:text-primary"
                    } p-4 whitespace-nowrap cursor-pointer`}
                    onClick={() => {
                      router.replace(
                        {
                          pathname: router.pathname,
                          query: router.query,
                          hash: "ads",
                        },
                        undefined,
                        { shallow: true }
                      );
                    }}
                  >
                    Ads
                  </div>
                )}
              {isBuyer(user) && (
                <div
                  className={`-mb-px border-b-4 ${
                    currentTab === ShopTab.BuyerRating
                      ? "border-current text-primary"
                      : "border-transparent hover:text-primary"
                  } p-4 whitespace-nowrap cursor-pointer`}
                  onClick={() => {
                    router.replace(
                      {
                        pathname: router.pathname,
                        query: router.query,
                        hash: "buyerRatings",
                      },
                      undefined,
                      { shallow: true }
                    );
                  }}
                >
                  Buyer Ratings
                </div>
              )}

              {isSeller(user) && (
                <div
                  className={`-mb-px border-b-4 ${
                    currentTab === ShopTab.SellerRating
                      ? "border-current text-primary"
                      : "border-transparent hover:text-primary"
                  } p-4 whitespace-nowrap cursor-pointer`}
                  onClick={() => {
                    router.replace(
                      {
                        pathname: router.pathname,
                        query: router.query,
                        hash: "sellerRatings",
                      },
                      undefined,
                      { shallow: true }
                    );
                  }}
                >
                  Seller Ratings
                </div>
              )}

              {isSeller(user) &&
                (isInternal(session) || session?.id === user.id) && (
                  <div
                    className={`-mb-px border-b-4 ${
                      currentTab === ShopTab.Usage
                        ? "border-current text-primary"
                        : "border-transparent hover:text-primary"
                    } p-4 whitespace-nowrap cursor-pointer`}
                    onClick={() => {
                      router.replace(
                        {
                          pathname: router.pathname,
                          query: router.query,
                          hash: "usage",
                        },
                        undefined,
                        { shallow: true }
                      );
                    }}
                  >
                    Usage
                  </div>
                )}

              {session && (isInternal(session) || session?.id === user?.id) && (
                <div
                  className={`-mb-px border-b-4 ${
                    currentTab === ShopTab.Details
                      ? "border-current text-primary"
                      : "border-transparent hover:text-primary"
                  } p-4 whitespace-nowrap cursor-pointer`}
                  onClick={() => {
                    router.replace(
                      {
                        pathname: router.pathname,
                        query: router.query,
                        hash: "details",
                      },
                      undefined,
                      { shallow: true }
                    );
                  }}
                >
                  Details
                </div>
              )}
            </nav>
          </div>
          {currentTab === ShopTab.Home ? (
            <UserHomeSection user={user} />
          ) : currentTab === ShopTab.Address ? (
            <UserAddressSection user={user} />
          ) : currentTab === ShopTab.Ads ? (
            <UserAdsSection user={user} />
          ) : currentTab === ShopTab.BuyerRating ? (
            <UserBuyerRatingSection user={user} />
          ) : currentTab === ShopTab.Details ? (
            <UserDetailsSection user={user} />
          ) : currentTab === ShopTab.SellerRating ? (
            <UserSellerRatingSection user={user} />
          ) : currentTab === ShopTab.Usage ? (
            <UserUsageSection user={user} />
          ) : (
            <UserHomeSection user={user} />
          )}
        </div>
      </div>
      <ReportDialog
        isModalOpen={isReportOpen}
        setModalOpen={setReportOpen}
        type={FeedbackType.User}
        id={user.id}
      />
    </>
  );
}
