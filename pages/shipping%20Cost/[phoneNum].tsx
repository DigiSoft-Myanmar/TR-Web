import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { defaultDescription } from "@/types/const";
import prisma from "@/prisma/prisma";
import { useSession } from "next-auth/react";
import { Brand, Role, State, User } from "@prisma/client";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import { formatAmount } from "@/util/textHelper";
import useSWR from "swr";
import { useQuery } from "react-query";
import ShippingCostCard from "@/components/card/ShippingCostCard";
import ShippingCostDialog from "@/components/modal/dialog/ShippingCostDialog";
import ErrorScreen from "@/components/screen/ErrorScreen";

function Edit(data: any) {
  const router = useRouter();
  const { locale } = router;
  const { action } = router.query;
  const { t } = useTranslation("common");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { data: session }: any = useSession();

  const { brand, stateList }: { brand: User; stateList: State[] } = data.data;

  return session && session.role !== Role.Buyer ? (
    <div>
      <Head>
        <title>Edit Shipping Cost | Pyi Twin Phyit</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col gap-3 p-5">
        <h1 className="font-bold">
          {brand?.displayName ? brand?.displayName : brand?.username} Shipping
          Cost
        </h1>
        {brand.shippingIncluded === false ? (
          <div
            role="alert"
            className="w-fit rounded border-l-4 border-red-500 bg-red-50 py-4 px-6 shadow-md"
          >
            <div className="flex items-center gap-2 text-red-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>

              <strong className="block font-medium">
                {" "}
                Paid by recipient on delivery{" "}
              </strong>
            </div>

            <p className="mt-2 text-sm text-red-700">
              Enable shipping feature and streamline your business today!
            </p>

            <button
              className="mt-3 rounded-md bg-error px-3 py-2 text-sm text-white"
              type="button"
              onClick={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                fetch("/api/shippingCost?isDisable=false&brandId=" + brand.id, {
                  body: JSON.stringify({}),
                  method: "POST",
                }).then(async (data) => {
                  if (data.status === 200) {
                    showSuccessDialog(
                      "Enable shipping success.",
                      "",
                      locale,
                      () => {
                        router.reload();
                      }
                    );
                  } else {
                    let json = await data.json();
                    if (json.error) {
                      showErrorDialog(json.error, json.errorMM, locale);
                    } else {
                      showErrorDialog(t("somethingWentWrong"));
                    }
                  }
                });
              }}
            >
              Enable
            </button>
          </div>
        ) : (
          <div>
            <div className="flex flex-row flex-wrap items-stretch justify-between gap-3">
              <div
                role="alert"
                className="flex-1 rounded bg-white py-4 px-6 shadow-md"
              >
                <h3 className="text-sm font-semibold">Default Shipping Cost</h3>
                <p className="mt-2 text-sm text-gray-700">
                  If no value is specified, the default value will be applied.
                </p>
                <div className="mt-5 flex flex-row items-center gap-3">
                  <div className="flex flex-row items-center gap-2">
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
                        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                      />
                    </svg>
                    <span className="text-sm">
                      {brand.defaultShippingCost
                        ? formatAmount(
                            brand.defaultShippingCost
                              ? brand.defaultShippingCost
                              : 0,
                            locale,
                            true
                          )
                        : "Not Set"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-row flex-wrap justify-end space-x-3 space-y-2">
                  <button
                    className="mt-3 rounded-md border border-red-500 px-3 py-2 text-sm text-red-500 transition-colors duration-200 hover:bg-red-500 hover:text-white"
                    type="button"
                    onClick={(evt) => {
                      evt.preventDefault();
                      evt.stopPropagation();
                      fetch(
                        "/api/shippingCost?isDisable=true&brandId=" + brand.id,
                        {
                          method: "POST",
                        }
                      ).then(async (data) => {
                        if (data.status === 200) {
                          showSuccessDialog(
                            "Disable shipping success.",
                            "",
                            locale,
                            () => {
                              router.reload();
                            }
                          );
                        } else {
                          let json = await data.json();
                          if (json.error) {
                            showErrorDialog(json.error, json.errorMM, locale);
                          } else {
                            showErrorDialog(t("somethingWentWrong"));
                          }
                        }
                      });
                    }}
                  >
                    Disable Shipping
                  </button>
                  <button
                    className="mt-3 rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-primary-focus"
                    type="button"
                    onClick={(evt) => {
                      evt.preventDefault();
                      evt.stopPropagation();
                      setDialogOpen(true);
                    }}
                  >
                    Set Default Shipping Fee
                  </button>
                </div>
              </div>
              {brand.isOfferFreeShipping === false ? (
                <div
                  role="alert"
                  className="flex-1 rounded border-l-4 border-yellow-500 bg-yellow-50 py-4 px-6 shadow-md"
                >
                  <div className="flex items-center gap-2 text-yellow-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <strong className="block font-medium">
                      {" "}
                      Free Shipping Cost Excluded{" "}
                    </strong>
                  </div>

                  <p className="mt-2 text-sm text-yellow-700">
                    Offer free shipping and attract more customers to boost
                    sales and increase loyalty.
                  </p>
                  <div className="flex flex-row justify-end">
                    <button
                      className="mt-3 rounded-md bg-warning px-3 py-2 text-sm text-white"
                      type="button"
                      onClick={(evt) => {
                        evt.preventDefault();
                        evt.stopPropagation();
                        fetch(
                          "/api/shippingCost?isFreeShipping=true&brandId=" +
                            brand.id,
                          {
                            body: JSON.stringify({}),
                            method: "POST",
                          }
                        ).then(async (data) => {
                          if (data.status === 200) {
                            showSuccessDialog(
                              "Enable free shipping success.",
                              "",
                              locale,
                              () => {
                                router.reload();
                              }
                            );
                          } else {
                            let json = await data.json();
                            if (json.error) {
                              showErrorDialog(json.error, json.errorMM, locale);
                            } else {
                              showErrorDialog(t("somethingWentWrong"));
                            }
                          }
                        });
                      }}
                    >
                      Enable Free Shipping
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  role="alert"
                  className="flex-1 rounded bg-white py-4 px-6 shadow-md"
                >
                  <div className="flex flex-col gap-1">
                    <strong className="block font-medium">
                      {" "}
                      Free Shipping Cost (for all region)
                    </strong>
                    {brand.freeShippingCost ? (
                      <p className="font-semibold text-primary">
                        {formatAmount(
                          brand.freeShippingCost ? brand.freeShippingCost : 0,
                          locale,
                          true
                        )}
                      </p>
                    ) : (
                      <p className="font-semibold text-primary">Not Set</p>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-gray-700">
                    If no value is specified, the default value will be applied.
                  </p>
                  <div className="flex flex-row flex-wrap justify-end space-x-3 space-y-2">
                    <button
                      className="mt-3 rounded-md border border-error px-3 py-2 text-sm text-error"
                      type="button"
                      onClick={(evt) => {
                        evt.preventDefault();
                        evt.stopPropagation();
                        fetch(
                          "/api/shippingCost?isFreeShipping=true&brandId=" +
                            brand.id,
                          {
                            method: "POST",
                          }
                        ).then(async (data) => {
                          if (data.status === 200) {
                            showSuccessDialog(
                              "Disable free shipping success.",
                              "",
                              locale,
                              () => {
                                router.reload();
                              }
                            );
                          } else {
                            let json = await data.json();
                            if (json.error) {
                              showErrorDialog(json.error, json.errorMM, locale);
                            } else {
                              showErrorDialog(t("somethingWentWrong"));
                            }
                          }
                        });
                      }}
                    >
                      Disable Free Shipping
                    </button>
                    <button
                      className="mt-3 rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-primary-focus"
                      type="button"
                      onClick={(evt) => {
                        evt.preventDefault();
                        evt.stopPropagation();
                        setDialogOpen(true);
                      }}
                    >
                      Set Default Free Shipping
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 space-y-4">
              {stateList.map((e: any, index: number) => (
                <ShippingCostCard key={index} state={e} brandId={brand.id} />
              ))}
            </div>
          </div>
        )}
      </div>
      <ShippingCostDialog
        isModalOpen={dialogOpen}
        isDefault={false}
        setModalOpen={setDialogOpen}
        title={`${t("shippingCost")}`}
        shippingCost={{
          isOfferFreeShipping: brand.isOfferFreeShipping,
          shippingCost: brand.defaultShippingCost,
          freeShippingCost: brand.freeShippingCost,
        }}
        isCarGateInclue={true}
        onClickFn={(e: any) => {
          fetch("/api/brands?brandId=" + brand.id, {
            method: "PUT",
            body: JSON.stringify(e),
          }).then(async (data) => {
            if (data.status === 200) {
              router.reload();
            } else {
              let json = await data.json();
              showErrorDialog(json.error, json.errorMM, router.locale);
            }
          });
        }}
      />
    </div>
  ) : (
    <ErrorScreen statusCode={401} />
  );
}

export async function getServerSideProps({ query, locale }: any) {
  const { phoneNum } = query;
  let user = await prisma.user.findFirst({
    where: { phoneNum: decodeURIComponent(phoneNum) },
    include: {
      state: true,
      district: true,
      township: true,
    },
  });

  let brand: any = null;
  if (user) {
    brand = await prisma.user.findFirst({
      where: { id: user.id },
      include: {
        state: true,
        district: true,
        township: true,
      },
    });
    if (brand) {
      if (!brand.isOfferFreeShipping) {
        brand.isOfferFreeShipping = false;
        brand.freeShippingCost = 0;
      }
      if (!brand.shippingIncluded) {
        brand.shippingIncluded = false;
        brand.defaultShippingCost = 0;
        brand.carGateShippingCost = 0;
      }
    }
  }

  const stateList = await prisma.state.findMany({
    include: {
      districts: {
        include: {
          townships: true,
        },
      },
    },
  });

  let u = JSON.parse(JSON.stringify(user));
  let b = brand ? JSON.parse(JSON.stringify(brand)) : null;
  let s = JSON.parse(JSON.stringify(stateList));

  return {
    props: {
      data: { user: u, brand: b, stateList: s },
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Edit;
