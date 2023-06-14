import FormInput from "@/components/presentational/FormInput";
import NRCPicker from "@/components/presentational/NRCPicker";
import { useProfile } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  backFn: Function;
  nextFn: Function;
};

function NRCSection({ backFn, nextFn }: Props) {
  const { t } = useTranslation("common");
  const {
    nrcFront,
    setNRCFront,
    nrcBack,
    setNRCBack,
    user,
    setUser,
    nrcAvailable,
  } = useProfile();
  const { locale } = useRouter();

  function submit() {
    nextFn();
    /* setUser((prevValue: any) => {
      return { ...prevValue, ...data };
    });
     */
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">{t("step")} 2</h3>
      <p className="my-1 text-xl font-bold">{t("nrcInfo")}</p>
      <span className="mb-10 text-sm">{t("fillNRCInfo")}</span>
      <form
        className="flex flex-col space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <NRCPicker
          isVerify={nrcAvailable}
          nrcState={user.nrcState}
          nrcTownship={user.nrcTownship}
          nrcType={user.nrcType}
          nrcNumber={user.nrcNumber}
          disabled={false}
          setNrc={(
            verify: boolean,
            state: string,
            township: string,
            nrcType: string,
            nrcNumber: string
          ) => {
            setUser((prevValue) => {
              return {
                ...prevValue,
                nrcState: state,
                nrcTownship: township,
                nrcType: nrcType,
                nrcNumber: nrcNumber,
              };
            });
          }}
        />

        <span className="mt-5 flex justify-end divide-x overflow-hidden">
          <button
            className={`inline-block rounded-l-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
            title="Previous"
            onClick={() => {
              backFn();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M20.25 12a.75.75 0 01-.75.75H6.31l5.47 5.47a.75.75 0 11-1.06 1.06l-6.75-6.75a.75.75 0 010-1.06l6.75-6.75a.75.75 0 111.06 1.06l-5.47 5.47H19.5a.75.75 0 01.75.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            className={`inline-block rounded-r-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
            title="Next"
            type="submit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M3.75 12a.75.75 0 01.75-.75h13.19l-5.47-5.47a.75.75 0 011.06-1.06l6.75 6.75a.75.75 0 010 1.06l-6.75 6.75a.75.75 0 11-1.06-1.06l5.47-5.47H4.5a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </span>
      </form>
    </div>
  );
}

export default NRCSection;
