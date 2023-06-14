import { useProduct } from "@/context/ProductContext";
import { ProductType } from "@prisma/client";
import { showErrorDialog } from "@/util/swalFunction";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import React, { useRef } from "react";
import AttributeSection from "../section/product/AttributeSection";
import DetailSection from "../section/product/DetailSection";
import InformationSection from "../section/product/InformationSection";
import PricingSection from "../section/product/PricingSection";
import ConfirmationSection from "../section/product/ConfirmationSection";
import StatusSection from "../section/product/StatusSection";
import VariationSection from "../section/product/VariationSection";
import { Role } from "@prisma/client";
import AuctionPricingSection from "../section/product/AuctionPricingSection";

enum Step {
  Information,
  Attribute,
  Pricing,
  Details,
  Status,
  Confirmation,
}

function ProductScreen() {
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();

  const { infoValid, attributeValid, pricingValid, product, infoCheck } =
    useProduct();

  const isVariable = product.type === ProductType.Variable ? true : false;

  const submitInfoRef = useRef<HTMLButtonElement | null>();
  const submitPricingRef = useRef<HTMLButtonElement | null>();
  const submitStatusRef = useRef<HTMLButtonElement | null>();

  const [isFullScreen, setFullScreen] = React.useState(false);

  const stepList =
    isVariable === true
      ? [
          Step.Information,
          Step.Attribute,
          Step.Pricing,
          Step.Details,
          Step.Status,
          Step.Confirmation,
        ]
      : [
          Step.Information,
          Step.Pricing,
          Step.Details,
          Step.Status,
          Step.Confirmation,
        ];

  const [currentStep, setCurrentStep] = React.useState(Step.Information);

  const stepDetails = [
    {
      step: Step.Information,
      title: t("information"),
      description: t("fillInformation"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
      ),
    },
    {
      step: Step.Attribute,
      title: t("attributes"),
      description: t("fillAttributes"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
          />
        </svg>
      ),
    },
    {
      step: Step.Pricing,
      title: t("pricing"),
      description: t("fillPricing"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
          />
        </svg>
      ),
    },

    {
      step: Step.Details,
      title: t("details"),
      description: t("fillDetails"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      ),
    },
    {
      step: Step.Status,
      title: t("status"),
      description: t("fillProductStatus"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      step: Step.Confirmation,
      title: t("confirmation"),
      description: t("fillConfirmation"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  function verify(newStep: Step) {
    if (newStep === Step.Information) {
      return true;
    }
    if (newStep === Step.Attribute) {
      return infoValid;
    }
    if (newStep === Step.Pricing) {
      return infoValid && attributeValid;
    }
    if (newStep === Step.Details) {
      return infoValid && attributeValid && pricingValid;
    }
    if (newStep === Step.Status) {
      return infoValid && attributeValid && pricingValid;
    }
    if (newStep === Step.Confirmation) {
      return infoValid && attributeValid && pricingValid;
    }
    return true;
  }

  function nextFn() {
    setCurrentStep((prevValue) => {
      let nextStep = prevValue;
      let index = stepList.findIndex((e) => e === nextStep);
      if (index < stepList.length - 1) {
        nextStep = stepList[index + 1];
      }
      return nextStep;
    });
  }

  function backFn() {
    setCurrentStep((prevValue) => {
      let prevStep = prevValue;
      let index = stepList.findIndex((e) => e === prevStep);
      if (index - 1 >= 0) {
        prevStep = stepList[index - 1];
      }
      return prevStep;
    });
  }

  return (
    <div>
      <div
        className={
          isFullScreen === true
            ? "relative mx-auto flex flex-col"
            : "relative mx-auto grid grid-cols-1 md:grid-cols-3"
        }
      >
        <div
          className={
            isFullScreen === true
              ? "bg-primary p-10"
              : "bg-primary p-10 md:min-h-screen"
          }
        >
          <div className="flex flex-row justify-end">
            <button
              type="button"
              onClick={() => {
                setFullScreen((prevValue) => !prevValue);
              }}
              className="text-white"
            >
              {isFullScreen === false ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="mt-3">
            {!product.id ? (
              <>
                <div
                  className={`flex flex-row items-center text-white gap-3 ${
                    isFullScreen === true ? "justify-center" : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3.75v16.5M2.25 12h19.5M6.375 17.25a4.875 4.875 0 004.875-4.875V12m6.375 5.25a4.875 4.875 0 01-4.875-4.875V12m-9 8.25h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5zm12.621-9.44c-1.409 1.41-4.242 1.061-4.242 1.061s-.349-2.833 1.06-4.242a2.25 2.25 0 013.182 3.182zM10.773 7.63c1.409 1.409 1.06 4.242 1.06 4.242S9 12.22 7.592 10.811a2.25 2.25 0 113.182-3.182z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold">{t("addProduct")}</h3>
                </div>
                <p
                  className={`mt-5 text-sm text-gray-100 ${
                    isFullScreen ? "text-center" : ""
                  }`}
                >
                  {t("addProductDescription")}
                </p>
              </>
            ) : (
              <>
                <div
                  className={`flex flex-row items-center text-white gap-3 ${
                    isFullScreen === true ? "justify-center" : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3.75v16.5M2.25 12h19.5M6.375 17.25a4.875 4.875 0 004.875-4.875V12m6.375 5.25a4.875 4.875 0 01-4.875-4.875V12m-9 8.25h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5zm12.621-9.44c-1.409 1.41-4.242 1.061-4.242 1.061s-.349-2.833 1.06-4.242a2.25 2.25 0 013.182 3.182zM10.773 7.63c1.409 1.409 1.06 4.242 1.06 4.242S9 12.22 7.592 10.811a2.25 2.25 0 113.182-3.182z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold">
                    {t("updateProduct")}
                  </h3>
                </div>
                <p
                  className={`mt-5 text-sm text-gray-100 ${
                    isFullScreen ? "text-center" : ""
                  }`}
                >
                  {t("updateProductDescription")}
                </p>
              </>
            )}

            <p
              className={
                isFullScreen === true
                  ? "mt-5 text-center font-semibold text-white"
                  : "mt-10 font-semibold text-white"
              }
            >
              {t("fillInformation")}
            </p>
          </div>
          <div
            className={
              isFullScreen === true
                ? "mt-5 flex flex-row items-center justify-center gap-3"
                : "mt-5 flex flex-col gap-3"
            }
          >
            {stepList.map((e, index) => (
              <div
                key={index}
                className="flex cursor-pointer flex-row items-center gap-3"
                onClick={() => {
                  if (verify(e)) {
                    if (currentStep < e) {
                      if (isVariable === false) {
                        if (currentStep === Step.Information) {
                          submitInfoRef.current?.click();
                        } else if (currentStep === Step.Status) {
                          submitStatusRef.current?.click();
                        } else if (currentStep === Step.Pricing) {
                          submitPricingRef.current?.click();
                        } else {
                          setCurrentStep(e);
                        }
                      } else {
                        if (currentStep === Step.Information) {
                          submitInfoRef.current?.click();
                        } else if (currentStep === Step.Status) {
                          submitStatusRef.current?.click();
                        } else {
                          setCurrentStep(e);
                        }
                      }
                    } else {
                      setCurrentStep(e);
                    }
                  } else {
                    showErrorDialog(t("fillInformation"));
                  }
                }}
              >
                <div
                  className={`${
                    currentStep === e
                      ? "bg-white text-primary"
                      : "bg-white text-gray-400"
                  } rounded-md p-2 transition-colors`}
                >
                  {stepDetails.find((a) => a.step === e)?.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-white">
                    {index + 1}. {stepDetails.find((a) => a.step === e)?.title}
                  </p>
                  <span className="text-xs text-gray-100">
                    {stepDetails.find((a) => a.step === e)?.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section
          className={`relative mb-0 bg-white px-8 py-10 ${
            isFullScreen === true ? "" : "shadow-2xl"
          } md:col-span-2 md:min-h-screen`}
        >
          <div
            className={`mb-10 flex flex-row ${
              isFullScreen === true ? "justify-center" : "w-full"
            }`}
          >
            <div className={"w-full p-10"}>
              {currentStep === Step.Information ? (
                <InformationSection nextFn={nextFn} infoRef={submitInfoRef} />
              ) : currentStep === Step.Attribute ? (
                <AttributeSection backFn={backFn} nextFn={nextFn} />
              ) : currentStep === Step.Pricing &&
                product.type === ProductType.Fixed ? (
                <PricingSection
                  backFn={backFn}
                  nextFn={nextFn}
                  currentStep={stepList.findIndex((e) => e === currentStep) + 1}
                  pricingRef={submitPricingRef}
                />
              ) : currentStep === Step.Pricing &&
                product.type === ProductType.Variable ? (
                <VariationSection
                  backFn={backFn}
                  nextFn={nextFn}
                  currentStep={stepList.findIndex((e) => e === currentStep) + 1}
                />
              ) : currentStep === Step.Pricing &&
                product.type === ProductType.Auction ? (
                <AuctionPricingSection
                  backFn={backFn}
                  nextFn={nextFn}
                  pricingRef={submitPricingRef}
                  currentStep={stepList.findIndex((e) => e === currentStep) + 1}
                />
              ) : currentStep === Step.Details ? (
                <DetailSection
                  backFn={backFn}
                  nextFn={nextFn}
                  currentStep={stepList.findIndex((e) => e === currentStep) + 1}
                />
              ) : currentStep === Step.Status ? (
                <StatusSection
                  backFn={backFn}
                  nextFn={nextFn}
                  currentStep={stepList.findIndex((e) => e === currentStep) + 1}
                  submitRef={submitStatusRef}
                />
              ) : (
                <ConfirmationSection
                  backFn={backFn}
                  currentStep={stepList.findIndex((e) => e === currentStep) + 1}
                />
              )}
            </div>
          </div>
          <div className="absolute bottom-10 left-10 right-10">
            <h2 className="sr-only">Steps</h2>

            <div>
              <p className="text-xs font-medium text-gray-500">
                {stepList.findIndex((e) => e === currentStep) + 1} /{" "}
                {stepList.length} -{" "}
                {stepDetails.find((e) => e.step === currentStep)?.title}
              </p>

              <div className="mt-4 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-2  rounded-full bg-primary`}
                  style={{
                    width:
                      ((stepList.findIndex((e) => e === currentStep) + 1) /
                        stepList.length) *
                        100 +
                      "%",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProductScreen;
