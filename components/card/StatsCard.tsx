import { getPercentage } from "@/util/compareHelper";
import { formatAmount } from "@/util/textHelper";
import { useRouter } from "next/router";
import React from "react";

function StatsCard({
  totalCount,
  currentCount,
  prevCount,
  label,
}: {
  totalCount: number;
  currentCount: number;
  prevCount?: number;
  label: string;
}) {
  const { locale } = useRouter();
  return (
    <article className="flex flex-1 flex-row justify-between gap-4 rounded-lg border border-gray-500 bg-white p-6">
      <div>
        <strong className="block text-sm font-medium text-gray-500">
          {" "}
          {label}{" "}
        </strong>

        <p>
          <span className="text-2xl font-medium text-gray-900">
            {" "}
            {formatAmount(totalCount, locale)}{" "}
          </span>
        </p>
      </div>
      {!prevCount || getPercentage(currentCount, prevCount) === 0 ? (
        <></>
      ) : (
        <div
          className={`inline-flex gap-2 self-end rounded ${
            getPercentage(currentCount, prevCount) > 0
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          } p-1 `}
        >
          {getPercentage(currentCount, prevCount) > 0 ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          )}

          <span className="text-xs font-medium">
            {" "}
            {getPercentage(currentCount, prevCount)}%{" "}
          </span>
        </div>
      )}
    </article>
  );
}

export default StatsCard;
