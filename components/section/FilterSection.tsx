import { fetcher } from "@/util/fetcher";
import { getText } from "@/util/textHelper";
import { Brand, Category, State } from "@prisma/client";
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

function FilterSection() {
  let maxProdPrice = 10000;
  const [minPrice, setMinPrice] = React.useState<string>("0");
  const [maxPrice, setMaxPrice] = React.useState<string>("10000");
  const priceGap = 1000;
  const progressRef = React.useRef<HTMLDivElement | null>(null);
  const [priceError, setPriceError] = React.useState<string>("");
  const { data: categories } = useSWR("/api/products/categories", fetcher);
  const { data: brands } = useSWR("/api/brands", fetcher);
  const { data: locales } = useSWR("/api/townships", fetcher);
  const { locale } = useRouter();

  React.useEffect(() => {
    if (!minPrice || !maxPrice) {
      setPriceError("Please input valid price");
      return;
    }
    let minVal = parseInt(minPrice);
    let maxVal = parseInt(maxPrice);
    if (minVal < 0 || maxVal < 0) {
      setPriceError("Please input valid price");
      return;
    }
    setPriceError("");

    if (maxVal > maxProdPrice) {
      setMaxPrice(maxProdPrice.toString());
    }
    if (minVal > maxProdPrice) {
      setMinPrice(maxProdPrice.toString());
    }
    if (minVal >= maxVal) {
      setPriceError("Please input valid price");
    }

    if (progressRef.current) {
      if (minVal !== 0 && maxVal !== maxProdPrice) {
      }

      progressRef.current.style.left = (minVal / maxProdPrice) * 100 + "%";
      progressRef.current.style.right =
        100 - (maxVal / maxProdPrice) * 100 + "%";
    }
  }, [minPrice, maxPrice, maxProdPrice]);

  return (
    <div className="flex w-full flex-col space-y-5 bg-white p-5 shadow-md">
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
        <div className="mt-3 flex space-x-5">
          <div className="flex w-1/2 flex-col space-y-1">
            <span className="text-xs text-gray-600">From</span>
            <input
              type="number"
              name="minPrice"
              onWheelCapture={(e) => e.currentTarget.blur()}
              className="text-primaryText w-full rounded-md bg-white text-center text-sm focus:outline-none"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.currentTarget.value);
              }}
            />
          </div>
          <div className="flex w-1/2 flex-col space-y-1">
            <span className="text-xs text-gray-600">Up to</span>
            <input
              type="number"
              name="maxPrice"
              onWheelCapture={(e) => e.currentTarget.blur()}
              className="text-primaryText w-full rounded-md bg-white text-center text-sm focus:outline-none"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.currentTarget.value);
              }}
            />
          </div>
        </div>
        {priceError && priceError.length > 0 ? (
          <div className="mt-2 text-center text-xs font-semibold text-error">
            {priceError}
          </div>
        ) : (
          <>
            <div className="relative mt-5 h-1 rounded-md bg-gray-300">
              <div
                className="absolute h-1 rounded-md bg-primary"
                ref={progressRef}
              ></div>
            </div>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={maxProdPrice}
                value={minPrice}
                className="pointer-events-none absolute -top-4 h-1 w-full appearance-none bg-transparent"
                onChange={(e) => {
                  if (
                    parseInt(maxPrice) - parseInt(e.currentTarget.value) <
                    priceGap
                  ) {
                    setMinPrice((parseInt(maxPrice) - priceGap).toString());
                  } else {
                    setMinPrice(e.currentTarget.value);
                  }
                }}
              />
              <input
                type="range"
                min={0}
                max={maxProdPrice}
                value={maxPrice}
                className="pointer-events-none absolute -top-4 h-1 w-full appearance-none bg-transparent"
                onChange={(e) => {
                  if (
                    parseInt(e.currentTarget.value) - parseInt(minPrice) <
                    priceGap
                  ) {
                    setMaxPrice((parseInt(minPrice) + priceGap).toString());
                  } else {
                    setMaxPrice(e.currentTarget.value);
                  }
                }}
              />
            </div>
          </>
        )}
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
            Local
          </label>
          <button
            className="text-primaryText text-xs font-light hover:text-primary"
            onClick={() => {}}
          >
            Reset
          </button>
        </div>
        <div className="flex flex-col space-y-3">
          {locales &&
            locales.map((e: State, index: number) => (
              <div className="form-control" key={index}>
                <label className="flex cursor-pointer items-center space-x-3">
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox checkbox-sm"
                  />
                  <span className="label-text">
                    {getText(e.name, e.nameMM, locale)}
                  </span>
                </label>
              </div>
            ))}
        </div>
      </div>
      <div className="flex flex-col space-y-3">
        <div className="flex flex-row border-b pb-2">
          <label className="test-primaryText flex-grow text-sm font-semibold">
            Rating
          </label>
          <button
            className="text-primaryText text-xs font-light hover:text-primary"
            onClick={() => {}}
          >
            Reset
          </button>
        </div>
        <div className="flex flex-col space-y-3">
          <div className="form-control">
            <label className="flex cursor-pointer items-center space-x-3">
              <input
                type="checkbox"
                className="checkbox-primary checkbox checkbox-sm"
              />
              <div className="flex flex-row items-center space-x-1 text-[#eb9b5c]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </label>
          </div>
          <div className="form-control">
            <label className="flex cursor-pointer items-center space-x-3">
              <input
                type="checkbox"
                className="checkbox-primary checkbox checkbox-sm"
              />
              <div className="flex flex-row items-center space-x-1 text-[#eb9b5c]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 text-gray-200"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </label>
          </div>
          <div className="form-control">
            <label className="flex cursor-pointer items-center space-x-3">
              <input
                type="checkbox"
                className="checkbox-primary checkbox checkbox-sm"
              />
              <div className="flex flex-row items-center space-x-1 text-gray-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 text-[#eb9b5c]"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 text-[#eb9b5c]"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 text-[#eb9b5c]"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </label>
          </div>
          <div className="form-control">
            <label className="flex cursor-pointer items-center space-x-3">
              <input
                type="checkbox"
                className="checkbox-primary checkbox checkbox-sm"
              />
              <div className="flex flex-row items-center space-x-1 text-gray-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 text-[#eb9b5c]"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 text-[#eb9b5c]"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </label>
          </div>
          <div className="form-control">
            <label className="flex cursor-pointer items-center space-x-3">
              <input
                type="checkbox"
                className="checkbox-primary checkbox checkbox-sm"
              />
              <div className="flex flex-row items-center space-x-1 text-gray-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 text-[#eb9b5c]"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterSection;
