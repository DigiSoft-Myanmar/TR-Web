import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useRef } from "react";
import { SocialIcon } from "react-social-icons";
import { useScrollDirection } from "react-use-scroll-direction";

import Navbar from "./Navbar";
import { signOut, useSession } from "next-auth/react";
import { Category, Content, Role } from "@prisma/client";
import {
  formatAmount,
  getHighlightText,
  getInitials,
  getText,
} from "@/util/textHelper";
import { fileUrl } from "@/types/const";
import useSWR from "swr";
//import { useMarketplace } from "@/context/MarketplaceContext";
import { useTranslation } from "next-i18next";
import { fetcher } from "@/util/fetcher";
import { useMarketplace } from "@/context/MarketplaceContext";
import SubCategoryDropdown from "../presentational/SubCategoryDropdown";
import LocationPickerFull from "../presentational/LocationPickerFull";
import { useSeller } from "@/context/SellerContext";
import Avatar from "../presentational/Avatar";
import DefaultDialog from "../modal/dialog/DefaultDialog";
import NavModal from "../modal/sideModal/NavModal";
import CartModal from "../modal/sideModal/CartModal";
import { getHeaders, isBuyer, isSeller } from "@/util/authHelper";
import { showErrorDialog } from "@/util/swalFunction";
import { getMobileOperatingSystem } from "@/util/getDevice";
import { ProductNavType } from "@/types/productTypes";
import { encryptPhone } from "@/util/encrypt";
import NotiModal from "../modal/sideModal/NotiModal";
import { useNoti } from "@/context/NotificationContext";
//import BuyerDrawer from "../modal/drawerModal/BuyerDrawer";
//import NotiModal from "../modal/sideModal/NotiModal";

function Header({
  content,
  categories,
  device,
}: {
  content: Content;
  categories: Category[];
  device: any;
}) {
  const router = useRouter();
  const { accessKey } = router.query;
  const { t } = useTranslation("common");
  const {
    subTotal,
    cartItems,
    shippingLocation,
    setShippingLocation,
    isLoading,
  } = useMarketplace();

  const { locale } = router;
  const searchRef = React.useRef<HTMLDivElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const { isNotiPing, turnOffNotiPing } = useNoti();
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { data: session }: any = useSession();
  const [isNotiModalOpen, setNotiModalOpen] = React.useState(false);
  const [open, setOpen] = React.useState("");

  enum TabList {
    all = "all",
    brands = "brands",
  }

  const [currentTab, setCurrentTab] = React.useState(TabList.all);
  /* const { data } = useSWR("/api/products/categories", fetcher);
  const { cartItems, subTotal } = useMarketplace();
  const { data: banner } = useSWR("/api/siteManagement/banner", fetcher); */

  const [isModalOpen, setModalOpen] = React.useState(false);
  const [isCartModalOpen, setCartModalOpen] = React.useState(true);
  const categoryBtnRef = useRef<any>();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const [scrollPosition, setScrollPosition] = React.useState(0);
  const { data: banner } = useSWR("/api/siteManagement/banner", fetcher);
  const deviceInfo = getMobileOperatingSystem(device);

  React.useEffect(() => {
    if (banner && banner.length > 1) {
      setInterval(() => {
        setCurrentIndex((prevValue) => {
          if (prevValue + 1 >= banner.length) {
            return 0;
          } else {
            return prevValue + 1;
          }
        });
      }, 5000);
    }
  }, [banner]);

  return (
    <>
      <div className="flex flex-row border-b border-b-gray-200 py-2 px-3 md:px-10">
        <div className="hidden flex-row space-x-1 md:flex">
          {content?.socialUrl?.map((e: string, index: number) => (
            <SocialIcon url={e} key={index} style={{ width: 20, height: 20 }} />
          ))}
        </div>
        <div className="flex flex-grow flex-row items-center justify-between space-x-3 md:mx-10">
          {banner && (
            <>
              <button
                className="text-primaryText rounded-full p-1 hover:bg-primary hover:text-white md:flex"
                type="button"
                onClick={() => {
                  setCurrentIndex((prevIndex) => {
                    if (prevIndex - 1 >= 0) {
                      return prevIndex - 1;
                    } else {
                      return banner.length - 1;
                    }
                  });
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>

              <p className="text-center text-xs">
                {locale === "mm"
                  ? getHighlightText(banner[currentIndex]?.bannerTextMM).map(
                      (e: any, index: number) => (
                        <span
                          className={
                            e.isHighlight === true
                              ? "font-semibold text-primary"
                              : ""
                          }
                          key={index}
                        >
                          {e.text}
                        </span>
                      )
                    )
                  : getHighlightText(banner[currentIndex]?.bannerText).map(
                      (e: any, index: number) => (
                        <span
                          className={
                            e.isHighlight === true
                              ? "font-semibold text-primary"
                              : ""
                          }
                          key={index}
                        >
                          {e.text}
                        </span>
                      )
                    )}
              </p>
              <button
                className="text-primaryText rounded-full p-1 hover:bg-primary hover:text-white md:flex"
                type="button"
                onClick={() => {
                  setCurrentIndex((prevIndex) => {
                    if (prevIndex + 1 < banner.length) {
                      return prevIndex + 1;
                    } else {
                      return 0;
                    }
                  });
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
        <div className="hidden md:flex">
          <div
            onClick={(e) =>
              router.push(router.route, router.asPath, {
                locale: router && router.locale === "mm" ? "en" : "mm",
              })
            }
            className={`flex cursor-pointer flex-row items-center space-x-1 border-b-4 border-transparent`}
          >
            {router && router.locale && router.locale === "mm" ? (
              <Image
                src="/assets/icon/myanmar.svg"
                width={16}
                height={16}
                className="h-4 w-4"
                alt="english"
              />
            ) : (
              <Image
                src="/assets/icon/eng.svg"
                width={16}
                height={16}
                className="h-4 w-4"
                alt="english"
              />
            )}
            <span className="text-xs">
              {router.locale === "mm" ? "မြန်မာ" : "English"}
            </span>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="z-50 mx-auto flex h-20 max-w-screen-2xl items-center justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 lg:hidden"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(true);
              }}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <Link href="/" className="hidden lg:flex items-center gap-3">
              <span className="sr-only">Logo</span>
              <Image
                key="logo"
                className="inline-block h-12 w-12 rounded-lg object-contain mb-3"
                width={48}
                height={48}
                src={"/assets/logo.png"}
                alt="Logo"
              />
              <h3 className="font-semibold text-base text-primary">
                Treasure Rush
              </h3>
            </Link>
          </div>

          <div className="flex flex-1 items-center lg:justify-end gap-3">
            <form
              className="flex-grow rounded-md flex flex-row items-stretch pl-5"
              onSubmit={(e: any) => {
                e.preventDefault();
                const qry = e.target.qry.value;
                router.push("/marketplace?qry=" + encodeURIComponent(qry));
              }}
            >
              <input
                className="w-full border-gray-200 border-2 border-r-0 rounded-l-full focus:ring-0 focus:border-primary-focus text-sm py-2 lg:px-5"
                type="search"
                placeholder="Search for the ultimate shopping experience..."
                name="qry"
              />
              <button
                type="submit"
                className="bg-primary rounded-r-full flex flex-row items-center px-2 py-2.5 text-white text-sm gap-3 pr-5 hover:bg-primary-focus"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <span className="hidden lg:flex">Search</span>
              </button>
            </form>
            <nav
              aria-label="Global"
              className="hidden lg:flex items-center lg:gap-4 lg:text-xs lg:font-bold lg:uppercase lg:tracking-wide lg:text-gray-500"
            >
              {session ? (
                <>
                  <div className="dropdown">
                    <div
                      tabIndex={0}
                      className="text-primaryText flex flex-row items-center space-x-2 hover:text-primary cursor-pointer"
                    >
                      <Avatar
                        profile={session.profile}
                        username={session.username}
                        size={32}
                      />

                      <div className="flex flex-row items-center gap-1">
                        <span className="text-sm font-medium">
                          {session.username}
                        </span>
                        <span className="indicator-item badge badge-primary badge-sm text-white">
                          {isNotiPing > 99 ? "99+" : isNotiPing}
                        </span>
                      </div>
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] menu p-2 border mt-3 bg-base-100 rounded-box w-52"
                    >
                      <span className="text-xs font-bold p-2">GENERAL</span>
                      <li>
                        <Link
                          href={
                            "/account/" +
                            encodeURIComponent(encryptPhone(session.phoneNum))
                          }
                          className="ml-1 font-normal hover:font-semibold"
                        >
                          Profile
                        </Link>
                      </li>
                      {(session.role === Role.Buyer ||
                        session.role === Role.Trader) && (
                        <li>
                          <Link
                            href={"/wishlist/"}
                            className="ml-1 font-normal hover:font-semibold"
                          >
                            Wishlist
                          </Link>
                        </li>
                      )}
                      <li>
                        <button
                          className="ml-1 font-normal hover:font-semibold cursor-pointer"
                          type="button"
                          onClick={() => {
                            turnOffNotiPing();
                            fetch("/api/notifications/update", {
                              method: "POST",
                              headers: getHeaders(session),
                            });
                            setNotiModalOpen(true);
                          }}
                        >
                          Notifications{" "}
                          <span className="indicator-item badge badge-primary badge-sm text-white">
                            {isNotiPing > 99 ? "99+" : isNotiPing}
                          </span>
                        </button>
                      </li>
                      {session.role === Role.Buyer ||
                      session.role === Role.Trader ? (
                        <>
                          <hr className="h-[1px] px-2 my-2" />
                          <span className="text-xs font-bold p-2">Buyer</span>
                          <li>
                            <Link
                              href={
                                "/account/" +
                                encodeURIComponent(
                                  encryptPhone(session.phoneNum)
                                ) +
                                "#address"
                              }
                              className="ml-1 font-normal hover:font-semibold"
                            >
                              Address
                            </Link>
                          </li>
                          <li>
                            <Link
                              href={"/orders/purchasedHistory"}
                              className="ml-1 font-normal hover:font-semibold"
                            >
                              Purchase History
                            </Link>
                          </li>
                          <li>
                            <Link
                              href={"/bidHistory"}
                              className="ml-1 font-normal hover:font-semibold"
                            >
                              Bids
                            </Link>
                          </li>
                        </>
                      ) : (
                        <></>
                      )}

                      {session.role === Role.Seller ||
                      session.role === Role.Trader ? (
                        <>
                          <hr className="h-[1px] px-2 my-2" />
                          <span className="text-xs font-bold p-2">Seller</span>
                          <li>
                            <Link
                              href={"/products/"}
                              className="ml-1 font-normal hover:font-semibold"
                            >
                              Product Listing
                            </Link>
                          </li>
                          <li>
                            <Link
                              href={"/orders/"}
                              className="ml-1 font-normal hover:font-semibold"
                            >
                              Sales History
                            </Link>
                          </li>
                          <li>
                            <Link
                              href={"/auctions/"}
                              className="ml-1 font-normal hover:font-semibold"
                            >
                              Offers
                            </Link>
                          </li>
                          <li>
                            <Link
                              href={"/shipping%20Cost/"}
                              className="ml-1 font-normal hover:font-semibold"
                            >
                              Shipping Cost
                            </Link>
                          </li>
                          <li>
                            <Link
                              href={"/promoCode/"}
                              className="ml-1 font-normal hover:font-semibold"
                            >
                              Promo Codes
                            </Link>
                          </li>
                          <li>
                            <Link
                              href={
                                "/account/" +
                                encodeURIComponent(
                                  encryptPhone(session.phoneNum)
                                ) +
                                "#ads"
                              }
                              className="ml-1 font-normal hover:font-semibold"
                            >
                              Ads
                            </Link>
                          </li>
                        </>
                      ) : (
                        <></>
                      )}
                      <hr className="h-[1px] px-2 my-2" />
                      <li>
                        <button
                          type="button"
                          className="ml-1 font-normal hover:font-semibold"
                          onClick={() => {
                            fetch(
                              "/api/user/" +
                                encodeURIComponent(session.phoneNum) +
                                "/stats",
                              {
                                method: "PUT",
                                body: JSON.stringify({
                                  id: session.id,
                                  lastOnlineTime: new Date().toISOString(),
                                }),
                                headers: getHeaders(session),
                              }
                            ).then((data) => {
                              signOut({
                                callbackUrl: accessKey
                                  ? "/?accessKey=" + accessKey
                                  : "/",
                              });
                            });
                          }}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div className="w-[1px] h-[30px] bg-gray-500"></div>
                </>
              ) : (
                <Link
                  className="text-primaryText flex  flex-row items-center space-x-2 hover:text-primary"
                  href={"/login"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>

                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-light">{t("signIn")}</span>
                    <span className="text-sm font-medium">{t("account")}</span>
                  </div>
                </Link>
              )}

              <button
                className="group text-primaryText flex min-w-[130px] flex-row items-center space-x-5 hover:text-primary"
                onClick={() => {
                  if (cartItems.length > 0) {
                    setCartModalOpen(true);
                  } else {
                    showErrorDialog(
                      "Empty cart. Please buy and try again.",
                      "",
                      locale
                    );
                  }
                }}
              >
                <div className="indicator">
                  <span className="indicator-item badge badge-primary badge-sm text-white">
                    {isLoading === false ? (
                      cartItems
                        .map((e) => e.quantity)
                        .reduce((a, b) => a + b, 0)
                    ) : (
                      <span></span>
                    )}
                  </span>
                  <div className="w-8 h-7 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6 group-hover:hidden"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                      />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6 hidden group-hover:block"
                    >
                      <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col items-start space-y-1">
                  <span className="text-xs font-light">{t("total")}</span>
                  <span className="text-sm font-medium">
                    {isLoading === false
                      ? formatAmount(subTotal, locale, true)
                      : "Calculating..."}
                  </span>
                </div>
              </button>
            </nav>
            <button
              className="group flex text-primaryText lg:hidden flex-row items-center hover:text-primary w-14"
              onClick={() => {
                if (cartItems.length > 0) {
                  setCartModalOpen(true);
                } else {
                  showErrorDialog(
                    "Empty cart. Please buy and try again.",
                    "",
                    locale
                  );
                }
              }}
            >
              <div className="indicator">
                <span className="indicator-item badge badge-primary badge-sm text-white">
                  {cartItems.map((e) => e.quantity).reduce((a, b) => a + b, 0)}
                </span>
                <div className="w-8 h-7 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6 group-hover:hidden"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 hidden group-hover:block"
                  >
                    <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div
          className={`hidden lg:flex flex-row items-center justify-between px-3 gap-3 sm:px-6 lg:px-8 max-w-screen-2xl py-1 text-sm border-y-[1px] border-y-gray-200 min-h-[52px]`}
        >
          <div className="flex flex-row items-center gap-3">
            {session && session.role === Role.Seller ? (
              <>
                <Link
                  href={"/marketplace"}
                  className="hidden xl:flex whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
                >
                  Products
                </Link>
                <Link
                  href={"/marketplace"}
                  className="hidden xl:flex whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
                >
                  Orders
                </Link>
                <Link
                  href={"/marketplace"}
                  className="hidden xl:flex whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
                >
                  Offers
                </Link>
                <Link
                  href={"/marketplace"}
                  className="hidden xl:flex whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
                >
                  Shipping Cost
                </Link>
                <Link
                  href={"/marketplace"}
                  className="hidden xl:flex whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
                >
                  Promo Code
                </Link>
              </>
            ) : (
              <>
                <div className="dropdown dropdown-hover border-r pr-3 border-r-neutral">
                  <label
                    tabIndex={0}
                    className="whitespace-nowrap hover:text-primary hover:underline flex flex-row items-center gap-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                      />
                    </svg>

                    <span>Categories</span>
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-72 z-10"
                  >
                    {categories?.map((e: any, index) => (
                      <li key={index} className="group">
                        {e.subCategory && e.subCategory.length > 0 ? (
                          <SubCategoryDropdown
                            id={e.id}
                            name={getText(e.name, e.nameMM, locale)}
                            subCategory={e.subCategory}
                            open={open}
                            slug={e.slug}
                            setOpen={setOpen}
                          />
                        ) : (
                          <Link
                            href={
                              "/marketplace?categories=" +
                              encodeURIComponent(e.slug)
                            }
                            className="group-hover:text-primary max-w-[288px] text-ellipsis"
                          >
                            {getText(e.name, e.nameMM, locale)}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={"/marketplace?type=" + ProductNavType.Promotion}
                  className="hidden xl:flex whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
                >
                  Promotions
                </Link>
                <Link
                  href={"/marketplace?type=" + ProductNavType.Auction}
                  className="hidden xl:flex whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
                >
                  Live Auctions
                </Link>
                <Link
                  href={isSeller(session) ? "/products" : "/memberships"}
                  className="whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
                >
                  Sell on Treasure Rush
                </Link>
              </>
            )}
            <Link
              href={"/faqs"}
              className="hidden xl:flex whitespace-nowrap hover:text-primary hover:underline "
            >
              FAQs
            </Link>
          </div>
          <div className="flex flex-row items-center gap-3">
            <button
              type="button"
              className={`whitespace-nowrap ${
                isSeller(session) ? "border-r pr-3 border-r-neutral" : ""
              } hover:text-primary hover:underline flex flex-row items-center gap-2`}
              onClick={() => {
                if (deviceInfo === "android") {
                  window.open(content.playStoreURL, "_blank");
                } else if (deviceInfo === "ios") {
                  window.open(content.appStoreURL, "_blank");
                } else {
                  window.scrollTo(0, document.body.scrollHeight);
                }
              }}
            >
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
                  d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                />
              </svg>
              <span>Get Apps</span>
            </button>
            <div className="whitespace-nowrap hover:text-primary flex flex-row items-center gap-2 flex-grow">
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
                  d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>

              <span>Ship to : </span>
              <div className="flex-grow min-w-[350px] max-w-[350px]">
                <LocationPickerFull
                  selected={{
                    stateId: shippingLocation?.stateId,
                    districtId: shippingLocation?.districtId,
                    townshipId: shippingLocation?.townshipId,
                  }}
                  disableLabel={true}
                  setSelected={(data) => {
                    setShippingLocation({
                      stateId: data.stateId,
                      districtId: data.districtId,
                      townshipId: data.townshipId,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex lg:hidden flex-row items-center px-3 gap-3 sm:px-6 lg:px-8 max-w-screen-2xl py-1 text-sm border-y-[1px] border-y-gray-200 overflow-x-auto scrollbar-hide">
          {isSeller(session) ? (
            <>
              <Link
                href={"/marketplace"}
                className="whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
              >
                Products
              </Link>
              <Link
                href={"/marketplace"}
                className="whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
              >
                Orders
              </Link>
              <Link
                href={"/marketplace"}
                className="whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
              >
                Offers
              </Link>
              <Link
                href={"/marketplace"}
                className="whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
              >
                Shipping Cost
              </Link>
              <Link
                href={"/marketplace"}
                className="whitespace-nowrap hover:text-primary hover:underline "
              >
                Promo Code
              </Link>
            </>
          ) : (
            <>
              <Link
                href={"/marketplace"}
                className="whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
              >
                All Categories
              </Link>
              {categories?.map((e, index) => (
                <Link
                  key={index}
                  href={"/marketplace"}
                  className={`whitespace-nowrap ${
                    index === categories.length - 1
                      ? ""
                      : "border-r pr-3 border-r-neutral"
                  } hover:text-primary hover:underline `}
                >
                  {getText(e.name, e.nameMM, locale)}
                </Link>
              ))}
            </>
          )}
        </div>
        {router.asPath.includes("/marketplace") && (
          <div className="flex lg:hidden flex-row items-center px-3 gap-3 sm:px-6 lg:px-8 max-w-screen-2xl py-1 text-sm border-b-[1px] border-y-gray-200 overflow-x-auto scrollbar-hide">
            <Link
              href={"/marketplace"}
              className="whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
            >
              Featured
            </Link>
            <Link
              href={"/marketplace"}
              className="whitespace-nowrap border-r pr-3 border-r-neutral hover:text-primary hover:underline "
            >
              Promotions
            </Link>
            <Link
              href={"/marketplace"}
              className="whitespace-nowrap hover:text-primary hover:underline "
            >
              Live Auctions
            </Link>
          </div>
        )}
      </header>
      <NavModal isModalOpen={isMenuOpen} setModalOpen={setMenuOpen} />
      <CartModal
        isModalOpen={isCartModalOpen}
        setModalOpen={setCartModalOpen}
      />
      <NotiModal
        isModalOpen={isNotiModalOpen}
        setModalOpen={setNotiModalOpen}
      />
    </>
  );
}

export default Header;
