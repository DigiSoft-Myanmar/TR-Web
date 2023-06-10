import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
  showUnauthorizedDialog,
} from "@/util/swalFunction";
import { formatAmount } from "@/util/textHelper";
import { useTranslation } from "next-i18next";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React from "react";
import ColorDialog from "../modal/dialog/ColorDialog";
import DistrictCard from "./DistrictCard";
import { getHeaders } from "@/util/authHelper";
import { useSession } from "next-auth/react";

interface Props {
  name?: string;
  nameMM?: string;
  count?: number;
  color?: string;
  districts?: any;
  parentState?: string;
  updateFn: Function;
  prodCount?: number;
  buyerCount?: number;
  brandCount?: number;
}

function StateCard({
  parentState,
  name,
  nameMM,
  color,
  count,
  districts,
  updateFn,
  prodCount,
  buyerCount,
  brandCount,
}: Props) {
  const { locale } = useRouter();
  const [isExpanded, setExpanded] = React.useState(false);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [township, setTownship] = React.useState<any>();
  const { data: session }: any = useSession();
  const router = useRouter();
  return (
    <>
      <div
        className={`relative flex flex-1 cursor-pointer flex-col space-y-5 rounded-sm border-t-4 bg-white p-8 shadow-xl`}
        style={color ? { borderColor: color } : { borderColor: "#E71D2A" }}
        onClick={(e) => setExpanded(!isExpanded)}
      >
        <div className="flex">
          <p className="flex-grow text-lg font-medium text-gray-800">
            {locale === "mm" && nameMM && nameMM.length > 0 ? nameMM : name}
          </p>
          {districts && districts.length > 0 && isExpanded ? (
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
            districts &&
            districts.length > 0 && (
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
        <div className="grid grid-cols-3 gap-3 text-gray-800">
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

            <h5 className="text-xl font-bold">
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

            <h5 className="text-xl font-bold">
              {formatAmount(brandCount ? brandCount : 0, locale)}
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
                d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>

            <h5 className="text-xl font-bold">
              {formatAmount(prodCount ? prodCount : 0, locale)}
            </h5>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTownship({
                id: parentState,
                color: color,
              });
              setModalOpen(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-brand dark:text-brandLight h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path
                fillRule="evenodd"
                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        {isExpanded && districts && (
          <div className="flex flex-col space-y-5 border-t py-5">
            {districts.map((e: any, index: number) => (
              <DistrictCard
                key={index}
                name={e.name}
                nameMM={e.nameMM}
                brandCount={e.brandCount}
                buyerCount={e.buyerCount}
                township={e.townships}
                parentState={parentState}
                parentDistrict={index}
                updateFn={updateFn}
              />
            ))}
          </div>
        )}
      </div>
      <ColorDialog
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        label="Color"
        onClickFn={(e: string) => {
          if (getHeaders(session)) {
            fetch("/api/townships?stateId=" + township.id, {
              method: "PUT",
              body: JSON.stringify({ color: e }),
              headers: getHeaders(session),
            }).then(async (data) => {
              if (data.status === 200) {
                showSuccessDialog("Update successful", "", locale, () => {
                  setModalOpen(false);
                  updateFn();
                });
              } else {
                let json = await data.json();
                showErrorDialog(json.error, json.errorMM, locale);
              }
            });
          } else {
            showUnauthorizedDialog(locale, () => {
              router.push("/login");
            });
          }
        }}
        title="Update Color"
        value={township?.color ? township.color : "#E71D2A"}
      />
    </>
  );
}

export default StateCard;
