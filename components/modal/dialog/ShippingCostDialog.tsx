import ErrorText from "@/components/presentational/ErrorText";
import { verifyNumber } from "@/util/verify";
import { Dialog, Transition } from "@headlessui/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { Fragment } from "react";
import { FaPlus } from "react-icons/fa";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  title: string;
  shippingCost: any;
  isDefault: boolean;
  onClickFn: Function;
  disableFreeShippingEdit?: boolean;
  isCarGateInclue?: boolean;
}

function ShippingCostDialog({
  isModalOpen,
  setModalOpen,
  title,
  isDefault,
  shippingCost: parentShippingCost,
  isCarGateInclue,
  onClickFn,
  disableFreeShippingEdit,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [shippingCost, setShippingCost] =
    React.useState<any>(parentShippingCost);
  const [shippingCostError, setShippingCostError] = React.useState<any>({});

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
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
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
              <div className="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">{title}</h3>
                    <button
                      className="flex rounded-md p-2 focus:outline-none"
                      onClick={() => setModalOpen(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </Dialog.Title>
                  <div className="mt-8">
                    <div className="flex flex-col space-y-5">
                      <div className="relative z-0">
                        <input
                          type="number"
                          onWheelCapture={(e) => e.currentTarget.blur()}
                          autoComplete="off"
                          className="peer block w-full appearance-none border-0 border-b-2 bg-transparent py-2.5 px-0 text-sm focus:border-primary focus:outline-none focus:ring-0"
                          placeholder=" "
                          defaultValue={
                            isDefault === true
                              ? shippingCost && shippingCost.defaultShippingCost
                                ? shippingCost.defaultShippingCost
                                : ""
                              : shippingCost && shippingCost.shippingCost
                              ? shippingCost.shippingCost
                              : ""
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onChange={(e) => {
                            let verify = verifyNumber(e.currentTarget.value);
                            if (isDefault === true) {
                              setShippingCost({
                                ...shippingCost,
                                defaultShippingCost:
                                  e.currentTarget.valueAsNumber,
                              });
                            } else {
                              setShippingCost({
                                ...shippingCost,
                                shippingCost: e.currentTarget.valueAsNumber,
                              });
                            }
                            if (verify.isSuccess) {
                              setShippingCostError({
                                ...shippingCostError,
                                defaultShippingCostError: "",
                                defaultShippingCostErrorMM: "",
                              });
                            } else {
                              setShippingCostError({
                                ...shippingCostError,
                                defaultShippingCostError: verify.error,
                                defaultShippingCostErrorMM: verify.errorMM,
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor="floating_standard"
                          className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-primary"
                        >
                          {isDefault === true
                            ? t("defaultShippingCost")
                            : t("shippingCost")}
                          <span className="text-primary">*</span>
                        </label>
                      </div>
                      {shippingCostError && (
                        <ErrorText
                          error={shippingCostError.defaultShippingCostError}
                          errorMM={shippingCostError.defaultShippingCostErrorMM}
                        />
                      )}
                      {isCarGateInclue === true ? (
                        <>
                          <div className="relative z-0">
                            <input
                              type="number"
                              onWheelCapture={(e) => e.currentTarget.blur()}
                              autoComplete="off"
                              className="peer block w-full appearance-none border-0 border-b-2 bg-transparent py-2.5 px-0 text-sm focus:border-primary focus:outline-none focus:ring-0"
                              placeholder=" "
                              defaultValue={
                                shippingCost && shippingCost.carGateShippingCost
                                  ? shippingCost.carGateShippingCost
                                  : ""
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onChange={(e) => {
                                let verify = verifyNumber(
                                  e.currentTarget.value,
                                );

                                setShippingCost({
                                  ...shippingCost,
                                  carGateShippingCost:
                                    e.currentTarget.valueAsNumber,
                                });
                                if (verify.isSuccess) {
                                  setShippingCostError({
                                    ...shippingCostError,
                                    carGateShippingCostError: "",
                                    carGateShippingCostErrorMM: "",
                                  });
                                } else {
                                  setShippingCostError({
                                    ...shippingCostError,
                                    carGateShippingCostError: verify.error,
                                    carGateShippingCostErrorMM: verify.errorMM,
                                  });
                                }
                              }}
                            />
                            <label
                              htmlFor="floating_standard"
                              className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-primary"
                            >
                              {t("carGateShippingCost")}
                              <span className="text-primary">*</span>
                            </label>
                          </div>
                          {shippingCostError && (
                            <ErrorText
                              error={shippingCostError.carGateShippingCostError}
                              errorMM={
                                shippingCostError.carGateShippingCostErrorMM
                              }
                            />
                          )}
                        </>
                      ) : (
                        <></>
                      )}
                      {disableFreeShippingEdit === true ? (
                        <></>
                      ) : (
                        <>
                          <div className="mb-4 flex items-center">
                            <input
                              id="default-checkbox"
                              type="checkbox"
                              checked={
                                shippingCost &&
                                shippingCost.isOfferFreeShipping === true
                                  ? true
                                  : false
                              }
                              onChange={(e) => {
                                if (e.currentTarget.checked === true) {
                                  setShippingCost({
                                    ...shippingCost,
                                    isOfferFreeShipping: true,
                                  });
                                } else {
                                  let a = { ...shippingCost };
                                  a.isOfferFreeShipping = false;
                                  if (a.freeShippingCost) {
                                    delete a.freeShippingCost;
                                  }
                                  setShippingCost(a);
                                  setShippingCostError({
                                    ...shippingCostError,
                                    minimumPriceError: "",
                                    minimumPriceErrorMM: "",
                                  });
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary accent-primary focus:ring-2 focus:ring-primary"
                            />
                            <label
                              htmlFor="default-checkbox"
                              className="ml-2 text-sm font-medium text-gray-900"
                            >
                              {t("offerFreeShipping")}
                            </label>
                          </div>
                          {shippingCost && shippingCost.isOfferFreeShipping && (
                            <>
                              <div className="relative z-0">
                                <input
                                  type="number"
                                  onWheelCapture={(e) => e.currentTarget.blur()}
                                  autoComplete="off"
                                  className="peer block w-full appearance-none border-0 border-b-2 bg-transparent py-2.5 px-0 text-sm focus:border-primary focus:outline-none focus:ring-0"
                                  placeholder=" "
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  defaultValue={
                                    shippingCost &&
                                    shippingCost.freeShippingCost
                                      ? shippingCost.freeShippingCost
                                      : ""
                                  }
                                  onChange={(e) => {
                                    setShippingCost({
                                      ...shippingCost,
                                      freeShippingCost:
                                        e.currentTarget.valueAsNumber,
                                    });
                                    let verify = verifyNumber(
                                      e.currentTarget.value,
                                    );
                                    if (verify.isSuccess) {
                                      setShippingCostError({
                                        ...shippingCostError,
                                        minimumPriceError: "",
                                        minimumPriceErrorMM: "",
                                      });
                                    } else {
                                      setShippingCostError({
                                        ...shippingCostError,
                                        minimumPriceError: verify.error,
                                        minimumPriceErrorMM: verify.errorMM,
                                      });
                                    }
                                  }}
                                />
                                <label
                                  htmlFor="floating_standard"
                                  className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-primary"
                                >
                                  {t("minimumPurchaseAmount")}
                                  <span className="text-primary">*</span>
                                </label>
                              </div>
                              {shippingCostError && (
                                <ErrorText
                                  error={shippingCostError.minimumPriceError}
                                  errorMM={
                                    shippingCostError.minimumPriceErrorMM
                                  }
                                />
                              )}
                              <h3 className="text-sm text-gray-800">
                                {t("provideFreeShipping")}
                              </h3>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex w-full justify-end ">
                    <button
                      type="button"
                      className="rounded-md bg-primary px-7 py-3 text-sm text-white hover:bg-primary-focus"
                      onClick={() => {
                        onClickFn(shippingCost);
                        setModalOpen(false);
                      }}
                    >
                      OK
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

export default ShippingCostDialog;
