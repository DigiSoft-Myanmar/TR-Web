import { fileUrl } from "@/types/const";
import { formatAmount } from "@/util/textHelper";
import { Brand } from "@prisma/client";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

function BrandUserSection({
  brand,
  phoneNum,
}: {
  brand: any;
  phoneNum: string;
}) {
  const { locale } = useRouter();
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 bg-white p-5 shadow-md">
        <Image
          src={fileUrl + brand.brandBanner}
          width={400}
          height={200}
          alt="Cover"
          className="rounded-t-md"
        />
        <div className="flex w-full flex-row items-center space-x-3 p-5">
          <Image
            src={fileUrl + brand.brandLogo}
            width={100}
            height={100}
            alt="Logo"
            className="object-contain"
          />
          <div className="flex flex-grow flex-col space-y-1">
            <h3 className="text-sm font-semibold">{brand.brandName}</h3>

            <p className="text-xs font-light">From {brand.state.name}</p>
            <div className="my-1.5 flex flex-row items-center space-x-1">
              {brand.ratingCount === 0 ? (
                <p className="text-xs font-semibold">No Rating</p>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4 text-[#eb9b5c]"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs font-semibold">
                    {(brand.rating / brand.ratingCount).toFixed(1)} (
                    {brand.ratingCount} ratings)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 bg-white p-5 shadow-md">
        <div className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold">Shipping Cost</h3>
          <Link
            className="rounded-md bg-primary/20 p-1 text-primary hover:bg-primary-focus hover:text-white"
            href={
              "/" +
              encodeURIComponent("shipping Cost") +
              "/" +
              encodeURIComponent(phoneNum)
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
            </svg>
          </Link>
        </div>
        {brand.shippingIncluded === true ? (
          <div className="mt-3 flex flex-1 flex-col gap-3">
            <div className="flex flex-row flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm">{t("defaultShippingCost")}</h3>
              <p className="text-sm font-semibold text-primary">
                {formatAmount(brand.defaultShippingCost!, locale, true)}
              </p>
            </div>
            <div className="flex flex-row flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm">{t("carGateShippingCost")}</h3>
              <p className="text-sm font-semibold text-primary">
                {formatAmount(brand.carGateShippingCost!, locale, true)}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-1 flex-col">
            <p className="text-sm">Paid by recipient on delivery only.</p>
          </div>
        )}
        <div className="mt-3 border-t pt-3">
          <h3 className="text-lg font-semibold">{t("isOfferFreeShipping")}</h3>
          {brand.isOfferFreeShipping === true ? (
            <div className="mt-3 flex flex-1 flex-col">
              <div className="flex flex-row flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm">{t("freeShippingCost")}</h3>
                <p className="text-sm font-semibold text-primary">
                  {formatAmount(brand.freeShippingCost!, locale, true)}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-1 flex-col">
              <p className="text-sm">Not available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BrandUserSection;
