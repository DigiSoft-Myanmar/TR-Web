import AddressCard from "@/components/card/AddressCard";
import AddressModal from "@/components/modal/sideModal/AddressModal";
import { isInternal } from "@/util/authHelper";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import { getText } from "@/util/textHelper";
import { User, UserAddress } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

function UserAddressSection({ user }: { user: User }) {
  const [addressModalOpen, setAddressModalOpen] = React.useState(false);
  const { data: session }: any = useSession();
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const { data: addressInfo, refetch } = useQuery("addressdata", () =>
    fetch("/api/user/" + encodeURIComponent(user.phoneNum) + "/address").then(
      (res) => {
        let json = res.json();
        return json;
      }
    )
  );

  return (
    <>
      <div
        className={`${
          isInternal(session)
            ? "py-5 flex flex-col gap-5"
            : "mx-6 px-4 py-5 flex flex-col gap-5"
        }`}
      >
        {addressInfo?.billingAddress ? (
          <>
            <h3 className="text-lg ml-3 mt-3">{t("billingAddress")}</h3>
            <div className="bg-white p-3 rounded-md border flex flex-col gap-3 w-fit">
              <AddressCard
                address={addressInfo.billingAddress}
                isBilling={true}
                updateFn={() => {
                  refetch();
                }}
                phoneNum={user.phoneNum}
                userId={user.id}
              />
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg ml-3 mt-3">{t("billingAddress")}</h3>
            <div className="grid p-10 bg-white place-content-center rounded-md border">
              <h1 className="tracking-widest text-gray-500 uppercase">
                This user doesn't set address yet.
              </h1>
            </div>
          </>
        )}
        {addressInfo?.shippingAddress &&
        addressInfo?.shippingAddress.length > 0 ? (
          <>
            <div className="flex flex-row items-center gap-3 mt-3">
              <h3 className="text-lg ml-3">{t("shippingAddress")}</h3>
              <button
                className="bg-primary text-white p-1 rounded-md hover:bg-primary-focus"
                type="button"
                onClick={() => {
                  if (addressInfo?.shippingAddress?.length > 3) {
                    showErrorDialog(
                      "Only 3 shipping address are allowed",
                      "",
                      locale
                    );
                  } else {
                    setAddressModalOpen(true);
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {addressInfo.shippingAddress.map((z: UserAddress, index) => (
                <div
                  className="bg-white p-3 rounded-md border flex flex-col gap-3 w-fit"
                  key={index}
                >
                  <AddressCard
                    address={z}
                    isBilling={z.isBillingAddress}
                    updateFn={() => {
                      refetch();
                    }}
                    phoneNum={user.phoneNum}
                    userId={user.id}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-row items-center gap-3 mt-3">
              <h3 className="text-lg ml-3">{t("shippingAddress")}</h3>
              <button
                className="bg-primary text-white p-1 rounded-md hover:bg-primary-focus"
                type="button"
                onClick={() => {
                  if (addressInfo?.shippingAddress?.length > 3) {
                    showErrorDialog(
                      "Only 3 shipping address are allowed",
                      "",
                      locale
                    );
                  } else {
                    setAddressModalOpen(true);
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
                </svg>
              </button>
            </div>
            <div className="grid p-10 bg-white place-content-center rounded-md border">
              <h1 className="tracking-widest text-gray-500 uppercase">
                {getText(
                  "This user doesn't set different address yet.",
                  "ဤအသုံးပြုသူသည် ပို့ဆောင်ရန် အခြားလိပ်စာ ထည့်သွင်းထားခြင်းမရှိပါ။",
                  locale
                )}
              </h1>
            </div>
          </>
        )}
      </div>
      <AddressModal
        isModalOpen={addressModalOpen}
        setModalOpen={setAddressModalOpen}
        address={{}}
        title={"New Address"}
        isBilling={false}
        userId={user.id}
        onClickFn={(currentAddress: any) => {
          let link =
            "/api/user/" + encodeURIComponent(user.phoneNum) + "/address";

          fetch(link, {
            method: "PUT",
            body: JSON.stringify(currentAddress),
          }).then(async (data) => {
            if (data.status === 200) {
              showSuccessDialog(t("submit") + " " + t("success"), "", locale);
              refetch();
            } else {
              let json = await data.json();
              if (json.error) {
                showErrorDialog(json.error, json.errorMM, locale);
              } else {
                showErrorDialog(t("somethingWentWrong"), "", locale);
              }
            }
          });
        }}
      />
    </>
  );
}

export default UserAddressSection;
