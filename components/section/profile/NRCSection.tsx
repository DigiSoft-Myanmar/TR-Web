import FormInput from "@/components/presentational/FormInput";
import NRCPicker from "@/components/presentational/NRCPicker";
import { useProfile } from "@/context/ProfileContext";
import { fileUrl } from "@/types/const";
import { showErrorDialog } from "@/util/swalFunction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  backFn: Function;
  nextFn: Function;
  submitRef: any;
};

function NRCSection({ backFn, nextFn, submitRef }: Props) {
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
        <div className="grid grid-cols-2 gap-3">
          {nrcFront ? (
            <div className="relative mb-3 flex w-full cursor-pointer flex-row">
              <Image
                src={URL.createObjectURL(nrcFront)}
                width={300}
                height={160}
                alt="nrcFront"
                quality={100}
                className="h-40 w-full rounded-md border object-contain p-2"
              />
              <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  multiple={false}
                  onChange={(e) => {
                    let fileList = e.currentTarget.files;
                    if (fileList) {
                      for (let i = 0; i < fileList.length; i++) {
                        setNRCFront(fileList[0]);
                      }
                    }
                  }}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <span className="text-xs ml-3">NRC FRONT</span>
              </label>
            </div>
          ) : user && user.nrcFront ? (
            <div className="relative mb-3 flex w-full cursor-pointer flex-row">
              <Image
                src={fileUrl + user.nrcFront}
                width={300}
                height={160}
                alt="nrcFront"
                quality={100}
                className="h-40 w-full rounded-md border object-contain p-2"
              />
              <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  multiple={false}
                  onChange={(e) => {
                    let fileList = e.currentTarget.files;
                    if (fileList) {
                      for (let i = 0; i < fileList.length; i++) {
                        setNRCFront(fileList[0]);
                      }
                    }
                  }}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <span className="text-xs ml-3">NRC FRONT</span>
              </label>
            </div>
          ) : (
            <div className="mb-3 flex w-full">
              <label className="relative flex h-48 w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-gray-200">
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
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  multiple={false}
                  onChange={(e) => {
                    let fileList = e.currentTarget.files;
                    if (fileList) {
                      for (let i = 0; i < fileList.length; i++) {
                        setNRCFront(fileList[0]);
                      }
                    }
                  }}
                />
                <span className="absolute bottom-0 right-0 flex w-fit items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <span className="text-xs ml-3">NRC FRONT</span>
                </span>
              </label>
            </div>
          )}

          {nrcBack ? (
            <div className="relative mb-3 flex w-full cursor-pointer flex-row">
              <Image
                src={URL.createObjectURL(nrcBack)}
                width={300}
                height={160}
                alt="nrcBack"
                quality={100}
                className="h-40 w-full rounded-md border object-contain p-2"
              />
              <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  multiple={false}
                  onChange={(e) => {
                    let fileList = e.currentTarget.files;
                    if (fileList) {
                      for (let i = 0; i < fileList.length; i++) {
                        setNRCBack(fileList[0]);
                      }
                    }
                  }}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <span className="text-xs ml-3">NRC BACK</span>
              </label>
            </div>
          ) : user && user.nrcBack ? (
            <div className="relative mb-3 flex w-full cursor-pointer flex-row">
              <Image
                src={fileUrl + user.nrcBack}
                width={300}
                height={160}
                alt="nrcBack"
                quality={100}
                className="h-40 w-full rounded-md border object-contain p-2"
              />
              <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  multiple={false}
                  onChange={(e) => {
                    let fileList = e.currentTarget.files;
                    if (fileList) {
                      for (let i = 0; i < fileList.length; i++) {
                        setNRCBack(fileList[0]);
                      }
                    }
                  }}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <span className="text-xs ml-3">NRC BACK</span>
              </label>
            </div>
          ) : (
            <div className="mb-3 flex w-full">
              <label className="relative flex h-48 w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-gray-200">
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
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  multiple={false}
                  onChange={(e) => {
                    let fileList = e.currentTarget.files;
                    if (fileList) {
                      for (let i = 0; i < fileList.length; i++) {
                        setNRCBack(fileList[0]);
                      }
                    }
                  }}
                />
                <span className="absolute bottom-0 right-0 flex w-fit items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <span className="text-xs ml-3">NRC BACK</span>
                </span>
              </label>
            </div>
          )}
        </div>
        <NRCPicker
          isVerify={nrcAvailable}
          nrcState={user.nrcState}
          nrcTownship={user.nrcTownship}
          nrcType={user.nrcType}
          nrcNumber={user.nrcNumber}
          userId={user.id}
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
            ref={submitRef}
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
