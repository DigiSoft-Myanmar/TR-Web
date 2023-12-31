import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import { useTranslation } from "next-i18next";
import { Category, Role } from "@prisma/client";
import { getText } from "@/util/textHelper";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { fileUrl } from "@/types/const";
import { encryptPhone } from "@/util/encrypt";
import { getHeaders } from "@/util/authHelper";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
}

function BuyerDrawer({ isModalOpen, setModalOpen }: Props) {
  const router = useRouter();
  const { locale } = router;
  const { accessKey } = router.query;
  const { data: session }: any = useSession();

  const { t } = useTranslation("common");
  const { data } = useSWR("/api/products/categories", fetcher);
  const [isTrackModalOpen, setTrackModalOpen] = React.useState(false);

  React.useEffect(() => {
    router.beforePopState(({ as }) => {
      if (as !== router.asPath) {
        if (isModalOpen === true) {
          setModalOpen(false);
          return false;
        }
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [router, isModalOpen, setModalOpen]);

  React.useEffect(() => {
    setModalOpen(false);
  }, [router.asPath]);
  return (
    <>
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            {isModalOpen === true && (
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
              </Transition.Child>
            )}

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute left-0 top-0 bottom-0 flex min-w-[400px] max-w-md transform overflow-auto rounded-r-xl bg-primary shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto bg-white px-6 pt-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="flex items-center text-lg font-medium leading-6"
                  >
                    <div className="flex flex-grow items-center space-x-3">
                      <Image
                        src="/assets/logo_full.png"
                        height={50}
                        width={120}
                        className="h-[50px] object-contain"
                        alt="logo"
                      />
                    </div>
                    <span className="block">
                      <button
                        className="block shrink-0 rounded-lg bg-white p-2.5 text-gray-600 shadow-sm hover:text-gray-700"
                        onClick={() => {
                          router.push(router.route, router.asPath, {
                            locale:
                              router && router.locale === "mm" ? "en" : "mm",
                          });
                        }}
                      >
                        <span className="sr-only">Language</span>
                        {router && router.locale && router.locale === "mm" ? (
                          <Image
                            src="/assets/icon/myanmar.svg"
                            width={20}
                            height={20}
                            className="h-5 w-5"
                            alt="english"
                          />
                        ) : (
                          <Image
                            src="/assets/icon/eng.svg"
                            width={20}
                            height={20}
                            className="h-5 w-5"
                            alt="english"
                          />
                        )}
                      </button>
                    </span>
                    <button
                      className="bg-lightShade flex rounded-md p-2 focus:outline-none"
                      onClick={() => setModalOpen(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </Dialog.Title>
                  <div className="mt-2">
                    <form
                      onSubmit={(event: any) => {
                        const search = event.target.search.value;
                        router.push(
                          "/marketplace?search=" + encodeURIComponent(search)
                        );
                        event.preventDefault();
                      }}
                    >
                      <div className="flex">
                        <div className="relative w-full">
                          <input
                            name="search"
                            type="search"
                            id="search-dropdown"
                            className="text-primaryText z-20  block w-full rounded-lg border border-l-2 border-gray-300 bg-gray-50 p-2.5 text-sm"
                            placeholder={t("search") + "..."}
                            required
                          />
                          <button
                            type="submit"
                            className="absolute top-0 right-0 rounded-r-lg border bg-primary p-2.5 text-sm font-medium text-white hover:bg-primary-focus focus:outline-none"
                          >
                            <svg
                              aria-hidden="true"
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              ></path>
                            </svg>
                            <span className="sr-only">Search</span>
                          </button>
                        </div>
                      </div>
                    </form>
                    <div className="mt-5 flow-root">
                      <nav
                        aria-label="Main Nav"
                        className="flex flex-col space-y-2"
                      >
                        <div>
                          <strong className="block text-xs font-medium uppercase text-gray-400">
                            {getText("General", "အထွေထွေ", locale)}
                          </strong>

                          <ul className="mt-2 space-y-1">
                            <li>
                              <Link
                                href={
                                  accessKey ? "/?accessKey=" + accessKey : "/"
                                }
                                className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${
                                  router.asPath === "/"
                                    ? "bg-gray-100"
                                    : "hover:bg-gray-100 hover:text-gray-700"
                                } `}
                              >
                                {t("home")}
                              </Link>
                            </li>

                            <li>
                              <Link
                                href={
                                  accessKey
                                    ? "/marketplace?accessKey=" + accessKey
                                    : "/marketplace"
                                }
                                className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${
                                  router.asPath.includes("/marketplace") &&
                                  router.asPath !== "/marketplace?deals=Hot"
                                    ? "bg-gray-100"
                                    : "hover:bg-gray-100 hover:text-gray-700"
                                } `}
                              >
                                {t("marketplace")}
                              </Link>
                            </li>

                            <li>
                              <Link
                                href={
                                  accessKey
                                    ? "/brands?accessKey=" + accessKey
                                    : "/brands"
                                }
                                className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${
                                  router.asPath.includes("/brands")
                                    ? "bg-gray-100"
                                    : "hover:bg-gray-100 hover:text-gray-700"
                                } `}
                              >
                                {t("brands")}
                              </Link>
                            </li>

                            <li>
                              <Link
                                href={
                                  accessKey
                                    ? "/marketplace?deals=Hot&accessKey=" +
                                      accessKey
                                    : "/marketplace?deals=Hot"
                                }
                                className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${
                                  router.asPath === "/marketplace?deals=Hot"
                                    ? "bg-gray-100"
                                    : "hover:bg-gray-100 hover:text-gray-700"
                                } `}
                              >
                                {t("hotOffers")}
                              </Link>
                            </li>

                            <li>
                              <button
                                type="button"
                                onClick={() => {
                                  setTrackModalOpen(true);
                                }}
                                className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                              >
                                {t("trackMyOrder")}
                              </button>
                            </li>

                            <li>
                              <Link
                                href={"/memberships"}
                                className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${
                                  router.asPath.includes("/memberships")
                                    ? "bg-gray-100"
                                    : "hover:bg-gray-100 hover:text-gray-700"
                                } `}
                              >
                                {t("sellProducts")}
                              </Link>
                            </li>

                            <li>
                              <Link
                                href={
                                  accessKey
                                    ? "/recent?accessKey=" + accessKey
                                    : "/recent"
                                }
                                className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${
                                  router.asPath === "/recent"
                                    ? "bg-gray-100"
                                    : "hover:bg-gray-100 hover:text-gray-700"
                                } `}
                              >
                                {t("recentlyViewed")}
                              </Link>
                            </li>
                          </ul>
                        </div>

                        {data && (
                          <div>
                            <strong className="block text-xs font-medium uppercase text-gray-400">
                              {t("categories")}
                            </strong>

                            <ul className="mt-2 space-y-1">
                              {data.map((e: Category, index: number) => (
                                <li key={index}>
                                  <Link
                                    href={
                                      accessKey
                                        ? "/marketplace?categories=" +
                                          encodeURIComponent(e.slug) +
                                          "&accessKey=" +
                                          accessKey
                                        : "/marketplace?categories=" +
                                          encodeURIComponent(e.slug)
                                    }
                                    className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${
                                      router.asPath.includes(
                                        "/marketplace?categories=" +
                                          encodeURIComponent(e.slug)
                                      )
                                        ? "bg-gray-100"
                                        : "hover:bg-gray-100 hover:text-gray-700"
                                    } `}
                                  >
                                    {getText(e.name, e.nameMM, locale)}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {session ? (
                          <div>
                            <strong className="block text-xs font-medium uppercase text-gray-400">
                              Profile
                            </strong>

                            <ul className="mt-2 space-y-1">
                              <li>
                                <Link
                                  href={
                                    accessKey
                                      ? "/account/" +
                                        encodeURIComponent(
                                          encryptPhone(session.phoneNum)
                                        ) +
                                        "?accessKey=" +
                                        accessKey
                                      : "/account/" +
                                        encodeURIComponent(
                                          encryptPhone(session.phoneNum)
                                        )
                                  }
                                  className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${
                                    router.asPath.includes(
                                      "/account/" +
                                        encodeURIComponent(
                                          encryptPhone(session.phoneNum)
                                        )
                                    )
                                      ? "bg-gray-100"
                                      : "hover:bg-gray-100 hover:text-gray-700"
                                  } `}
                                >
                                  {t("profile")}
                                </Link>
                              </li>

                              <li>
                                <Link
                                  href={
                                    accessKey
                                      ? "/orders?accessKey=" + accessKey
                                      : "/orders"
                                  }
                                  className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${
                                    router.asPath.includes("/orders")
                                      ? "bg-gray-100"
                                      : "hover:bg-gray-100 hover:text-gray-700"
                                  } `}
                                >
                                  {t("orders")}
                                </Link>
                              </li>

                              <li>
                                <Link
                                  href={
                                    "/account/" +
                                    encodeURIComponent(
                                      encryptPhone(session.phoneNum)
                                    ) +
                                    "#address"
                                  }
                                  className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${
                                    router.asPath.includes(
                                      "/account/" +
                                        encodeURIComponent(
                                          encryptPhone(session.phoneNum)
                                        ) +
                                        "#address"
                                    )
                                      ? "bg-gray-100"
                                      : "hover:bg-gray-100 hover:text-gray-700"
                                  } `}
                                >
                                  {t("address")}
                                </Link>
                              </li>

                              <li>
                                <Link
                                  href={
                                    "/account/" +
                                    encodeURIComponent(
                                      encryptPhone(session.phoneNum)
                                    ) +
                                    "#wishlist"
                                  }
                                  className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${
                                    router.asPath.includes(
                                      "/account/" +
                                        encodeURIComponent(
                                          encryptPhone(session.phoneNum)
                                        ) +
                                        "#wishlist"
                                    )
                                      ? "bg-gray-100"
                                      : "hover:bg-gray-100 hover:text-gray-700"
                                  } `}
                                >
                                  {getText(
                                    "Wishlist",
                                    "ကြိုက်နှစ်သက်သည့်ပစ္စည်းများ",
                                    locale
                                  )}
                                </Link>
                              </li>
                            </ul>
                          </div>
                        ) : (
                          <></>
                        )}

                        <div>
                          <strong className="block text-xs font-medium uppercase text-gray-400">
                            {getText(
                              "Helpful Links",
                              "အသုံးဝင်သောလင့်ခ်များ",
                              locale
                            )}
                          </strong>

                          <ul className="mt-2 space-y-1">
                            <li>
                              <Link
                                href={
                                  accessKey
                                    ? "/about?accessKey=" + accessKey
                                    : "/about"
                                }
                                className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${
                                  router.asPath === "/about"
                                    ? "bg-gray-100"
                                    : "hover:bg-gray-100 hover:text-gray-700"
                                } `}
                              >
                                {t("about")}
                              </Link>
                            </li>

                            <li>
                              <Link
                                href={
                                  accessKey
                                    ? "/about#contact?accessKey=" + accessKey
                                    : "/about#contact"
                                }
                                className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${
                                  router.asPath === "/about#contact"
                                    ? "bg-gray-100"
                                    : "hover:bg-gray-100 hover:text-gray-700"
                                } `}
                              >
                                {t("contact")}
                              </Link>
                            </li>
                            <li>
                              <Link
                                href={
                                  accessKey
                                    ? "/faqs?accessKey=" + accessKey
                                    : "/faqs"
                                }
                                className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 ${
                                  router.asPath === "/faqs"
                                    ? "bg-gray-100"
                                    : "hover:bg-gray-100 hover:text-gray-700"
                                } `}
                              >
                                {t("faqs")}
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </nav>

                      <div className="sticky inset-x-0 bottom-0 -mx-6 border-t border-gray-100 px-3">
                        {session ? (
                          <div className="flex w-full items-center gap-2 bg-white p-4 text-left">
                            {session.profile ? (
                              <Image
                                alt="profile"
                                width={40}
                                height={40}
                                src={fileUrl + session.profile}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <></>
                            )}

                            <div className="flex-grow">
                              <p className="text-xs">
                                <strong className="block font-medium">
                                  {session.username}
                                </strong>

                                <span> {session.phoneNum} </span>
                              </p>
                            </div>
                            <button
                              className="text-primaryText rounded-md p-2 transition-colors hover:bg-primary hover:text-white"
                              type="button"
                              onClick={() => {
                                fetch(
                                  "/api/user/" +
                                    encodeURIComponent(session.phoneNum) +
                                    "/stats",
                                  {
                                    method: "PUT",
                                    body: JSON.stringify({
                                      id: session.id,
                                      lastOnlineTime: undefined,
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
                                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex w-full items-center gap-2 bg-white p-4 text-left">
                            <div className="flex-grow">
                              <p className="text-xs">
                                <strong className="block font-medium">
                                  {getText(
                                    `Don't have an account? `,
                                    "အကောင့်မရှိပါသဖြင့်",
                                    locale
                                  )}
                                </strong>

                                <Link
                                  className="underline"
                                  href={
                                    accessKey
                                      ? "/register?accessKey=" + accessKey
                                      : "/register"
                                  }
                                >
                                  {getText(
                                    "Register",
                                    "အကောင့်အသစ်ပြုလုပ်ရန်",
                                    locale
                                  )}
                                </Link>
                              </p>
                            </div>
                            <Link
                              className="text-primaryText rounded-md p-2 transition-colors hover:bg-primary hover:text-white"
                              href={
                                accessKey
                                  ? "/login?accessKey=" + accessKey
                                  : "/login"
                              }
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
                                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                                />
                              </svg>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default BuyerDrawer;
