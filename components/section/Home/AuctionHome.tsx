import AuctionCard from "@/components/card/AuctionCard";
import ProductImg from "@/components/card/ProductImg";
import Avatar from "@/components/presentational/Avatar";
import { useAuction } from "@/context/AuctionContext";
import { fileUrl } from "@/types/const";
import { ProductNavType, RemainingTime } from "@/types/productTypes";
import { convertMsToTime, getValue } from "@/util/formatter";
import { showConfirmationDialog } from "@/util/swalFunction";
import { formatAmount, getText } from "@/util/textHelper";
import { Brand, Category, Product, Review, User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

function AuctionHome({
  prodList,
  categories,
}: {
  prodList: (Product & {
    Brand: Brand;
    Review: Review[];
    seller: User;
  })[];
  categories: Category[];
}) {
  const { locale } = useRouter();
  const { t } = useTranslation("common");
  const [current, setCurrent] = React.useState("");
  const [remainingTime, setRemainingTime] = React.useState<RemainingTime>();
  const [bidAmount, setBidAmount] = React.useState(0);
  const { data, refetch } = useQuery(
    ["bidAmount", prodList[0].id, prodList[0].SKU],
    () =>
      fetch(
        "/api/auction/prod?prodId=" + prodList[0].id + "&SKU=" + prodList[0].SKU
      ).then((res) => {
        let json = res.json();
        return json;
      })
  );
  const { newBid, placeBid } = useAuction();

  React.useEffect(() => {
    if (data?.currentBid) {
      setBidAmount(data?.currentBid + 1000);
    } else {
      setBidAmount(prodList[0].openingBid);
    }
  }, [prodList[0], data]);

  React.useEffect(() => {
    if (newBid) {
      if (
        newBid.find(
          (z) => z.productId === prodList[0].id && z.SKU === prodList[0].SKU
        )
      ) {
        refetch();
      }
    }
  }, [newBid]);

  React.useEffect(() => {
    if (prodList[0]) {
      const startDate = new Date(prodList[0].startTime);
      if (new Date() >= startDate) {
        const intervalId = setInterval(() => {
          if (prodList[0].endTime) {
            if (
              new Date(prodList[0].endTime!).valueOf() > new Date().valueOf()
            ) {
              let remainingTime =
                new Date(prodList[0].endTime!).valueOf() - new Date().valueOf();
              setRemainingTime(convertMsToTime(remainingTime));
            } else {
              setRemainingTime(undefined);
            }
          }
        }, 1000);

        // clear interval on re-render to avoid memory leaks
        return () => clearInterval(intervalId);
      } else {
        const intervalId = setInterval(() => {
          if (prodList[0].startTime) {
            if (
              new Date(prodList[0].startTime!).valueOf() > new Date().valueOf()
            ) {
              let remainingTime =
                new Date(prodList[0].startTime!).valueOf() -
                new Date().valueOf();
              setRemainingTime(convertMsToTime(remainingTime));
            } else {
              setRemainingTime(undefined);
            }
          }
        }, 1000);

        // clear interval on re-render to avoid memory leaks
        return () => clearInterval(intervalId);
      }
    }
  }, [prodList[0]]);

  return (
    <div className="bg-darkShade text-white p-5 lg:p-0 mt-32 lg:mt-56">
      <div className="py-5 flex flex-col gap-5 w-full max-w-screen-xl mx-auto">
        <div className="relative flex flex-col lg:flex-row items-center gap-3">
          <div className="absolute -top-32 lg:-top-56 flex flex-col items-start bg-white rounded-md max-w-[250px]">
            <div className="overflow-hidden">
              <ProductImg
                imgUrl={fileUrl + prodList[0].imgList[0]}
                roundedAll={true}
                title={prodList[0].name}
                width={250}
              />
            </div>
            <div className="flex flex-col gap-3 p-5">
              <h3 className="text-primaryText font-semibold line-clamp-2">
                {getText(prodList[0].name, prodList[0].nameMM, locale)}
              </h3>
              <div className="flex flex-row items-center gap-3 text-gray-600">
                <Avatar
                  username={prodList[0].seller.username}
                  profile={prodList[0].seller.profile}
                />
                <p className="text-sm line-clamp-1">
                  {prodList[0].seller.displayName
                    ? prodList[0].seller.displayName
                    : prodList[0].seller.username}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-[250px] lg:ml-[250px] lg:mt-0 px-5 w-full">
            <div
              className="text-sm"
              dangerouslySetInnerHTML={{
                __html: getText(
                  prodList[0].shortDescription,
                  prodList[0].shortDescriptionMM,
                  locale
                ),
              }}
            />
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 w-full">
              <div className="flex flex-col gap-3 items-center flex-1">
                {data?.currentBid > 0 ? (
                  <h3 className="font-medium text-gray-200">
                    {t("currentBid")}
                  </h3>
                ) : (
                  <h3 className="font-medium text-gray-200">
                    {t("openingBid")}
                  </h3>
                )}
                <p className="text-xl font-bold">
                  {formatAmount(
                    data?.currentBid > 0
                      ? data?.currentBid
                      : prodList[0].openingBid,
                    locale,
                    true
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-3 items-center flex-1">
                <h3 className="font-medium text-gray-200">
                  {new Date(prodList[0].startTime) > new Date()
                    ? "Starts in"
                    : "Ending in"}
                </h3>
                <div className="grid grid-flow-col gap-5 text-center auto-cols-max place-items-center text-white">
                  {remainingTime?.days > 0 ? (
                    <div className="flex flex-col text-gray-200 text-xs items-center">
                      <span className="countdown font-mono text-xl text-white font-bold">
                        <span style={getValue(remainingTime?.days)}></span>
                      </span>
                      days
                    </div>
                  ) : (
                    <></>
                  )}
                  <div className="flex flex-col text-gray-200 text-xs items-center">
                    <span className="countdown font-mono text-xl text-white font-bold">
                      <span style={getValue(remainingTime?.hours)}></span>
                    </span>
                    hours
                  </div>
                  <div className="flex flex-col text-gray-200 text-xs items-center">
                    <span className="countdown font-mono text-xl text-white font-bold">
                      <span style={getValue(remainingTime?.minutes)}></span>
                    </span>
                    min
                  </div>
                  <div className="flex flex-col text-gray-200 text-xs items-center">
                    <span className="countdown font-mono text-xl text-white font-bold">
                      <span style={getValue(remainingTime?.seconds)}></span>
                    </span>
                    sec
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-start gap-3 flex-1 justify-end mt-3 lg:mt-5">
                <div className="flex-1 flex flex-col gap-1">
                  <button
                    className="bg-primary text-white rounded-md px-3 py-3 w-full text-sm hover:bg-primary-focus transition"
                    type="button"
                    onClick={() => {
                      placeBid(
                        bidAmount,
                        prodList[0].id,
                        prodList[0].SKU,
                        prodList[0].sellerId,
                        prodList[0].seller
                      );
                    }}
                  >
                    {t("placeBid")}
                  </button>
                  <span className="text-sm text-center">
                    {formatAmount(bidAmount, locale, true)}
                  </span>
                </div>
                <Link
                  href={"/marketplace/" + encodeURIComponent(prodList[0].slug)}
                  className="bg-slate-600 text-white rounded-md px-3 py-3 flex-1 text-sm hover:bg-slate-700 transition text-center"
                >
                  {t("seeDetails")}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 lg:mt-20 flex flex-row items-center justify-between gap-5 w-full">
          <h3 className="font-semibold text-lg">{t("liveAuctions")}</h3>
          <Link
            href={"/marketplace?type=" + ProductNavType.Auction}
            className="text-sm font-semibold transition group pb-[3px] hover:pb-0"
          >
            {t("seeMore")}
            <div className="group-hover:flex hidden w-1/2 h-[2px] rounded-full bg-white mt-1"></div>
          </Link>
        </div>
        <div className="flex flex-row items-center gap-5 max-w-screen-xl overflow-x-auto scrollbar-hide pb-5">
          <div
            className={`cursor-pointer text-sm whitespace-nowrap group ${
              current === "" ? "pb-0" : "pb-3 hover:pb-0"
            }`}
            onClick={() => {
              setCurrent("");
            }}
          >
            {t("all")}
            {current === "" ? (
              <div className="w-1/2 h-1 rounded-full bg-white mt-2"></div>
            ) : (
              <div className="group-hover:flex hidden w-1/2 h-1 rounded-full bg-white mt-2"></div>
            )}
          </div>
          {categories.map((z: any, index: number) => (
            <div
              key={index}
              className={`cursor-pointer text-sm whitespace-nowrap group ${
                current === z.id ? "pb-0" : "pb-3 hover:pb-0"
              }`}
              onClick={() => {
                setCurrent(z.id);
              }}
            >
              {getText(z.name, z.nameMM, locale)}

              {current === z.id ? (
                <div className="w-1/2 h-1 rounded-full bg-white mt-2"></div>
              ) : (
                <div className="group-hover:flex hidden w-1/2 h-1 rounded-full bg-white mt-2"></div>
              )}
            </div>
          ))}
        </div>
        {prodList.filter((z) =>
          current === ""
            ? z.id !== prodList[0].id
            : z.id !== prodList[0].id &&
              z.categoryIds.find((b) => b === current)
        ).length > 0 ? (
          <div className="mt-3 flex flex-row max-w-screen-xl overflow-auto scrollbar-hide pb-5 gap-3">
            {prodList
              .filter((z) =>
                current === ""
                  ? z.id !== prodList[0].id
                  : z.id !== prodList[0].id &&
                    z.categoryIds.find((b) => b === current)
              )
              .map((z, index) => (
                <AuctionCard key={index} product={z} />
              ))}
          </div>
        ) : (
          <div className="grid h-[300px] px-4 place-content-center">
            <h1 className="tracking-widest text-white uppercase">
              {current === ""
                ? t("browsedAllProducts")
                : getText(
                    "No products related to " +
                      categories.find((b) => b.id === current).name,
                    +categories.find((b) => b.id === current).nameMM +
                      " နှင့်ပတ်သက်၍ ပစ္စည်းမရှိပါ။",
                    locale
                  )}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuctionHome;
