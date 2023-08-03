import { fetcher } from "@/util/fetcher";
import { formatAmount } from "@/util/textHelper";
import React from "react";
import useSWR from "swr";
import StatsBar from "./StatsBar";
import { Colors } from "@/types/color";
import { invoiceStatusObj } from "@/components/muiTable/OrderFullTbl";
import { OrderStatus } from "@/types/orderTypes";

function SaleOverviewCard() {
  const { data } = useSWR("/api/stats/salesOverview", fetcher);

  return data ? (
    <div className="lg:col-span-2 grid grid-cols-2 gap-3">
      <div className="flex flex-col bg-white shadow p-3">
        <h4 className="font-light text-base text-gray-500 font-inter mb-2">
          Total Buyers
        </h4>
        <p className="font-bold text-lg">
          {formatAmount(data.totalBuyers, "en", false, true)}
        </p>
        <StatsBar
          stats={[
            {
              amount: data.totalActiveBuyers,
              backgroundColor: Colors.primary,
              label: "Active",
            },
            {
              amount: data.totalInactiveBuyers,
              backgroundColor: Colors.accent,
              label: "Inactive",
            },
          ]}
        />
      </div>
      <div className="flex flex-col bg-white shadow p-3">
        <h4 className="font-light text-base text-gray-500 font-inter mb-2">
          Total Sellers
        </h4>
        <p className="font-bold text-lg">
          {formatAmount(data.totalSellers, "en", false, true)}
        </p>
        <StatsBar
          stats={[
            {
              amount: data.totalActiveSellers,
              backgroundColor: Colors.primary,
              label: "Active",
            },
            {
              amount: data.totalInactiveSellers,
              backgroundColor: Colors.accent,
              label: "Inactive",
            },
            {
              amount: data.totalExpiredSellers,
              backgroundColor: Colors.secondary,
              label: "Expired",
            },
          ]}
        />
      </div>
      <div className="flex flex-col bg-white shadow p-3">
        <h4 className="font-light text-base text-gray-500 font-inter mb-2">
          Total Traders
        </h4>
        <p className="font-bold text-lg">
          {formatAmount(data.totalTraders, "en", false, true)}
        </p>
        <StatsBar
          stats={[
            {
              amount: data.totalActiveTraders,
              backgroundColor: Colors.primary,
              label: "Active",
            },
            {
              amount: data.totalInactiveTraders,
              backgroundColor: Colors.accent,
              label: "Inactive",
            },
            {
              amount: data.totalExpiredTraders,
              backgroundColor: Colors.secondary,
              label: "Expired",
            },
          ]}
        />
      </div>
      <div className="flex flex-col bg-white shadow p-3">
        <h4 className="font-light text-base text-gray-500 font-inter mb-2">
          Total Ads
        </h4>
        <p className="font-bold text-lg">
          {formatAmount(data.totalAds, "en", false, true)}
        </p>
        <StatsBar
          stats={[
            {
              amount: data.totalAdsPlaced,
              backgroundColor: Colors.primary,
              label: "Active",
            },
            {
              amount: data.totalAdsNearExpired,
              backgroundColor: Colors.warning,
              label: "Expired Soon",
            },
            {
              amount: data.totalAdsExpired,
              backgroundColor: Colors.secondary,
              label: "Expired",
            },
            {
              amount: data.totalAdsNotPlaced,
              backgroundColor: Colors.error,
              label: "Not Placed",
            },
          ]}
        />
      </div>
      <div className="flex flex-col bg-white shadow p-3">
        <h4 className="font-light text-base text-gray-500 font-inter mb-2">
          Total Orders
        </h4>
        <p className="font-bold text-lg">
          {formatAmount(data.totalOrders, "en", false, true)}
        </p>
        <StatsBar
          stats={[
            {
              amount: data.totalOrderReceivedOrders,
              backgroundColor:
                invoiceStatusObj[OrderStatus.OrderReceived]!.color,
              label: "Order Received",
            },
            {
              amount: data.totalAcceptOrders,
              backgroundColor: invoiceStatusObj[OrderStatus.Accepted]!.color,
              label: "Accepted",
            },
            {
              amount: data.totalShippedOrders,
              backgroundColor: invoiceStatusObj[OrderStatus.Shipped]!.color,
              label: "Shipped",
            },
            {
              amount: data.totalRejectedOrders,
              backgroundColor: invoiceStatusObj[OrderStatus.Rejected]!.color,
              label: "Rejected",
            },
            {
              amount: data.totalAutoCancelledOrders,
              backgroundColor:
                invoiceStatusObj[OrderStatus.AutoCancelled]!.color,
              label: "Auto Cancelled",
            },
          ]}
        />
      </div>
      <div className="flex flex-col bg-white shadow p-3">
        <h4 className="font-light text-base text-gray-500 font-inter mb-2">
          Total Products
        </h4>
        <p className="font-bold text-lg">
          {formatAmount(data.totalProducts, "en", false, true)}
        </p>
        <StatsBar
          stats={[
            {
              amount: data.totalAuctions,
              backgroundColor: Colors.primary,
              label: "Auctions",
            },
            {
              amount: data.totalInStockProducts,
              backgroundColor: Colors.success,
              label: "In Stock",
            },
            {
              amount: data.totalOutOfStockProducts,
              backgroundColor: Colors.error,
              label: "Out of Stock",
            },
            {
              amount: data.totalLowStockProducts,
              backgroundColor: Colors.warning,
              label: "Low Stock",
            },
          ]}
        />
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
