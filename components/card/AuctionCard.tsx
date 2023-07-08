import React from "react";
import ProductImg from "./ProductImg";
import { fileUrl } from "@/types/const";
import { formatAmount, getText } from "@/util/textHelper";
import { ProductType } from "@prisma/client";
import { getPricing } from "@/util/pricing";
import { useRouter } from "next/router";
import { RemainingTime } from "@/types/productTypes";
import { convertMsToTime, getValue } from "@/util/formatter";
import { useQuery } from "react-query";
import Link from "next/link";
import { useAuction } from "@/context/AuctionContext";

function AuctionCard({ product }: { product: any }) {
  const { locale } = useRouter();
  const { data, refetch } = useQuery(
    ["bidAmount", product.id, product.SKU],
    () =>
      fetch(
        "/api/auction/prod?prodId=" + product.id + "&SKU=" + product.SKU
      ).then((res) => {
        let json = res.json();
        return json;
      })
  );
  const [remainingTime, setRemainingTime] = React.useState<RemainingTime>();
  const { newBid } = useAuction();

  React.useEffect(() => {
    if (newBid) {
      if (
        newBid.find((z) => z.productId === product.id && z.SKU === product.SKU)
      ) {
        refetch();
      }
    }
  }, [newBid]);

  React.useEffect(() => {
    if (product) {
      const startDate = new Date(product.startTime);
      if (new Date() >= startDate) {
        const intervalId = setInterval(() => {
          if (product.endTime) {
            if (new Date(product.endTime!).valueOf() > new Date().valueOf()) {
              let remainingTime =
                new Date(product.endTime!).valueOf() - new Date().valueOf();
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
          if (product.startTime) {
            if (new Date(product.startTime!).valueOf() > new Date().valueOf()) {
              let remainingTime =
                new Date(product.startTime!).valueOf() - new Date().valueOf();
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
  }, [product]);

  return (
    <Link
      className="max-w-[200px] overflow-hidden flex flex-col gap-3 rounded-md cursor-pointer bg-white border hover:border-primary transition"
      href={"/marketplace/" + encodeURIComponent(product.slug)}
    >
      <div className="overflow-hidden">
        <ProductImg
          imgUrl={fileUrl + product.imgList[0]}
          title={product.name}
          roundedAll={false}
          width={200}
        />
      </div>
      <div className="flex flex-col gap-3 text-primaryText p-3">
        <h3 className="text-primaryText font-semibold line-clamp-2">
          {getText(product.name, product.nameMM, locale)}
        </h3>

        <p className="text-sm">
          {data?.currentBid > 0
            ? formatAmount(data.currentBid, locale, true)
            : formatAmount(product.openingBid, locale, true)}
        </p>

        <span className="text-xs border-t pt-3 border-t-gray-500">
          {new Date(product.startTime) > new Date()
            ? "Starts in"
            : new Date(product.endTime) > new Date()
            ? "Ending in"
            : "Ended"}
        </span>
        {remainingTime && (
          <div className="grid grid-flow-col gap-5 text-center auto-cols-max place-items-center text-primaryText mb-2">
            {remainingTime?.days > 0 ? (
              <div className="flex flex-col text-gray-600 text-xs items-center">
                <span className="countdown font-mono text-sm text-primaryText font-bold">
                  <span style={getValue(remainingTime?.days)}></span>
                </span>
                days
              </div>
            ) : (
              <></>
            )}
            <div className="flex flex-col text-gray-600 text-xs items-center">
              <span className="countdown font-mono text-sm text-primaryText font-bold">
                <span style={getValue(remainingTime?.hours)}></span>
              </span>
              hours
            </div>
            <div className="flex flex-col text-gray-600 text-xs items-center">
              <span className="countdown font-mono text-sm text-primaryText font-bold">
                <span style={getValue(remainingTime?.minutes)}></span>
              </span>
              min
            </div>
            <div className="flex flex-col text-gray-600 text-xs items-center">
              <span className="countdown font-mono text-sm text-primaryText font-bold">
                <span style={getValue(remainingTime?.seconds)}></span>
              </span>
              sec
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export default AuctionCard;
