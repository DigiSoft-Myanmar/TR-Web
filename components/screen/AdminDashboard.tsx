import React from "react";
import RegionStatsCard from "../card/dashboard/RegionStatsCard";
import WeeklySiteVisitCard from "../card/dashboard/WeeklySiteVisitCard";
import SaleOverviewCard from "../card/dashboard/SaleOverviewCard";
import BestSellerCard from "../card/dashboard/BestSellerCard";

function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <SaleOverviewCard />
      <WeeklySiteVisitCard />
      <BestSellerCard />
      <RegionStatsCard />
    </div>
  );
}

export default AdminDashboard;
