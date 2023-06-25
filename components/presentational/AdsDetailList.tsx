import { Ads } from "@prisma/client";
import React from "react";
import AdsPickerDialog from "../modal/dialog/AdsPickerDialog";
import AdsCard from "../card/AdsCard";

function AdsDetailList({
  title,
  ads,
  currentLocation,
  setAdsModalOpen,
  setType,
  type,
  setLocation,
}: {
  title: string;
  ads: Ads[];
  currentLocation: any;
  setAdsModalOpen: Function;
  setType: Function;
  type: any;
  setLocation: Function;
}) {
  return (
    <details open={title === currentLocation}>
      <summary className="flex flex-row cursor-pointer items-end py-3 border-b">
        <div className="flex flex-row items-center justify-between gap-3 flex-grow mr-3">
          <div className={`text-xs font-semibold text-gray-700`}>{title}</div>
          <span className="text-xs bg-darkShade text-white p-1 rounded-full min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px] items-center flex justify-center">
            {ads.length > 99 ? "99+" : ads.length}
          </span>
        </div>
        <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </summary>
      <div className="flex flex-col gap-3 mt-3 border-b pb-3">
        <div className="flex flex-row items-center gap-3">
          <span className="text-sm flex-grow">Total Ads : {ads.length}</span>
          <button
            className="bg-primary px-3 py-2 rounded-md text-white text-xs hover:bg-primary-focus"
            onClick={() => {
              setAdsModalOpen(true);
              setType(type);
              setLocation(title);
            }}
          >
            Add Ad
          </button>
        </div>
        {ads.map((z, index) => (
          <div key={index} className="border p-2">
            <AdsCard ads={z} />
          </div>
        ))}
      </div>
    </details>
  );
}

export default AdsDetailList;
