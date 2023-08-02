import ErrorText from "@/components/presentational/ErrorText";
import FormInput from "@/components/presentational/FormInput";
import FormSaleDatePicker from "@/components/presentational/FormSaleDatePicker";
import { useProduct } from "@/context/ProductContext";
import { showErrorDialog } from "@/util/swalFunction";
import { toDateTimeLocal } from "@/util/textHelper";
import { verifyAuctionPeriod } from "@/util/verify";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductType, StockType } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  backFn: Function;
  nextFn: Function;
  currentStep: number;
  pricingRef: any;
};

type AuctionPricing = {
  estimatedPrice?: number;
  openingBid?: number;
  startTime?: string;
  endTime?: string;
};

function AuctionPricingSection({
  backFn,
  nextFn,
  currentStep,
  pricingRef,
}: Props) {
  const { t } = useTranslation("common");
  const { product, setProduct, maxAuctionPeriod } = useProduct();
  const schema = z.object({
    estimatedPrice: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(1, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    openingBid: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(1, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    startTime: z
      .string()
      .refine((arg) =>
        arg.match(
          /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/
        )
      ),
    endTime: z
      .string()
      .refine((arg) =>
        arg.match(
          /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/
        )
      ),
  });

  const { register, handleSubmit, watch, formState, reset } =
    useForm<AuctionPricing>({
      mode: "onChange",
      defaultValues: product,
      resolver: zodResolver(schema),
    });
  const { errors } = formState;
  const watchFields = watch();

  React.useEffect(() => {
    if (product) {
      reset({
        estimatedPrice: product?.estimatedPrice,
        openingBid: product?.openingBid,
        startTime: product?.startTime
          ? new Date(product.startTime).toISOString()
          : "",
        endTime: product?.endTime
          ? new Date(product.endTime).toISOString()
          : "",
      });
    } else {
      reset({
        estimatedPrice: 0,
        openingBid: 0,
        startTime: new Date().toISOString(),
        endTime: "",
      });
    }
  }, [product]);

  function submit(data: AuctionPricing) {
    setProduct((prevValue: any) => {
      return { ...prevValue, ...data };
    });
    if (data.startTime && data.endTime) {
      let start = new Date(data.startTime);
      let end = new Date(data.endTime);
      if (start < end) {
        // Calculate the difference in milliseconds between start time and end time
        var timeDiff = end.getTime() - start.getTime();

        // Calculate the difference in days
        var diffDays = timeDiff / (1000 * 3600 * 24);
        console.log(diffDays);

        // Check if the difference is less than 3 days
        if (diffDays <= maxAuctionPeriod) {
          nextFn();
        } else {
          showErrorDialog(
            "Date must be less than " + maxAuctionPeriod + " days."
          );
        }
      } else {
        showErrorDialog("Start time is not greater than end time.");
      }
    } else {
      showErrorDialog(t("fillInformation"));
    }
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">
        {t("step")} {currentStep}
      </h3>
      <p className="my-1 text-xl font-bold">{t("pricing")}</p>
      <span className="mb-10 text-sm">{t("fillPricing")}</span>
      <form className="flex flex-col space-y-3" onSubmit={handleSubmit(submit)}>
        <FormInput
          label={t("estimatedPrice")}
          placeHolder={t("enter") + " " + t("estimatedPrice")}
          error={errors.estimatedPrice?.message}
          type="number"
          defaultValue={product?.estimatedPrice}
          formControl={{
            ...register("estimatedPrice", {
              setValueAs: (v) => (v ? parseInt(v) : 0),
            }),
          }}
          currentValue={watchFields.estimatedPrice}
        />

        <FormInput
          label={t("openingBid")}
          placeHolder={t("enter") + " " + t("openingBid")}
          error={errors.openingBid?.message}
          type="number"
          defaultValue={product?.openingBid}
          formControl={{
            ...register("openingBid", {
              setValueAs: (v) => (v ? parseInt(v) : 0),
            }),
          }}
          currentValue={watchFields.openingBid}
        />

        <FormInput
          label={t("startTime")}
          placeHolder={t("enter") + " " + t("startTime")}
          error={errors.startTime?.message}
          type="datetime-local"
          formControl={{
            ...register("startTime", {
              setValueAs: (v) => (v ? new Date(v).toISOString() : ""),
            }),
          }}
          currentValue={
            watchFields.startTime ? toDateTimeLocal(watchFields.startTime) : ""
          }
        />

        <FormInput
          label={t("endTime")}
          placeHolder={t("enter") + " " + t("endTime")}
          error={errors.endTime?.message}
          type="datetime-local"
          formControl={{
            ...register("endTime", {
              setValueAs: (v) => (v ? new Date(v).toISOString() : ""),
            }),
          }}
          currentValue={
            watchFields.endTime ? toDateTimeLocal(watchFields.endTime) : ""
          }
        />

        <span className="mt-5 flex justify-end divide-x overflow-hidden">
          <button
            className={`inline-block rounded-l-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
            title="Previous"
            onClick={() => {
              backFn();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M20.25 12a.75.75 0 01-.75.75H6.31l5.47 5.47a.75.75 0 11-1.06 1.06l-6.75-6.75a.75.75 0 010-1.06l6.75-6.75a.75.75 0 111.06 1.06l-5.47 5.47H19.5a.75.75 0 01.75.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            className={`inline-flex items-center gap-3 rounded-r-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
            title="Next"
            type="submit"
            ref={pricingRef}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M3.75 12a.75.75 0 01.75-.75h13.19l-5.47-5.47a.75.75 0 011.06-1.06l6.75 6.75a.75.75 0 010 1.06l-6.75 6.75a.75.75 0 11-1.06-1.06l5.47-5.47H4.5a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </span>
      </form>
    </div>
  );
}

export default AuctionPricingSection;
