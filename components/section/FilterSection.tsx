import { ProductNavType } from "@/types/productTypes";
import { fetcher } from "@/util/fetcher";
import { getText } from "@/util/textHelper";
import { Brand, Category, Condition, State } from "@prisma/client";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { SortByType } from "../presentational/SortSelectBox";
import { sortBy } from "lodash";

type CategoryCheckBoxProps = {
  name: string;
  nameMM: string;
  slug: string;
  id: string;
  subCategory: Category[];
};

function CategoryCheckBox({
  name,
  nameMM,
  slug,
  id,
  subCategory,
}: CategoryCheckBoxProps) {
  const [isOpen, setOpen] = React.useState(false);
  const router = useRouter();
  const { locale } = router;
  const {
    page,
    brands: pathBrands,
    categories,
    startPrice,
    endPrice,
    type,
    conditions: pathConditions,
    qry,
    sort,
  } = router.query;

  return (
    <div className="flex flex-col space-y-3">
      <div className="form-control flex flex-row items-center">
        <label className="flex flex-grow cursor-pointer items-center space-x-3">
          <input
            type="checkbox"
            className="checkbox-primary checkbox checkbox-sm"
            checked={
              categories
                ? typeof categories === "string"
                  ? categories === slug
                  : categories.includes(slug)
                : false
            }
            onChange={() => {
              let cat = [];
              if (categories) {
                if (typeof categories === "string") {
                  cat = [categories];
                } else {
                  cat = categories;
                }
              }
              if (cat.includes(slug)) {
                cat = cat.filter((z) => z !== slug);
              } else {
                cat = [...cat, slug];
              }

              router.push({
                pathname: "/marketplace",
                query: {
                  page: 1,
                  categories: cat,
                  brands: pathBrands,
                  startPrice: startPrice,
                  endPrice: endPrice,
                  type: type,
                  conditions: pathConditions,
                  qry: qry,
                  sort: sort,
                },
              });
            }}
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
  console.log(categories);
  let priceRangeList = [
    {
      startPrice: 0,
      endPrice: -1,
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
      endPrice: -1,
      name: "above 25000 MMK",
      nameMM: "၂၅၀၀၀ ကျပ်အထက်",
    },
  ];

  const router = useRouter();

  const {
    page,
    brands: pathBrands,
    categories: pathCategories,
    startPrice,
    endPrice,
    type,
    conditions: pathConditions,
    qry,
    sort,
  } = router.query;

  const [brandQry, setBrandQry] = React.useState("");
  const [conditionQry, setConditionQry] = React.useState("");

  /* router.push({
    pathname: "/marketplace",
    query: {
      page: 1,
      categories: pathCategories,
      brands: pathBrands,
      startPrice: startPrice,
      endPrice: endPrice,
      type: type,
      conditions: pathConditions,
      qry: qry,
      sort: sort,
    },
  }); */

  return (
    <div className="flex w-full flex-col space-y-5 bg-white p-5 shadow-md">
      <div className="flex flex-col space-y-3">
        <div className="flex flex-row border-b pb-2">
          <label className="test-primaryText flex-grow text-sm font-semibold">
            Type
          </label>
          <button
            className="text-primaryText text-xs font-light hover:text-primary"
            onClick={() => {
              router.push({
                pathname: "/marketplace",
                query: {
                  page: 1,
                  categories: pathCategories,
                  brands: pathBrands,
                  startPrice: startPrice,
                  endPrice: endPrice,
                  type: "",
                  conditions: pathConditions,
                  qry: qry,
                  sort: sort,
                },
              });
            }}
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
                  checked={type && type === e}
                  onChange={() => {
                    if (type?.toString() === e) {
                      router.push({
                        pathname: "/marketplace",
                        query: {
                          page: 1,
                          categories: pathCategories,
                          brands: pathBrands,
                          startPrice: startPrice,
                          endPrice: endPrice,
                          type: "",
                          conditions: pathConditions,
                          qry: qry,
                          sort: sort,
                        },
                      });
                    } else {
                      router.push({
                        pathname: "/marketplace",
                        query: {
                          page: 1,
                          categories: pathCategories,
                          brands: pathBrands,
                          startPrice: startPrice,
                          endPrice: endPrice,
                          type: e,
                          conditions: pathConditions,
                          qry: qry,
                          sort: sort,
                        },
                      });
                    }
                  }}
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
            onClick={() => {
              router.push({
                pathname: "/marketplace",
                query: {
                  page: 1,
                  categories: pathCategories,
                  brands: pathBrands,
                  startPrice: "",
                  endPrice: "",
                  type: type,
                  conditions: pathConditions,
                  qry: qry,
                  sort: sort,
                },
              });
            }}
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
                    checked={
                      startPrice &&
                      endPrice &&
                      parseInt(startPrice.toString()) === e.startPrice &&
                      parseInt(endPrice.toString()) === e.endPrice
                    }
                    onChange={() => {
                      if (
                        startPrice &&
                        endPrice &&
                        parseInt(startPrice.toString()) === e.startPrice &&
                        parseInt(endPrice.toString()) === e.endPrice
                      ) {
                        router.push({
                          pathname: "/marketplace",
                          query: {
                            page: 1,
                            categories: pathCategories,
                            brands: pathBrands,
                            startPrice: "",
                            endPrice: "",
                            type: type,
                            conditions: pathConditions,
                            qry: qry,
                            sort: sort,
                          },
                        });
                      } else {
                        router.push({
                          pathname: "/marketplace",
                          query: {
                            page: 1,
                            categories: pathCategories,
                            brands: pathBrands,
                            startPrice: e.startPrice,
                            endPrice: e.endPrice,
                            type: type,
                            conditions: pathConditions,
                            qry: qry,
                            sort: sort,
                          },
                        });
                      }
                    }}
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
            onClick={() => {
              router.push({
                pathname: "/marketplace",
                query: {
                  page: 1,
                  categories: "",
                  brands: pathBrands,
                  startPrice: startPrice,
                  endPrice: endPrice,
                  type: type,
                  conditions: pathConditions,
                  qry: qry,
                  sort: sort,
                },
              });
            }}
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
            onClick={() => {
              router.push({
                pathname: "/marketplace",
                query: {
                  page: 1,
                  categories: pathCategories,
                  brands: pathBrands,
                  startPrice: startPrice,
                  endPrice: endPrice,
                  type: type,
                  conditions: pathConditions,
                  qry: qry,
                  sort: sort,
                },
              });
            }}
          >
            Reset
          </button>
        </div>
        <div className="relative flex flex-col space-y-3 max-h-[200px] overflow-y-auto scrollbar-hide">
          <div className="sticky top-0 bg-white">
            <label htmlFor="Search" className="sr-only">
              {" "}
              Search{" "}
            </label>

            <input
              type="text"
              id="Search"
              className="w-full rounded-md border-gray-200 pr-10 shadow-sm sm:text-sm"
              onChange={(e) => {
                setBrandQry(e.currentTarget.value);
              }}
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
            sortBy(
              brands.filter(
                (z) =>
                  z.name.toLowerCase().includes(brandQry.toLowerCase()) ||
                  z.nameMM?.includes(brandQry.toLowerCase())
              ),
              (z) => z.name
            ).map((e: Brand, index: number) => (
              <div className="form-control" key={index}>
                <label className="flex cursor-pointer items-center space-x-3">
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox checkbox-sm"
                    checked={
                      pathBrands
                        ? typeof pathBrands === "string"
                          ? pathBrands === e.name
                          : pathBrands.includes(e.name)
                        : false
                    }
                    onChange={() => {
                      let cat = [];
                      if (pathBrands) {
                        if (typeof pathBrands === "string") {
                          cat = [pathBrands];
                        } else {
                          cat = pathBrands;
                        }
                      }
                      if (cat.includes(e.name)) {
                        cat = cat.filter((z) => z !== e.name);
                      } else {
                        cat = [...cat, encodeURIComponent(e.name)];
                      }

                      router.push({
                        pathname: "/marketplace",
                        query: {
                          page: 1,
                          categories: pathCategories,
                          brands: cat,
                          startPrice: startPrice,
                          endPrice: endPrice,
                          type: type,
                          conditions: pathConditions,
                          qry: qry,
                          sort: sort,
                        },
                      });
                    }}
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
          {/* <div className="relative">
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
          </div> */}

          {conditions &&
            conditions.map((e: Condition, index: number) => (
              <div className="form-control" key={index}>
                <label className="flex cursor-pointer items-center space-x-3">
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox checkbox-sm"
                    checked={
                      pathConditions
                        ? typeof pathConditions === "string"
                          ? pathConditions === e.name
                          : pathConditions.includes(e.name)
                        : false
                    }
                    onChange={() => {
                      let cat = [];
                      if (pathConditions) {
                        if (typeof pathConditions === "string") {
                          cat = [pathConditions];
                        } else {
                          cat = pathConditions;
                        }
                      }
                      if (cat.includes(e.name)) {
                        cat = cat.filter((z) => z !== e.name);
                      } else {
                        cat = [...cat, encodeURIComponent(e.name)];
                      }

                      router.push({
                        pathname: "/marketplace",
                        query: {
                          page: 1,
                          categories: pathCategories,
                          brands: pathBrands,
                          startPrice: startPrice,
                          endPrice: endPrice,
                          type: type,
                          conditions: cat,
                          qry: qry,
                          sort: sort,
                        },
                      });
                    }}
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
            Type
          </label>
          <button
            className="text-primaryText text-xs font-light hover:text-primary"
            onClick={() => {
              router.push({
                pathname: "/marketplace",
                query: {
                  page: 1,
                  categories: pathCategories,
                  brands: pathBrands,
                  startPrice: startPrice,
                  endPrice: endPrice,
                  type: type,
                  conditions: pathConditions,
                  qry: qry,
                  sort: "",
                },
              });
            }}
          >
            Reset
          </button>
        </div>
        <div className="flex flex-col space-y-3">
          {[
            SortByType.SortByDefault,
            SortByType.SortByNewest,
            SortByType.SortByOldest,
            SortByType.SortByNameAsc,
            SortByType.SortByNameDesc,
            SortByType.SortByPriceAsc,
            SortByType.SortByPriceDesc,
            SortByType.SortByRatingAsc,
            SortByType.SortByRatingDesc,
          ].map((e, index: number) => (
            <div className="form-control" key={index}>
              <label className="flex cursor-pointer items-center space-x-3">
                <input
                  type="checkbox"
                  className="checkbox-primary checkbox checkbox-sm"
                  checked={
                    e === SortByType.SortByDefault
                      ? !sort
                        ? true
                        : sort === SortByType.SortByDefault
                      : sort && sort === e
                  }
                  onChange={() => {
                    if (sort?.toString() === e) {
                      router.push({
                        pathname: "/marketplace",
                        query: {
                          page: 1,
                          categories: pathCategories,
                          brands: pathBrands,
                          startPrice: startPrice,
                          endPrice: endPrice,
                          type: type,
                          conditions: pathConditions,
                          qry: qry,
                          sort: "",
                        },
                      });
                    } else {
                      router.push({
                        pathname: "/marketplace",
                        query: {
                          page: 1,
                          categories: pathCategories,
                          brands: pathBrands,
                          startPrice: startPrice,
                          endPrice: endPrice,
                          type: type,
                          conditions: pathConditions,
                          qry: qry,
                          sort: e,
                        },
                      });
                    }
                  }}
                />
                <span className="label-text">{e}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterSection;
