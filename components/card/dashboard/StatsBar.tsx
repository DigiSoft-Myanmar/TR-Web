import { calculateWidth } from "@/util/dashboardHelper";
import { formatAmount } from "@/util/textHelper";
import { Tooltip } from "@mui/material";
import React from "react";

export type StatType = {
  backgroundColor: string;
  label: string;
  amount: number;
};

function StatsBar({ stats }: { stats: StatType[] }) {
  const data = stats.sort((a, b) => a.amount - b.amount).reverse();
  let total = stats.map((z) => z.amount).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-row items-center w-full mt-3 bg-gray-400">
      {data.map((z, index) => (
        <Tooltip
          title={`${z.label}: ${formatAmount(z.amount, "en")}`}
          key={index}
        >
          <div
            className="h-1 rounded-full"
            style={{
              width: calculateWidth(z.amount, total) + "%",
              backgroundColor: z.backgroundColor,
            }}
          ></div>
        </Tooltip>
      ))}
    </div>
  );
}

export default StatsBar;
