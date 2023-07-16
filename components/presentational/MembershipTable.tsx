import { getHeaders, isInternal } from "@/util/authHelper";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import { formatAmount, getText } from "@/util/textHelper";
import { Tooltip } from "@mui/material";
import { Content, Membership } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";

function MembershipTable({
  data,
  content,
}: {
  data: Membership[];
  content?: Content;
}) {
  const { locale } = useRouter();
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  const router = useRouter();

  return (
    <div
      className={`${
        isInternal(session) && !router.asPath.includes("account")
          ? "w-[65vw] max-w-[65vw] min-w-[65vw]"
          : ""
      } overflow-x-auto`}
    >
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border bg-white rounded-tr border-gray-300 font-normal"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border bg-white lg:border-l-0 border-r-0 border-gray-300 font-normal"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border bg-white border-r-0 border-gray-300 font-normal"
                }
                key={index}
              >
                <h4 className="u-slab text-center">
                  {getText(z.name, z.nameMM, locale)}
                </h4>
                {/* <p className="text-sm hidden sm:block">Private Q&A for teams</p> */}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border lg:border-r-0 border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col text-primary font-semibold">
              Pricing
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-t-0 border-gray-300 flex flex-col"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-r-0 border-t-0 border-l-0 border-gray-300 flex flex-col"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-r-0 border-t-0 border-gray-300 flex flex-col"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-t-0 border-gray-300 flex flex-col"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-r-0 border-t-0 lg:border-l-0 border-gray-300 flex flex-col"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-r-0 border-t-0 border-gray-300 flex flex-col"
                }
              >
                <div className="flex items-center mb-4 flex-wrap sm:no-wrap justify-center">
                  <p className="text-xl text-center">
                    {formatAmount(z.price, locale, true)}
                  </p>
                  <p className="text-xs font-normal text-center mt-3">
                    per {z.validity} {t("days")}
                  </p>
                  <div className="font-normal text-xs ml-2">
                    {/* <p>billed anually</p> */}
                  </div>
                </div>
                {/* <ul className="text-sm font-normal mb-6 hidden sm:block">
                  <li className="mb-2 tick">Free 14 day trial</li>
                  <li className="mb-2 tick">
                    A single team hosted on stackoverflow.com
                  </li>
                  <li className="mb-2 tick">
                    Unlimited private questions and answers
                  </li>
                  <li className="tick">Searchable archive</li>
                </ul> */}
                {isInternal(session) && (
                  <div className="flex flex-row items-center gap-3">
                    <button
                      type="button"
                      className="flex-grow mt-auto block text-white bg-primary hover:bg-primary-focus text-xs py-2 text-center rounded font-normal"
                      onClick={() => {
                        router.push(
                          "/contents/memberships/" + encodeURIComponent(z.name)
                        );
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-white bg-warning hover:bg-opacity-80 text-xs p-2 text-center rounded font-normal"
                      onClick={(evt) => {
                        evt.stopPropagation();
                        showConfirmationDialog(
                          t("deleteConfirmation"),
                          "",
                          locale,
                          () => {
                            fetch(
                              `/api/memberships?id=${encodeURIComponent(
                                z.id!
                              )}`,
                              {
                                method: "DELETE",
                                headers: getHeaders(session),
                              }
                            ).then(async (data) => {
                              if (data.status === 200) {
                                router.reload();
                                showSuccessDialog("Delete Success", "", locale);
                              } else {
                                let json = await data.json();
                                showErrorDialog(
                                  json.error,
                                  json.errorMM,
                                  locale
                                );
                              }
                            });
                          }
                        );
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </th>
            ))}
          </tr>

          {/* Start */}

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-row gap-3 text-primary font-semibold">
              <h3>{t("SKUListing")}</h3>
              {content?.SKUDetails?.length > 0 && (
                <Tooltip
                  title={
                    <div
                      className="text-white text-sm mt-3 font-normal"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          content?.SKUDetails,
                          content?.SKUDetailsMM,
                          locale
                        ),
                      }}
                    />
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </Tooltip>
              )}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="lg:flex hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-row gap-3 text-primary font-semibold">
              <h3>{t("SKUListing")}</h3>
              {content?.SKUDetails?.length > 0 && (
                <Tooltip
                  title={
                    <div
                      className="text-white text-sm mt-3 font-normal"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          content?.SKUDetails,
                          content?.SKUDetailsMM,
                          locale
                        ),
                      }}
                    />
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </Tooltip>
              )}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-b border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
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
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-row gap-3 text-primary font-semibold">
              <h3>{t("Ads")}</h3>
              {content?.adsDetails?.length > 0 && (
                <Tooltip
                  title={
                    <div
                      className="text-white text-sm mt-3 font-normal"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          content?.adsDetails,
                          content?.adsDetailsMM,
                          locale
                        ),
                      }}
                    />
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </Tooltip>
              )}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="lg:flex hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-row text-primary font-semibold">
              <h3>{t("Ads")}</h3>
              {content?.adsDetails?.length > 0 && (
                <Tooltip
                  title={
                    <div
                      className="text-white text-sm mt-3 font-normal"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          content?.adsDetails,
                          content?.adsDetailsMM,
                          locale
                        ),
                      }}
                    />
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </Tooltip>
              )}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-b border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
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
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-row gap-3 text-primary font-semibold">
              <h3>{t("topSearch")}</h3>
              {content?.topSearchDetails?.length > 0 && (
                <Tooltip
                  title={
                    <div
                      className="text-white text-sm mt-3 font-normal"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          content?.topSearchDetails,
                          content?.topSearchDetailsMM,
                          locale
                        ),
                      }}
                    />
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </Tooltip>
              )}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="lg:flex hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-row text-primary font-semibold">
              <h3>{t("topSearch")}</h3>
              {content?.topSearchDetails?.length > 0 && (
                <Tooltip
                  title={
                    <div
                      className="text-white text-sm mt-3 font-normal"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          content?.topSearchDetails,
                          content?.topSearchDetailsMM,
                          locale
                        ),
                      }}
                    />
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </Tooltip>
              )}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-b border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                }
              >
                <p className="text-center">{z.topSearchEnd}</p>
              </td>
            ))}
          </tr>

          {/* End */}

          {/* Start */}

          <tr className="flex lg:hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-row gap-3 text-primary font-semibold">
              <h3>{t("reports")}</h3>
              {content?.saleReportDetails?.length > 0 && (
                <Tooltip
                  title={
                    <div
                      className="text-white text-sm mt-3 font-normal"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          content?.saleReportDetails,
                          content?.saleReportDetailsMM,
                          locale
                        ),
                      }}
                    />
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </Tooltip>
              )}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="lg:flex hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-row text-primary font-semibold">
              <h3>{t("reports")}</h3>
              {content?.saleReportDetails?.length > 0 && (
                <Tooltip
                  title={
                    <div
                      className="text-white text-sm mt-3 font-normal"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          content?.saleReportDetails,
                          content?.saleReportDetailsMM,
                          locale
                        ),
                      }}
                    />
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </Tooltip>
              )}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-b border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
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
              <h3>{t("buyerProfileReport")}</h3>
              {content?.buyerReportDetails?.length > 0 && (
                <Tooltip
                  title={
                    <div
                      className="text-white text-sm mt-3 font-normal"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          content?.buyerReportDetails,
                          content?.buyerReportDetailsMM,
                          locale
                        ),
                      }}
                    />
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </Tooltip>
              )}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              <h3>{t("buyerProfileReport")}</h3>
              {content?.buyerReportDetails?.length > 0 && (
                <div
                  className="text-white text-sm mt-3 font-normal"
                  dangerouslySetInnerHTML={{
                    __html: getText(
                      content?.buyerReportDetails,
                      content?.buyerReportDetailsMM,
                      locale
                    ),
                  }}
                />
              )}
            </th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
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
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-row gap-3 text-primary font-semibold">
              <h3>{t("onBoarding")}</h3>
              {content?.onBoardingDetails?.length > 0 && (
                <Tooltip
                  title={
                    <div
                      className="text-white text-sm mt-3 font-normal"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          content?.onBoardingDetails,
                          content?.onBoardingDetailsMM,
                          locale
                        ),
                      }}
                    />
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </Tooltip>
              )}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="lg:flex hidden text-left">
            <td className="sticky left-0 min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 border-r-0 bg-gray-100 border-gray-300 lg:flex flex-row text-primary font-semibold">
              <h3>{t("onBoarding")}</h3>
              {content?.onBoardingDetails?.length > 0 && (
                <Tooltip
                  title={
                    <div
                      className="text-white text-sm mt-3 font-normal"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          content?.onBoardingDetails,
                          content?.onBoardingDetailsMM,
                          locale
                        ),
                      }}
                    />
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </Tooltip>
              )}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-b border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
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
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
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
              <h3>{t("dedicatedAccountManager")}</h3>

              {content?.customerServiceDetails?.length > 0 && (
                <Tooltip
                  title={
                    <div
                      className="text-white text-sm mt-3 font-normal"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          content?.customerServiceDetails,
                          content?.customerServiceDetailsMM,
                          locale
                        ),
                      }}
                    />
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </Tooltip>
              )}
            </td>
            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-r border-gray-300 flex flex-col bg-gray-100"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border-gray-300 flex flex-col bg-gray-100"
                }
              ></td>
            ))}
          </tr>

          <tr className="flex text-left text-sm">
            <th
              scope="col"
              className="sticky left-0 hidden min-w-[300px] max-w-[300px] w-1/3 sm:w-1/4 p-4 border border-t-0 bg-gray-100 border-gray-300 lg:flex flex-col"
            >
              <h3>{t("dedicatedAccountManager")}</h3>

              {content?.customerServiceDetails?.length > 0 && (
                <Tooltip
                  title={
                    <div
                      className="text-white text-sm mt-3 font-normal"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          content?.customerServiceDetails,
                          content?.customerServiceDetailsMM,
                          locale
                        ),
                      }}
                    />
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                </Tooltip>
              )}
            </th>

            {data?.map((z: Membership, index: number) => (
              <td
                key={index}
                className={
                  data.length - 1 === index
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                    : index === 0
                    ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                    : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
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
        {isInternal(session) && (
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
                      ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border lg:border-l-0 border-t-0 border-gray-300 flex flex-col bg-white"
                      : index === 0
                      ? "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-gray-300 flex flex-col bg-white border-t-0 lg:border-l-0"
                      : "min-w-[200px] max-w-[200px] lg:w-1/3 p-4 border border-l-0 border-gray-300 flex flex-col bg-white border-t-0"
                  }
                >
                  {isInternal(session) && (
                    <div className="flex flex-row items-center gap-3">
                      <button
                        type="button"
                        className="flex-grow mt-auto block text-white bg-primary hover:bg-primary-focus text-xs py-2 text-center rounded font-normal"
                        onClick={() => {
                          router.push(
                            "/content/memberships/" + encodeURIComponent(z.name)
                          );
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-white bg-warning hover:bg-opacity-80 text-xs p-2 text-center rounded font-normal"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          showConfirmationDialog(
                            t("deleteConfirmation"),
                            "",
                            locale,
                            () => {
                              fetch(
                                `/api/memberships?id=${encodeURIComponent(
                                  z.id!
                                )}`,
                                {
                                  method: "DELETE",
                                  headers: getHeaders(session),
                                }
                              ).then(async (data) => {
                                if (data.status === 200) {
                                  router.reload();
                                  showSuccessDialog(
                                    "Delete Success",
                                    "",
                                    locale
                                  );
                                } else {
                                  let json = await data.json();
                                  showErrorDialog(
                                    json.error,
                                    json.errorMM,
                                    locale
                                  );
                                }
                              });
                            }
                          );
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

export default MembershipTable;
