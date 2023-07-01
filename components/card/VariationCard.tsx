import { useProduct } from "@/context/ProductContext";
import { getPricingSingle } from "@/util/pricing";
import { formatAmount, formatDate } from "@/util/textHelper";
import { StockType } from "@prisma/client";
import { useRouter } from "next/router";
import React from "react";

interface Props {
  variation: any;
  editDetail: Function;
  deleteVariation: Function;
}

function VariationCard({ variation, editDetail, deleteVariation }: Props) {
  const { locale } = useRouter();
  const { product } = useProduct();
  const pricingDetail = getPricingSingle(variation);

  return (
    <div
      className="relative flex min-w-[200px] cursor-pointer flex-col items-start justify-center space-y-3 rounded-md bg-white p-3 shadow-md"
      onClick={() => editDetail()}
    >
      <button
        className="place-self-end rounded-md bg-primary px-2 py-2 text-white shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          deleteVariation();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
      <div className="flex w-full items-center justify-center space-x-3">
        <div className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center space-y-5 rounded-md bg-white shadow-md">
          {variation.img ? (
            <img
              draggable={false}
              src={"/api/files/" + variation.img}
              className="h-16 w-16 rounded-md object-contain shadow-md"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {/* <MdImage className="h-16 w-16 text-brandDark" /> */}
        </div>
        <div className="flex flex-grow flex-wrap items-center justify-center">
          {variation.attributes &&
            variation.attributes.map((elem: any, varIndex: number) => (
              <div className="m-2 flex flex-col items-center" key={varIndex}>
                <h3 className="text-xs font-medium text-gray-500">
                  {locale === "mm" &&
                  product.attributes.find((e: any) => e.id === elem.attributeId)
                    .nameMM &&
                  product.attributes.find((e: any) => e.id === elem.attributeId)
                    .nameMM.length > 0
                    ? product.attributes.find(
                        (e: any) => e.id === elem.attributeId
                      ).nameMM
                    : product.attributes.find(
                        (e: any) => e.id === elem.attributeId
                      ).name}
                </h3>
                <h4 className="text-sm font-semibold">
                  {locale === "mm" && elem.nameMM && elem.nameMM.length > 0
                    ? elem.nameMM
                    : elem.name}
                </h4>
              </div>
            ))}
        </div>
      </div>
      <div className="mt-3 flex w-full items-center space-x-5 border-t p-2 text-white">
        {pricingDetail ? (
          <div className="flex w-full items-center justify-center space-x-3 rounded-md bg-primary px-2 py-3">
            {pricingDetail.isPromotion ? (
              <div className="flex flex-col space-y-2">
                <h2 className="font-medium line-through">
                  {formatAmount(pricingDetail.regularPrice, locale, true)}
                </h2>

                <h2 className="text-lg font-semibold">
                  {formatAmount(pricingDetail.saleAmount, locale, true)}
                </h2>
              </div>
            ) : (
              <h2 className="text-lg font-medium">
                {formatAmount(pricingDetail.regularPrice, locale, true)}
              </h2>
            )}
            {pricingDetail.startDate && pricingDetail.endDate && (
              <div className="flex flex-col items-center justify-center border-l-2 px-3">
                <span className="text-xs font-semibold">
                  {new Date(pricingDetail.startDate).toLocaleDateString(
                    "en-ca",
                    {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    }
                  )}
                </span>
                <span className="text-xs">to</span>
                <span className="text-xs font-semibold">
                  {new Date(pricingDetail.endDate).toLocaleDateString("en-ca", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-darkShade flex w-full items-center justify-center space-x-3 rounded-md px-2 py-3">
            Pricing - Not set
          </div>
        )}
      </div>
      <div className="flex w-full items-center space-x-5 px-2">
        <h3 className="flex-grow text-sm text-gray-600">
          SKU:{" "}
          <span className="text-darkShade font-semibold">
            {variation.SKU ? variation.SKU : "Not set"}
          </span>
        </h3>
        {variation.stockType ? (
          variation.stockType === StockType.OutOfStock ||
          (variation.stockType === StockType.StockLevel &&
            variation.stockLevel! <= 0) ? (
            <h3 className="rounded-md bg-error px-3 py-1 text-sm font-bold text-white">
              Out of Stock
            </h3>
          ) : variation.stockType === StockType.InStock ||
            (variation.stockType === StockType.StockLevel &&
              variation.stockLevel! > 0) ? (
            <h3 className=" rounded-md bg-green-600 px-3 py-1 text-sm font-bold text-white">
              In Stock{" "}
              {variation.stockType === StockType.StockLevel && (
                <span>| {variation.stockLevel}</span>
              )}
            </h3>
          ) : (
            <></>
          )
        ) : (
          <h3 className=" bg-darkShade rounded-md px-3 py-1 text-sm font-bold text-white">
            Stock - Not set
          </h3>
        )}
      </div>
    </div>
  );
}

export default VariationCard;
