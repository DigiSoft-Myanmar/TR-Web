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
  });

  const { register, handleSubmit, watch, formState, reset } =
    useForm<AuctionPricing>({
      mode: "onChange",
      defaultValues: product,
      resolver: zodResolver(schema),
    });
  const { errors } = formState;
  const watchFields = watch();

  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [startTimeError, setStartTimeError] = React.useState("");
  const [endTimeError, setEndTimeError] = React.useState("");

  React.useEffect(() => {
    if (product) {
      reset({
        estimatedPrice: product?.estimatedPrice,
        openingBid: product?.openingBid,
      });
      setStartTime(
        product?.startTime
          ? toDateTimeLocal(new Date(product.startTime).toISOString())
          : ""
      );
      setEndTime(
        product?.endTime
          ? toDateTimeLocal(new Date(product.endTime).toISOString())
          : ""
      );
    } else {
      reset({
        estimatedPrice: 0,
        openingBid: 0,
      });
    }
  }, [product]);

  React.useEffect(() => {
    if (startTime && endTime) {
      if (new Date(endTime).getTime() <= new Date().getTime()) {
        setStartTimeError("");
        setEndTimeError("End time is less than today.");
      } else if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
        setStartTimeError("");
        setEndTimeError("End time must be greater than start time.");
      } else {
        setStartTimeError("");
        setEndTimeError("");
      }
    } else if (startTime && !endTime) {
      setEndTimeError("Please input end time.");
    } else if (endTime && !startTime) {
      setStartTimeError("Please input start time.");
    } else {
      setEndTimeError("Please input end time.");
      setStartTimeError("Please input start time.");
    }
  }, [startTime, endTime]);

  function submit(data: AuctionPricing) {
    if (startTime && endTime) {
      setProduct((prevValue: any) => {
        return {
          ...prevValue,
          ...data,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        };
      });
      if (startTime && endTime && !startTimeError && !endTimeError) {
        let start = new Date(startTime);
        let end = new Date(endTime);
        if (start < end) {
          // Calculate the difference in milliseconds between start time and end time
          var timeDiff = end.getTime() - start.getTime();

          // Calculate the difference in days
          var diffDays = timeDiff / (1000 * 3600 * 24);

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
              setValueAs: (v) => (v ? parseInt(v) : undefined),
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
              setValueAs: (v) => (v ? parseInt(v) : undefined),
            }),
          }}
          currentValue={watchFields.openingBid}
        />

        <div>
          <label
            className={`text-sm font-medium ${
              startTimeError
                ? "text-error"
                : startTime && new Date(startTime) && !startTimeError
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            {t("startTime")} <span className="text-primary">*</span>
          </label>

          <div className={`relative mt-1`}>
            <input
              type={"datetime-local"}
              className={`w-full rounded-lg ${
                startTimeError
                  ? "border-error"
                  : startTime && new Date(startTime) && !startTimeError
                  ? "border-green-600"
                  : "border-gray-200"
              } px-4 py-2 pr-12 text-sm leading-6 shadow-sm`}
              placeholder={t("enter") + " " + t("startTime")}
              onWheelCapture={(e) => e.currentTarget.blur()}
              value={startTime}
              onChange={(e) => {
                let date = e.currentTarget.value;
                if (date) {
                  setStartTime(toDateTimeLocal(new Date(date).toISOString()));
                } else {
                  setStartTime("");
                }
              }}
            />
          </div>
          {startTimeError && (
            <span className="p-2 text-xs text-error">{startTimeError}</span>
          )}
        </div>

        <div>
          <label
            className={`text-sm font-medium ${
              endTimeError
                ? "text-error"
                : endTime && new Date(endTime) && !endTimeError
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            {t("endTime")} <span className="text-primary">*</span>
          </label>

          <div className={`relative mt-1`}>
            <input
              type={"datetime-local"}
              className={`w-full rounded-lg ${
                endTimeError
                  ? "border-error"
                  : endTime && new Date(endTime) && !endTimeError
                  ? "border-green-600"
                  : "border-gray-200"
              } px-4 py-2 pr-12 text-sm leading-6 shadow-sm`}
              placeholder={t("enter") + " " + t("endTime")}
              onWheelCapture={(e) => e.currentTarget.blur()}
              value={endTime}
              onChange={(e) => {
                let date = e.currentTarget.value;
                if (date) {
                  setEndTime(toDateTimeLocal(new Date(date).toISOString()));
                } else {
                  setEndTime("");
                }
              }}
            />
          </div>
          {endTimeError && (
            <span className="p-2 text-xs text-error">{endTimeError}</span>
          )}
        </div>

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
