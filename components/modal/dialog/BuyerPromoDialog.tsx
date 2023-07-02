import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { PromoCode, User } from "@prisma/client";
import Avatar from "@/components/presentational/Avatar";
import {
  formatAmount,
  getPromoAvailCount,
  getPromoCount,
  getUsageCount,
} from "@/util/textHelper";
import LoadingScreen from "@/components/screen/LoadingScreen";
import { useMarketplace } from "@/context/MarketplaceContext";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  sellerId: string;
  seller: any;
  totalAmount: number;
}

function BuyerPromoDialog({
  isModalOpen,
  setModalOpen,
  sellerId,
  seller,
  totalAmount,
}: Props) {
  const router = useRouter();
  const { locale } = router;
  const { isLoading, error, data, refetch } = useQuery(
    ["promoData", sellerId],
    () =>
      fetch("/api/promoCode?sellerId=" + sellerId).then((res) => {
        let json = res.json();
        return json;
      })
  );
  const { addPromotion } = useMarketplace();

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
  return sellerId && seller ? (
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
              <div className="my-8 inline-block w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="text-darkShade flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">
                      Promo Code from {seller?.username}
                    </h3>
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
                  <div className="overflow-y-auto">
                    {data && data.length > 0 ? (
                      <div className="mt-5 grid grid-cols-auto200 gap-3 min-h-[300px] place-content-start">
                        {data
                          .filter((z) => getPromoAvailCount(z) >= 0)
                          .map(
                            (
                              z: PromoCode & {
                                seller: User;
                                usage: number;
                                ownUsage: number;
                              },
                              index
                            ) => (
                              <div
                                key={index}
                                className="flex flex-col gap-3 border p-3 rounded-md hover:border-primary transition cursor-pointer max-w-[200px] min-w-[200px]"
                              >
                                <div className="flex flex-row items-center gap-3">
                                  <Avatar
                                    username={z.seller.username}
                                    profile={z.seller.profile}
                                    size={32}
                                  />
                                  <div className="flex flex-col">
                                    <h3 className="font-semibold text-primary">
                                      {z.promoCode}
                                    </h3>
                                    <h3 className="text-xs">
                                      {z.seller.username}
                                    </h3>
                                  </div>
                                </div>
                                <div className="border-t border-dashed border-primaryText flex flex-row items-start gap-3 justify-end">
                                  {z.startDate && z.endDate && (
                                    <div className="flex-grow flex flex-col gap-1 py-2 items-center">
                                      <h3 className="text-xs text-center text-gray-500">
                                        Valid until
                                      </h3>
                                      <p className="text-xs text-center">
                                        {new Date(z.endDate).toLocaleDateString(
                                          "en-ca",
                                          {
                                            year: "numeric",
                                            month: "short",
                                            day: "2-digit",
                                          }
                                        )}
                                      </p>
                                    </div>
                                  )}
                                  <div className="bg-primary p-2 rounded-b-lg flex flex-col gap-1">
                                    <h3 className="font-semibold text-white text-sm text-center">
                                      {formatAmount(
                                        z.discount,
                                        locale,
                                        z.isPercent === false
                                      )}
                                      {z.isPercent === true ? "%" : ""}
                                    </h3>
                                    <p className="text-white font-semibold text-center text-sm">
                                      OFF
                                    </p>
                                  </div>
                                </div>
                                {totalAmount >= z.minimumPurchasePrice &&
                                getPromoAvailCount(z) > 0 ? (
                                  <button
                                    type="button"
                                    className="text-sm font-semibold bg-primary px-3 py-2 rounded-md text-white hover:bg-primary-focus"
                                    onClick={() => {
                                      addPromotion(z);
                                      setModalOpen(false);
                                    }}
                                  >
                                    Apply Promo Code
                                  </button>
                                ) : totalAmount < z.minimumPurchasePrice ? (
                                  <button
                                    type="button"
                                    className="text-sm font-semibold bg-warning px-3 py-2 rounded-md text-white hover:bg-warning-content"
                                    onClick={() => {
                                      router.push("/shop/" + z.seller.phoneNum);
                                    }}
                                  >
                                    Need{" "}
                                    {formatAmount(
                                      z.minimumPurchasePrice - totalAmount,
                                      locale,
                                      true
                                    )}{" "}
                                    more to apply
                                  </button>
                                ) : (
                                  <span></span>
                                )}
                              </div>
                            )
                          )}
                      </div>
                    ) : data && data.length === 0 ? (
                      <div className="grid px-4 place-content-center min-h-[300px] bg-white">
                        <h1 className="tracking-widest text-gray-500 uppercase">
                          No promo code available from {seller.username}
                        </h1>
                      </div>
                    ) : (
                      <LoadingScreen />
                    )}
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

export default BuyerPromoDialog;
