import { HighlightTypes } from "@/types/highlightType";
import { Product } from "@prisma/client";
import Link from "next/link";
import React from "react";
import MiniProduct from "../card/MiniProduct";
import ShortProduct from "../card/ShortProduct";
import useMaxProd from "@/hooks/useMaxProd";
import { useRouter } from "next/router";
import { getText } from "@/util/textHelper";
import { SortByType } from "../presentational/SortSelectBox";

type Props = {
  type: HighlightTypes;
  products: Product[];
};
function HighlightSection({ type, products }: Props) {
  const maxProd = useMaxProd(160, 2, 1280);
  const { locale } = useRouter();

  return products && products.length > 0 ? (
    <div className="flex w-full flex-1 flex-col space-y-3 rounded-md border bg-white px-3 shadow-md">
      <div className="flex w-full flex-row items-center space-x-3 border-b-2 border-b-base-100 pt-5 pb-3">
        <h1 className="text-primaryText flex-grow pl-3 text-lg font-semibold">
          {type}
        </h1>
        <Link
          href={
            type === HighlightTypes.bestSellers
              ? "/marketplace?sort=" +
                encodeURIComponent(SortByType.SortBySalesDesc)
              : type === HighlightTypes.mostViewed
              ? "/marketplace?sort=" +
                encodeURIComponent(SortByType.SortByViewDesc)
              : type === HighlightTypes.newArrivals
              ? "/marketplace?sort=" +
                encodeURIComponent(SortByType.SortByNewest)
              : "/marketplace"
          }
          className="text-primaryText/50 text-sm hover:font-semibold hover:text-primary"
        >
          {getText("View All", "အားလုံးကြည့်ရန်", locale)}
        </Link>
      </div>
      {products && (
        <div className="grid grid-cols-auto150 place-items-stretch justify-items-center gap-3 lg:max-h-[520px]">
          {products.slice(0, maxProd > 4 ? maxProd : 4).map((e, index) => (
            <MiniProduct key={index} product={e} />
          ))}
        </div>
      )}
    </div>
  ) : (
    <></>
  );
}

export default HighlightSection;
