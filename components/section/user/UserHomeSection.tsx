import AuctionCard from "@/components/card/AuctionCard";
import ProductCard from "@/components/card/ProductCard";
import ProductImg from "@/components/card/ProductImg";
import Avatar from "@/components/presentational/Avatar";
import { fileUrl } from "@/types/const";
import { isInternal, isSeller } from "@/util/authHelper";
import { fetcher } from "@/util/fetcher";
import { getPricing } from "@/util/pricing";
import useSWR from "swr";
import {
  formatAmount,
  getPromoAvailCount,
  getPromoCount,
  getText,
  getUsageCount,
} from "@/util/textHelper";
import {
  Category,
  Product,
  ProductType,
  PromoCode,
  StockType,
  User,
} from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

enum Tab {
  BuyNow,
  Promotions,
  LiveAuctions,
  Auctions,
  EndedAuctions,
  LowStock,
  OutOfStock,
}

let TabList = [
  {
    TabInfo: Tab.BuyNow,
    name: "Buy Now",
    nameMM: "ဝယ်ယူရရှိနိုင်သော ပစ္စည်းများ",
  },
  {
    TabInfo: Tab.Promotions,
    name: "Promotions",
    nameMM: "လျှော့စျေး ပစ္စည်းများ",
  },
  {
    TabInfo: Tab.LiveAuctions,
    name: "Live Auctions",
    nameMM: "လက်ရှိ လေလံပစ္စည်းများ",
  },
  {
    TabInfo: Tab.Auctions,
    name: "Auctions",
    nameMM: "လေလံပစ္စည်းများ",
  },
  {
    TabInfo: Tab.EndedAuctions,
    name: "Ended Auctions",
    nameMM: "ပြီးဆုံးသွားသော လေလံပစ္စည်းများ",
  },
  {
    TabInfo: Tab.LowStock,
    name: "Low Stock Products",
    nameMM: "လက်ကျန်နည်းနေသော ပစ္စည်းများ",
  },
  {
    TabInfo: Tab.OutOfStock,
    name: "Out of Stock Products",
    nameMM: "လက်ကျန်ပြတ်တောက်နေသော ပစ္စည်းများ",
  },
];

function UserHomeSection({ user }: { user: User }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation("common");
  const [currentStep, setCurrentStep] = React.useState(Tab.BuyNow);
  const { data: settingsData } = useSWR("/api/configurations", fetcher);
  const { isLoading, error, data, refetch } = useQuery(
    ["promoData", user.id],
    () =>
      fetch("/api/promoCode?sellerId=" + user.id).then((res) => {
        let json = res.json();
        return json;
      })
  );
  const { data: productData } = useQuery(["productData", user.id], () =>
    fetch("/api/products?isHome=true&sellerId=" + user.id).then((res) => {
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
                      className="w-[100px] h-[100px] rounded-md min-h-[100px] min-w-[100px]"
                    />
                    <span className="text-lg font-light uppercase">
                      {z.name}
                    </span>
                  </div>
                  {isSeller(user) && productData && (
                    <span className="text-[100px] font-extrabold">
                      {productData.filter((b: Product) =>
                        b.categoryIds.includes(z.id)
                      ).length > 99
                        ? "99+"
                        : productData.filter((b: Product) =>
                            b.categoryIds.includes(z.id)
                          ).length}
                    </span>
                  )}
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

          <div className="px-3 bg-white pt-5">
            <div className="border-b border-gray-200 overflow-auto scrollbar-hide">
              <nav className="-mb-px flex gap-3" aria-label="Tabs">
                {TabList.map((b, index) => (
                  <div
                    key={index}
                    className={
                      currentStep === b.TabInfo
                        ? "shrink-0 border-b-2 border-primary px-1 pb-4 text-sm font-medium text-primary cursor-pointer"
                        : "shrink-0 border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 cursor-pointer"
                    }
                    aria-current="page"
                    onClick={() => {
                      setCurrentStep(b.TabInfo);
                    }}
                  >
                    {getText(b.name, b.nameMM, locale)}
                  </div>
                ))}
              </nav>
            </div>

            {productData.filter((z: any) =>
              currentStep === Tab.Auctions
                ? z.type === ProductType.Auction
                : currentStep === Tab.BuyNow
                ? z.type !== ProductType.Auction
                : currentStep === Tab.EndedAuctions
                ? z.type === ProductType.Auction &&
                  new Date(z.endTime).getTime() < new Date().getTime()
                : currentStep === Tab.LiveAuctions
                ? z.type === ProductType.Auction &&
                  new Date(z.startTime).getTime() <= new Date().getTime() &&
                  new Date(z.endTime).getTime() >= new Date().getTime()
                : currentStep === Tab.LowStock
                ? (z.type === ProductType.Fixed &&
                    z.stockType === StockType.StockLevel &&
                    (settingsData
                      ? z.stockLevel <= settingsData.lowStockLimit
                      : z.stockLevel <= 10)) ||
                  (z.type === ProductType.Variable &&
                    z.variations.find(
                      (b: any) =>
                        b.stockType === StockType.StockLevel &&
                        (settingsData
                          ? b.stockLevel <= settingsData.lowStockLimit
                          : b.stockLevel <= 10)
                    ))
                : currentStep === Tab.OutOfStock
                ? (z.type === ProductType.Fixed &&
                    (z.stockType === StockType.OutOfStock ||
                      (z.stockType === StockType.StockLevel &&
                        z.stockLevel <= 0))) ||
                  (z.type === ProductType.Variable &&
                    z.variations.find(
                      (b: any) =>
                        b.stockType === StockType.OutOfStock ||
                        (b.stockType === StockType.StockLevel &&
                          b.stockLevel <= 0)
                    ))
                : currentStep === Tab.Promotions
                ? z.type !== ProductType.Auction &&
                  getPricing(z).isPromotion === true
                : false
            ).length > 0 ? (
              <div className="bg-white py-3 grid grid-cols-auto200 gap-3 mt-3 place-items-center lg:place-items-start">
                {productData
                  .filter((z: any) =>
                    currentStep === Tab.Auctions
                      ? z.type === ProductType.Auction
                      : currentStep === Tab.BuyNow
                      ? z.type !== ProductType.Auction
                      : currentStep === Tab.EndedAuctions
                      ? z.type === ProductType.Auction &&
                        new Date(z.endTime).getTime() < new Date().getTime()
                      : currentStep === Tab.LiveAuctions
                      ? z.type === ProductType.Auction &&
                        new Date(z.startTime).getTime() <=
                          new Date().getTime() &&
                        new Date(z.endTime).getTime() >= new Date().getTime()
                      : currentStep === Tab.LowStock
                      ? (z.type === ProductType.Fixed &&
                          z.stockType === StockType.StockLevel &&
                          z.stockLevel <= 10) ||
                        (z.type === ProductType.Variable &&
                          z.variations.find(
                            (b: any) =>
                              b.stockType === StockType.StockLevel &&
                              b.stockLevel <= 10
                          ))
                      : currentStep === Tab.OutOfStock
                      ? (z.type === ProductType.Fixed &&
                          (z.stockType === StockType.OutOfStock ||
                            (z.stockType === StockType.StockLevel &&
                              z.stockLevel <= 0))) ||
                        (z.type === ProductType.Variable &&
                          z.variations.find(
                            (b: any) =>
                              b.stockType === StockType.OutOfStock ||
                              (b.stockType === StockType.StockLevel &&
                                b.stockLevel <= 0)
                          ))
                      : currentStep === Tab.Promotions
                      ? z.type !== ProductType.Auction &&
                        getPricing(z).isPromotion === true
                      : false
                  )
                  .map((b, index) => (
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
              <div className="grid p-10 bg-white place-content-center">
                <h1 className="tracking-widest text-gray-500 uppercase">
                  {getText(
                    "This seller doesn't have any products related to this tab.",
                    "ဤရောင်းချသူတွင် ယခုခေါင်းစဉ်နှင့်ပတ်သက်သော ပစ္စည်းမရှိပါ။",
                    locale
                  )}
                </h1>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default UserHomeSection;
