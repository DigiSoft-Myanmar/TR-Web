import { fetcher } from "@/util/fetcher";
import React from "react";
import useSWR from "swr";

function SaleOverviewCard() {
  const { data } = useSWR("/api/stats/salesOverview", fetcher);
  return data ? (
    <div className="lg:col-span-2 grid grid-cols-2 gap-3">
      <div className="flex flex-col bg-white shadow p-3">
        <h4 className="font-light text-base text-gray-500 font-inter mb-2">
          Total Buyers
        </h4>
        <p className="font-bold text-lg">50</p>
        <p className="text-xs line-clamp-1">Active / Inactive</p>
      </div>
      <div className="flex flex-col bg-white shadow p-3">
        <h4 className="font-light text-base text-gray-500 font-inter mb-2">
          Total Sellers
        </h4>
        <p className="font-bold text-lg">50</p>
        <p className="text-xs line-clamp-1">Active / Inactive / Expired</p>
      </div>
      <div className="flex flex-col bg-white shadow p-3">
        <h4 className="font-light text-base text-gray-500 font-inter mb-2">
          Total Traders
        </h4>
        <p className="font-bold text-lg">50</p>
        <p className="text-xs line-clamp-1">Active / Inactive / Expired</p>
      </div>
      <div className="flex flex-col bg-white shadow p-3">
        <h4 className="font-light text-base text-gray-500 font-inter mb-2">
          Total Ads
        </h4>
        <p className="font-bold text-lg">50</p>
        <p className="text-xs line-clamp-1">
          Placed / Near Expired / Expired / Not Placed
        </p>
      </div>
      <div className="flex flex-col bg-white shadow p-3">
        <h4 className="font-light text-base text-gray-500 font-inter mb-2">
          Total Orders
        </h4>
        <p className="font-bold text-lg">50</p>
        <p className="text-xs line-clamp-1">
          Order Received / Accept / Shipping / Rejected
        </p>
      </div>
      <div className="flex flex-col bg-white shadow p-3">
        <h4 className="font-light text-base text-gray-500 font-inter mb-2">
          Total Products
        </h4>
        <p className="font-bold text-lg">50</p>
        <p className="text-xs line-clamp-1">
          Auction / In Stock / Out of Stock / Low Stock
        </p>
      </div>
    </div>
  ) : (
    <div className="lg:col-span-2 bg-white shadow-md flex flex-col gap-3 items-center justify-center min-h-[300px]">
      <div className="w-1/2 flex flex-col -mt-10">
        <h4 className="font-light text-base text-gray-500 font-inter -mb-5">
          Loading...
        </h4>
        <div className="loading-bar"></div>
      </div>
    </div>
  );
}

export default SaleOverviewCard;
