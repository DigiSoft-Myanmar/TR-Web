import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { Ads, AdsPlacement, User } from "@prisma/client";
import SellerSelectBox from "@/components/presentational/SellerSelectBox";
import { useQuery } from "react-query";
import { getHeaders } from "@/util/authHelper";
import { useSession } from "next-auth/react";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import { useTranslation } from "react-i18next";
import AdsCard from "@/components/card/AdsCard";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  type: any;
  location: any;
}

enum TabList {
  All = "All",
  "Not Placed" = "Not placed",
  "Currently in use" = "Currently in use",
}

function AdsPickerDialog({ isModalOpen, setModalOpen, type, location }: Props) {
  const router = useRouter();
  const { locale } = router;
  const { data: session }: any = useSession();
  const [currentTab, setCurrentTab] = React.useState<any>(TabList.All);
  const [seller, setSeller] = React.useState<User | undefined>(undefined);
  const [currentAd, setCurrentAd] = React.useState<Ads | undefined>(undefined);
  const [isSubmit, setSubmit] = React.useState(false);
  const { t } = useTranslation("common");

  const { isLoading, error, data, refetch } = useQuery("adsData", () =>
    fetch("/api/siteManagement/ads").then((res) => {
      let json = res.json();
      return json;
    })
  );

  React.useEffect(() => {
    setCurrentTab(type);
  }, [type]);

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
  return (
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
              <div className="my-8 inline-block w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="text-darkShade flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">Ads Picker for {location}</h3>
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
                    <div className="min-w-[200px]">
                      <SellerSelectBox
                        isEmpty={true}
                        selected={seller}
                        setSelected={(e: User) => {
                          setSeller(e);
                        }}
                      />
                    </div>
                    <nav
                      aria-label="Tabs"
                      className="flex text-sm font-medium max-w-4xl overflow-x-auto scrollbar-hide border-b border-gray-100"
                    >
                      {Object.keys(TabList).map((z) => (
                        <div
                          className={`-mb-px border-b-4 p-4 whitespace-nowrap cursor-pointer ${
                            currentTab === z
                              ? "border-primary text-primary"
                              : "border-gray-100 hover:text-primary"
                          }`}
                          onClick={() => {
                            setCurrentTab(z);
                          }}
                        >
                          {TabList[z]}
                        </div>
                      ))}
                      {Object.keys(AdsPlacement).map((z) => (
                        <div
                          className={`-mb-px border-b-4 p-4 whitespace-nowrap cursor-pointer ${
                            currentTab === z
                              ? "border-primary text-primary"
                              : "border-gray-100 hover:text-primary"
                          }`}
                          onClick={() => {
                            setCurrentTab(z);
                          }}
                        >
                          {AdsPlacement[z]}
                        </div>
                      ))}
                    </nav>
                    {data
                      ?.filter((z: Ads) =>
                        seller ? seller.id === z.sellerId : true
                      )
                      ?.filter((z: any) =>
                        currentTab === TabList.All
                          ? true
                          : currentTab === TabList["Currently in use"]
                          ? z.adsLocations.length > 0
                          : currentTab === "Not Placed"
                          ? z.adsLocations.length === 0
                          : currentTab === AdsPlacement.OneCol
                          ? z.adsPlacement === AdsPlacement.OneCol
                          : currentTab === AdsPlacement.TwoCols
                          ? z.adsPlacement === AdsPlacement.TwoCols
                          : currentTab === AdsPlacement.ThreeCols
                          ? z.adsPlacement === AdsPlacement.ThreeCols
                          : currentTab === AdsPlacement.Unknown
                          ? z.adsPlacement === AdsPlacement.Unknown
                          : true
                      ).length > 0 ? (
                      <div className="grid grid-cols-auto280 gap-3 min-h-[300px] place-items-start">
                        {data
                          ?.filter((z: Ads) =>
                            seller ? seller.id === z.sellerId : true
                          )
                          ?.filter((z: any) =>
                            currentTab === TabList.All
                              ? true
                              : currentTab === TabList["Currently in use"]
                              ? z.adsLocations.length > 0
                              : currentTab === "Not Placed"
                              ? z.adsLocations.length === 0
                              : currentTab === AdsPlacement.OneCol
                              ? z.adsPlacement === AdsPlacement.OneCol
                              : currentTab === AdsPlacement.TwoCols
                              ? z.adsPlacement === AdsPlacement.TwoCols
                              : currentTab === AdsPlacement.ThreeCols
                              ? z.adsPlacement === AdsPlacement.ThreeCols
                              : currentTab === AdsPlacement.Unknown
                              ? z.adsPlacement === AdsPlacement.Unknown
                              : true
                          )
                          .map((z: Ads, index: number) => (
                            <div
                              key={index}
                              className={`relative min-w-[280px] max-w-[280px] rounded-md p-2 cursor-pointer ${
                                currentAd && currentAd.id === z.id
                                  ? "border border-primary"
                                  : "border"
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentAd && currentAd.id === z.id) {
                                  setCurrentAd(undefined);
                                } else {
                                  setCurrentAd(z);
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                className="checkbox checkbox-primary absolute top-3 left-3"
                                checked={currentAd && currentAd.id === z.id}
                                onChange={(e) => {
                                  e.preventDefault();
                                  if (currentAd && currentAd.id === z.id) {
                                    setCurrentAd(undefined);
                                  } else {
                                    setCurrentAd(z);
                                  }
                                }}
                              />
                              <AdsCard ads={z} />
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 min-h-[300px]">
                        <div className="grid min-h-[300px] px-4 bg-white place-content-center">
                          <h1 className="tracking-widest text-gray-500 uppercase">
                            {currentTab} | No Ads Found
                          </h1>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex w-full justify-end ">
                    <button
                      type="button"
                      disabled={isSubmit}
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary text-white hover:bg-primary-focus px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2"
                      onClick={() => {
                        if (currentAd) {
                          let adsLocation: any = currentAd.adsLocations;

                          if (
                            adsLocation.find(
                              (z: any) => z.location === location
                            )
                          ) {
                            showErrorDialog(
                              "This ad is already placed.",
                              "အသုံးပြုထားသော ကြော်ညာဖြစ်ပါသည်။",
                              locale
                            );
                            return;
                          } else {
                            adsLocation.push({
                              location: location,
                              startDate: new Date(),
                            });
                          }

                          setSubmit(true);
                          fetch("/api/siteManagement/ads?id=" + currentAd.id, {
                            method: "PUT",
                            headers: getHeaders(session),
                            body: JSON.stringify({
                              adsLocations: adsLocation,
                            }),
                          }).then(async (data) => {
                            setSubmit(false);
                            if (data.status === 200) {
                              showSuccessDialog(
                                t("submit") + " " + t("success"),
                                "",
                                locale
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
                        setModalOpen(false);
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default AdsPickerDialog;
