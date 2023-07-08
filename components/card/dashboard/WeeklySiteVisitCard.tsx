import React from "react";
import WeeklySiteVisitGraph from "./WeeklySiteVisitGraph";
import LoadingScreen from "@/components/screen/LoadingScreen";
import { fetcher } from "@/util/fetcher";
import useSWR from "swr";
import PercentageText from "./PercentageText";
import { formatAmount } from "@/util/textHelper";
import { calculatePercentage } from "@/util/dashboardHelper";

function WeeklySiteVisitCard() {
  const { data } = useSWR("/api/stats/weeklyStats", fetcher);

  return data ? (
    <div className="relative lg:col-span-2 bg-white shadow-md pt-5 flex flex-col gap-3">
      <div>
        <h4 className="font-light text-base text-gray-500 font-inter mb-1 px-5">
          Weekly Site Visits
        </h4>

        {calculatePercentage(
          data.prevStats.totalVisits,
          data.currentStats.totalVisits
        ) > 0 ? (
          <p className="font-bold text-lg text-green-600 px-5">
            {calculatePercentage(
              data.prevStats.totalVisits,
              data.currentStats.totalVisits
            )}
            % increased
          </p>
        ) : (
          <p className="font-bold text-lg text-red-600 px-5">
            {calculatePercentage(
              data.prevStats.totalVisits,
              data.currentStats.totalVisits
            )}
            % decreased
          </p>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 px-5 mt-3 gap-3">
          <div className="flex flex-col bg-white p-3 rounded-md flex-1 border">
            <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1">
              Users Login
            </h4>
            <p className="font-bold text-lg">
              {formatAmount(data.currentStats.usersLogin, "en", false, true)}{" "}
              <PercentageText
                currentValue={data.currentStats.usersLogin}
                prevValue={data.prevStats.usersLogin}
              />
            </p>
          </div>
          {/* <div className="flex flex-col bg-white p-3 rounded-md flex-1 border">
            <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1">
              Product Clicks
            </h4>
            <p className="font-bold text-lg">
              {formatAmount(
                data.currentStats.productsClicks,
                "en",
                false,
                true
              )}{" "}
              <PercentageText
                currentValue={data.currentStats.productsClicks}
                prevValue={data.prevStats.productsClicks}
              />
            </p>
          </div> */}
          <div className="flex flex-col bg-white p-3 rounded-md flex-1 border">
            <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1">
              Mobile Usage
            </h4>
            <p className="font-bold text-lg">
              {formatAmount(data.currentStats.mobileUsage, "en", false, true)}{" "}
              <PercentageText
                currentValue={data.currentStats.mobileUsage}
                prevValue={data.prevStats.mobileUsage}
              />
            </p>
          </div>
          <div className="flex flex-col bg-white p-3 rounded-md flex-1 border">
            <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1">
              Web Usage
            </h4>
            <p className="font-bold text-lg">
              {formatAmount(data.currentStats.webUsage, "en", false, true)}{" "}
              <PercentageText
                currentValue={data.currentStats.webUsage}
                prevValue={data.prevStats.webUsage}
              />
            </p>
          </div>
        </div>
      </div>
      <div className="h-full lg:h-[150px] mt-1 text-xs">
        <WeeklySiteVisitGraph data={data.dateStats} />
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

export default WeeklySiteVisitCard;
