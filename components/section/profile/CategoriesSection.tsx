import FormInput from "@/components/presentational/FormInput";
import { useProfile } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import { showErrorDialog } from "@/util/swalFunction";
import { Category } from "@prisma/client";
import { getText } from "@/util/textHelper";

type Props = {
  backFn: Function;
  nextFn: Function;
};

type Password = {
  password?: string;
  confirmPassword?: string;
};

function CategoriesSection({ backFn, nextFn }: Props) {
  const { t } = useTranslation("common");
  const { user: profile, setUser: setProfile } = useProfile();
  const { locale } = useRouter();
  const { data } = useSWR("/api/products/categories", fetcher);

  function submit() {
    if (profile.preferCategoryIDs && profile.preferCategoryIDs.length === 3) {
      nextFn();
    } else {
      showErrorDialog(t("fillInformation"));
    }
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">{t("step")} 4</h3>
      <p className="my-1 text-xl font-bold">{t("categoriesInfo")}</p>
      <span className="mb-10 text-sm">{t("fillCategoriesInfo")}</span>
      <form
        className="flex flex-col space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex flex-row items-center gap-3 flex-wrap">
          {data?.map((z: Category, index: number) => (
            <div
              key={index}
              className=""
              onClick={() => {
                setProfile((prevValue) => {
                  let v = prevValue.preferCategoryIDs;
                  if (v.find((b) => b === z.id)) {
                    v = v.filter((b) => b !== z.id);
                  } else {
                    v = [...v, z.id];
                  }
                  if (v.length <= 3) {
                    return {
                      ...prevValue,
                      preferCategoryIDs: v,
                    };
                  } else {
                    return prevValue;
                  }
                });
              }}
            >
              <input
                type="checkbox"
                name="DeliveryOption"
                value={z.id}
                className="peer hidden [&:checked_+_label_svg]:block"
                checked={
                  profile.preferCategoryIDs?.find((b) => b === z.id)
                    ? true
                    : false
                }
              />

              <label
                htmlFor="DeliveryStandard"
                className="block cursor-pointer rounded-lg border border-gray-100 bg-white p-4 text-sm font-medium shadow-sm hover:border-gray-200 peer-checked:border-primary peer-checked:ring-1 peer-checked:ring-primary"
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-700">
                    {getText(z.name, z.nameMM, locale)}
                  </p>

                  <svg
                    className="ml-3 hidden h-5 w-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>

                {/* <p className="mt-1 text-gray-900">Free</p> */}
              </label>
            </div>
          ))}
        </div>
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

export default CategoriesSection;
