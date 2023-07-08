import { calculatePercentage } from "@/util/dashboardHelper";
import React from "react";

function PercentageText({
  prevValue,
  currentValue,
}: {
  prevValue: number;
  currentValue: number;
}) {
  return calculatePercentage(prevValue, currentValue) > 0 ? (
    <span className="text-xs text-green-600">
      +{calculatePercentage(prevValue, currentValue)}%
    </span>
  ) : calculatePercentage(prevValue, currentValue) < 0 ? (
    <span className="text-xs text-red-600">
      {calculatePercentage(prevValue, currentValue)}%
    </span>
  ) : (
    <></>
  );
}

export default PercentageText;
