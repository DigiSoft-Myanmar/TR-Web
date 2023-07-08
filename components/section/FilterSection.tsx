import { ProductNavType } from "@/types/productTypes";
import { fetcher } from "@/util/fetcher";
import { getText } from "@/util/textHelper";
import { Brand, Category, Condition, State } from "@prisma/client";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";

type CategoryCheckBoxProps = {
  name: string;
  nameMM: string;
  id: string;
  subCategory: Category[];
};

function CategoryCheckBox({
  name,
  nameMM,
  id,
  subCategory,
}: CategoryCheckBoxProps) {
  const [isOpen, setOpen] = React.useState(false);
  const { locale } = useRouter();
  return (
    <div className="flex flex-col space-y-3">
      <div className="form-control flex flex-row items-center">
        <label className="flex flex-grow cursor-pointer items-center space-x-3">
          <input
            type="checkbox"
            className="checkbox-primary checkbox checkbox-sm"
          />
          <span className="label-text">{getText(name, nameMM, locale)}</span>
        </label>
        {subCategory && subCategory.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prevValue) => !prevValue);
            }}
          >
            {isOpen ? (
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
                  d="M4.5 15.75l7.5-7.5 7.5 7.5"
                />
              </svg>
            ) : (
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
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            )}
          </button>
        )}
      </div>
      {subCategory && subCategory.length > 0 && (
        <div className={isOpen ? "ml-2 flex flex-col space-y-3" : "hidden"}>
          {subCategory.map((e: any, ind: number) => (
            <CategoryCheckBox key={ind} {...e} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSection({
  brands,
  categories,
  conditions,
}: {
  brands: Brand[];
  categories: Category[] & {
    subCategory: (Category & {
      subCategory: Category[];
    })[];
  };
  conditions: Condition[];
}) {
  let priceRangeList = [
    {
      startPrice: 0,
      endPrice: Number.POSITIVE_INFINITY,
      name: "Any Price",
      nameMM: "စျေးနှုန်းမသတ်မှတ်ထားပါ",
    },
    {
      startPrice: 0,
      endPrice: 5000,
      name: "below 5000 MMK",
      nameMM: "၅၀၀၀ ကျပ်အောက်",
    },
    {
      startPrice: 5000,
      endPrice: 10000,
      name: "between 5000 - 10000 MMK",
      nameMM: "၅၀၀၀ ကျပ်နှင့် ၁၀၀၀၀ ကျပ်အတွင်း",
    },
    {
      startPrice: 10000,
      endPrice: 15000,
      name: "between 10000 - 15000 MMK",
      nameMM: "၁၀၀၀၀ ကျပ်နှင့် ၁၅၀၀၀ ကျပ်အတွင်း",
    },
    {
      startPrice: 15000,
      endPrice: 20000,
      name: "between 15000 - 20000 MMK",
      nameMM: "၁၅၀၀၀ ကျပ်နှင့် ၂၀၀၀၀ ကျပ်အတွင်း",
    },
    {
      startPrice: 20000,
      endPrice: 25000,
      name: "between 20000 - 25000 MMK",
      nameMM: "၂၀၀၀၀ ကျပ်နှင့် ၂၅၀၀၀ ကျပ်အတွင်း",
    },
    {
      startPrice: 25000,
      endPrice: Number.POSITIVE_INFINITY,
      name: "between 20000 - 25000 MMK",
      nameMM: "၂၀၀၀၀ ကျပ်နှင့် ၂၅၀၀၀ ကျပ်အတွင်း",
    },
  ];

  return (
    <div className="flex w-full flex-col space-y-5 bg-white p-5 shadow-md">
      <div className="flex flex-col space-y-3">
        <div className="flex flex-row border-b pb-2">
          <label className="test-primaryText flex-grow text-sm font-semibold">
            Type
          </label>
          <button
            className="text-primaryText text-xs font-light hover:text-primary"
            onClick={() => {}}
          >
            Reset
          </button>
        </div>
        <div className="flex flex-col space-y-3">
          {[
            ProductNavType.Buy,
            ProductNavType.Auction,
            ProductNavType.Promotion,
          ].map((e, index: number) => (
            <div className="form-control" key={index}>
              <label className="flex cursor-pointer items-center space-x-3">
                <input
                  type="checkbox"
                  className="checkbox-primary checkbox checkbox-sm"
                />
                <span className="label-text">{e}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col space-y-3">
        <div className="flex flex-row border-b pb-2">
          <label className="test-primaryText flex-grow text-sm font-semibold">
            Pricing
          </label>
          <button
            className="text-primaryText text-xs font-light hover:text-primary"
            onClick={() => {}}
          >
            Reset
          </button>
        </div>
        <div className="flex flex-col space-y-3">
          {priceRangeList &&
            priceRangeList.map((e, index: number) => (
              <div className="form-control" key={index}>
                <label className="flex cursor-pointer items-center space-x-3">
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox checkbox-sm"
                  />
                  <span className="label-text">{e.name}</span>
                </label>
              </div>
            ))}
        </div>
      </div>
      <div className="flex flex-col space-y-3">
        <div className="flex flex-row border-b pb-2">
          <label className="test-primaryText flex-grow text-sm font-semibold">
            Categories
          </label>
          <button
            className="text-primaryText text-xs font-light hover:text-primary"
            onClick={() => {}}
          >
            Reset
          </button>
        </div>
        <div className="flex flex-col space-y-3">
          {categories &&
            categories.map((e: any, index: number) => (
              <CategoryCheckBox key={index} {...e} />
            ))}
        </div>
      </div>
      <div className="flex flex-col space-y-3">
        <div className="flex flex-row border-b pb-2">
          <label className="test-primaryText flex-grow text-sm font-semibold">
            Brands
          </label>
          <button
            className="text-primaryText text-xs font-light hover:text-primary"
            onClick={() => {}}
          >
            Reset
          </button>
        </div>
        <div className="flex flex-col space-y-3">
          <div className="relative">
            <label htmlFor="Search" className="sr-only">
              {" "}
              Search{" "}
            </label>

            <input
              type="text"
              id="Search"
              className="w-full rounded-md border-gray-200 pr-10 shadow-sm sm:text-sm"
            />

            <span className="pointer-events-none absolute inset-y-0 right-0 grid w-10 place-content-center text-gray-500">
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
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </span>
          </div>

          {brands &&
            brands.map((e: Brand, index: number) => (
              <div className="form-control" key={index}>
                <label className="flex cursor-pointer items-center space-x-3">
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox checkbox-sm"
                  />
                  <span className="label-text">{e.name}</span>
                </label>
              </div>
            ))}
        </div>
      </div>

      <div className="flex flex-col space-y-3">
        <div className="flex flex-row border-b pb-2">
          <label className="test-primaryText flex-grow text-sm font-semibold">
            Conditions
          </label>
          <button
            className="text-primaryText text-xs font-light hover:text-primary"
            onClick={() => {}}
          >
            Reset
          </button>
        </div>
        <div className="flex flex-col space-y-3">
          <div className="relative">
            <label htmlFor="Search" className="sr-only">
              {" "}
              Search{" "}
            </label>

            <input
              type="text"
              id="Search"
              className="w-full rounded-md border-gray-200 pr-10 shadow-sm sm:text-sm"
            />

            <span className="pointer-events-none absolute inset-y-0 right-0 grid w-10 place-content-center text-gray-500">
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
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </span>
          </div>

          {conditions &&
            conditions.map((e: Condition, index: number) => (
              <div className="form-control" key={index}>
                <label className="flex cursor-pointer items-center space-x-3">
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox checkbox-sm"
                  />
                  <span className="label-text">{e.name}</span>
                </label>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default FilterSection;
