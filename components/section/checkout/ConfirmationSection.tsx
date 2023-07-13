import { useMarketplace } from "@/context/MarketplaceContext";
import { getHeaders } from "@/util/authHelper";
import { fetcher } from "@/util/fetcher";
import {
  showErrorDialog,
  showSuccessDialog,
  showUnauthorizedDialog,
} from "@/util/swalFunction";
import { getText } from "@/util/textHelper";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";

type Props = {
  backFn: Function;
  stepNum: number;
};

function ConfirmationSection({ backFn, stepNum }: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const {
    promoCode,
    clearCart,
    removePromotion,
    isAddressDiff,
    billingAddress,
    shippingAddress,
  } = useMarketplace();
  const { data: session }: any = useSession();
  const { data } = useSWR("/api/townships?allow=true", fetcher);
  const [billingLocation, setBillingLocation] = React.useState("");
  const [shippingLocation, setShippingLocation] = React.useState("");
  const [orderNote, setOrderNote] = React.useState("");

  React.useEffect(() => {
    if (
      data &&
      billingAddress.stateId &&
      billingAddress.districtId &&
      billingAddress.townshipId
    ) {
      let state = data.find((z) => z.id === billingAddress.stateId);
      let stateStr = getText(state.name, state.nameMM, locale);
      let district = state.districts.find(
        (z) => z.id === billingAddress.districtId
      );
      let districtStr = getText(district.name, district.nameMM, locale);
      let township = district.townships.find(
        (z) => z.id === billingAddress.townshipId
      );
      let townshipStr = getText(township.name, township.nameMM, locale);
      setBillingLocation(stateStr + "-" + districtStr + "-" + townshipStr);
    }
  }, [data, locale]);

  React.useEffect(() => {
    if (
      data &&
      shippingAddress.stateId &&
      shippingAddress.districtId &&
      shippingAddress.townshipId
    ) {
      let state = data.find((z) => z.id === shippingAddress.stateId);
      let stateStr = getText(state.name, state.nameMM, locale);
      let district = state.districts.find(
        (z) => z.id === shippingAddress.districtId
      );
      let districtStr = getText(district.name, district.nameMM, locale);
      let township = district.townships.find(
        (z) => z.id === shippingAddress.townshipId
      );
      let townshipStr = getText(township.name, township.nameMM, locale);
      setShippingLocation(stateStr + "-" + districtStr + "-" + townshipStr);
    }
  }, [data, locale, shippingAddress]);

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">
        {t("step")} {stepNum}
      </h3>
      <p className="my-1 text-xl font-bold">{t("confirmationInfo")}</p>
      <span className="mb-10 text-sm">{t("fillConfirmationInfo")}</span>
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold">{t("billingAddress")}</h3>
        <div className="flex flex-row items-center justify-between gap-3">
          <h3 className="font-semibold text-sm">{t("name")}</h3>
          <p>{billingAddress.name}</p>
        </div>
        <div className="flex flex-row items-center justify-between gap-3">
          <h3 className="font-semibold text-sm">{t("phoneNum")}</h3>
          <p>{billingAddress.phoneNum}</p>
        </div>
        <div className="flex flex-row items-center justify-between gap-3">
          <h3 className="font-semibold text-sm">{t("email")}</h3>
          <p>{billingAddress.email}</p>
        </div>
        <div className="flex flex-row items-center justify-between gap-3">
          <h3 className="font-semibold text-sm">{t("houseNo")}</h3>
          <p>{billingAddress.houseNo}</p>
        </div>
        <div className="flex flex-row items-center justify-between gap-3">
          <h3 className="font-semibold text-sm">{t("street")}</h3>
          <p>{billingAddress.street}</p>
        </div>

        <div className="flex flex-row items-center justify-between gap-3">
          <h3 className="font-semibold text-sm">{t("location")}</h3>
          <p>{billingLocation}</p>
        </div>

        <div className="flex flex-row items-center justify-between gap-3">
          <h3 className="font-semibold text-sm">{t("isAddressDiff")}</h3>
          <p>{isAddressDiff ? "Different shipping address" : "Same Address"}</p>
        </div>
      </div>
      {isAddressDiff && (
        <div className="flex flex-col gap-3 mt-5 border-t pt-5">
          <h3 className="font-semibold">{t("shippingAddress")}</h3>
          <div className="flex flex-row items-center justify-between gap-3">
            <h3 className="font-semibold text-sm">{t("name")}</h3>
            <p>{shippingAddress.name}</p>
          </div>
          <div className="flex flex-row items-center justify-between gap-3">
            <h3 className="font-semibold text-sm">{t("phoneNum")}</h3>
            <p>{shippingAddress.phoneNum}</p>
          </div>
          <div className="flex flex-row items-center justify-between gap-3">
            <h3 className="font-semibold text-sm">{t("houseNo")}</h3>
            <p>{shippingAddress.houseNo}</p>
          </div>
          <div className="flex flex-row items-center justify-between gap-3">
            <h3 className="font-semibold text-sm">{t("street")}</h3>
            <p>{shippingAddress.street}</p>
          </div>

          <div className="flex flex-row items-center justify-between gap-3">
            <h3 className="font-semibold text-sm">{t("location")}</h3>
            <p>{shippingLocation}</p>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-3 mt-5 pt-5 border-t">
        <div className="flex flex-row items-center justify-between gap-3">
          <h3 className="font-semibold text-sm">{t("orderNote")}</h3>
        </div>
        <textarea
          className="h-40 rounded-md border"
          value={orderNote}
          onChange={(e) => {
            setOrderNote(e.currentTarget.value);
          }}
        ></textarea>
      </div>
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
            className={`flex flex-row items-center rounded-r-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
            title="Next"
            type="button"
            onClick={() => {
              if (getHeaders(session)) {
                fetch("api/cart?type=Order", {
                  method: "POST",
                  body: JSON.stringify({
                    promoIds: promoCode.map((z) => z.id),
                    orderNote: orderNote,
                  }),
                  headers: getHeaders(session),
                }).then(async (data) => {
                  if (data.status === 200) {
                    showSuccessDialog(
                      "Order placed successfully.",
                      "",
                      locale,
                      () => {
                        clearCart();
                        removePromotion();
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
              className="ml-3 h-4 w-4"
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
