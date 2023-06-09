import { useProduct } from "@/context/ProductContext";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import React from "react";

type Props = {
  backFn: Function;
  nextFn: Function;
  currentStep: number;
};

const FormInputRichText = dynamic(
  () => import("@/components/presentational/FormInputRichTextSun"),
  {
    ssr: false,
  }
);

function DetailSection({ backFn, nextFn, currentStep }: Props) {
  const { product, setProduct } = useProduct();
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">
        {t("step")} {currentStep}
      </h3>
      <p className="my-1 text-xl font-bold">{t("details")}</p>
      <span className="mb-10 text-sm">{t("fillDetails")}</span>
      <form
        className="flex flex-col space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          nextFn();
        }}
      >
        {/*   <FormInputRichText
          content={product.description}
          label={t("description")}
          setContent={(e: string) => {
            setProduct((prevValue: any) => {
              return { ...prevValue, description: e };
            });
          }}
        />

        {product.description && product.description.length > 0 && (
          <FormInputRichText
            content={product.descriptionMM}
            label={t("description") + " " + t("mm")}
            setContent={(e: string) => {
              setProduct((prevValue: any) => {
                return { ...prevValue, descriptionMM: e };
              });
            }}
          />
        )}

        <FormInputRichText
          content={product.additionalInformation}
          label={t("additionalInformation")}
          setContent={(e: string) => {
            setProduct((prevValue: any) => {
              return { ...prevValue, additionalInformation: e };
            });
          }}
        />

        {product.additionalInformation &&
          product.additionalInformation.length > 0 && (
            <FormInputRichText
              content={product.additionalInformationMM}
              label={t("additionalInformation") + " " + t("mm")}
              setContent={(e: string) => {
                setProduct((prevValue: any) => {
                  return { ...prevValue, additionalInformationMM: e };
                });
              }}
            />
          )}

        <FormInputRichText
          content={product.shippingInformation}
          label={t("shippingInformation")}
          setContent={(e: string) => {
            setProduct((prevValue: any) => {
              return { ...prevValue, shippingInformation: e };
            });
          }}
        />

        {product.shippingInformation &&
          product.shippingInformation.length > 0 && (
            <FormInputRichText
              content={product.shippingInformationMM}
              label={t("shippingInformation") + " " + t("mm")}
              setContent={(e: string) => {
                setProduct((prevValue: any) => {
                  return { ...prevValue, shippingInformationMM: e };
                });
              }}
            />
          )} */}
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

export default DetailSection;
