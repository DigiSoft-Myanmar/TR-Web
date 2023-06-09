import { fetcher } from "@/util/fetcher";
import { getText } from "@/util/textHelper";
import { Category, Product } from "@prisma/client";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import ShortProduct from "../card/ShortProduct";

type Props = {
  title?: string;
  disablePadding?: boolean;
};

function FeatureProductsSection({ title, disablePadding }: Props) {
  const [currentCategories, setCurrentCategories] = React.useState("All");
  const { data } = useSWR("/api/products/categories", fetcher);
  const { data: prodData } = useSWR("/api/products/featured", fetcher);
  const { locale } = useRouter();

  return (
    <div className="w-full">
      <div className="mt-5 flex w-full flex-row flex-wrap items-center space-x-3">
        <h1 className="text-primaryText pl-3 text-lg font-semibold">
          {title ? title : "Featured Products"}
        </h1>
        <div className="divider flex-grow" />
        <div className="flex max-w-[100vw] flex-row items-center space-x-3 overflow-x-auto scrollbar-hide">
          <button
            className={
              currentCategories === "All"
                ? "rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white"
                : "text-primaryText border-primaryText rounded-md border bg-white px-3 py-2 text-xs font-semibold"
            }
            onClick={() => setCurrentCategories("All")}
          >
            {getText("All", "အလုံးစုံ", locale)}
          </button>
          {data &&
            data.map((e: Category, index: number) => (
              <React.Fragment key={index}>
                {prodData?.filter((p: Product) =>
                  p.categoryIds.find((z) => z === e.id),
                ).length > 0 && (
                  <button
                    className={
                      currentCategories === e.id
                        ? "whitespace-nowrap rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white"
                        : "text-primaryText border-primaryText whitespace-nowrap rounded-md border bg-white px-3 py-2 text-xs font-semibold"
                    }
                    onClick={() => setCurrentCategories(e.id)}
                  >
                    {getText(e.name, e.nameMM, locale)}
                  </button>
                )}
              </React.Fragment>
            ))}
        </div>
      </div>
      {prodData &&
      prodData?.filter((e: Product) =>
        currentCategories !== "All"
          ? e.categoryIds.includes(currentCategories)
          : true,
      ).length > 0 ? (
        <div
          className={`mt-3 mb-3 flex flex-col gap-5  ${
            disablePadding === true ? "" : "px-10"
          } max-w-[100vw] overflow-x-auto pb-5 md:flex-row`}
        >
          {prodData
            .filter((e: Product) =>
              currentCategories !== "All"
                ? e.categoryIds.includes(currentCategories)
                : true,
            )
            .map((e: any, index: number) => (
              <ShortProduct key={index} product={e} />
            ))}
          {prodData
            .filter((e: Product) =>
              currentCategories !== "All"
                ? e.categoryIds.includes(currentCategories)
                : true,
            )
            .map((e: any, index: number) => (
              <ShortProduct key={index} product={e} />
            ))}
        </div>
      ) : (
        <div className="mt-3 mb-3 flex w-screen items-center justify-center px-10 pb-5">
          <p className="text-sm font-semibold">No Products</p>
        </div>
      )}
    </div>
  );
}

export default FeatureProductsSection;
