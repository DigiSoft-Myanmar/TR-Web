import AuctionCard from "@/components/card/AuctionCard";
import ProductCard from "@/components/card/ProductCard";
import ProductImg from "@/components/card/ProductImg";
import Avatar from "@/components/presentational/Avatar";
import { fileUrl } from "@/types/const";
import { isInternal, isSeller } from "@/util/authHelper";
import {
  formatAmount,
  getPromoAvailCount,
  getPromoCount,
  getUsageCount,
} from "@/util/textHelper";
import { Category, ProductType, PromoCode, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

function UserHomeSection({ user }: { user: User }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation("common");
  const { isLoading, error, data, refetch } = useQuery(
    ["promoData", user.id],
    () =>
      fetch("/api/promoCode?sellerId=" + user.id).then((res) => {
        let json = res.json();
        return json;
      })
  );
  const { data: productData } = useQuery(["productData", user.id], () =>
    fetch("/api/marketplace?sellerId=" + user.id).then((res) => {
      let json = res.json();
      return json;
    })
  );

  const { data: categories } = useQuery("categoriesData", () =>
    fetch("/api/products/categories").then((res) => {
      let json = res.json();
      return json;
    })
  );

  return (
    <div
      className={`${
        isInternal(session)
          ? "py-5 flex flex-col gap-5"
          : "mx-6 px-4 py-5 flex flex-col gap-5"
      }`}
    >
      {categories && user.preferCategoryIDs.length > 0 ? (
        <>
          <h3 className="text-lg ml-3 mt-3">{t("categoriesInfo")}</h3>
          <div className="bg-white p-3 rounded-md border grid grid-cols-1 lg:grid-cols-3 gap-3">
            {categories
              .filter((z) => user.preferCategoryIDs.includes(z.id))
              .map((z: any, index) => (
                <div
                  key={index}
                  className="border p-3 pr-10 flex flex-row items-center gap-3 rounded-md h-32 relative text-white justify-between cursor-pointer"
                  style={{
                    backgroundColor: z.color,
                  }}
                  onClick={() => {
                    if (isInternal(session)) {
                    } else {
                      router.push(
                        "/marketplace?categories=" + encodeURIComponent(z.slug)
                      );
                    }
                  }}
                >
                  <div className="flex flex-row items-center gap-3">
                    <img
                      src={fileUrl + z.icon}
                      className="w-5 h-5 rounded-md"
                    />
                    <span className="text-lg font-light uppercase">
                      {z.name}
                    </span>
                  </div>
                  <span className="text-[100px] font-extrabold">
                    {z.prodCount > 99 ? "99+" : z.prodCount}
                  </span>
                </div>
              ))}
          </div>
        </>
      ) : (
        <>
          <h3 className="text-lg ml-3 mt-3">{t("categoriesInfo")}</h3>
          <div className="grid p-10 bg-white place-content-center rounded-md border">
            <h1 className="tracking-widest text-gray-500 uppercase">
              This user doesn't set categories yet.
            </h1>
          </div>
        </>
      )}
      {data && data.length > 0 && (
        <div className="bg-white p-3 rounded-md border flex flex-col">
          <h3 className="text-lg ml-3 mt-3">Promo Codes</h3>
          <div className="p-3 mt-3 flex flex-row items-center gap-3 overflow-x-auto scrollbar-hide">
            {data
              .filter((z) => getPromoAvailCount(z) > 0)
              .map(
                (
                  z: PromoCode & {
                    seller: User;
                    usage: number;
                    ownUsage: number;
                  },
                  index
                ) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 border p-3 rounded-md hover:border-primary transition cursor-pointer max-w-[200px] min-w-[200px]"
                  >
                    <div className="flex flex-row items-center gap-3">
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-primary">
                          {z.promoCode}
                        </h3>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-primaryText flex flex-row items-start gap-3 justify-end">
                      {z.startDate && z.endDate ? (
                        <div className="flex-grow flex flex-col gap-1 py-2 items-center">
                          <h3 className="text-xs text-center text-gray-500">
                            Valid until
                          </h3>
                          <p className="text-xs text-center">
                            {new Date(z.endDate).toLocaleDateString("en-ca", {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                            })}
                          </p>
                        </div>
                      ) : (
                        <div className="flex-grow flex flex-col gap-1 py-2 items-center">
                          <h3 className="text-xs text-center text-gray-500">
                            No Expired Date
                          </h3>
                        </div>
                      )}
                      <div className="bg-primary p-2 rounded-b-lg flex flex-col gap-1">
                        <h3 className="font-semibold text-white text-sm text-center">
                          {formatAmount(
                            z.discount,
                            locale,
                            z.isPercent === false
                          )}
                          {z.isPercent === true ? "%" : ""}
                        </h3>
                        <p className="text-white font-semibold text-center text-sm">
                          OFF
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-center">
                        Minimum Purchase Amount:{" "}
                        {formatAmount(z.minimumPurchasePrice, locale, true)}
                      </span>
                      {z.isShippingFree === true && (
                        <span className="text-xs text-center">
                          Free shipping
                        </span>
                      )}
                    </div>
                  </div>
                )
              )}
          </div>
        </div>
      )}
      {productData && isSeller(user) && (
        <>
          <h3 className="text-lg ml-3 mt-3">Products</h3>
          {productData.length > 0 ? (
            <div className="bg-white p-3 rounded-md border grid grid-cols-auto200 gap-3">
              {productData.map((b, index) => (
                <React.Fragment key={index}>
                  {b.type === ProductType.Auction ? (
                    <AuctionCard product={b} />
                  ) : (
                    <ProductCard product={b} />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="grid p-10 bg-white place-content-center rounded-md border">
              <h1 className="tracking-widest text-gray-500 uppercase">
                This seller doesn't have any products yet.
              </h1>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UserHomeSection;
