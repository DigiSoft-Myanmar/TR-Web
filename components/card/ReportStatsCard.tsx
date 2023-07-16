import { formatAmount } from "@/util/textHelper";
import { useRouter } from "next/router";
import React from "react";

function ReportStatsCard({
  title,
  value,
  isMMK,
  symbol,
}: {
  title: string;
  value: number;
  isMMK?: boolean;
  symbol?: string;
}) {
  const router = useRouter();
  const { locale } = router;
  return (
    <div className="flex flex-col bg-white p-3 rounded-md flex-1 border">
      <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1">
        {title}
      </h4>
      <p className="font-bold text-lg">
        {formatAmount(value, "en", isMMK, true)} {symbol}
      </p>
    </div>
  );
}

export default ReportStatsCard;
