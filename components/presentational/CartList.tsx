import { useMarketplace } from "@/context/MarketplaceContext";
import { Product, User } from "@prisma/client";
import React from "react";
import Avatar from "./Avatar";
import { formatAmount, getText } from "@/util/textHelper";
import { useRouter } from "next/router";
import BuyerPromoDialog from "../modal/dialog/BuyerPromoDialog";
import { CartItem } from "@/prisma/models/cartItems";
import Image from "next/image";
import { fileUrl } from "@/types/const";
import { getPriceDiscount } from "@/util/pricing";

function CartList() {
  const router = useRouter();
  const { locale } = router;
  const {
    sellerDetails,
    cartItems,
    shippingFee,
    promoCode,
    productDetails,
    modifyCount,
    attributes,
    subTotal,
    promoTotal,
    totalPrice,
  } = useMarketplace();
  const [isPromoModalOpen, setPromoModalOpen] = React.useState(false);
  const [sellerId, setSellerId] = React.useState("");
  const [seller, setSeller] = React.useState<any>(undefined);

  return (
    <>
      <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto scrollbar-hide">
        {sellerDetails.map((b: User, index: number) => (
          <React.Fragment key={index}>
            <details
              className="group lg:min-w-[400px] lg:max-w-[400px] cursor-pointer bg-white px-3"
              open
            >
              <summary className="sticky top-0 flex w-full min-w-[293px] flex-row items-center gap-3 py-3 bg-white border-b">
                <div className="flex flex-col items-center gap-1">
                  <Avatar
                    username={b.username}
                    profile={b.profile}
                    isLarge={true}
                  />
                </div>
                <div className="flex w-full flex-grow flex-col space-y-1 pr-3">
                  <h3 className="text-linear truncate py-1 text-xs font-semibold">
                    {b.username}{" "}
                    <span className="text-primary">
                      (
                      {cartItems
                        .filter((e) => e.sellerId === b.id)
                        .map((z) => z.quantity)
                        .reduce((a, b) => a + b, 0)}
                      )
                    </span>
                  </h3>
                  <p className="truncate text-sm font-semibold">
                    Subtotal:{" "}
                    <span className="text-primary">
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
                    </span>
                  </p>
                  <div className="flex w-full flex-row items-center gap-3 mt-1 flex-wrap">
                    <div className="flex flex-row items-center gap-1">
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

                      {shippingFee.find((e) => e.sellerId === b.id) ===
                      undefined ? (
                        <span className="text-xs">
                          Please provide delivery address.
                        </span>
                      ) : (
                        <span className="text-xs">
                          {shippingFee.find((e) => e.sellerId === b.id)
                            .isFreeShipping === true
                            ? "Free Shipping"
                            : formatAmount(
                                shippingFee.find((e) => e.sellerId === b.id)
                                  .shippingFee,
                                locale,
                                true
                              )}
                        </span>
                      )}
                    </div>
                    {promoCode.find((z) => z.sellerId === b.id) ? (
                      <button
                        className="flex flex-row items-center gap-1 bg-primary p-2 rounded-md text-center text-white"
                        type="button"
                        onClick={() => {
                          setSellerId(b.id);
                          setPromoModalOpen(true);
                          setSeller(b);
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
                            d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>
                        <span className="text-xs">
                          {promoCode.find((z) => z.sellerId === b.id).isPercent
                            ? formatAmount(
                                promoCode.find((z) => z.sellerId === b.id)
                                  .discount,
                                locale
                              ) + "%"
                            : formatAmount(
                                promoCode.find((z) => z.sellerId === b.id)
                                  .discount,
                                locale,
                                true
                              )}
                        </span>
                      </button>
                    ) : (
                      <button
                        className="flex flex-row items-center gap-1 bg-primary p-2 rounded-md text-center text-white"
                        type="button"
                        onClick={() => {
                          setSellerId(b.id);
                          setPromoModalOpen(true);
                          setSeller(b);
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
                            d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>
                        <span className="text-xs">Apply promo code</span>
                      </button>
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
              <div className="flex flex-col divide-y divide-primary border p-3 rounded-md bg-gray-100">
                {cartItems
                  .filter((z) => z.sellerId === b.id)
                  .map((e: CartItem, index: number) => (
                    <div key={index} className="min-w-[300px] bg-white px-3">
                      <div className="flex min-w-[293px] flex-row items-stretch gap-3 py-3">
                        <div className="flex flex-col items-center gap-1 justify-between">
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
                          <button
                            onClick={(evt) => {
                              evt.stopPropagation();
                              evt.preventDefault();
                              modifyCount(e.productId, 0);
                            }}
                            className="rounded-md px-2 py-1 text-error transition-colors duration-200 hover:bg-error hover:text-white flex flex-row items-center mt-1"
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
                            <span className="text-xs ml-1">Remove</span>
                          </button>
                        </div>
                        <div className="flex w-full flex-grow flex-col space-y-1 pr-3">
                          <span className="text-xs font-semibold text-primary">
                            {
                              productDetails.find(
                                (p: Product) => e.productId === p.id
                              )?.Brand.name
                            }
                          </span>
                          <h3 className="text-linear truncate py-1 text-sm font-semibold">
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
                          {e.variation && (
                            <div className="flex flex-wrap gap-3 items-start pb-1">
                              {e.variation.attributes.map((z: any, index) => (
                                <p className="text-sm font-light" key={index}>
                                  {getText(
                                    attributes?.find(
                                      (b: any) => b.id === z.attributeId
                                    )?.name,
                                    attributes?.find(
                                      (b: any) => b.id === z.attributeId
                                    )?.nameMM,
                                    locale
                                  )}{" "}
                                  :{" "}
                                  <span className="text-primaryText font-medium">
                                    {getText(z.name, z.nameMM, locale)}
                                  </span>
                                </p>
                              ))}
                            </div>
                          )}
                          <p className="truncate text-xs font-semibold">
                            Unit Price:{" "}
                            <span className="text-primary text-sm">
                              {formatAmount(
                                e.salePrice ? e.salePrice : e.normalPrice,
                                locale,
                                true
                              )}
                            </span>
                          </p>
                          {e.salePrice > 0 ? (
                            <span className="text-xs bg-warning/20 text-warning w-fit p-2 rounded-md font-semibold">
                              Discount:{" "}
                              {getPriceDiscount(e.normalPrice, e.salePrice)}%
                            </span>
                          ) : (
                            <></>
                          )}

                          <div className="flex w-full flex-row items-center gap-3"></div>
                        </div>
                        <div className="flex flex-grow flex-col items-center gap-1">
                          <button
                            onClick={(evt) => {
                              evt.stopPropagation();
                              evt.preventDefault();
                              modifyCount(e.productId, e.quantity - 1);
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
                              modifyCount(e.productId, e.quantity + 1);
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
                      </div>
                    </div>
                  ))}
              </div>
            </details>
          </React.Fragment>
        ))}
      </div>

      <BuyerPromoDialog
        isModalOpen={isPromoModalOpen}
        setModalOpen={setPromoModalOpen}
        sellerId={sellerId}
        seller={seller}
        totalAmount={cartItems
          .filter((e) => e.sellerId === sellerId)
          .map((z) =>
            z.salePrice ? z.salePrice * z.quantity : z.normalPrice * z.quantity
          )
          .reduce((a, b) => a + b, 0)}
      />
    </>
  );
}

export default CartList;
