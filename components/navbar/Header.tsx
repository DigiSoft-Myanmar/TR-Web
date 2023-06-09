import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useRef } from "react";
import { SocialIcon } from "react-social-icons";
import { useScrollDirection } from "react-use-scroll-direction";

import Navbar from "./Navbar";
import { signOut, useSession } from "next-auth/react";
import { Category, Role } from "@prisma/client";
import { formatAmount, getHighlightText, getText } from "@/util/textHelper";
import { fileUrl } from "@/types/const";
//import { useMarketplace } from "@/context/MarketplaceContext";
import { useTranslation } from "next-i18next";
//import BuyerDrawer from "../modal/drawerModal/BuyerDrawer";
//import NotiModal from "../modal/sideModal/NotiModal";

function Header({ content }: { content: any }) {
  const router = useRouter();
  const { accessKey } = router.query;
  const { t } = useTranslation("common");

  const { locale } = router;
  const searchRef = React.useRef<HTMLDivElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const { data: session }: any = useSession();
  const [isNotiModalOpen, setNotiModalOpen] = React.useState(false);

  enum TabList {
    all = "all",
    brands = "brands",
  }

  const [currentTab, setCurrentTab] = React.useState(TabList.all);
  /* const { data } = useSWR("/api/products/categories", fetcher);
  const { cartItems, subTotal } = useMarketplace();
  const { data: banner } = useSWR("/api/siteManagement/banner", fetcher); */

  const [isModalOpen, setModalOpen] = React.useState(false);
  const [isCartModalOpen, setCartModalOpen] = React.useState(false);
  const categoryBtnRef = useRef<any>();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const [scrollPosition, setScrollPosition] = React.useState(0);

  return (
    <header className="border-b border-gray-100">
      <div className="bg-primary/10 sm:px-6 lg:px-8 max-w-screen-2xl flex flex-row justify-between py-1 text-xs">
        <p>Social Icons</p>
        <p>Banner</p>
        <p>Language</p>
      </div>
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button type="button" className="p-2 lg:hidden">
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

          <a href="#" className="flex">
            <span className="sr-only">Logo</span>
            <span className="inline-block h-10 w-32 rounded-lg bg-gray-200"></span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-end gap-8">
          <input className="bg-red-500" type="search" />
          <nav
            aria-label="Global"
            className="hidden lg:flex lg:gap-4 lg:text-xs lg:font-bold lg:uppercase lg:tracking-wide lg:text-gray-500"
          >
            <Link
              href="/"
              className="block h-16 border-b-4 border-transparent leading-[4rem] hover:border-current hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/marketplace"
              className="block h-16 border-b-4 border-transparent leading-[4rem] hover:border-current hover:text-primary"
            >
              Marketplace
            </Link>

            <Link
              href="/sell"
              className="block h-16 border-b-4 border-transparent leading-[4rem] hover:border-current hover:text-primary"
            >
              Sell Products
            </Link>
          </nav>

          <div className="flex items-center">
            <div className="flex items-center border-x border-gray-100">
              <span className="border-e border-e-gray-100">
                <a
                  href="/cart"
                  className="grid h-16 w-16 place-content-center border-b-4 border-transparent hover:border-primary"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>

                  <span className="sr-only">Cart</span>
                </a>
              </span>
              <span className="border-e border-e-gray-100">
                <Link
                  href="/login"
                  className="grid h-16 w-16 place-content-center border-b-4 border-transparent hover:border-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>

                  <span className="sr-only">Login</span>
                </Link>
              </span>
              {session && (
                <span className="border-e border-e-gray-100">
                  <a
                    href="/account"
                    className="grid h-16 w-16 place-content-center border-b-4 border-transparent hover:border-primary"
                  >
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>

                    <span className="sr-only"> Account </span>
                  </a>
                </span>
              )}
              {session && (
                <span className="border-e border-e-gray-100">
                  <a
                    href="/account"
                    className="grid h-16 w-16 place-content-center border-b-4 border-transparent hover:border-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                      />
                    </svg>

                    <span className="sr-only"> Notifications </span>
                  </a>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center gap-3 sm:px-6 lg:px-8 max-w-screen-2xl py-1 text-xs bg-primary/10 overflow-x-auto scrollbar-hide">
        <Link href={"/marketplace"} className="whitespace-nowrap">
          Promotions
        </Link>
        <Link href={"/marketplace"} className="whitespace-nowrap">
          Live Auctions
        </Link>
        <Link href={"/marketplace"}>Categories</Link>
        {Array.from(Array(30).keys()).map((z) => (
          <Link href={"/marketplace"} key={z}>
            Categories
          </Link>
        ))}
      </div>
    </header>
  );
}

export default Header;
