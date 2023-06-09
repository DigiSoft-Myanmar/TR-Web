import { Action } from "@/types/action";
import { ImgType } from "@/types/orderTypes";
import { RoleNav } from "@/types/role";
import { ProductType, Role } from "@prisma/client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

type Props = {
  isOpen: string;
};

function AdminSidebar({ isOpen }: Props) {
  const { data: session }: any = useSession();
  const router = useRouter();

  return (
    <div
      className={`flex h-screen flex-col justify-between ${
        isOpen === "close" ? "w-[60px]" : ""
      }`}
    >
      <div className="py-6">
        <div
          className={
            isOpen === "close"
              ? "mt-3 h-1 w-full"
              : "relative flex w-full flex-col items-center gap-1"
          }
        >
          {isOpen === "open" && (
            <Image
              width={150}
              height={100}
              className="object-contain"
              alt="logo"
              src="/assets/logo_full.png"
            />
          )}
        </div>

        <nav aria-label="Main Nav" className="mt-6 flex flex-col pl-1">
          <Link
            href="/"
            className={
              router.asPath === "/"
                ? "active-route bg-gray-100 px-4 py-2 text-gray-700"
                : "px-4 py-2 text-gray-700"
            }
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 opacity-75"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z"
                />
              </svg>
              {isOpen === "open" && (
                <span className="ml-3 whitespace-nowrap text-sm font-medium">
                  {" "}
                  Dashboard{" "}
                </span>
              )}
            </div>
          </Link>
          {session &&
            (session.role === Role.Admin ||
              session.role === Role.Staff ||
              session.role === Role.SuperAdmin) && (
              <details
                className="group"
                open={isOpen === "close" || router.asPath.includes("/users")}
              >
                {isOpen === "open" ? (
                  <summary className="flex cursor-pointer items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 opacity-75"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>

                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {" "}
                      Users{" "}
                    </span>
                    <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </summary>
                ) : (
                  <summary></summary>
                )}
                <nav
                  aria-label="Teams Nav"
                  className={
                    isOpen === "close"
                      ? "flex flex-col border-t border-t-slate-200"
                      : "ml-8 flex flex-col"
                  }
                >
                  <Link
                    href={"/users/" + encodeURIComponent(RoleNav.Buyers)}
                    className={
                      router.asPath.includes(
                        "/users/" + encodeURIComponent(RoleNav.Buyers)
                      )
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        Buyers{" "}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={"/users/" + encodeURIComponent(RoleNav.Sellers)}
                    className={
                      router.asPath.includes(
                        "/users/" + encodeURIComponent(RoleNav.Sellers)
                      )
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        Sellers / Brands
                      </span>
                    )}
                  </Link>

                  <Link
                    href={"/users/" + encodeURIComponent(RoleNav.Staff)}
                    className={
                      router.asPath.includes(
                        "/users/" + encodeURIComponent(RoleNav.Staff)
                      )
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        Staffs
                      </span>
                    )}
                  </Link>

                  <Link
                    href={"/users/" + encodeURIComponent(RoleNav.Admin)}
                    className={
                      router.asPath.includes(
                        "/users/" + encodeURIComponent(RoleNav.Admin)
                      )
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        Admins{" "}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={"/users/" + encodeURIComponent(RoleNav.Banned)}
                    className={
                      router.asPath.includes(
                        "/users/" + encodeURIComponent(RoleNav.Banned)
                      )
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        Banned Users{" "}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={"/users/" + encodeURIComponent(RoleNav.Subscribe)}
                    className={
                      router.asPath.includes(
                        "/users/" + encodeURIComponent(RoleNav.Subscribe)
                      )
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        Subscribe Users{" "}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={"/users/" + encodeURIComponent(RoleNav.Inactive)}
                    className={
                      router.asPath.includes(
                        "/users/" + encodeURIComponent(RoleNav.Inactive)
                      )
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        Inactive Users
                      </span>
                    )}
                  </Link>

                  <Link
                    href={"/users/" + encodeURIComponent(RoleNav.Deleted)}
                    className={
                      router.asPath.includes(
                        "/users/" + encodeURIComponent(RoleNav.Deleted)
                      )
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        Deleted Users
                      </span>
                    )}
                  </Link>
                </nav>
              </details>
            )}
          <details
            className="group"
            open={isOpen === "close" || router.asPath.includes("/products")}
          >
            {isOpen === "open" ? (
              <summary className="flex cursor-pointer items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 opacity-75"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>

                <span className="ml-3 whitespace-nowrap text-sm font-medium">
                  {" "}
                  Products{" "}
                </span>

                <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </summary>
            ) : (
              <summary></summary>
            )}

            <nav
              aria-label="Teams Nav"
              className={
                isOpen === "close"
                  ? "flex flex-col border-t border-t-slate-200"
                  : "ml-8 flex flex-col"
              }
            >
              <Link
                href={"/products"}
                className={
                  router.asPath === "/products"
                    ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                    : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 opacity-75"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                {isOpen === "open" && (
                  <span className="ml-3 whitespace-nowrap text-sm font-medium">
                    {" "}
                    Product Listing{" "}
                  </span>
                )}
              </Link>
              <Link
                href={"/products?type=" + ProductType.Auction}
                className={
                  router.asPath === "/products?type=" + ProductType.Auction
                    ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                    : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 opacity-75"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                {isOpen === "open" && (
                  <span className="ml-3 whitespace-nowrap text-sm font-medium">
                    {" "}
                    Auctions{" "}
                  </span>
                )}
              </Link>
              <Link
                href={"/products/newProduct"}
                className={
                  router.asPath === "/products/newProduct"
                    ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                    : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 opacity-75"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3.75v16.5M2.25 12h19.5M6.375 17.25a4.875 4.875 0 004.875-4.875V12m6.375 5.25a4.875 4.875 0 01-4.875-4.875V12m-9 8.25h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5zm12.621-9.44c-1.409 1.41-4.242 1.061-4.242 1.061s-.349-2.833 1.06-4.242a2.25 2.25 0 013.182 3.182zM10.773 7.63c1.409 1.409 1.06 4.242 1.06 4.242S9 12.22 7.592 10.811a2.25 2.25 0 113.182-3.182z"
                  />
                </svg>
                {isOpen === "open" && (
                  <span className="ml-3 whitespace-nowrap text-sm font-medium">
                    {" "}
                    Add Product{" "}
                  </span>
                )}
              </Link>
              {session &&
                (session.role === Role.Admin ||
                  session.role === Role.Staff ||
                  session.role === Role.SuperAdmin) && (
                  <>
                    <Link
                      href={"/products/categories"}
                      className={
                        router.asPath === "/products/categories"
                          ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                          : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5 opacity-75"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                        />
                      </svg>
                      {isOpen === "open" && (
                        <span className="ml-3 whitespace-nowrap text-sm font-medium">
                          {" "}
                          Categories{" "}
                        </span>
                      )}
                    </Link>

                    <Link
                      href={"/products/attributes"}
                      className={
                        router.asPath === "/products/attributes"
                          ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                          : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5 opacity-75"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                        />
                      </svg>
                      {isOpen === "open" && (
                        <span className="ml-3 whitespace-nowrap text-sm font-medium">
                          {" "}
                          Attributes{" "}
                        </span>
                      )}
                    </Link>
                    <Link
                      href={"/products/brands"}
                      className={
                        router.asPath === "/products/brands"
                          ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                          : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 opacity-75"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 6h.008v.008H6V6z"
                        />
                      </svg>

                      {isOpen === "open" && (
                        <span className="ml-3 whitespace-nowrap text-sm font-medium">
                          {" "}
                          Brands{" "}
                        </span>
                      )}
                    </Link>
                    <Link
                      href={"/products/conditions"}
                      className={
                        router.asPath === "/products/conditions"
                          ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                          : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 opacity-75"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                        />
                      </svg>

                      {isOpen === "open" && (
                        <span className="ml-3 whitespace-nowrap text-sm font-medium">
                          {" "}
                          Conditions{" "}
                        </span>
                      )}
                    </Link>
                  </>
                )}
            </nav>
          </details>

          <Link
            href={"/orders"}
            className={
              router.asPath.includes("/orders")
                ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 opacity-75"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            {isOpen === "open" && (
              <span className="ml-3 whitespace-nowrap text-sm font-medium">
                {" "}
                Orders{" "}
              </span>
            )}
          </Link>

          {session &&
          (session.role === Role.Admin ||
            session.role === Role.Staff ||
            session.role === Role.SuperAdmin) ? (
            <details
              className="group"
              open={isOpen === "close" || router.asPath.includes("/feedbacks")}
            >
              {isOpen === "open" ? (
                <summary className="flex cursor-pointer items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 opacity-75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                  </svg>

                  <span className="ml-3 whitespace-nowrap text-sm font-medium">
                    {" "}
                    Feedbacks{" "}
                  </span>

                  <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </summary>
              ) : (
                <summary></summary>
              )}
              <nav
                aria-label="Teams Nav"
                className={
                  isOpen === "close"
                    ? "flex flex-col border-t border-t-slate-200"
                    : "ml-8 flex flex-col"
                }
              >
                <Link
                  href={"/feedbacks/reviews"}
                  className={
                    router.asPath.includes("/feedbacks/reviews")
                      ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                      : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 opacity-75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                  {isOpen === "open" && (
                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {" "}
                      Reviews{" "}
                    </span>
                  )}
                </Link>

                <Link
                  href={"/feedbacks/UGC"}
                  className={
                    router.asPath.includes("/feedbacks/UGC")
                      ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                      : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 opacity-75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"
                    />
                  </svg>
                  {isOpen === "open" && (
                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {" "}
                      UGC Reports{" "}
                    </span>
                  )}
                </Link>

                <Link
                  href={"/feedbacks/help"}
                  className={
                    router.asPath.includes("/feedbacks/help")
                      ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                      : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 opacity-75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                  {isOpen === "open" && (
                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {" "}
                      Help Center{" "}
                    </span>
                  )}
                </Link>
              </nav>
            </details>
          ) : (
            <></>
          )}

          {session &&
            (session.role === Role.Admin ||
              session.role === Role.Staff ||
              session.role === Role.SuperAdmin) && (
              <details
                className="group"
                open={
                  isOpen === "close" || router.asPath.includes("/announcements")
                }
              >
                {isOpen === "open" ? (
                  <summary className="flex cursor-pointer items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"
                      />
                    </svg>

                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {" "}
                      Announcements{" "}
                    </span>

                    <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </summary>
                ) : (
                  <summary></summary>
                )}

                <nav
                  aria-label="Teams Nav"
                  className={
                    isOpen === "close"
                      ? "flex flex-col border-t border-t-slate-200"
                      : "ml-8 flex flex-col"
                  }
                >
                  <Link
                    href={"/announcements"}
                    className={
                      router.asPath === "/announcements"
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        Promo Code{" "}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={"/announcements/announcement"}
                    className={
                      router.asPath.includes("/announcements/announcement")
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 9h16.5m-16.5 6.75h16.5"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        Announcement{" "}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={"/announcements/ads"}
                    className={
                      router.asPath.includes("/announcements/ads")
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        Ads{" "}
                      </span>
                    )}
                  </Link>
                </nav>
              </details>
            )}

          {session &&
          (session.role === Role.Admin ||
            session.role === Role.Staff ||
            session.role === Role.SuperAdmin) ? (
            <details
              className="group"
              open={isOpen === "close" || router.asPath.includes("/gallery")}
            >
              {isOpen === "open" ? (
                <summary className="flex cursor-pointer items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 opacity-75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>

                  <span className="ml-3 whitespace-nowrap text-sm font-medium">
                    {" "}
                    Gallery{" "}
                  </span>

                  <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </summary>
              ) : (
                <summary></summary>
              )}

              <nav
                aria-label="Teams Nav"
                className={
                  isOpen === "close"
                    ? "flex flex-col border-t border-t-slate-200"
                    : "ml-8 flex flex-col"
                }
              >
                <Link
                  href={"/gallery/" + ImgType.Product}
                  className={
                    router.asPath.includes("/gallery/" + ImgType.Product)
                      ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                      : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 opacity-75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                    />
                  </svg>
                  {isOpen === "open" && (
                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {" "}
                      Products{" "}
                    </span>
                  )}
                </Link>

                <Link
                  href={"/gallery/" + ImgType.PromoCode}
                  className={
                    router.asPath.includes("/gallery/" + ImgType.PromoCode)
                      ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                      : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 opacity-75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  {isOpen === "open" && (
                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {" "}
                      Promo Code{" "}
                    </span>
                  )}
                </Link>

                <Link
                  href={"/gallery/" + ImgType.Profile}
                  className={
                    router.asPath.includes("/gallery/" + ImgType.Profile)
                      ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                      : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 opacity-75"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                  {isOpen === "open" && (
                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {" "}
                      Profile{" "}
                    </span>
                  )}
                </Link>

                <Link
                  href={"/gallery/" + ImgType.Ads}
                  className={
                    router.asPath.includes("/gallery/" + ImgType.Ads)
                      ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                      : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 opacity-75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  {isOpen === "open" && (
                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {" "}
                      Ads{" "}
                    </span>
                  )}
                </Link>

                <Link
                  href={"/gallery/" + ImgType.Category}
                  className={
                    router.asPath.includes("/gallery/" + ImgType.Category)
                      ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                      : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 opacity-75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                    />
                  </svg>
                  {isOpen === "open" && (
                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {" "}
                      Category{" "}
                    </span>
                  )}
                </Link>

                <Link
                  href={"/gallery/" + ImgType.Attribute}
                  className={
                    router.asPath.includes("/gallery/" + ImgType.Attribute)
                      ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                      : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 opacity-75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                    />
                  </svg>
                  {isOpen === "open" && (
                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {" "}
                      Attribute{" "}
                    </span>
                  )}
                </Link>

                <Link
                  href={"/gallery/" + ImgType.Others}
                  className={
                    router.asPath.includes("/gallery/" + ImgType.Others)
                      ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                      : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 opacity-75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>

                  {isOpen === "open" && (
                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {" "}
                      Others{" "}
                    </span>
                  )}
                </Link>
              </nav>
            </details>
          ) : (
            <></>
          )}

          <details
            className="group"
            open={isOpen === "close" || router.asPath.includes("/reports")}
          >
            {isOpen === "open" ? (
              <summary className="flex cursor-pointer items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 opacity-75"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>

                <span className="ml-3 whitespace-nowrap text-sm font-medium">
                  {" "}
                  Reports{" "}
                </span>

                <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </summary>
            ) : (
              <summary></summary>
            )}

            <nav
              aria-label="Teams Nav"
              className={
                isOpen === "close"
                  ? "flex flex-col border-t border-t-slate-200"
                  : "ml-8 flex flex-col"
              }
            >
              <Link
                href={"/reports/buyerLocation"}
                className={
                  router.asPath.includes("/reports/buyerLocation")
                    ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                    : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 opacity-75"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM6.262 6.072a8.25 8.25 0 1010.562-.766 4.5 4.5 0 01-1.318 1.357L14.25 7.5l.165.33a.809.809 0 01-1.086 1.085l-.604-.302a1.125 1.125 0 00-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 01-2.288 4.04l-.723.724a1.125 1.125 0 01-1.298.21l-.153-.076a1.125 1.125 0 01-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 01-.21-1.298L9.75 12l-1.64-1.64a6 6 0 01-1.676-3.257l-.172-1.03z"
                    clipRule="evenodd"
                  />
                </svg>
                {isOpen === "open" && (
                  <span className="ml-3 whitespace-nowrap text-sm font-medium">
                    {" "}
                    Buyer Location Reports{" "}
                  </span>
                )}
              </Link>
              <Link
                href={"/reports/category"}
                className={
                  router.asPath.includes("/reports/category")
                    ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                    : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 opacity-75"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                {isOpen === "open" && (
                  <span className="ml-3 whitespace-nowrap text-sm font-medium">
                    {" "}
                    Category Reports{" "}
                  </span>
                )}
              </Link>

              <Link
                href={"/reports/clicks"}
                className={
                  router.asPath.includes("/reports/clicks")
                    ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                    : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 opacity-75"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
                  />
                </svg>
                {isOpen === "open" && (
                  <span className="ml-3 whitespace-nowrap text-sm font-medium">
                    {" "}
                    Click Reports{" "}
                  </span>
                )}
              </Link>
              <Link
                href={"/reports/brands"}
                className={
                  router.asPath.includes("/reports/brands")
                    ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                    : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 opacity-75"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.5 3A2.5 2.5 0 003 5.5v2.879a2.5 2.5 0 00.732 1.767l6.5 6.5a2.5 2.5 0 003.536 0l2.878-2.878a2.5 2.5 0 000-3.536l-6.5-6.5A2.5 2.5 0 008.38 3H5.5zM6 7a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                {isOpen === "open" && (
                  <span className="ml-3 whitespace-nowrap text-sm font-medium">
                    {" "}
                    Brands Reports{" "}
                  </span>
                )}
              </Link>
            </nav>
          </details>
          {isOpen === "open" && <div className="h-[1px] w-full bg-slate-200" />}

          {session && (
            <Link
              href={
                session && session.role === Role.Seller
                  ? "/shipping%20Cost/" + encodeURIComponent(session.phoneNum)
                  : "/shipping%20Cost"
              }
              className={
                router.asPath.includes("/shipping%20Cost")
                  ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                  : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 opacity-75"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>

              {isOpen === "open" && (
                <span className="ml-3 whitespace-nowrap text-sm font-medium">
                  {" "}
                  Shipping Cost{" "}
                </span>
              )}
            </Link>
          )}

          {session &&
            (session.role === Role.Admin ||
              session.role === Role.Staff ||
              session.role === Role.SuperAdmin) && (
              <details
                className="group"
                open={isOpen === "close" || router.asPath.includes("/contents")}
              >
                {isOpen === "open" ? (
                  <summary className="flex cursor-pointer items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>

                    <span className="ml-3 whitespace-nowrap text-sm font-medium">
                      {" "}
                      Contents{" "}
                    </span>

                    <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </summary>
                ) : (
                  <summary></summary>
                )}

                <nav
                  aria-label="Teams Nav"
                  className={
                    isOpen === "close"
                      ? "flex flex-col border-t border-t-slate-200"
                      : "ml-8 flex flex-col"
                  }
                >
                  <Link
                    href={"/contents/memberships"}
                    className={
                      router.asPath.includes("/contents/memberships")
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        Memberships{" "}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={"/contents/roles"}
                    className={
                      router.asPath.includes("/contents/roles")
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        Roles{" "}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={"/contents/site"}
                    className={
                      router.asPath.includes("/contents/site")
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                      />
                    </svg>

                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        Site{" "}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={"/contents/faqs"}
                    className={
                      router.asPath.includes("/contents/faqs")
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        FAQs{" "}
                      </span>
                    )}
                  </Link>
                  <Link
                    href={"/contents/about"}
                    className={
                      router.asPath.includes("/contents/about")
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        About{" "}
                      </span>
                    )}
                  </Link>
                  <Link
                    href={"/contents/contact"}
                    className={
                      router.asPath.includes("/contents/contact")
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        Contact{" "}
                      </span>
                    )}
                  </Link>
                  <Link
                    href={"/contents/legal"}
                    className={
                      router.asPath.includes("/contents/legal")
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        Legal{" "}
                      </span>
                    )}
                  </Link>
                  <Link
                    href={"/contents/townships"}
                    className={
                      router.asPath.includes("/contents/townships")
                        ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                        : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 opacity-75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                      />
                    </svg>
                    {isOpen === "open" && (
                      <span className="ml-3 whitespace-nowrap text-sm font-medium">
                        {" "}
                        Townships{" "}
                      </span>
                    )}
                  </Link>
                </nav>
              </details>
            )}
          {session &&
            (session.role === Role.Admin ||
              session.role === Role.Staff ||
              session.role === Role.SuperAdmin) && (
              <Link
                href={"/configurations"}
                className={
                  router.asPath.includes("/configurations")
                    ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                    : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 opacity-75"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {isOpen === "open" && (
                  <span className="ml-3 whitespace-nowrap text-sm font-medium">
                    {" "}
                    Configurations{" "}
                  </span>
                )}
              </Link>
            )}

          <details
            className="group"
            open={isOpen === "close" || router.asPath.includes("/account")}
          >
            {isOpen === "open" ? (
              <summary className="flex cursor-pointer items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 opacity-75"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>

                <span className="ml-3 whitespace-nowrap text-sm font-medium">
                  {" "}
                  Account{" "}
                </span>

                <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </summary>
            ) : (
              <summary></summary>
            )}

            <nav
              aria-label="Account Nav"
              className={
                isOpen === "close"
                  ? "flex flex-col border-t border-t-slate-200"
                  : "ml-8 flex flex-col"
              }
            >
              <Link
                href={"/account/" + encodeURIComponent(session.phoneNum)}
                className={
                  router.asPath.includes("/account/" + session.phoneNum)
                    ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                    : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 opacity-75"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
                {isOpen === "open" && (
                  <span className="ml-3 whitespace-nowrap text-sm font-medium">
                    {" "}
                    Profile{" "}
                  </span>
                )}
              </Link>

              <Link
                href={
                  "/account/" +
                  encodeURIComponent(session.phoneNum) +
                  "?action=" +
                  Action.Edit +
                  "&step=Password"
                }
                className={
                  router.asPath ===
                  "/account/" +
                    encodeURIComponent(session.phoneNum) +
                    "?action=" +
                    Action.Edit +
                    "&step=Password"
                    ? "active-route flex items-center bg-gray-100 px-4 py-2 text-gray-700"
                    : "flex items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 opacity-75"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                  />
                </svg>
                {isOpen === "open" && (
                  <span className="ml-3 whitespace-nowrap text-sm font-medium">
                    {" "}
                    Change Password{" "}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 opacity-75"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                {isOpen === "open" && (
                  <span className="ml-3 whitespace-nowrap text-sm font-medium">
                    {" "}
                    Logout{" "}
                  </span>
                )}
              </button>
            </nav>
          </details>
        </nav>
      </div>

      {isOpen === "open" && (
        <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
          <div className="flex shrink-0 items-center bg-white p-4 hover:bg-gray-50">
            <div className="ml-1.5">
              <p className="text-xs">
                <strong className="block font-medium">
                  Designed by DigiSoft (Myanmar)
                </strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSidebar;
