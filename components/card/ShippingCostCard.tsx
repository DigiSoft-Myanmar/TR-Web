import {
  showConfirmationDialog,
  showErrorDialog,
  showUnauthorizedDialog,
} from "@/util/swalFunction";
import { formatAmount } from "@/util/textHelper";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import ShippingCostDialog from "../modal/dialog/ShippingCostDialog";
import ShippingCostDistrinct from "./ShippingCostDistrict";
import { getHeaders } from "@/util/authHelper";
import { useSession } from "next-auth/react";

function ShippingCostCard({
  state,
  sellerId,
}: {
  state: any;
  sellerId: string;
}) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [shippingCost, setShippingCost] = React.useState<any>();
  const [isUpdate, setUpdate] = React.useState(true);
  const { data: session }: any = useSession();

  React.useEffect(() => {
    if (state && state.name && isUpdate === true) {
      fetch(
        "/api/shippingCost?sellerId=" + sellerId + "&state=" + state.id
      ).then(async (data) => {
        if (data.status === 200) {
          let json = await data.json();
          console.log(
            json,
            state.name,
            "/api/shippingCost?sellerId=" + sellerId + "&state=" + state.id
          );
          setShippingCost(json);
          setUpdate(false);
        } else {
        }
      });
    }
  }, [isUpdate, sellerId, state]);

  return (
    shippingCost && (
      <>
        <details
          className={`group border-l-4 border bg-white p-6 ${
            shippingCost.shippingIncluded === true
              ? "border-l-success"
              : "border-l-warning"
          }`}
          onClick={(e) => setDetailOpen(!detailOpen)}
          open={detailOpen}
        >
          <summary className="flex cursor-pointer items-center justify-between">
            <div className="flex flex-col gap-5">
              <h5 className="text-lg font-medium">
                {router.locale &&
                router.locale === "mm" &&
                state.nameMM &&
                state.nameMM.length > 0
                  ? state.nameMM
                  : state.name}
              </h5>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {shippingCost.shippingIncluded === true ? (
                  <>
                    <div className="relative inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-500 transition hover:text-gray-700 focus:outline-none focus:ring">
                      <span
                        className={
                          shippingCost.isOfferFreeShipping === true
                            ? "text-success"
                            : ""
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-3 h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                        </svg>
                      </span>
                      {shippingCost.shippingCost ? (
                        <span className="text-sm font-medium">
                          {t("shippingCost")} -{" "}
                          {formatAmount(
                            shippingCost.shippingCost,
                            router.locale,
                            true
                          )}{" "}
                        </span>
                      ) : (
                        <span className="text-sm font-medium">
                          {t("defaultShippingCost")} -{" "}
                          {formatAmount(
                            shippingCost.defaultShippingCost,
                            router.locale,
                            true
                          )}{" "}
                        </span>
                      )}
                    </div>

                    <div className="relative inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-500 transition hover:text-gray-700 focus:outline-none focus:ring">
                      {shippingCost.isOfferFreeShipping === true ? (
                        <span className="text-sm font-medium">
                          {t("freeShippingCost")} -{" "}
                          {formatAmount(
                            shippingCost.freeShippingCost,
                            router.locale,
                            true
                          )}{" "}
                        </span>
                      ) : (
                        <span className="text-sm font-medium">
                          Free shipping not allowed
                        </span>
                      )}
                    </div>

                    <button
                      className="block rounded-lg bg-info px-5 py-3 text-sm font-medium text-white transition hover:bg-info-content focus:outline-none focus:ring"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDialogOpen(true);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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

                    <button
                      className="block rounded-lg bg-warning px-5 py-3 text-sm font-medium text-white transition hover:bg-warning/80 focus:outline-none focus:ring"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        showConfirmationDialog(
                          "Are you sure to disable delivery to " +
                            state.name +
                            "?",
                          (state.nameMM && state.nameMM.length > 0
                            ? state.nameMM
                            : state.name) +
                            " အတွက်ပို့ဆောင်မှုရပ်တန့်ခြင်းသေချာပါသလား။",
                          router.locale,
                          () => {
                            if (getHeaders(session)) {
                              fetch(
                                "/api/shippingCost?sellerId=" +
                                  sellerId +
                                  "&state=" +
                                  state.id,
                                {
                                  method: "POST",
                                  body: JSON.stringify({
                                    shippingIncluded: false,
                                  }),
                                  headers: getHeaders(session),
                                }
                              ).then(async (data) => {
                                if (data.status === 200) {
                                  setUpdate(true);
                                } else {
                                  let json = await data.json();
                                  showErrorDialog(
                                    json.error,
                                    json.errorMM,
                                    router.locale
                                  );
                                }
                              });
                            } else {
                              showUnauthorizedDialog(router.locale, () => {
                                router.push("/login");
                              });
                            }
                          }
                        );
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                    </button>
                  </>
                ) : (
                  <button
                    className="block rounded-lg bg-success px-5 py-3 text-sm font-medium text-white transition hover:bg-success/80 focus:outline-none focus:ring"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (getHeaders(session)) {
                        fetch(
                          "/api/shippingCost?sellerId=" +
                            sellerId +
                            "&state=" +
                            state.id,
                          {
                            method: "POST",
                            body: JSON.stringify({ shippingIncluded: true }),
                            headers: getHeaders(session),
                          }
                        ).then(async (data) => {
                          if (data.status === 200) {
                            setUpdate(true);
                          } else {
                            let json = await data.json();
                            showErrorDialog(
                              json.error,
                              json.errorMM,
                              router.locale
                            );
                          }
                        });
                      } else {
                        showUnauthorizedDialog(router.locale, () => {
                          router.push("/login");
                        });
                      }
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <span className="ml-1.5 flex-shrink-0  rounded-full bg-white p-1.5 sm:p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-45"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </summary>
        </details>

        {detailOpen === true && shippingCost.shippingIncluded === true && (
          <div className="mx-5 lg:mx-10">
            {state &&
              state.districts.map((e: any, index: number) => (
                <ShippingCostDistrinct
                  key={index}
                  district={e}
                  isUpdate={isUpdate}
                  state={state.id}
                  sellerId={sellerId}
                />
              ))}
          </div>
        )}
        <ShippingCostDialog
          isModalOpen={dialogOpen}
          isDefault={false}
          setModalOpen={setDialogOpen}
          title={`${t("shippingCost")} - ${
            router.locale &&
            router.locale === "mm" &&
            state.nameMM &&
            state.nameMM.length > 0
              ? state.nameMM
              : state.name
          }`}
          shippingCost={shippingCost}
          onClickFn={(e: any) => {
            if (getHeaders(session)) {
              fetch(
                "/api/shippingCost?sellerId=" + sellerId + "&state=" + state.id,
                {
                  method: "POST",
                  body: JSON.stringify(e),
                  headers: getHeaders(session),
                }
              ).then(async (data) => {
                if (data.status === 200) {
                  setUpdate(true);
                } else {
                  let json = await data.json();
                  showErrorDialog(json.error, json.errorMM, router.locale);
                }
              });
            } else {
              showUnauthorizedDialog(router.locale, () => {
                router.push("/login");
              });
            }
          }}
        />
      </>
    )
  );
}

export default ShippingCostCard;
