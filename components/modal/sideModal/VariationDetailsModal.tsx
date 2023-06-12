import React, { Fragment } from "react";
import { Dialog, Listbox, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { z } from "zod";
import { useTranslation } from "next-i18next";
import { StockType } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorText from "@/components/presentational/ErrorText";
import { useProduct } from "@/context/ProductContext";
import FormInput from "@/components/presentational/FormInput";
import FormSaleDatePicker from "@/components/presentational/FormSaleDatePicker";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import _ from "lodash";
import { verifyText } from "@/util/verify";
import ProductImgDialog from "../dialog/ProductImgDialog";

interface Props {
  variation: any;
  setVariation: Function;
  isModalOpen: boolean;
  setModalOpen: Function;
  isNew: boolean;
  currentIndex: number;
}

type Variation = {
  img?: String;
  SKU?: string;
  regularPrice?: number;
  salePrice?: number;
  isPercent?: boolean;
  stockType?: StockType;
  stockLevel?: number;
  saleStartDate?: Date;
  saleEndDate?: Date;
};

function VariationDetailsModal({
  isModalOpen,
  setModalOpen,
  variation,
  setVariation,
  isNew,
  currentIndex,
}: Props) {
  const { product, setProduct } = useProduct();

  const [variationError, setVariationError] = React.useState<any>({});
  const [galleryModalOpen, setGalleryModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");

  const stockList = [
    StockType.InStock,
    StockType.OutOfStock,
    StockType.StockLevel,
  ];
  const router = useRouter();
  const { t } = useTranslation("common");

  const schema = z.object(
    variation.stockType === StockType.StockLevel
      ? {
          regularPrice: z
            .number({
              invalid_type_error: t("inputValidNumber"),
              required_error: "",
            })
            .min(1, {
              message: t("inputValidAmount"),
            })
            .nonnegative({ message: t("inputValidAmount") }),
          salePrice:
            variation.isPercent === true
              ? z
                  .number({
                    invalid_type_error: t("inputValidNumber"),
                    required_error: "",
                  })
                  .min(0, {
                    message: t("inputValidPercentage"),
                  })
                  .max(100, {
                    message: t("inputValidPercentage"),
                  })
                  .nonnegative({ message: t("inputValidPercentage") })
                  .optional()
                  .or(z.literal(""))
              : z
                  .number({
                    invalid_type_error: t("inputValidNumber"),
                    required_error: "",
                  })
                  .min(0, {
                    message: t("inputValidAmount"),
                  })
                  .nonnegative({ message: t("inputValidAmount") })
                  .optional()
                  .or(z.literal("")),
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
          regularPrice: z
            .number({
              invalid_type_error: t("inputValidNumber"),
              required_error: "",
            })
            .min(1, {
              message: t("inputValidAmount"),
            })
            .nonnegative({ message: t("inputValidAmount") }),
          salePrice:
            variation.isPercent === true
              ? z
                  .number({
                    invalid_type_error: t("inputValidNumber"),
                    required_error: "",
                  })
                  .min(0, {
                    message: t("inputValidPercentage"),
                  })
                  .max(100, {
                    message: t("inputValidPercentage"),
                  })
                  .nonnegative({ message: t("inputValidPercentage") })
                  .optional()
                  .or(z.literal(""))
              : z
                  .number({
                    invalid_type_error: t("inputValidNumber"),
                    required_error: "",
                  })
                  .min(0, {
                    message: t("inputValidAmount"),
                  })
                  .nonnegative({ message: t("inputValidAmount") })
                  .optional()
                  .or(z.literal("")),
        }
  );

  const { register, handleSubmit, watch, formState, reset } =
    useForm<Variation>({
      mode: "onChange",
      resolver: zodResolver(schema),
    });
  const { errors } = formState;
  const watchFields = watch();

  React.useEffect(() => {
    if (isModalOpen === true) {
      if (variation) {
        reset(variation);
      } else {
        reset({});
      }
    }
  }, [isModalOpen]);

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

  React.useEffect(() => {
    if (variation.attributes) {
      if (product.attributes.length === variation.attributes.length) {
        if (
          product.variations &&
          product.variations.find((e: any) =>
            _.isEqual(
              _.sortBy(e.attributes, (o) => o._id),
              _.sortBy(variation.attributes, (o) => o._id)
            )
          )
        ) {
          let id = product.variations.findIndex((e: any) =>
            _.isEqual(
              _.sortBy(e.attributes, (o) => o._id),
              _.sortBy(variation.attributes, (o) => o._id)
            )
          );
          if (currentIndex !== -1) {
            if (currentIndex !== id) {
              setVariationError({
                ...variationError,
                attributeError: "Variation already exists.",
                attributeErrorMM: "မျိုးကွဲရှိပြီးသားဖြစ်ပါသည်",
              });
            } else {
              setVariationError({
                ...variationError,
                attributeError: "",
                attributeErrorMM: "",
              });
            }
          } else {
            setVariationError({
              ...variationError,
              attributeError: "Variation already exists.",
              attributeErrorMM: "မျိုးကွဲရှိပြီးသားဖြစ်ပါသည်",
            });
          }
        } else {
          setVariationError({
            ...variationError,
            attributeError: "",
            attributeErrorMM: "",
          });
        }
      } else {
        setVariationError({
          ...variationError,
          attributeError: "Please choose all attributes.",
          attributeErrorMM: "အရည်အသွေးအားလုံးကို ရွေးပါ။",
        });
      }
    }
  }, [variation, currentIndex]);

  function submitVariation(data: Variation) {
    let valid = true;
    if (variation.attributes) {
      if (product.attributes.length === variation.attributes.length) {
        if (
          product.variations &&
          product.variations.find((e: any) =>
            _.isEqual(
              _.sortBy(e.attributes, (o) => o._id),
              _.sortBy(variation.attributes, (o) => o._id)
            )
          )
        ) {
          let id = product.variations.findIndex((e: any) =>
            _.isEqual(
              _.sortBy(e.attributes, (o) => o._id),
              _.sortBy(variation.attributes, (o) => o._id)
            )
          );
          if (currentIndex !== -1) {
            if (currentIndex !== id) {
              setVariationError({
                ...variationError,
                attributeError: "Variation already exists.",
                attributeErrorMM: "မျိုးကွဲရှိပြီးသားဖြစ်ပါသည်",
              });
              valid = false;
            } else {
              setVariationError({
                ...variationError,
                attributeError: "",
                attributeErrorMM: "",
              });
            }
          } else {
            setVariationError({
              ...variationError,
              attributeError: "Variation already exists.",
              attributeErrorMM: "မျိုးကွဲရှိပြီးသားဖြစ်ပါသည်",
            });

            valid = false;
          }
        }
      } else {
        setVariationError({
          ...variationError,
          attributeError: "Please choose all attributes.",
          attributeErrorMM: "အရည်အသွေးအားလုံးကို ရွေးပါ။",
        });
        valid = false;
      }
    } else {
      setVariationError({
        ...variationError,
        attributeError: "Please choose all attributes.",
        attributeErrorMM: "အရည်အသွေးအားလုံးကို ရွေးပါ။",
      });
      valid = false;
    }
    setVariation((prevValue: Variation) => {
      return { ...prevValue, ...data };
    });
    if ((valid === true && error && error.length === 0) || !error) {
      let variations: any = [];
      if (product.variations) {
        variations = [...product.variations];
      }
      if (variation.SKU && variation.SKUVerify !== true) {
        setVariationError({
          ...variationError,
          skuError: "SKU is not verified yet.",
          skuErrorMM: "SKU မစစ်ရသေးပါ",
        });
      } else {
        if (isNew) {
          variations.push({ ...variation, ...data });
          setProduct({
            ...product,
            variations: variations,
          });
        } else {
          variations[currentIndex] = { ...variation, ...data };
          setProduct({
            ...product,
            variations: variations,
          });
        }
        setModalOpen(false);
      }
    }
  }

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
              <div className="absolute top-0 right-0 bottom-0 flex w-[400px] transform overflow-auto rounded-l-xl bg-primary shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto bg-white p-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">
                      {isNew ? "New Variation" : "Update Variation"}
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
                  <form onSubmit={handleSubmit(submitVariation)}>
                    <div className="mt-2">
                      <div className="mt-6 flex flex-col space-y-5 px-5">
                        <div className="flex flex-col items-center">
                          {variation.img ? (
                            <img
                              draggable={false}
                              src={"/api/files/" + variation.img}
                              className="h-16 w-16 cursor-pointer object-contain shadow-md md:h-32 md:w-32"
                              onClick={() => setGalleryModalOpen(true)}
                            />
                          ) : (
                            <div
                              className={`flex h-32 w-32 cursor-pointer flex-col items-center justify-center space-y-5 rounded-md bg-primary text-white shadow-md`}
                              onClick={() => {
                                setGalleryModalOpen(true);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {product.attributes.map(
                          (elem: any, attrIndex: number) => (
                            <div
                              className="flex flex-col space-y-2"
                              key={attrIndex}
                            >
                              <div className="flex w-full">
                                <label className="flex-grow text-sm text-gray-400">
                                  {router.locale &&
                                  router.locale === "mm" &&
                                  elem.nameMM.length > 0
                                    ? elem.nameMM
                                    : elem.name}
                                  <span className="text-primary">*</span>
                                </label>
                              </div>
                              <Listbox
                                value={
                                  variation && variation.attributes
                                    ? variation.attributes.find(
                                        (e: any) => e.attributeId === elem.id
                                      )
                                      ? variation.attributes.find(
                                          (e: any) => e.attributeId === elem.id
                                        )
                                      : { name: "Any", attributeId: elem.id }
                                    : { name: "Any", attributeId: elem.id }
                                }
                                onChange={(e) => {
                                  if (variation.attributes) {
                                    let existsIndex =
                                      variation.attributes.findIndex(
                                        (e: any) => e.attributeId === elem.id
                                      );
                                    if (existsIndex >= 0) {
                                      let attr = [...variation.attributes];
                                      attr[existsIndex] = e;
                                      setVariation({
                                        ...variation,
                                        attributes: attr,
                                      });
                                    } else {
                                      setVariation({
                                        ...variation,
                                        attributes: [
                                          ...variation.attributes,
                                          e,
                                        ],
                                      });
                                    }
                                  } else {
                                    setVariation({
                                      ...variation,
                                      attributes: [e],
                                    });
                                  }
                                }}
                              >
                                <div className="relative mt-1">
                                  <Listbox.Button
                                    className={`relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm`}
                                  >
                                    <span className="block truncate">
                                      {variation &&
                                      variation.attributes &&
                                      variation.attributes.find(
                                        (e: any) => e.attributeId === elem.id
                                      )
                                        ? router.locale &&
                                          router.locale === "mm" &&
                                          variation.attributes.find(
                                            (e: any) =>
                                              e.attributeId === elem.id
                                          ).nameMM &&
                                          variation.attributes.find(
                                            (e: any) =>
                                              e.attributeId === elem.id
                                          ).nameMM.length > 0
                                          ? variation.attributes.find(
                                              (e: any) =>
                                                e.attributeId === elem.id
                                            ).nameMM
                                          : variation.attributes.find(
                                              (e: any) =>
                                                e.attributeId === elem.id
                                            ).name
                                        : "-"}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                                        />
                                      </svg>
                                    </span>
                                  </Listbox.Button>
                                  <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                  >
                                    <Listbox.Options
                                      className={`absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
                                    >
                                      <Listbox.Option
                                        className={({ active }) =>
                                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                            active
                                              ? "bg-primary/10 text-primary"
                                              : ""
                                          }`
                                        }
                                        value={{
                                          name: "Any",
                                          attributeId: elem.id,
                                        }}
                                      >
                                        <>
                                          <span
                                            className={`block whitespace-nowrap ${
                                              variation &&
                                              variation.attributes &&
                                              variation.attributes.find(
                                                (e: any) =>
                                                  e.attributeId === elem.id
                                              )
                                                ? "font-medium"
                                                : "font-normal"
                                            }`}
                                          >
                                            {router.locale &&
                                            router.locale === "mm"
                                              ? "Any"
                                              : "Any"}
                                          </span>
                                          {variation &&
                                          variation.attributes &&
                                          variation.attributes.find(
                                            (e: any) =>
                                              e.attributeId === elem.id
                                          ) &&
                                          variation &&
                                          variation.attributes &&
                                          variation.attributes.find(
                                            (e: any) =>
                                              e.attributeId === elem.id
                                          ).name === "Any" ? (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                aria-hidden="true"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="M5 13l4 4L19 7"
                                                />
                                              </svg>
                                            </span>
                                          ) : null}
                                        </>
                                      </Listbox.Option>
                                      {elem.Term.map(
                                        (data: any, index: number) => (
                                          <Listbox.Option
                                            key={index}
                                            className={({ active }) =>
                                              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                active
                                                  ? "bg-primary/10 text-primary"
                                                  : ""
                                              }`
                                            }
                                            value={data}
                                          >
                                            <>
                                              <span
                                                className={`block whitespace-nowrap ${
                                                  variation &&
                                                  variation.attributes &&
                                                  variation.attributes.find(
                                                    (e: any) =>
                                                      e.attributeId === elem.id
                                                  )
                                                    ? "font-medium"
                                                    : "font-normal"
                                                }`}
                                              >
                                                {router.locale &&
                                                router.locale === "mm" &&
                                                data.nameMM &&
                                                data.nameMM.length > 0
                                                  ? data.nameMM
                                                  : data.name}
                                              </span>
                                              {variation &&
                                              variation.attributes &&
                                              variation.attributes.find(
                                                (e: any) =>
                                                  e.attributeId === elem.id
                                              ) &&
                                              variation &&
                                              variation.attributes &&
                                              variation.attributes.find(
                                                (e: any) =>
                                                  e.attributeId === elem.id
                                              ).name === data.name ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    aria-hidden="true"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      d="M5 13l4 4L19 7"
                                                    />
                                                  </svg>
                                                </span>
                                              ) : null}
                                            </>
                                          </Listbox.Option>
                                        )
                                      )}
                                    </Listbox.Options>
                                  </Transition>
                                </div>
                              </Listbox>
                            </div>
                          )
                        )}
                        {variationError && (
                          <ErrorText
                            error={variationError.attributeError}
                            errorMM={variationError.attributeErrorMM}
                          />
                        )}
                      </div>
                      <div className="mt-5 flex flex-col gap-5">
                        <FormInput
                          label={t("regularPrice")}
                          placeHolder={t("enter") + " " + t("regularPrice")}
                          error={errors.regularPrice?.message}
                          type="number"
                          defaultValue={product?.regularPrice}
                          formControl={{
                            ...register("regularPrice", {
                              setValueAs: (v) => (v ? parseInt(v) : 0),
                            }),
                          }}
                          currentValue={watchFields.regularPrice}
                        />

                        <div className="flex flex-row items-start">
                          <div className="flex-grow">
                            <FormInput
                              disableRoundedRight={true}
                              label={t("salePrice")}
                              placeHolder={t("enter") + " " + t("salePrice")}
                              error={
                                watchFields.salePrice &&
                                watchFields.regularPrice &&
                                watchFields.salePrice >=
                                  watchFields.regularPrice
                                  ? t("invalidSalePrice")
                                  : errors.salePrice?.message
                              }
                              type="number"
                              defaultValue={product?.salePrice}
                              formControl={{
                                ...register("salePrice", {
                                  setValueAs: (v) =>
                                    v ? parseInt(v) : undefined,
                                }),
                              }}
                              currentValue={watchFields.salePrice}
                              optional={true}
                            />
                          </div>
                          <div
                            className="mt-7 cursor-pointer rounded-r-md border border-l-0 p-2 text-center"
                            onClick={() => {
                              setVariation((prevValue: any) => {
                                if (prevValue.isPercent === true) {
                                  return { ...prevValue, isPercent: false };
                                } else {
                                  return { ...prevValue, isPercent: true };
                                }
                              });
                            }}
                          >
                            {variation.isPercent === true ? "%" : "MMK"}
                          </div>
                        </div>

                        <div>
                          <label
                            className={`text-sm font-medium text-gray-400`}
                          >
                            {t("stockType")}
                            <span className="text-primary">*</span>
                          </label>
                          <div className="mt-1 flex flex-wrap items-center justify-start gap-3">
                            {stockList.map((elem, index) => (
                              <div
                                className={`flex cursor-pointer items-center space-x-3 rounded-lg border px-3 shadow-sm transition-colors hover:bg-primary-focus hover:text-white ${
                                  variation.stockType === elem
                                    ? "border-primary text-primary ring-1 ring-primary"
                                    : "border-gray-200"
                                } `}
                                key={index}
                                onClick={(e) => {
                                  setVariation((prevValue: any) => {
                                    return { ...prevValue, stockType: elem };
                                  });
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
                                {elem === variation.stockType && (
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
                          {variation && !variation.stockType && (
                            <span className="p-2 text-xs text-error">
                              {t("inputStockTypeError")}
                            </span>
                          )}
                        </div>

                        {variation.stockType === StockType.StockLevel && (
                          <FormInput
                            label={t("stockLevel")}
                            placeHolder={t("enter") + " " + t("stockLevel")}
                            error={errors.stockLevel?.message}
                            type="number"
                            defaultValue={variation?.stockLevel}
                            formControl={{
                              ...register("stockLevel", {
                                valueAsNumber: true,
                              }),
                            }}
                            enableZero={true}
                            currentValue={watchFields.stockLevel}
                          />
                        )}

                        {watchFields.salePrice && watchFields.salePrice > 0 && (
                          <FormSaleDatePicker
                            isSalePeriod={variation.isSalePeriod}
                            saleEndDate={variation.saleEndDate}
                            saleStartDate={variation.saleStartDate}
                            error={error}
                            setError={setError}
                            setSaleDate={(startDate: Date, endDate: Date) => {
                              setVariation((prevValue: any) => {
                                if (startDate === null && endDate === null) {
                                  let d = { ...prevValue };
                                  if (d.saleStartDate) {
                                    delete d.saleStartDate;
                                  }
                                  if (d.saleEndDate) {
                                    delete d.saleEndDate;
                                  }
                                  return d;
                                } else {
                                  return {
                                    ...prevValue,
                                    saleStartDate: startDate,
                                    saleEndDate: endDate,
                                  };
                                }
                              });
                            }}
                            setSalePeriod={(value: boolean) => {
                              setVariation((prevValue: any) => {
                                return { ...prevValue, isSalePeriod: value };
                              });
                            }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex w-full justify-end ">
                      <SubmitBtn
                        isSubmit={false}
                        submitTxt={"Loading..."}
                        text={"OK"}
                      />
                    </div>
                  </form>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      <ProductImgDialog
        data={product.imgList}
        fileSrc={variation.img}
        isModalOpen={galleryModalOpen}
        setFileSrc={(e: string) => setVariation({ ...variation, img: e })}
        setModalOpen={setGalleryModalOpen}
      />
    </>
  );
}

export default VariationDetailsModal;
