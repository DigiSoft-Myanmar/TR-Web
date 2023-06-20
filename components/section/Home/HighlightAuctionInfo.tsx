import ProductImg from "@/components/card/ProductImg";
import { convertMsToTime } from "@/util/formatter";
import { formatAmount } from "@/util/textHelper";
import { ProductType } from "@prisma/client";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

interface Props {
  type: ProductType;
  name?: string;
  nameMM?: string;
  image?: string;
  seller?: any;
  currentBid?: any;
  startTime?: string;
  openingBid?: any;
  endTime?: string;
  productInfo?: string;
  productInfoMM?: string;
  slug?: string;
  id: string;
}

function HighlightAuctionInfo({
  type,
  id,
  name,
  nameMM,
  image,
  seller,
  openingBid,
  startTime,
  endTime,
  productInfo,
  productInfoMM,
  slug,
}: Props) {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  const [remainingTime, setRemainingTime] = React.useState<string>("");

  const [currentBid, setCurrentBid] = React.useState(0);
  const [totalBids, setTotalBids] = React.useState(0);

  React.useEffect(() => {
    fetch("/api/marketplace/placeBid?id=" + id)
      .then((data) => data.json())
      .then((json) => {
        setCurrentBid(json.currentBid);
        setTotalBids(json.totalBids);
      });
  }, []);

  /*  React.useEffect(() => {
    if (refreshId === id) {
      fetch("/api/marketplace/placeBid?id=" + id)
        .then((data) => data.json())
        .then((json) => {
          setCurrentBid(json.currentBid);
          setTotalBids(json.totalBids);
        });
    }
  }, [refreshId]); */

  React.useEffect(() => {
    if (startTime) {
      const startDate = new Date(startTime);
      if (new Date() >= startDate) {
        const intervalId = setInterval(() => {
          if (endTime) {
            if (new Date(endTime!).valueOf() > new Date().valueOf()) {
              let remainingTime =
                new Date(endTime!).valueOf() - new Date().valueOf();
              //setRemainingTime(convertMsToTime(remainingTime, locale));
            } else {
              setRemainingTime(t("biddingClose"));
            }
          }
        }, 1000);

        // clear interval on re-render to avoid memory leaks
        return () => clearInterval(intervalId);
      } else {
        setRemainingTime("");
      }
    }
  }, [endTime, startTime]);

  return (
    <div className="items-center justify-center md:justify-start flex flex-col md:flex-row relative">
      <div className="relative">
        <div className="relative -top-32 lg:-top-56 rounded-md flex flex-col items-center bg-white justify-center min-w-[250px] max-w-[250px]">
          {image && name && (
            <div className="overflow-hidden">
              <ProductImg
                imgUrl={"/api/files/" + encodeURIComponent(image)}
                title={name}
                width={250}
                roundedAll={false}
              />
            </div>
          )}
          <div className="relative px-10 py-5 rounded-b-md bg-white w-full flex flex-col space-y-3 dark:bg-bgDark">
            <h3 className="text-lg font-bold">
              {locale === "mm" && nameMM && nameMM.length > 0 ? nameMM : name}
            </h3>
            <div className="flex items-center flex-wrap gap-3">
              {seller && seller.profile && (
                <div className="rounded-full shadow-md">
                  <img
                    src={"/api/files/" + encodeURIComponent(seller.profile)}
                    className="rounded-full w-7 h-7"
                  />
                </div>
              )}
              <h4 className="font-semibold">
                {seller.displayName ? seller.displayName : seller.username}
              </h4>
            </div>
          </div>
        </div>
      </div>
      <div className="flex relative -top-28 md:-top-10 lg:-top-28 flex-col md:px-10 text-white">
        <p className="text-sm leading-5 md:line-clamp-2 text-justify text-gray-300">
          {locale &&
          locale === "mm" &&
          productInfoMM &&
          productInfoMM.length > 0
            ? productInfoMM
            : productInfo}
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 py-5 w-full">
          <div className="flex flex-col space-y-3">
            {currentBid && currentBid > 0 ? (
              <>
                <h3 className="font-medium text-gray-200">{t("currentBid")}</h3>
                <h1 className="font-bold text-xl">
                  {formatAmount(currentBid, locale, true)}
                </h1>
              </>
            ) : (
              <>
                <h3 className="font-medium text-gray-200">{t("openingBid")}</h3>
                <h1 className="font-bold text-xl">
                  {formatAmount(openingBid, locale, true)}
                </h1>
              </>
            )}
          </div>
          {remainingTime && remainingTime.length > 0 ? (
            <div className="flex flex-col space-y-3">
              <h3 className="font-medium text-gray-200">{t("endsIn")}</h3>
              <h1 className="font-bold text-xl">{remainingTime}</h1>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <h3 className="font-medium text-gray-200">{t("startsIn")}</h3>
              <h1 className="font-bold text-xl">
                {new Date(startTime!).toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour12: true,
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </h1>
            </div>
          )}
          <div className="flex gap-3 flex-wrap items-start lg:justify-center justify-end md:justify-start">
            <div
              className="inline-flex items-center px-8 py-3 text-white bg-info border border-info rounded hover:bg-transparent hover:text-info active:text-info hover:bg-white focus:outline-none focus:ring cursor-pointer dark:hover:bg-infoDark dark:hover:text-white"
              onClick={(e) => {
                try {
                  fetch("https://api.ipify.org/?format=json")
                    .then((data) => data.json())
                    .then((json) => {
                      fetch(
                        "/api/products/clickCount?productId=" +
                          id +
                          "&ip=" +
                          json.ip,
                        {
                          method: "POST",
                        }
                      );
                    });
                } catch (err) {
                  fetch("/api/products/clickCount?productId=" + id, {
                    method: "POST",
                  });
                }
              }}
            >
              <span className="text-sm font-medium"> {t("placeBid")} </span>
            </div>
            <Link
              href={"/marketplace/" + encodeURIComponent(slug!)}
              className="inline-flex items-center px-8 py-3 text-white bg-lightAccent border border-lightAccent rounded hover:bg-transparent hover:text-lightAccent active:text-lightAccent hover:bg-white focus:outline-none focus:ring cursor-pointer dark:hover:bg-lightAccent/70 dark:hover:text-white"
            >
              <span className="text-sm font-medium"> {t("seeDetails")} </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HighlightAuctionInfo;
