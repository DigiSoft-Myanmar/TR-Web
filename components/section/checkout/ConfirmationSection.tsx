import { useMarketplace } from "@/context/MarketplaceContext";
import { getHeaders } from "@/util/authHelper";
import {
  showErrorDialog,
  showSuccessDialog,
  showUnauthorizedDialog,
} from "@/util/swalFunction";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";

type Props = {
  backFn: Function;
  stepNum: number;
};

function ConfirmationSection({ backFn, stepNum }: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const { promoCode } = useMarketplace();
  const { data: session }: any = useSession();
  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">
        {t("step")} {stepNum}
      </h3>
      <p className="my-1 text-xl font-bold">{t("confirmationInfo")}</p>
      <span className="mb-10 text-sm">{t("fillConfirmationInfo")}</span>
      <div className="flex flex-col items-center gap-3">
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
            className={`inline-block rounded-r-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
            title="Next"
            type="button"
            onClick={() => {
              if (getHeaders(session)) {
                fetch("api/cart?type=Order", {
                  method: "POST",
                  body: JSON.stringify({ promoCodeId: promoCode?.id }),
                  headers: getHeaders(session),
                }).then(async (data) => {
                  if (data.status === 200) {
                    showSuccessDialog(
                      "Order placed successfully.",
                      "",
                      locale,
                      () => {
                        router.push("/orders");
                      }
                    );
                  } else {
                    let json = await data.json();
                    console.log(json);
                    showErrorDialog(t("somethingWentWrong"), "", router.locale);
                  }
                });
              } else {
                showUnauthorizedDialog(locale, () => {
                  router.push("/login");
                });
              }
            }}
          >
            Place Order
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
      </div>
    </div>
  );
}

export default ConfirmationSection;
