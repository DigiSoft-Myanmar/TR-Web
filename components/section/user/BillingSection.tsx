import { fileUrl } from "@/types/const";
import { PaymentStatus } from "@/types/orderTypes";
import { fetcher } from "@/util/fetcher";
import { formatAmount, getText } from "@/util/textHelper";
import { Tooltip } from "@mui/material";
import moment from "moment";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";

function BillingSection({
  membershipData,
  brandId,
  paymentMethods,
  brand,
}: {
  membershipData: any;
  brandId?: string;
  paymentMethods: any;
  brand?: any;
}) {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const { data } = useSWR("/api/user/payment?brandId=" + brandId, fetcher);
  const [paymentModalOpen, setPaymentModalOpen] = React.useState(false);
  const [upgradePlan, setUpgradePlan] = React.useState(false);
  const [memberPayment, setMemberPayment] = React.useState<any>();

  const day =
    data &&
    data[0] &&
    data[0].memberStartDate &&
    data[0].paymentStatus === PaymentStatus.Verified
      ? new Date(data[0].memberStartDate)
      : null;
  if (day) {
    day.setFullYear(day.getFullYear() + 1);
  }

  const now = moment();
  const usedDay =
    data &&
    data[0] &&
    data[0].memberStartDate &&
    data[0].paymentStatus === PaymentStatus.Verified
      ? now.diff(moment(data[0].memberStartDate, "YYYY-MM-DD"), "days")
      : 0;

  return (
    <div className="flex flex-col gap-5">
      {membershipData && brandId && (
        <>
          <div className="flex flex-col gap-3 bg-white p-5 shadow-md">
            <div className="flex flex-row items-center gap-3">
              <h3 className="text-lg font-semibold">Current Plan</h3>
              <Tooltip
                className="text-primary"
                title={
                  <div>
                    <p className="mt-3 text-sm">
                      <span className="font-semibold text-primary">
                        {membershipData.price !== 0 ? (
                          <>
                            <span>
                              {formatAmount(
                                membershipData.price!,
                                locale,
                                true
                              )}
                            </span>
                            <span className="text-body-color text-sm font-medium">
                              {locale === "mm" ? "နှစ်စဥ်" : "/ year"}
                            </span>
                          </>
                        ) : (
                          <span>
                            {locale === "mm" ? "ကုန်ကျစရိတ်အခမဲ့" : "No Cost"}
                          </span>
                        )}
                      </span>
                    </p>
                    <div className="mt-1">
                      <div className="mb-1 flex flex-row items-center space-x-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>

                        <p className="text-sm font-light leading-loose text-white">
                          {membershipData.percentagePerTransaction !== 0
                            ? `Only ${membershipData.percentagePerTransaction} percentage per transactions.`
                            : "Full payment for every transactions."}
                        </p>
                      </div>
                      <div className="mb-1 flex flex-row items-center space-x-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path d="M9.375 3a1.875 1.875 0 000 3.75h1.875v4.5H3.375A1.875 1.875 0 011.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0112 2.753a3.375 3.375 0 015.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 10-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3zM11.25 12.75H3v6.75a2.25 2.25 0 002.25 2.25h6v-9zM12.75 12.75v9h6.75a2.25 2.25 0 002.25-2.25v-6.75h-9z" />
                        </svg>

                        <p className="text-sm font-light leading-loose text-white">
                          {membershipData.productLimit &&
                          membershipData.productLimit !== 0
                            ? `Can list up to ${membershipData.productLimit} products.`
                            : "Unlimited product listing."}
                        </p>
                      </div>
                    </div>
                  </div>
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </Tooltip>
            </div>
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="flex flex-1 flex-col">
                <p className="text-sm">
                  Your Current Plan is{" "}
                  <span className="font-semibold text-primary">
                    {getText(
                      membershipData.name,
                      membershipData.nameMM,
                      locale
                    )}
                  </span>
                </p>
                <p className="my-1 text-sm font-light text-gray-500">
                  {getText(
                    membershipData.description,
                    membershipData.descriptionMM,
                    locale
                  )}
                </p>
                {day ? (
                  <>
                    <p className="mt-3 text-sm">
                      Active until{" "}
                      <span className="font-semibold text-primary">
                        {day.toLocaleDateString("en-ca", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        })}
                      </span>
                    </p>
                    <p className="text-sm font-light text-gray-500">
                      We will send you a notification upon Subscription
                      expiration
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-sm">Not Active</p>
                    <p className="text-sm font-light text-gray-500">
                      Your account is not available for selling your products
                      yet. Contact admin for more details.
                    </p>
                  </>
                )}
              </div>
              <div className="flex-1">
                {usedDay > 365 ? (
                  <div>
                    <h2 className="sr-only">Steps</h2>
                    <div>
                      <div className="flex flex-row items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">
                          Membership Start Date -{" "}
                          {new Date(data[0].memberStartDate).toLocaleDateString(
                            "en-CA",
                            {
                              year: "numeric",
                              month: "long",
                              day: "2-digit",
                            }
                          )}
                        </p>
                        <p className="text-sm font-medium text-error">
                          Expired
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="sr-only">Steps</h2>
                    <div>
                      <div className="flex flex-row items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">
                          {t("days")}
                        </p>
                        <p className="text-sm font-medium text-gray-500">
                          {usedDay} of 365 {t("days")}
                        </p>
                      </div>
                      <div className="mt-1 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: (usedDay * 100) / 365 + "%",
                          }}
                        ></div>
                      </div>
                      <p className="mt-1 text-xs font-light text-gray-500">
                        {365 - usedDay} {t("days")} {t("remaining")}
                      </p>
                    </div>
                  </div>
                )}
                {/* //TODO Update Payment */}
                {data[0] && data[0].paymentStatus === PaymentStatus.Verified ? (
                  <button
                    className={
                      "mt-5 block w-full rounded-md border border-primary bg-primary p-4 text-center text-sm font-semibold text-white transition hover:bg-opacity-90"
                    }
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setPaymentModalOpen(true);
                      setUpgradePlan(true);
                      setMemberPayment(data[0]);
                    }}
                  >
                    {t("upgradePlan")}
                  </button>
                ) : (
                  <button
                    className={
                      "mt-5 block w-full rounded-md border border-primary bg-primary p-4 text-center text-sm font-semibold text-white transition hover:bg-opacity-90"
                    }
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setPaymentModalOpen(true);
                      setUpgradePlan(false);
                      if (data && data[0]) {
                        console.log(data[0]);
                        setMemberPayment(data[0]);
                      } else {
                        setMemberPayment({
                          paymentStatus: PaymentStatus.Unpaid,
                          brandId: brandId,
                          membershipId: membershipData.id,
                        });
                      }
                    }}
                  >
                    {t("activateMembership")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {!brandId && (
        <>
          <div className="flex flex-col bg-white p-5 shadow-md">
            <h3 className="text-lg font-bold">Billing Address</h3>
            <div className="mt-3 flex flex-1 flex-col">
              <p className="text-sm">Billing address not set.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default BillingSection;
