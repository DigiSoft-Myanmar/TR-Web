import { getText } from "@/util/textHelper";
import { useRouter } from "next/router";
import React from "react";

function EmptyScreen({ onClickFn }: { onClickFn: Function }) {
  const { locale } = useRouter();

  return (
    <div className="grid h-[calc(100vh-20vh)] place-content-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-gray-200">No Data</h1>

        <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Empty Page
        </p>

        <p className="mt-4 text-gray-500">
          {getText("Currently there is no data.", "ပစ္စည်းမရှိသေးပါ။", locale)}
        </p>

        <button
          className="mt-5 inline-flex items-center rounded border border-primary bg-primary px-8 py-3 text-white hover:bg-transparent hover:text-primary focus:outline-none focus:ring active:text-primary"
          type="button"
          onClick={() => {
            onClickFn();
          }}
        >
          <span className="text-sm font-medium">
            {" "}
            {getText("Create new", "အသစ်ပြုလုပ်ရန်", locale)}{" "}
          </span>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="ml-3 h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default EmptyScreen;
