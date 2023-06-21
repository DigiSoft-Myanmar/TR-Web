import { formatAmount, getText } from "@/util/textHelper";
import { Membership } from "@prisma/client";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";

function MembershipTable({ data }: { data: Membership[] }) {
  const { locale } = useRouter();
  const { t } = useTranslation("common");
  return (
    <div className="w-full overflow-x-auto">
      <table className="rounded lg:max-w-5xl m-auto">
        <thead className="block">
          <tr className="flex text-left">
            <th
              scope="row"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border lg:border-r-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            ></th>
            {data?.map((z: Membership, index: number) => (
              <th
                scope="col"
                className={
                  index === data.length - 1
                    ? "w-1/3 sm:w-1/4 p-4 border bg-white rounded-tr border-gray-300 font-normal"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border bg-white lg:border-l-0 border-r-0 border-gray-300 font-normal"
                    : "w-1/3 sm:w-1/4 p-4 border bg-white border-r-0 border-gray-300 font-normal"
                }
                key={index}
              >
                <h4 className="u-slab">{getText(z.name, z.nameMM, locale)}</h4>
                {/* <p className="text-sm hidden sm:block">Private Q&A for teams</p> */}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border lg:border-r-0 border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col text-primary">
              Pricing
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border border-t-0 border-gray-300 flex flex-col"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-r-0 border-t-0 border-l-0 border-gray-300 flex flex-col"
                    : "w-1/3 sm:w-1/4 p-4 border border-r-0 border-t-0 border-gray-300 flex flex-col"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden lg:min-w-[300px] lg:max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              Pricing
            </th>

            {data?.map((z: Membership, index: number) => (
              <th
                key={index}
                scope="col"
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border border-t-0 border-gray-300 flex flex-col"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-r-0 border-t-0 lg:border-l-0 border-gray-300 flex flex-col"
                    : "w-1/3 sm:w-1/4 p-4 border border-r-0 border-t-0 border-gray-300 flex flex-col"
                }
              >
                <div className="flex items-center mb-4 flex-wrap sm:no-wrap justify-center">
                  <p className="text-xl">
                    {formatAmount(z.price, locale, true)}
                  </p>
                  <p className="text-xs font-normal text-center mt-3">
                    per {z.validity} {t("days")}
                  </p>
                  <div className="font-normal text-xs ml-2">
                    {/* <p>billed anually</p> */}
                  </div>
                </div>
                <ul className="text-sm font-normal mb-6 hidden sm:block">
                  <li className="mb-2 tick">Free 14 day trial</li>
                  <li className="mb-2 tick">
                    A single team hosted on stackoverflow.com
                  </li>
                  <li className="mb-2 tick">
                    Unlimited private questions and answers
                  </li>
                  <li className="tick">Searchable archive</li>
                </ul>
                <a
                  href=""
                  className=" mt-auto block text-white bg-indigo-500 text-xs py-2 text-center rounded font-normal"
                  title=""
                >
                  Get Started
                </a>
              </th>
            ))}
          </tr>

          {/* Start */}

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col text-primary">
              {t("SKUListing")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="lg:flex hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-col text-primary">
              {t("SKUListing")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  "w-1/3 sm:w-1/4 p-4 border-b border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col font-semibold text-sm">
              {t("freeSKUListing")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              {t("freeSKUListing")}
            </th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "w-1/3 sm:w-1/4 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                }
              >
                <p className="text-center">{z.SKUListing}</p>
              </td>
            ))}
          </tr>

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col font-semibold text-sm">
              {t("extraSKUPricing")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              {t("extraSKUPricing")}
            </th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "w-1/3 sm:w-1/4 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                }
              >
                <p className="text-center">
                  {formatAmount(z.extraSKUPricing, locale, true)}
                </p>
              </td>
            ))}
          </tr>

          {/* End */}

          {/* Start */}

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col text-primary">
              {t("Ads")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="lg:flex hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-col text-primary">
              {t("Ads")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  "w-1/3 sm:w-1/4 p-4 border-b border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col font-semibold text-sm">
              {t("freeAdsListing")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              {t("freeAdsListing")}
            </th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "w-1/3 sm:w-1/4 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                }
              >
                <p className="text-center">{z.freeAdsLimit}</p>
              </td>
            ))}
          </tr>

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col font-semibold text-sm">
              {t("extraAdsPricing")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              {t("extraAdsPricing")}
            </th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "w-1/3 sm:w-1/4 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                }
              >
                <p className="text-center">
                  {formatAmount(z.extraAdsPricing, locale, true)}
                </p>
              </td>
            ))}
          </tr>

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col font-semibold text-sm">
              {t("adsValidity")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              {t("adsValidity")}
            </th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "w-1/3 sm:w-1/4 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                }
              >
                <p className="text-center">
                  {formatAmount(z.adsValidity, locale)} {t("days")}
                </p>
              </td>
            ))}
          </tr>

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col font-semibold text-sm">
              {t("adsLifeTime")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              {t("adsLifeTime")}
            </th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "w-1/3 sm:w-1/4 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                }
              >
                <p className="text-center">
                  {formatAmount(z.adsLifeTime, locale, false)} {t("days")}
                </p>
              </td>
            ))}
          </tr>

          {/* End */}

          {/* Start */}

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col text-primary">
              {t("topSearch")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="lg:flex hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-col text-primary">
              {t("topSearch")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  "w-1/3 sm:w-1/4 p-4 border-b border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col font-semibold text-sm">
              {t("topSearch")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              {t("startFrom")}
            </th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "w-1/3 sm:w-1/4 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                }
              >
                <p className="text-center">{z.topSearchStart}</p>
              </td>
            ))}
          </tr>

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col font-semibold text-sm">
              {t("endAt")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              {t("endAt")}
            </th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "w-1/3 sm:w-1/4 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                }
              >
                <p className="text-center">{z.topSearchEnd}</p>
              </td>
            ))}
          </tr>

          {/* End */}

          {/* Start */}

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col text-primary">
              {t("reports")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="lg:flex hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-col text-primary">
              {t("reports")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  "w-1/3 sm:w-1/4 p-4 border-b border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col font-semibold text-sm">
              {t("categorySaleReport")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              {t("categorySaleReport")}
            </th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "w-1/3 sm:w-1/4 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                }
              >
                <div className="flex flex-col items-center">
                  {z.subCategoryReport === 0 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-error"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <p className="text-center">{z.subCategoryReport}</p>
                  )}
                </div>
              </td>
            ))}
          </tr>

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col font-semibold text-sm">
              {t("buyerProfileReport")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              {t("buyerProfileReport")}
            </th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "w-1/3 sm:w-1/4 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                }
              >
                <div className="flex flex-col items-center">
                  {z.allowBuyerProfileReport === false ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-error"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-success"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </td>
            ))}
          </tr>

          {/* End */}

          {/* Start */}

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col text-primary">
              {t("onBoarding")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="lg:flex hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-col text-primary">
              {t("onBoarding")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  "w-1/3 sm:w-1/4 p-4 border-b border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col font-semibold text-sm">
              {t("onBoardingLimit")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              {t("onBoardingLimit")}
            </th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "w-1/3 sm:w-1/4 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                }
              >
                <div className="flex flex-col items-center">
                  {z.onBoardingLimit === 0 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-error"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <p className="text-center">{z.onBoardingLimit}</p>
                  )}
                </div>
              </td>
            ))}
          </tr>

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col font-semibold text-sm">
              {t("dedicatedAccountManager")}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "w-1/3 sm:w-1/4 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              {t("dedicatedAccountManager")}
            </th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "w-1/3 sm:w-1/4 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                }
              >
                <div className="flex flex-col items-center">
                  {z.allowDelicatedAccountManager === false ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-error"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-success"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </td>
            ))}
          </tr>

          {/* End */}
        </tbody>
        <tfoot>
          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            ></th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "w-1/3 sm:w-1/4 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "w-1/3 sm:w-1/4 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "w-1/3 sm:w-1/4 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                }
              >
                <a
                  href=""
                  className=" mt-auto block text-white bg-indigo-500 text-xs py-2 text-center rounded font-normal"
                  title=""
                >
                  Get Started
                </a>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default MembershipTable;
