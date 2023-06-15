import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import ColorPicker from "@/components/presentational/ColorPicker";
import SingleUploadModal from "./SingleUploadModal";
import SingleGalleryModal from "./SingleGalleryModal";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/presentational/FormInput";
import { Category } from "@/models/product";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import { Banner, Brand, PromoCode, User } from "@prisma/client";
import { ImgType } from "@/types/orderTypes";
import Image from "next/image";
import { fileUrl } from "@/types/const";
import FormInputCheckbox from "@/components/presentational/FormInputCheckbox";

import BuyerMultiSelectBox from "@/components/presentational/BuyerMultiSelectBox";
import FormSaleDatePicker from "@/components/presentational/FormSaleDatePicker";
import SellerSelectBox from "@/components/presentational/SellerSelectBox";
import { getHeaders } from "@/util/authHelper";
import { useSession } from "next-auth/react";

type PromoCodeWithBrandsUsers = PromoCode & { seller: User };

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  title: string;
  promotion: PromoCodeWithBrandsUsers;
  setUpdate: Function;
}

function PromotionModal({
  isModalOpen,
  setModalOpen,
  title,
  promotion: parentPromotion,
  setUpdate,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [isSubmit, setSubmit] = React.useState(false);

  const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
  const [chooseModalOpen, setChooseModalOpen] = React.useState(false);

  const [promotion, setPromotion] = React.useState<PromoCodeWithBrandsUsers>();
  const [error, setError] = React.useState("");
  const { data: session }: any = useSession();

  const schema = z.object({
    isShippingFree: z.boolean(),
    isCouponUsageInfinity: z.boolean(),
    isPercent: z.boolean(),
    isCouponUsagePerUserInfinity: z.boolean(),
    couponUsage: z
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
    couponUsagePerUser: z
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
    promoCode: z.string().min(1, { message: t("inputError") }),

    minimumPurchasePrice: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    discount:
      promotion?.isPercent === false
        ? z
            .number({
              invalid_type_error: t("inputValidNumber"),
              required_error: "",
            })
            .min(1, {
              message: t("inputValidAmount"),
            })
            .nonnegative({ message: t("inputValidAmount") })
        : z
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
            .or(z.literal("")),
  });

  const { register, handleSubmit, watch, formState, reset } =
    useForm<PromoCode>({
      mode: "onChange",
      resolver: zodResolver(schema),
    });
  const { errors } = formState;
  const watchFields = watch();

  React.useEffect(() => {
    console.log(errors);
  }, [errors]);

  function submitPromoCode(data: PromoCode) {
    let b: any = { ...data };
    if (promotion) {
      b.img = promotion.img;
      b.isPercent = promotion!.isPercent!;
      b.isScheduled = promotion.isScheduled;
      b.startDate = promotion.startDate;
      b.endDate = promotion.endDate;
      b.sellerId = promotion.sellerId;
    }
    setSubmit(true);
    if (b.seller) {
      delete b.seller;
    }
    if (b.Order) {
      delete b.Order;
    }
    if (parentPromotion && parentPromotion.id) {
      let id = parentPromotion.id;
      fetch("/api/promoCode?id=" + id, {
        method: "PUT",
        body: JSON.stringify(b),
        headers: getHeaders(session),
      })
        .then((data) => data.json())
        .then((json) => {
          setSubmit(false);
          setUpdate(true);
          setModalOpen(false);
          showSuccessDialog(t("submitSuccess"));
        });
    } else {
      fetch("/api/promoCode", {
        method: "POST",
        body: JSON.stringify(b),
        headers: getHeaders(session),
      })
        .then((data) => data.json())
        .then((json) => {
          setSubmit(false);
          setUpdate(true);
          setModalOpen(false);
          showSuccessDialog(t("submitSuccess"));
        });
    }
  }

  React.useEffect(() => {
    if (parentPromotion) {
      let p: any = { ...parentPromotion };
      if (!parentPromotion.couponUsagePerUser) {
        p.couponUsagePerUser = undefined;
      }
      if (!parentPromotion.couponUsage) {
        p.couponUsage = undefined;
      }
      reset(p);
      setPromotion(p);
    } else {
      reset({});
      setPromotion(undefined);
    }
  }, [parentPromotion]);

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
              <div className="absolute top-0 right-0 bottom-0 flex min-w-[400px] max-w-md transform overflow-auto rounded-l-xl bg-primary shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto bg-white p-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="flex items-center text-lg font-medium leading-6 text-primary"
                  >
                    <h3 className="flex-grow">{title}</h3>
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
                  <form onSubmit={handleSubmit(submitPromoCode)}>
                    <div className="mt-3 flex flex-row items-center justify-center">
                      {promotion?.img && (
                        <Image
                          src={fileUrl + promotion.img}
                          alt=""
                          width={430}
                          height={180}
                          quality={100}
                          className="h-[180px] max-h-[180px] w-[430px] object-contain"
                        />
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <label
                        className={`text-sm font-medium ${
                          !promotion?.img
                            ? "text-error"
                            : promotion?.img
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {t("Image")} (Optimal Image Resolution: 415 x 185 px)
                      </label>

                      <div
                        className={`relative mt-1 flex w-full flex-row justify-center`}
                      >
                        <span className="inline-flex divide-x overflow-hidden rounded-md border bg-white shadow-sm">
                          <button
                            type="button"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:relative"
                            onClick={() => {
                              setUploadModalOpen(true);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="mr-3 h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                              />
                            </svg>

                            {t("upload")}
                          </button>

                          <button
                            type="button"
                            className="flex items-center py-2 px-4 text-sm text-gray-700 hover:bg-gray-50 focus:relative"
                            title="Choose"
                            onClick={() => {
                              setChooseModalOpen(true);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="mr-3 h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                              />
                            </svg>

                            {t("choose")}
                          </button>
                        </span>
                      </div>
                      {!promotion?.img && (
                        <span className="p-2 text-xs text-error">
                          {t("inputError")}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-col gap-3">
                      <FormInput
                        label={"Promo Code"}
                        placeHolder={"Enter Promo Code"}
                        error={errors.promoCode?.message}
                        type="text"
                        defaultValue={promotion?.promoCode}
                        formControl={{ ...register("promoCode") }}
                        currentValue={watchFields.promoCode}
                      />

                      <SellerSelectBox
                        selected={promotion?.seller}
                        setSelected={(e: User) => {
                          setPromotion((prevValue: any) => {
                            return { ...prevValue, seller: e, sellerId: e.id };
                          });
                        }}
                      />

                      <FormInput
                        label={"Minimum Purchase Price"}
                        placeHolder={"Enter Minimum Purchase Price"}
                        error={errors.minimumPurchasePrice?.message}
                        type="number"
                        defaultValue={promotion?.minimumPurchasePrice}
                        formControl={{
                          ...register("minimumPurchasePrice", {
                            setValueAs: (v) => (v ? parseInt(v) : 0),
                          }),
                        }}
                        currentValue={watchFields.minimumPurchasePrice}
                      />

                      <div className="flex flex-row items-start">
                        <div className="flex-grow">
                          <FormInput
                            disableRoundedRight={true}
                            label={"Discount"}
                            placeHolder={"Enter discount"}
                            error={errors.discount?.message}
                            type="number"
                            formControl={{
                              ...register("discount", {
                                setValueAs: (v) =>
                                  v ? parseInt(v) : undefined,
                              }),
                            }}
                            currentValue={watchFields.discount}
                            defaultValue={promotion?.discount}
                            optional={true}
                          />
                        </div>
                        <div
                          className="mt-7 cursor-pointer rounded-r-md border border-l-0 bg-white p-2 text-center"
                          onClick={() => {
                            setPromotion((prevValue: any) => {
                              return {
                                ...prevValue,
                                isPercent: !prevValue.isPercent,
                              };
                            });
                          }}
                        >
                          {promotion?.isPercent === true ? "%" : "MMK"}
                        </div>
                      </div>

                      <FormSaleDatePicker
                        isSalePeriod={
                          promotion?.isScheduled ? promotion.isScheduled : false
                        }
                        saleEndDate={
                          promotion?.endDate
                            ? new Date(promotion.endDate)
                            : null
                        }
                        saleStartDate={
                          promotion?.startDate
                            ? new Date(promotion.startDate)
                            : null
                        }
                        error={error}
                        setError={setError}
                        setSaleDate={(startDate: Date, endDate: Date) => {
                          setPromotion((prevValue: any) => {
                            if (startDate === null && endDate === null) {
                              let d = { ...prevValue };
                              if (d.startDate) {
                                delete d.startDate;
                              }
                              if (d.endDate) {
                                delete d.endDate;
                              }
                              return d;
                            } else {
                              return {
                                ...prevValue,
                                startDate: startDate,
                                endDate: endDate,
                              };
                            }
                          });
                        }}
                        setSalePeriod={(value: boolean) => {
                          setPromotion((prevValue: any) => {
                            return { ...prevValue, isScheduled: value };
                          });
                        }}
                      />

                      <FormInputCheckbox
                        formControl={{ ...register("isShippingFree") }}
                        label={"Is Shipping Free?"}
                        value={watchFields.isShippingFree}
                      />

                      <FormInputCheckbox
                        formControl={{ ...register("isCouponUsageInfinity") }}
                        label={"Is Coupon Usage Infinity?"}
                        value={watchFields.isCouponUsageInfinity}
                      />

                      {watchFields.isCouponUsageInfinity === false && (
                        <FormInput
                          label={"Coupon Usage"}
                          placeHolder={"Enter Coupon Usage"}
                          error={errors.couponUsage?.message}
                          type="number"
                          defaultValue={promotion?.couponUsage}
                          formControl={{
                            ...register("couponUsage", {
                              setValueAs: (v) => (v ? parseInt(v) : undefined),
                            }),
                          }}
                          currentValue={watchFields.couponUsage}
                        />
                      )}

                      <FormInputCheckbox
                        formControl={{
                          ...register("isCouponUsagePerUserInfinity"),
                        }}
                        label={"Is Coupon Usage Per User Infinity?"}
                        value={watchFields.isCouponUsagePerUserInfinity}
                      />

                      {watchFields.isCouponUsagePerUserInfinity === false && (
                        <FormInput
                          label={"Coupon Usage Per User"}
                          placeHolder={"Enter Coupon Usage Per User"}
                          error={errors.couponUsagePerUser?.message}
                          type="number"
                          defaultValue={promotion?.couponUsagePerUser}
                          formControl={{
                            ...register("couponUsagePerUser", {
                              setValueAs: (v) => (v ? parseInt(v) : undefined),
                            }),
                          }}
                          currentValue={watchFields.couponUsagePerUser}
                        />
                      )}
                    </div>

                    <div className="mt-4 flex w-full justify-end ">
                      <SubmitBtn
                        isSubmit={isSubmit}
                        submitTxt="Loading..."
                        text={t("submit")}
                      />
                    </div>
                  </form>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      <SingleUploadModal
        type={ImgType.PromoCode}
        isModalOpen={uploadModalOpen}
        setModalOpen={setUploadModalOpen}
        setFileSrc={(e: string) => {
          setPromotion((prevValue: any) => {
            return { ...prevValue, img: e };
          });
        }}
      />
      <SingleGalleryModal
        type={ImgType.PromoCode}
        isSeller={false}
        isModalOpen={chooseModalOpen}
        setModalOpen={setChooseModalOpen}
        fileSrc={promotion?.img?.toString()}
        setFileSrc={(e: string) => {
          setPromotion((prevValue: any) => {
            return { ...prevValue, img: e };
          });
        }}
      />
    </>
  );
}

export default PromotionModal;
