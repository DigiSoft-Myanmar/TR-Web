import ProductImg from "@/components/card/ProductImg";
import { isInternal } from "@/util/authHelper";
import { formatAmount } from "@/util/textHelper";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";

function UserHomeSection() {
  const { data: session } = useSession();
  const router = useRouter();
  const { locale } = router;
  return (
    <div
      className={`${
        isInternal(session)
          ? "py-5 flex flex-col gap-5"
          : "mx-6 px-4 py-5 flex flex-col gap-5"
      }`}
    >
      <div className="bg-white p-3 rounded-md border flex flex-col">
        <h3 className="text-lg ml-3 mt-3">Promo Codes</h3>
        <div className="p-3 mt-3 flex flex-row items-center gap-3 overflow-x-auto scrollbar-hide">
          {Array.from(Array(1000).keys()).map((b, index) => (
            <div
              key={index}
              className="bg-primary/5 border p-5 min-w-[200px] rounded-md"
            >
              <h3 className="font-semibold whitespace-nowrap text-sm text-primary">
                PROMO-{b}
              </h3>
              <p className="text-xs mt-1">
                Min Spend -{" "}
                <span className="text-primary font-semibold">
                  {formatAmount(10000, locale, true)}
                </span>
              </p>
              <p className="text-xs mt-2 text-gray-500">
                Valid till{" "}
                <span className="font-semibold text-primary">
                  {new Date().toLocaleDateString("en-ca", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
      <h3 className="text-lg ml-3 mt-3">Products</h3>
      <div className="bg-white p-3 rounded-md border grid grid-cols-auto200 gap-3 place-items-center">
        {Array.from(Array(10).keys()).map((b, index) => (
          <div
            key={index}
            className="bg-white border min-w-[200px] max-w-[200px] rounded-md overflow-hidden cursor-pointer"
          >
            <div className="overflow-hidden">
              <ProductImg
                imgUrl="/assets/dummy/dummy_product.png"
                width={200}
                title=""
                roundedAll={false}
              />
            </div>
            <div className="m-3 flex flex-col">
              <h4 className="text-sm line-clamp-2">Sweater</h4>
              <h4 className="text-sm mt-1 font-semibold text-primary">
                {formatAmount(5000, locale, true)}
              </h4>

              <span className="text-xs font-semibold text-success bg-success/20 rounded-md px-3 py-1 mt-1 w-fit">
                In Stock
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserHomeSection;
