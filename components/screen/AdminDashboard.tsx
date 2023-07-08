import React from "react";
import RegionStatsCard from "../card/dashboard/RegionStatsCard";
import WeeklySiteVisitCard from "../card/dashboard/WeeklySiteVisitCard";
import SaleOverviewCard from "../card/dashboard/SaleOverviewCard";

function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <SaleOverviewCard />
      <WeeklySiteVisitCard />
      <div className="flex flex-col gap-3">
        <div className="">Best Buyer (by Qty)</div>
        <div className="">Best Buyer (by MMK)</div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="">Best Seller (by Qty)</div>
        <div className="">Best Seller (by MMK)</div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="">Best Product (by Qty)</div>
        <div className="">Best Product (by MMK)</div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="">Best Auction Product (by MMK)</div>
        <div className="">Best Auction Product (by Bids)</div>
      </div>
      <RegionStatsCard />
    </div>
  );
}

export default AdminDashboard;
