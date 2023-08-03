import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaPlus } from "react-icons/fa";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { verifyNumber } from "@/util/verify";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import FormInput from "@/components/presentational/FormInput";
import { StockType } from "@prisma/client";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  setStock: Function;
}

type Form = {
  stockLevel: number;
};

function StockTypeModal({ isModalOpen, setModalOpen, setStock }: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [stockType, setStockType] = React.useState<StockType>(
    StockType.InStock
  );

  const schema = z.object(
    stockType === StockType.StockLevel
      ? {
          stockLevel: z
            .number({
              invalid_type_error: t("inputValidNumber"),
              required_error: "",
            })
            .min(0, {
              message: t("inputValidAmount"),
            })
            .nonnegative({ message: t("inputValidAmount") }),
        }
      : {
          stockLevel: z
            .number({
              invalid_type_error: t("inputValidNumber"),
              required_error: "",
            })
            .min(0, {
              message: t("inputValidAmount"),
            })
            .nonnegative({ message: t("inputValidAmount") }),
        }
  );

  const { register, handleSubmit, watch, formState, reset } = useForm<Form>({
    mode: "onChange",
    defaultValues: {
      stockLevel: 0,
    },
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const watchFields = watch();

  const stockList = [
    StockType.InStock,
    StockType.OutOfStock,
    StockType.StockLevel,
  ];

  React.useEffect(() => {
    reset({
      stockLevel: 0,
    });
  }, [isModalOpen]);

  function submitForm(data: Form) {
    setStock({ stockType: stockType, stockLevel: data.stockLevel });
    setModalOpen(false);
  }

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
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-80" />
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
              <div className="bg-brandDark absolute top-0 right-0 bottom-0 flex w-full max-w-md transform overflow-auto shadow-xl transition-all">
                <div className="dark:bg-bgDark inline-block w-full overflow-y-auto bg-gray-100 p-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">Set Stock Level</h3>
                    <button
                      className="bg-lightShade dark:bg-bgDark flex rounded-md p-2 focus:outline-none"
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
                  <form onSubmit={handleSubmit(submitForm)}>
                    <div className="mt-8">
                      <div>
                        <label className={`text-sm font-medium text-gray-400`}>
                          {t("stockType")}
                          <span className="text-primary">*</span>
                        </label>
                        <div className="mt-1 flex flex-wrap items-center justify-start gap-3">
                          {stockList.map((elem, index) => (
                            <div
                              className={`flex cursor-pointer items-center space-x-3 rounded-lg border px-3 shadow-sm transition-colors hover:bg-primary-focus hover:text-white ${
                                stockType === elem
                                  ? "border-primary text-primary ring-1 ring-primary"
                                  : "border-gray-200"
                              } `}
                              key={index}
                              onClick={(e) => {
                                setStockType(elem);
                              }}
                            >
                              <label
                                className={`block flex-grow cursor-pointer p-4 text-sm font-medium`}
                              >
                                <span className="whitespace-nowrap">
                                  {" "}
                                  {t(elem)}{" "}
                                </span>
                              </label>
                              {elem === stockType && (
                                <svg
                                  className="top-4 right-4 h-5 w-5 cursor-pointer"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          ))}
                        </div>
                        {!stockType && (
                          <span className="p-2 text-xs text-error">
                            {t("inputStockTypeError")}
                          </span>
                        )}
                      </div>

                      {stockType === StockType.StockLevel && (
                        <FormInput
                          disableRoundedRight={true}
                          label={"Stock Level"}
                          placeHolder={"Enter Stock Level"}
                          error={errors.stockLevel?.message}
                          type="number"
                          formControl={{
                            ...register("stockLevel", {
                              setValueAs: (v) => (v ? parseInt(v) : undefined),
                            }),
                          }}
                          currentValue={watchFields.stockLevel}
                          optional={true}
                        />
                      )}
                    </div>

                    <div className="mt-4 flex w-full justify-end ">
                      <SubmitBtn
                        isSubmit={false}
                        submitTxt={"Loading..."}
                        text="OK"
                      />
                    </div>
                  </form>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default StockTypeModal;
