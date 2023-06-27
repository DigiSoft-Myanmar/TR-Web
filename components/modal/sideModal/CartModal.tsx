import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useMarketplace } from "@/context/MarketplaceContext";
import { formatAmount, getText } from "@/util/textHelper";
import { Brand, Product, ProductType, User } from "@prisma/client";
import { fileUrl } from "@/types/const";
import { useTranslation } from "next-i18next";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import { CartItem } from "@/prisma/models/cartItems";
import Link from "next/link";
import { DeliveryType } from "@/types/orderTypes";
import Avatar from "@/components/presentational/Avatar";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
}

function CartModal({ isModalOpen, setModalOpen }: Props) {
  const router = useRouter();
  const {
    cartItems,
    productDetails,
    subTotal,
    modifyCount,
    shippingFee,
    sellerDetails,
  } = useMarketplace();
  const { locale } = router;

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

  return productDetails && productDetails.length > 0 ? (
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
              <div className="absolute top-0 right-0 bottom-0 flex min-w-[300px] max-w-md transform overflow-auto rounded-l-xl bg-primary shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto bg-gray-100 p-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="flex items-center text-lg font-medium leading-6 text-primary"
                  >
                    <h3 className="flex-grow text-primary">
                      Cart x{" "}
                      <span className="text-diamond font-semibold">
                        {formatAmount(
                          cartItems
                            .map((e: CartItem) => e.quantity)
                            .reduce((a: number, b: number) => a + b, 0),
                          locale,
                          false
                        )}
                      </span>
                    </h3>
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
                  <div className="mt-6 flex flex-col gap-3">
                    {sellerDetails.length > 0
                      ? sellerDetails.map((b: User, index: number) => (
                          <React.Fragment key={index}>
                            <details className="group min-w-[300px] cursor-pointer rounded-md bg-white px-3">
                              <summary className="flex w-full min-w-[293px] flex-row items-center gap-3 py-3">
                                <div className="flex flex-col items-center gap-1">
                                  <Avatar
                                    username={b.username}
                                    profile={b.profile}
                                    isLarge={true}
                                  />
                                </div>
                                <div className="flex w-full flex-grow flex-col space-y-1 pr-3">
                                  <h3 className="text-linear truncate py-1 text-xs font-semibold">
                                    {b.username} x{" "}
                                    {cartItems
                                      .filter((e) => e.sellerId === b.id)
                                      .map((z) => z.quantity)
                                      .reduce((a, b) => a + b, 0)}
                                  </h3>
                                  <p className="truncate text-sm font-semibold text-primary">
                                    {formatAmount(
                                      cartItems
                                        .filter((e) => e.sellerId === b.id)
                                        .map((z) =>
                                          z.salePrice
                                            ? z.salePrice * z.quantity
                                            : z.normalPrice * z.quantity
                                        )
                                        .reduce((a, b) => a + b, 0),
                                      locale,
                                      true
                                    )}
                                  </p>
                                  <div className="flex w-full flex-row items-center gap-3">
                                    {shippingFee.find(
                                      (e) => e.sellerId === b.id
                                    ) === undefined ? (
                                      <span className="mt-1 text-xs text-error">
                                        Please provide delivery address.
                                      </span>
                                    ) : (
                                      <></>
                                    )}
                                  </div>
                                </div>
                                <div className="transition duration-300 group-open:-rotate-180">
                                  <svg
                                    aria-hidden="true"
                                    className="ml-1 h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                </div>
                              </summary>
                              <div className="flex flex-col divide-y divide-primary">
                                {cartItems
                                  .filter((z) => z.sellerId === b.id)
                                  .map((e: CartItem, index: number) => (
                                    <div
                                      key={index}
                                      className="min-w-[300px] bg-gray-200 px-3"
                                    >
                                      <div className="flex min-w-[293px] flex-row items-stretch gap-3 py-3">
                                        <div className="flex flex-col items-center gap-1">
                                          <Image
                                            src={
                                              e.variation && e.variation.img
                                                ? fileUrl + e.variation.img
                                                : fileUrl +
                                                  productDetails.find(
                                                    (p: Product) =>
                                                      e.productId === p.id
                                                  )!.imgList[0]
                                            }
                                            className="h-[100px] w-[100px] object-contain"
                                            alt={
                                              productDetails.find(
                                                (p: Product) =>
                                                  e.productId === p.id
                                              )!.name!
                                            }
                                            width={100}
                                            height={100}
                                            quality={100}
                                          />
                                        </div>
                                        <div className="flex w-full flex-grow flex-col space-y-1 pr-3">
                                          <span className="text-[10px] font-semibold text-primary">
                                            {
                                              productDetails.find(
                                                (p: Product) =>
                                                  e.productId === p.id
                                              )?.seller.username
                                            }
                                          </span>
                                          <h3 className="text-linear truncate py-1 text-xs font-semibold">
                                            {getText(
                                              productDetails.find(
                                                (p: Product) =>
                                                  e.productId === p.id
                                              )?.name,
                                              productDetails.find(
                                                (p: Product) =>
                                                  e.productId === p.id
                                              )?.nameMM,
                                              locale
                                            )}
                                          </h3>
                                          <p className="truncate text-sm font-semibold text-primary">
                                            {formatAmount(
                                              e.salePrice
                                                ? e.salePrice
                                                : e.normalPrice,
                                              locale,
                                              true
                                            )}
                                          </p>
                                          <div className="flex w-full flex-row items-center gap-3">
                                            <div className="flex flex-grow flex-row items-center gap-3">
                                              <button
                                                onClick={(evt) => {
                                                  evt.stopPropagation();
                                                  evt.preventDefault();
                                                  modifyCount(
                                                    e.productId,
                                                    e.quantity - 1
                                                  );
                                                }}
                                                className="rounded-md p-1 transition-colors duration-200 hover:bg-primary hover:text-white"
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  viewBox="0 0 20 20"
                                                  fill="currentColor"
                                                  className="h-5 w-5"
                                                >
                                                  <path d="M6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" />
                                                </svg>
                                              </button>
                                              <span className="py-2 text-sm leading-6">
                                                {formatAmount(
                                                  e.quantity,
                                                  locale,
                                                  false
                                                )}
                                              </span>
                                              <button
                                                onClick={(evt) => {
                                                  evt.stopPropagation();
                                                  evt.preventDefault();
                                                  modifyCount(
                                                    e.productId,
                                                    e.quantity + 1
                                                  );
                                                }}
                                                className="rounded-md p-1 transition-colors duration-200 hover:bg-primary hover:text-white"
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  viewBox="0 0 20 20"
                                                  fill="currentColor"
                                                  className="h-5 w-5"
                                                >
                                                  <path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
                                                </svg>
                                              </button>
                                            </div>
                                            <div className="flex flex-grow items-center justify-end space-x-1">
                                              <button
                                                onClick={(evt) => {
                                                  evt.stopPropagation();
                                                  evt.preventDefault();
                                                  modifyCount(e.productId, 0);
                                                }}
                                                className="rounded-md p-1 text-error transition-colors duration-200 hover:bg-error hover:text-white"
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  strokeWidth={1.5}
                                                  stroke="currentColor"
                                                  className="h-5 w-5"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                                  />
                                                </svg>
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </details>
                          </React.Fragment>
                        ))
                      : cartItems.map((e: CartItem, index: number) => (
                          <div
                            key={index}
                            className="min-w-[300px] rounded-md px-3"
                          >
                            <div className="flex min-w-[293px] flex-row items-stretch justify-between gap-3 py-3">
                              <div className="flex flex-col items-center gap-1">
                                <Image
                                  src={
                                    e.variation && e.variation.img
                                      ? fileUrl + e.variation.img
                                      : fileUrl +
                                        productDetails.find(
                                          (p: Product) => e.productId === p.id
                                        )!.imgList[0]
                                  }
                                  className="h-[100px] w-[100px] object-contain"
                                  alt={
                                    productDetails.find(
                                      (p: Product) => e.productId === p.id
                                    )!.name!
                                  }
                                  width={100}
                                  height={100}
                                  quality={100}
                                />
                              </div>
                              <div className="flex w-full flex-grow flex-col space-y-1 pr-3">
                                <span className="text-[10px] font-semibold text-primary">
                                  {
                                    productDetails.find(
                                      (p: Product) => e.productId === p.id
                                    )?.seller.username
                                  }
                                </span>
                                <h3 className="text-linear truncate py-1 text-xs font-semibold">
                                  {getText(
                                    productDetails.find(
                                      (p: Product) => e.productId === p.id
                                    )?.name,
                                    productDetails.find(
                                      (p: Product) => e.productId === p.id
                                    )?.nameMM,
                                    locale
                                  )}
                                </h3>
                                <p className="truncate text-sm font-semibold text-primary">
                                  {formatAmount(
                                    e.salePrice ? e.salePrice : e.normalPrice,
                                    locale,
                                    true
                                  )}
                                </p>
                                <div className="flex w-full flex-row items-center gap-3">
                                  <div className="flex flex-grow flex-row items-center gap-3">
                                    <button
                                      onClick={(evt) => {
                                        evt.stopPropagation();
                                        evt.preventDefault();
                                        modifyCount(
                                          e.productId,
                                          e.quantity - 1
                                        );
                                      }}
                                      className="rounded-md p-1 transition-colors duration-200 hover:bg-primary hover:text-white"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="h-5 w-5"
                                      >
                                        <path d="M6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" />
                                      </svg>
                                    </button>
                                    <span className="py-2 text-sm leading-6">
                                      {formatAmount(e.quantity, locale, false)}
                                    </span>
                                    <button
                                      onClick={(evt) => {
                                        evt.stopPropagation();
                                        evt.preventDefault();
                                        modifyCount(
                                          e.productId,
                                          e.quantity + 1
                                        );
                                      }}
                                      className="rounded-md p-1 transition-colors duration-200 hover:bg-primary hover:text-white"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="h-5 w-5"
                                      >
                                        <path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
                                      </svg>
                                    </button>
                                  </div>
                                  <div className="flex flex-grow items-center justify-end space-x-1">
                                    <button
                                      onClick={(evt) => {
                                        evt.stopPropagation();
                                        evt.preventDefault();
                                        modifyCount(e.productId, 0);
                                      }}
                                      className="rounded-md p-1 text-error transition-colors duration-200 hover:bg-error hover:text-white"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="h-5 w-5"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                  </div>

                  <div className="mt-5 flex flex-row items-center">
                    <label className="flex flex-grow py-2 text-sm font-semibold">
                      Sub Total
                    </label>
                    <p className="py-2 text-sm font-semibold text-primary">
                      {formatAmount(subTotal, locale, true)}
                    </p>
                  </div>

                  <div className="mt-4 flex w-full justify-center">
                    <Link
                      className="group relative inline-flex items-center overflow-hidden rounded bg-primary px-8 py-3 text-white focus:outline-none focus:ring active:bg-primary"
                      href="/checkout"
                    >
                      <span className="absolute right-0 translate-x-full transition-transform group-hover:-translate-x-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                          />
                        </svg>
                      </span>

                      <span className="text-sm font-medium transition-all group-hover:mr-4">
                        Checkout
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      {/*  <ProductModal
          isModalOpen={isProductModalOpen}
          cartItemDetails={cartItemDetails}
          setCartItemDetails={setCartItemDetails}
          setModalOpen={setProductModalOpen}
          canReview={false}
          attributeList={attributeList}
        /> */}
    </>
  ) : (
    <></>
  );
}

export default CartModal;
