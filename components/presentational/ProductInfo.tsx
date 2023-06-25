import { formatAmount, getText } from "@/util/textHelper";
import {
  Brand,
  Category,
  Condition,
  Product,
  ProductType,
  Review,
  UnitSold,
} from "@prisma/client";
import { useRouter } from "next/router";
import React from "react";

function ProductInfo({
  product,
}: {
  product: Product & {
    Brand: Brand;
    Condition: Condition;
    categories: Category[];
    UnitSold: UnitSold[];
    Review: Review[];
  };
}) {
  const router = useRouter();
  const { locale } = router;
  return (
    <div className="flex flex-col">
      <strong className="py-0.5 text-xs font-semibold tracking-wide text-primary">
        {getText(product.Brand.name, product.Brand.nameMM, locale)}
      </strong>
      <h1 className="text-xl font-light sm:text-2xl mt-1">
        {getText(product.name, product.nameMM, locale)}
      </h1>

      <p className="text-xs mt-1">
        {getText(product.Condition.name, product.Condition.nameMM, locale)}
      </p>

      <div className="flex flex-row items-center gap-3 mt-5 text-sm text-gray-500">
        <div className="flex flex-row items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-primary"
          >
            <path
              fillRule="evenodd"
              d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            {formatAmount(
              parseFloat(
                (
                  product.Review.map((z) => z.rating).reduce(
                    (a, b) => a + b,
                    0
                  ) / product.Review.length
                ).toFixed(1)
              ),
              locale,
              false,
              true
            )}{" "}
            Ratings
          </span>
        </div>
        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
        <div className="flex flex-row items-center gap-1">
          <span>
            {formatAmount(product.Review.length, locale, false, true)} Reviews
          </span>
        </div>
        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
        <div className="flex flex-row items-center gap-1">
          <span>
            {formatAmount(
              product.UnitSold.map((z) => z.soldUnit).reduce(
                (a, b) => a + b,
                0
              ),
              locale,
              false,
              true
            )}{" "}
            {product.UnitSold.map((z) => z.soldUnit).reduce(
              (a, b) => a + b,
              0
            ) > 1
              ? "Units Sold"
              : "Unit Sold"}
          </span>
        </div>
      </div>
      {product.type === ProductType.Variable ? (
        <div className="flex flex-col gap-3 mt-10">
          <p className="font-medium text-sm">Choose Style</p>
          <div className="flex flex-row items-center gap-3 flex-wrap">
            <div className="bg-primary text-white p-3 rounded-md font-semibold text-sm">
              Style 1
            </div>
            <div className="border border-gray-500 text-primaryText p-3 rounded-md text-sm">
              Style 2
            </div>
            <div className="border border-gray-500 text-primaryText p-3 rounded-md text-sm">
              Style 3
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default ProductInfo;
