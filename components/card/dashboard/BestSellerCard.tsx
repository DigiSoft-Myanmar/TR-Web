import Avatar from "@/components/presentational/Avatar";
import { fileUrl } from "@/types/const";
import { fetcher } from "@/util/fetcher";
import { formatAmount } from "@/util/textHelper";
import Image from "next/image";
import React from "react";
import useSWR from "swr";

function BestSellerCard() {
  const date = new Date();
  const { data } = useSWR("/api/stats/bestStats", fetcher);

  return data ? (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col bg-white p-5 flex-1 gap-1 items-center lg:items-start shadow hover:border-primary border border-gray-50 rounded-sm cursor-pointer">
          <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1 leading-8">
            Best Buyer (By Units Purchased)
          </h4>
          <p className="font-bold text-lg">
            {formatAmount(data.bestBuyerByUnit.units, "en", false, true)}{" "}
            <span className="text-xs font-light">
              units purchased with{" "}
              {formatAmount(data.bestBuyerByUnit.totalProfit, "en", true, true)}{" "}
            </span>
          </p>
          <div className="flex flex-row items-center gap-3 mt-3">
            <Avatar
              size={50}
              username={data.bestBuyerByUnit.userInfo.username}
              profile={data.bestBuyerByUnit.userInfo.profile}
            />
            <div className="flex flex-col gap-1">
              <h4 className="font-extralight text-lg text-gray-500 font-inter line-clamp-1 leading-6">
                {data.bestBuyerByUnit.userInfo.username}
              </h4>
              <span className="text-xs font-light">
                {data.bestBuyerByUnit.userInfo.displayName}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col bg-white p-5 flex-1 gap-1 items-center lg:items-start shadow hover:border-primary border border-gray-50 rounded-sm cursor-pointer">
          <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1 leading-8">
            Best Buyer (By MMK)
          </h4>
          <p className="font-bold text-lg">
            {formatAmount(data.bestBuyerByProfit.totalProfit, "en", true, true)}{" "}
            <span className="text-xs font-light">
              purchased with{" "}
              {formatAmount(data.bestBuyerByProfit.units, "en", false, true)}{" "}
              units
            </span>
          </p>
          <div className="flex flex-row items-center gap-3 mt-3">
            <Avatar
              size={50}
              username={data.bestBuyerByProfit.userInfo.username}
              profile={data.bestBuyerByProfit.userInfo.profile}
            />
            <div className="flex flex-col gap-1">
              <h4 className="font-extralight text-lg text-gray-500 font-inter line-clamp-1 leading-6">
                {data.bestBuyerByProfit.userInfo.username}
              </h4>
              <span className="text-xs font-light">
                {data.bestBuyerByProfit.userInfo.displayName}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col bg-white p-5 flex-1 gap-1 items-center lg:items-start shadow hover:border-primary border border-gray-50 rounded-sm cursor-pointer">
          <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1 leading-8">
            Best Seller (By Units Sold)
          </h4>
          <p className="font-bold text-lg">
            {formatAmount(data.bestSellerByUnit.units, "en", false, true)}{" "}
            <span className="text-xs font-light">
              units sold with{" "}
              {formatAmount(
                data.bestSellerByUnit.totalProfit,
                "en",
                true,
                true
              )}{" "}
            </span>
          </p>
          <div className="flex flex-row items-center gap-3 mt-3">
            <Avatar
              size={50}
              username={data.bestSellerByUnit.userInfo.username}
              profile={data.bestSellerByUnit.userInfo.profile}
            />
            <div className="flex flex-col gap-1">
              <h4 className="font-extralight text-lg text-gray-500 font-inter line-clamp-1 leading-6">
                {data.bestSellerByUnit.userInfo.username}
              </h4>
              <span className="text-xs font-light">
                {data.bestSellerByUnit.userInfo.displayName}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col bg-white p-5 flex-1 gap-1 items-center lg:items-start shadow hover:border-primary border border-gray-50 rounded-sm cursor-pointer">
          <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1 leading-8">
            Best Seller (By MMK)
          </h4>
          <p className="font-bold text-lg">
            {formatAmount(
              data.bestSellerByProfit.totalProfit,
              "en",
              true,
              true
            )}{" "}
            <span className="text-xs font-light">
              sold with{" "}
              {formatAmount(data.bestSellerByProfit.units, "en", true, true)}{" "}
              units
            </span>
          </p>
          <div className="flex flex-row items-center gap-3 mt-3">
            <Avatar
              size={50}
              username={data.bestSellerByProfit.userInfo.username}
              profile={data.bestSellerByProfit.userInfo.profile}
            />
            <div className="flex flex-col gap-1">
              <h4 className="font-extralight text-lg text-gray-500 font-inter line-clamp-1 leading-6">
                {data.bestSellerByProfit.userInfo.username}
              </h4>
              <span className="text-xs font-light">
                {data.bestSellerByProfit.userInfo.displayName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col bg-white p-5 pb-0 flex-1 gap-1 items-center lg:items-start shadow hover:border-primary border border-gray-50 rounded-sm cursor-pointer">
          <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1 leading-8">
            Best Product (By Units Sold)
          </h4>
          <p className="font-bold text-lg">
            {formatAmount(data.bestProdByUnit.units, "en", false, true)}{" "}
            <span className="text-xs font-light">
              units sold with{" "}
              {formatAmount(data.bestProdByUnit.totalProfit, "en", true, true)}{" "}
            </span>
          </p>
          <div className="flex flex-row items-center gap-3">
            <Image
              src={fileUrl + data.bestProdByUnit.productInfo.imgList[0]}
              width={100}
              height={100}
              alt="best product"
              className="w-[100px] h-[100px] object-cover py-3"
            />
            <div className="flex flex-col gap-1">
              <h4 className="font-extralight text-lg text-gray-500 font-inter line-clamp-1 leading-6">
                {data.bestProdByUnit.productInfo.name
                  ? data.bestProdByUnit.productInfo.name
                  : "Custom"}
              </h4>
              <span className="text-xs font-light">
                {data.bestProdByUnit.productInfo.SKU}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col bg-white p-5 pb-0 flex-1 gap-1 items-center lg:items-start shadow hover:border-primary border border-gray-50 rounded-sm cursor-pointer">
          <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1 leading-8">
            Best Product (By MMK)
          </h4>
          <p className="font-bold text-lg">
            {formatAmount(data.bestProdByProfit.totalProfit, "en", true, true)}{" "}
            <span className="text-xs font-light">
              sold with{" "}
              {formatAmount(data.bestProdByProfit.units, "en", false, true)}{" "}
              units
            </span>
          </p>
          <div className="flex flex-row items-center gap-3">
            <Image
              src={fileUrl + data.bestProdByProfit.productInfo.imgList[0]}
              width={100}
              height={100}
              alt="best product"
              className="w-[100px] h-[100px] object-cover py-3"
            />
            <div className="flex flex-col gap-1">
              <h4 className="font-extralight text-lg text-gray-500 font-inter line-clamp-1 leading-6">
                {data.bestProdByProfit.productInfo.name
                  ? data.bestProdByProfit.productInfo.name
                  : "Custom"}
              </h4>
              <span className="text-xs font-light">
                {data.bestProdByProfit.productInfo.SKU}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col bg-white p-5 pb-0 flex-1 gap-1 items-center lg:items-start shadow hover:border-primary border border-gray-50 rounded-sm cursor-pointer">
          <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1 leading-8">
            Best Auction Product (By MMK)
          </h4>
          <p className="font-bold text-lg">
            {formatAmount(
              data.bestAuctionByAmount.totalProfit,
              "en",
              true,
              true
            )}{" "}
            <span className="text-xs font-light">
              won with{" "}
              {formatAmount(data.bestAuctionByAmount.units, "en", false, true)}{" "}
              bids
            </span>
          </p>
          <div className="flex flex-row items-center gap-3">
            <Image
              src={fileUrl + data.bestAuctionByAmount.productInfo.imgList[0]}
              width={100}
              height={100}
              alt="best product"
              className="w-[100px] h-[100px] object-cover py-3"
            />
            <div className="flex flex-col gap-1">
              <h4 className="font-extralight text-lg text-gray-500 font-inter line-clamp-1 leading-6">
                {data.bestAuctionByAmount.productInfo.name
                  ? data.bestAuctionByAmount.productInfo.name
                  : "Custom"}
              </h4>
              <span className="text-xs font-light">
                {data.bestAuctionByAmount.SKU}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col bg-white p-5 pb-0 flex-1 gap-1 items-center lg:items-start shadow hover:border-primary border border-gray-50 rounded-sm cursor-pointer">
          <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1 leading-8">
            Best Auction Product (By Bids)
          </h4>
          <p className="font-bold text-lg">
            {formatAmount(data.bestAuctionByUnit.units, "en", false, true)}{" "}
            <span className="text-xs font-light">
              placed and won with{" "}
              {formatAmount(
                data.bestAuctionByUnit.totalProfit,
                "en",
                true,
                true
              )}{" "}
            </span>
          </p>
          <div className="flex flex-row items-center gap-3">
            <Image
              src={fileUrl + data.bestAuctionByUnit.productInfo.imgList[0]}
              width={100}
              height={100}
              alt="best product"
              className="w-[100px] h-[100px] object-cover py-3"
            />
            <div className="flex flex-col gap-1">
              <h4 className="font-extralight text-lg text-gray-500 font-inter line-clamp-1 leading-6">
                {data.bestAuctionByUnit.productInfo.name
                  ? data.bestAuctionByUnit.productInfo.name
                  : "Custom"}
              </h4>
              <span className="text-xs font-light">
                {data.bestAuctionByUnit.SKU}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <></>
  );
}

export default BestSellerCard;
