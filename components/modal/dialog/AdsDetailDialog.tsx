import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { fileUrl } from "@/types/const";
import { Ads, Membership, User } from "@prisma/client";
import Avatar from "@/components/presentational/Avatar";
import { getText } from "@/util/textHelper";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import { getHeaders } from "@/util/authHelper";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  ads: Ads & { seller: User & { currentMembership: Membership } };
  refetch: Function;
  isEditMode?: boolean;
}

function AdsDetailDialog({
  isModalOpen,
  setModalOpen,
  ads,
  refetch,
  isEditMode,
}: Props) {
  const router = useRouter();
  const { locale } = router;
  const memberValidity = ads?.seller?.currentMembership?.validity;
  const memberStartDate = ads?.seller?.memberStartDate;
  let date = new Date(memberStartDate);
  if (memberStartDate) {
    date = new Date(memberStartDate);
    date.setDate(date.getDate() + memberValidity);
  }
  const { data: session }: any = useSession();
  const { t } = useTranslation("common");
  const [url, setUrl] = React.useState("");

  React.useEffect(() => {
    if (ads) {
      setUrl(ads.url);
    }
  }, [ads]);

  React.useEffect(() => {
    router.beforePopState(({ as }) => {
      if (as !== router.asPath) {
        if (isModalOpen === true) {
          setModalOpen(false);
          return false;
        }
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [router, isModalOpen]);
  return ads ? (
    <>
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            {isModalOpen === true && (
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
              </Transition.Child>
            )}

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="my-8 inline-block w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="text-darkShade flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">Ads Details</h3>
                    <button
                      className="bg-lightShade flex rounded-md p-2 focus:outline-none"
                      onClick={() => setModalOpen(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </Dialog.Title>
                  <div className="mt-2 flex flex-col gap-3">
                    <div className="flex flex-col lg:flex-row items-start gap-3">
                      <div className="w-1/2">
                        <img src={fileUrl + ads.adsImg} />
                      </div>
                      <div className="w-1/2 flex flex-col gap-3">
                        <h3 className="text-primaryText font-semibold">
                          Ads Information
                        </h3>
                        <p className="text-sm">
                          Ads Size : {ads.adsWidth} x {ads.adsHeight}
                        </p>
                        <p className="text-sm">
                          Suitable Placement : {ads.adsPlacement}
                        </p>
                        {isEditMode === true ? (
                          <>
                            <label className="text-xs text-gray-700">
                              Ads URL
                            </label>
                            <input
                              value={url}
                              onChange={(e) => setUrl(e.currentTarget.value)}
                              className="text-sm border p-2 rounded-md bg-white"
                            />
                          </>
                        ) : (
                          <p className="text-sm">
                            Ads URL :{" "}
                            <a
                              href={ads.url}
                              target="_blank"
                              className="hover:underline"
                            >
                              {ads.url}
                            </a>
                          </p>
                        )}
                        <h3 className="text-primaryText font-semibold border-t pt-3">
                          Seller Information
                        </h3>
                        <div
                          className="flex flex-row items-center gap-3 cursor-pointer"
                          onClick={() => {
                            router.push(
                              "/account/" +
                                encodeURIComponent(ads.seller.phoneNum)
                            );
                          }}
                        >
                          <Avatar
                            username={ads.seller.username}
                            profile={ads.seller.profile}
                            size={40}
                          />
                          <div className="flex flex-col">
                            <p className="text-sm font-medium">
                              {ads.seller.username}
                            </p>
                            <span className="text-xs text-gray-500">
                              {getText(
                                ads.seller.currentMembership.name,
                                ads.seller.currentMembership.nameMM,
                                locale
                              )}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm">
                          Member end date :{" "}
                          {date.toLocaleDateString("en-ca", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <h3 className="text-primaryText font-semibold border-t pt-3">
                      Ads Placement
                    </h3>
                    <div className="grid grid-cols-auto200 gap-3">
                      {ads?.adsLocations.map((z: any, index) => {
                        const adsValidity =
                          ads?.seller?.currentMembership?.adsValidity;
                        const adsEndDate = new Date(z.startDate);
                        adsEndDate.setDate(adsEndDate.getDate() + adsValidity);

                        return (
                          <div
                            className="flex flex-col items-start gap-3 border p-3 min-w-[200px] max-w-[200px] rounded-md hover:border-primary"
                            key={index}
                          >
                            <p className="text-sm text-gray-600">
                              Location:{" "}
                              <span className="text-primaryText font-semibold">
                                {z.location}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Start Date:{" "}
                              <span className="text-primaryText font-semibold">
                                {new Date(z.startDate).toLocaleDateString(
                                  "en-ca",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "2-digit",
                                  }
                                )}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              End Date:{" "}
                              <span className="text-primaryText font-semibold">
                                {new Date(adsEndDate).toLocaleDateString(
                                  "en-ca",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "2-digit",
                                  }
                                )}
                              </span>
                            </p>
                            <div className="flex flex-row justify-end w-full">
                              <button
                                className="bg-primary p-1 rounded-md text-white hover:bg-primary-focus"
                                onClick={() => {
                                  if (ads) {
                                    let adsLocation: any = ads.adsLocations;

                                    showConfirmationDialog(
                                      t("deleteConfirmation"),
                                      "",
                                      locale,
                                      () => {
                                        fetch(
                                          "/api/siteManagement/ads?id=" +
                                            ads.id,
                                          {
                                            method: "PUT",
                                            headers: getHeaders(session),
                                            body: JSON.stringify({
                                              adsLocations: adsLocation.filter(
                                                (b) => b.location !== z.location
                                              ),
                                            }),
                                          }
                                        ).then(async (data) => {
                                          if (data.status === 200) {
                                            showSuccessDialog(
                                              t("submit") + " " + t("success"),
                                              "",
                                              locale,
                                              () => {
                                                refetch();
                                                setModalOpen(false);
                                              }
                                            );
                                          } else {
                                            let json = await data.json();
                                            if (json.error) {
                                              showErrorDialog(
                                                json.error,
                                                json.errorMM,
                                                locale
                                              );
                                            } else {
                                              showErrorDialog(
                                                t("somethingWentWrong"),
                                                "",
                                                locale
                                              );
                                            }
                                          }
                                        });
                                      }
                                    );
                                  }
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-5 h-5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 flex w-full justify-end ">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-focus focus:outline-none"
                      onClick={() => {
                        if (isEditMode) {
                          fetch("/api/siteManagement/ads?id=" + ads.id, {
                            method: "PUT",
                            headers: getHeaders(session),
                            body: JSON.stringify({
                              url: url,
                            }),
                          }).then(async (data) => {
                            if (data.status === 200) {
                              showSuccessDialog(
                                t("submit") + " " + t("success"),
                                "",
                                locale,
                                () => {
                                  refetch();
                                  setModalOpen(false);
                                }
                              );
                            } else {
                              let json = await data.json();
                              if (json.error) {
                                showErrorDialog(
                                  json.error,
                                  json.errorMM,
                                  locale
                                );
                              } else {
                                showErrorDialog(
                                  t("somethingWentWrong"),
                                  "",
                                  locale
                                );
                              }
                            }
                          });
                        } else {
                          setModalOpen(false);
                        }
                      }}
                    >
                      {isEditMode ? "Submit" : "Close"}
                    </button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  ) : (
    <></>
  );
}

export default AdsDetailDialog;
