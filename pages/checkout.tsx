import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription, fileUrl } from "@/types/const";
import { useMarketplace } from "@/context/MarketplaceContext";
import { formatAmount, getText } from "@/util/textHelper";
import { CartItem } from "@/prisma/models/cartItems";
import { useRouter } from "next/router";
import Image from "next/image";
import { Brand, Product } from "@prisma/client";
import { DeliveryType } from "@/types/orderTypes";
import BillingSection from "@/components/section/checkout/BillingSection";
import ShippingSection from "@/components/section/checkout/ShippingSection";
import ConfirmationSection from "@/components/section/checkout/ConfirmationSection";
import { showErrorDialog } from "@/util/swalFunction";
import CartList from "@/components/presentational/CartList";
import CartFooter from "@/components/presentational/CartFooter";

enum Step {
  Billing,
  Shipping,
  Confirmation,
}

function CheckoutPage() {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const { cartItems, sellerDetails, isAddressDiff } = useMarketplace();

  const stepList =
    isAddressDiff === true
      ? [Step.Billing, Step.Shipping, Step.Confirmation]
      : [Step.Billing, Step.Confirmation];
  const [currentStep, setCurrentStep] = React.useState(Step.Billing);
  const promoRef = React.useRef<HTMLInputElement | null>(null);

  function nextFn(addDiff: boolean) {
    setCurrentStep((prevValue) => {
      let nextStep = prevValue;
      let index = stepList.findIndex((e) => e === nextStep);
      if (index < stepList.length - 1) {
        nextStep = stepList[index + 1];
      }
      if (prevValue === Step.Billing) {
        if (addDiff === true) {
          return Step.Shipping;
        } else {
          return Step.Confirmation;
        }
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
      <Head>
        <title>Checkout | Pyi Twin Phyit</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative max-w-screen-2xl mx-6 px-4 py-8">
        <div className="my-3 flex w-full flex-row flex-wrap gap-3 rounded-md pt-5">
          <div className="flex flex-grow flex-col space-y-3">
            <h3 className="text-base font-semibold">Checkout</h3>
            <p className="text-sm font-light">
              {cartItems.map((e) => e.quantity).reduce((a, b) => a + b, 0)}{" "}
              Products | {sellerDetails.length} Sellers
            </p>
          </div>
        </div>
        <div className="relative mt-5 mb-10 flex w-full flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="flex-grow">
            <div className="">
              <h2 className="sr-only">Steps</h2>

              <div>
                <div className="overflow-hidden rounded-full bg-gray-200">
                  {currentStep === Step.Billing ? (
                    <div className="h-2 w-0 rounded-full bg-primary"></div>
                  ) : currentStep === Step.Shipping &&
                    isAddressDiff === true ? (
                    <div className="h-2 w-1/2 rounded-full bg-primary"></div>
                  ) : (
                    currentStep === Step.Confirmation && (
                      <div className="h-2 w-full rounded-full bg-primary"></div>
                    )
                  )}
                </div>

                <ol
                  className={`mt-4 grid ${
                    isAddressDiff ? "grid-cols-3" : "grid-cols-2"
                  } text-sm font-medium text-gray-500`}
                >
                  <li
                    className={`flex items-center justify-start text-primary`}
                  >
                    <span className="hidden sm:inline"> Billing </span>

                    <svg
                      className="h-6 w-6 sm:ml-2 sm:h-5 sm:w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>
                  </li>

                  {isAddressDiff === true && (
                    <li
                      className={`flex items-center justify-center ${
                        currentStep >= Step.Shipping ? "text-primary" : ""
                      }`}
                    >
                      <span className="hidden sm:inline"> Shipping </span>

                      <svg
                        className="h-6 w-6 sm:ml-2 sm:h-5 sm:w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </li>
                  )}

                  <li
                    className={`flex items-center justify-end ${
                      currentStep >= Step.Confirmation ? "text-primary" : ""
                    }`}
                  >
                    <span className="hidden sm:inline"> Confirmation </span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6 sm:ml-2 sm:h-5 sm:w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </li>
                </ol>
              </div>

              <div className="mt-5 rounded-md bg-white p-5 shadow-md">
                {currentStep === Step.Billing ? (
                  <BillingSection nextFn={nextFn} />
                ) : currentStep === Step.Shipping ? (
                  <ShippingSection backFn={backFn} nextFn={nextFn} />
                ) : (
                  <ConfirmationSection
                    backFn={backFn}
                    stepNum={currentStep + 1}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-primaryText">
              My Cart{" "}
              <span className="text-primary font-semibold">
                (
                {formatAmount(
                  cartItems
                    .map((e: CartItem) => e.quantity)
                    .reduce((a: number, b: number) => a + b, 0),
                  locale,
                  false
                )}
                )
              </span>
            </h3>
            <div className="flex flex-col border rounded-md bg-white">
              <div className="p-3">
                <CartList />
              </div>
              <CartFooter isModal={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default CheckoutPage;
