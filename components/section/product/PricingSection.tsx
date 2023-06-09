import FormInput from "@/components/presentational/FormInput";
import FormSaleDatePicker from "@/components/presentational/FormSaleDatePicker";
import { useProduct } from "@/context/ProductContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { StockType } from "@prisma/client";
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

type Pricing = {
  regularPrice?: number;
  salePrice?: number;
  isPercent?: boolean;
  stockType?: StockType;
  stockLevel?: number;
  saleStartDate?: Date;
  saleEndDate?: Date;
};

function PricingSection({ backFn, nextFn, currentStep, pricingRef }: Props) {
  const { t } = useTranslation("common");
  const stockList = [
    StockType.InStock,
    StockType.OutOfStock,
    StockType.StockLevel,
  ];
  const { product, setProduct } = useProduct();
  const [error, setError] = React.useState("");
  const schema = z.object(
    product.stockType === StockType.StockLevel
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
            product.isPercent === true
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
            product.isPercent === true
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
        },
  );

  const { register, handleSubmit, watch, formState } = useForm<Pricing>({
    mode: "onChange",
    defaultValues: product,
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const watchFields = watch();

  React.useEffect(() => {
    console.log(errors);
  }, [errors]);

  function submit(data: Pricing) {
    setProduct((prevValue: any) => {
      return { ...prevValue, ...data };
    });
    if ((error && error.length === 0) || !error) {
      if (
        data.salePrice &&
        data.regularPrice &&
        data.salePrice >= data.regularPrice &&
        data.stockType
      ) {
      } else {
        nextFn();
      }
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
                watchFields.salePrice >= watchFields.regularPrice
                  ? t("invalidSalePrice")
                  : errors.salePrice?.message
              }
              type="number"
              defaultValue={product?.salePrice}
              formControl={{
                ...register("salePrice", {
                  setValueAs: (v) => (v ? parseInt(v) : undefined),
                }),
              }}
              currentValue={watchFields.salePrice}
              optional={true}
            />
          </div>
          <div
            className="mt-7 cursor-pointer rounded-r-md border border-l-0 p-2 text-center"
            onClick={() => {
              setProduct((prevValue: any) => {
                if (prevValue.isPercent === true) {
                  return { ...prevValue, isPercent: false };
                } else {
                  return { ...prevValue, isPercent: true };
                }
              });
            }}
          >
            {product.isPercent === true ? "%" : "MMK"}
          </div>
        </div>

        <div>
          <label className={`text-sm font-medium text-gray-400`}>
            {t("stockType")}
            <span className="text-primary">*</span>
          </label>
          <div className="mt-1 flex flex-wrap items-center justify-start gap-3">
            {stockList.map((elem, index) => (
              <div
                className={`flex cursor-pointer items-center space-x-3 rounded-lg border px-3 shadow-sm transition-colors hover:bg-primary-focus hover:text-white ${
                  product.stockType === elem
                    ? "border-primary text-primary ring-1 ring-primary"
                    : "border-gray-200"
                } `}
                key={index}
                onClick={(e) => {
                  setProduct((prevValue: any) => {
                    return { ...prevValue, stockType: elem };
                  });
                }}
              >
                <label
                  className={`block flex-grow cursor-pointer p-4 text-sm font-medium`}
                >
                  <span className="whitespace-nowrap"> {t(elem)} </span>
                </label>
                {elem === product.stockType && (
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
          {product && !product.stockType && (
            <span className="p-2 text-xs text-error">
              {t("inputStockTypeError")}
            </span>
          )}
        </div>

        {product.stockType === StockType.StockLevel && (
          <FormInput
            label={t("stockLevel")}
            placeHolder={t("enter") + " " + t("stockLevel")}
            error={errors.stockLevel?.message}
            type="number"
            defaultValue={product?.stockLevel}
            formControl={{
              ...register("stockLevel", {
                setValueAs: (v) => (v ? parseInt(v) : undefined),
              }),
            }}
            enableZero={true}
            currentValue={watchFields.stockLevel}
          />
        )}

        {watchFields.salePrice && watchFields.salePrice > 0 && (
          <FormSaleDatePicker
            isSalePeriod={product.isSalePeriod}
            saleEndDate={product.saleEndDate}
            saleStartDate={product.saleStartDate}
            error={error}
            setError={setError}
            setSaleDate={(startDate: Date, endDate: Date) => {
              setProduct((prevValue: any) => {
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
              setProduct((prevValue: any) => {
                return { ...prevValue, isSalePeriod: value };
              });
            }}
          />
        )}
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

export default PricingSection;
