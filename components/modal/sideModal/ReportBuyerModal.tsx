import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { FilterType } from "@/pages/reports/buyerLocation";
import SellerSelectBox from "@/components/presentational/SellerSelectBox";
import { User } from "@prisma/client";
import { BrandSortSelectBox } from "@/components/presentational/SortSelectBox";
import BrandAutoCompleteBox from "@/components/presentational/BrandAutoCompleteBox";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import { showErrorDialog } from "@/util/swalFunction";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  filterType: FilterType;
  filterFn: Function;
  resetFilterFn: Function;
}

function ReportBuyerModal({
  isModalOpen,
  setModalOpen,
  filterType: parentFilterType,
  filterFn,
  resetFilterFn,
}: Props) {
  const router = useRouter();
  const [filterType, setFilterType] = React.useState<FilterType>({
    endDate: null,
    startDate: null,
    brandId: "",
    sellerId: "",
  });

  React.useEffect(() => {
    setFilterType(parentFilterType);
  }, [parentFilterType]);

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
  }, [router, isModalOpen, setModalOpen]);
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
              enter="ease-in-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute top-0 right-0 bottom-0 flex max-w-md min-w-[400px] transform overflow-auto rounded-l-xl bg-primary shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto bg-white p-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="text-darkShade flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">Filter</h3>
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
                  <div className="mt-2">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className={`text-sm font-medium text-gray-400`}>
                          Start Date
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg
                              aria-hidden="true"
                              className="w-5 h-5 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </div>
                          <input
                            name="start"
                            type="date"
                            className="border text-sm rounded-lg block w-full pl-10 p-2.5  bg-white border-gray-300 placeholder-gray-100 text-primaryText focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Select date start"
                            value={
                              filterType.startDate
                                ? typeof filterType.startDate === "object"
                                  ? filterType.startDate
                                      ?.toISOString()
                                      .substring(0, 10)
                                  : filterType.startDate
                                  ? filterType.startDate
                                  : ""
                                : ""
                            }
                            onChange={(e) => {
                              let d = e.currentTarget.valueAsDate;
                              if (d) {
                                setFilterType((prevValue) => {
                                  return {
                                    ...prevValue,
                                    startDate: d,
                                  };
                                });
                              } else {
                                setFilterType((prevValue) => {
                                  return {
                                    ...prevValue,
                                    startDate: null,
                                  };
                                });
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className={`text-sm font-medium text-gray-400`}>
                          End Date
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg
                              aria-hidden="true"
                              className="w-5 h-5 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </div>
                          <input
                            name="end"
                            type="date"
                            className="border text-sm rounded-lg block w-full pl-10 p-2.5  bg-white border-gray-300 placeholder-gray-100 text-primaryText focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Select date end"
                            value={
                              filterType.endDate
                                ? typeof filterType.endDate === "object"
                                  ? filterType.endDate
                                      ?.toISOString()
                                      .substring(0, 10)
                                  : filterType.endDate
                                  ? filterType.endDate
                                  : ""
                                : ""
                            }
                            onChange={(e) => {
                              let d = e.currentTarget.valueAsDate;
                              if (d) {
                                setFilterType((prevValue) => {
                                  return {
                                    ...prevValue,
                                    endDate: d,
                                  };
                                });
                              } else {
                                setFilterType((prevValue) => {
                                  return {
                                    ...prevValue,
                                    endDate: null,
                                  };
                                });
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <SellerSelectBox
                          selected={filterType?.seller}
                          setSelected={(e: User) => {
                            setFilterType((prevValue: any) => {
                              return {
                                ...prevValue,
                                seller: e,
                                sellerId: e.id,
                              };
                            });
                          }}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className={`text-sm font-medium text-gray-400`}>
                          Brand
                        </label>
                        <BrandAutoCompleteBox
                          setSelected={(e: any) => {
                            setFilterType((prevValue: any) => {
                              if (e.id) {
                                return {
                                  ...prevValue,
                                  brandId: filterType.brandId,
                                };
                              } else {
                                return {
                                  ...prevValue,
                                  brandId: "",
                                };
                              }
                            });
                          }}
                          selected={{ id: filterType.brandId }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex w-full justify-end gap-3">
                    <button
                      className="border px-3 rounded-md border-gray-400 hover:bg-gray-300 hover:text-primaryText transition"
                      type="button"
                      onClick={() => {
                        setFilterType({
                          endDate: null,
                          startDate: null,
                          sellerId: "",
                          brandId: "",
                          seller: undefined,
                        });
                        resetFilterFn();
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
                          d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                        />
                      </svg>
                    </button>
                    <SubmitBtn
                      isSubmit={false}
                      submitTxt="Loading..."
                      text="Filter"
                      onClick={() => {
                        if (filterType.startDate && filterType.endDate) {
                          if (filterType.startDate < filterType.endDate) {
                            filterFn(filterType);
                            setModalOpen(false);
                          } else {
                            showErrorDialog("Please input valid dates.");
                          }
                        } else {
                          showErrorDialog(
                            "Please input start date and end date."
                          );
                        }
                      }}
                    />
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

export default ReportBuyerModal;
