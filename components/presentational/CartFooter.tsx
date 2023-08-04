import { useMarketplace } from "@/context/MarketplaceContext";
import { formatAmount } from "@/util/textHelper";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

function CartFooter({ isModal }: { isModal: boolean }) {
  const router = useRouter();
  const { locale } = router;
  const { subTotal, shippingFee, promoTotal, totalPrice } = useMarketplace();
  return (
    <div
      className={`${
        isModal === true ? "absolute bottom-0 left-0 right-0" : ""
      } px-5 flex flex-col border-t pt-3 bg-white pb-5`}
    >
      <div className="flex flex-row items-center">
        <label className="flex flex-grow py-2 text-sm font-semibold">
          Sub Total
        </label>
        <p className="py-2 text-sm font-semibold text-primary">
          {formatAmount(subTotal, locale, true)}
        </p>
      </div>
      <div className="flex flex-row items-center">
        <label className="flex flex-grow py-2 text-sm font-semibold">
          Shipping Total
        </label>
        <p className="py-2 text-sm font-semibold text-primary">
          {formatAmount(
            shippingFee
              .map((z) =>
                z.isFreeShipping === true
                  ? 0
                  : z.shippingFee
                  ? z.shippingFee
                  : 0
              )
              .reduce((a, b) => a + b, 0),
            locale,
            true
          )}
        </p>
      </div>
      <div className="flex flex-row items-center">
        <label className="flex flex-grow py-2 text-sm font-semibold">
          Promo Code Discount
        </label>
        <p className="py-2 text-sm font-semibold text-primary">
          {formatAmount(promoTotal, locale, true)}
        </p>
      </div>
      <div className="flex flex-row items-center">
        <label className="flex flex-grow py-2 text-sm font-semibold">
          Total
        </label>
        <p className="py-2 text-sm font-semibold text-primary">
          {formatAmount(totalPrice, locale, true)}
        </p>
      </div>
      {isModal === true && (
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
      )}
    </div>
  );
}

export default CartFooter;
