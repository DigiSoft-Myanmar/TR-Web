import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import { formatAmount } from "@/util/textHelper";
import { useTranslation } from "next-i18next";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React from "react";
import TownshipCard from "./TownshipCard";

interface Props {
  name?: string;
  nameMM?: string;
  buyerCount?: number;
  sellerCount?: number;
  township?: any;
  parentState?: string;
  parentDistrict?: number;
  updateFn: Function;
}

function DistrictCard({
  name,
  nameMM,
  buyerCount,
  sellerCount,
  township: parentTownship,
  parentState,
  parentDistrict,
  updateFn,
}: Props) {
  const { locale } = useRouter();
  const [isExpanded, setExpanded] = React.useState(false);

  return (
    <>
      <div
        className="flex cursor-pointer flex-col space-y-3 p-3"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!isExpanded);
        }}
      >
        <div className="flex">
          <h3 className="flex-grow text-sm">
            {locale === "mm" && nameMM && nameMM.length > 0 ? nameMM : name}
          </h3>
          {parentTownship && parentTownship.length > 0 && isExpanded ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15l7-7 7 7"
              />
            </svg>
          ) : (
            parentTownship &&
            parentTownship.length > 0 && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 text-gray-800">
          <div className="flex flex-row items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>

            <h5 className="font-semibold">
              {formatAmount(buyerCount ? buyerCount : 0, locale)}
            </h5>
          </div>
          <div className="flex flex-row items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
              />
            </svg>

            <h5 className="font-semibold">
              {formatAmount(sellerCount ? sellerCount : 0, locale)}
            </h5>
          </div>
        </div>

        {isExpanded && parentTownship && (
          <div className="flex flex-col space-y-5 border-t py-5">
            {parentTownship.map((e: any, index: number) => (
              <TownshipCard
                key={index}
                name={e.name}
                nameMM={e.nameMM}
                brandCount={e.brandCount}
                buyerCount={e.buyerCount}
                parentState={parentState}
                parentDistrict={parentDistrict}
                parentTownship={index}
                updateFn={updateFn}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default DistrictCard;
