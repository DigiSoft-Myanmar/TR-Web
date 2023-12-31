import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import { useTranslation } from "next-i18next";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React from "react";
import AddressModal from "../modal/sideModal/AddressModal";
import { getText } from "@/util/textHelper";

interface Props {
  address: any;
  updateFn: Function;
  isBilling: boolean;
  index?: number;
  phoneNum: string;
  userId: string;
}

function AddressCard({
  address,
  updateFn,
  isBilling,
  index,
  phoneNum,
  userId,
}: Props) {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const { theme } = useTheme();
  const [currentAddress, setCurrentAddress] = React.useState<any>();
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  return (
    <>
      <div className="p-3 max-w-sm min-w-[300px]">
        {isBilling === true ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mb-2 w-6 h-6 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mb-2 w-6 h-6 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        )}
        <h5 className="mb-4 text-lg font-semibold tracking-tight text-gray-900">
          {isBilling === true ? t("billingAddress") : t("shippingAddress")}
        </h5>
        <div className="flex flex-col gap-3 pt-3 border-t border-t-inputLightBorder">
          <div className="mb-3 font-normal text-gray-500 text-sm flex items-center gap-2">
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
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <p>{address.name}</p>
          </div>
          <div className="mb-3 font-normal text-gray-500 text-sm flex items-center gap-2">
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
                d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
              />
            </svg>

            <p>{address.phoneNum}</p>
          </div>
          {isBilling === true && (
            <div className="mb-3 font-normal text-gray-500 text-sm flex items-center gap-2">
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
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>

              <p>{address.email}</p>
            </div>
          )}
          <div className="mb-3 font-normal text-gray-500 text-sm flex items-center gap-2">
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
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>

            <p>{address.houseNo}</p>
          </div>
          <div className="mb-3 font-normal text-gray-500 text-sm flex items-center gap-2">
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
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>

            <p>{address.street}</p>
          </div>
          {address.state && address.district && address.township && (
            <div className="mb-3 font-normal text-gray-500 text-sm flex items-center gap-2">
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
                  d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                />
              </svg>

              <p>
                {getText(address.state.name, address.state.nameMM, locale) +
                  "-" +
                  getText(
                    address.district.name,
                    address.district.nameMM,
                    locale
                  ) +
                  "-" +
                  getText(
                    address.township.name,
                    address.township.nameMM,
                    locale
                  )}
              </p>
            </div>
          )}
        </div>
        <div className="flex space-x-5 justify-end items-center pt-3 border-t border-t-inputLightBorder">
          {isBilling === false && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showConfirmationDialog(
                  t("deleteConfirmation"),
                  "",
                  locale,
                  () => {
                    let link =
                      "/api/user/" + encodeURIComponent(phoneNum) + "/address";
                    if (address && address.id) {
                      link += "?id=" + encodeURIComponent(address.id);
                    }
                    fetch(link, {
                      method: "DELETE",
                    }).then(async (data) => {
                      if (data.status === 200) {
                        updateFn();
                        showSuccessDialog(
                          t("delete") + " " + t("success"),
                          "",
                          locale
                        );
                      } else {
                        let json = await data.json();
                        showErrorDialog(json.error, json.errorMM, locale);
                      }
                    });
                  }
                );
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentAddress(address);
              setDialogOpen(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path
                fillRule="evenodd"
                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      <AddressModal
        isModalOpen={isDialogOpen}
        setModalOpen={setDialogOpen}
        address={currentAddress}
        title={"Edit Address"}
        isBilling={isBilling}
        userId={userId}
        onClickFn={(currentAddress: any) => {
          let link = "/api/user/" + encodeURIComponent(phoneNum) + "/address";
          if (address && address.id) {
            link += "?id=" + encodeURIComponent(address.id);
          }
          fetch(link, {
            method: "PUT",
            body: JSON.stringify(currentAddress),
          }).then(async (data) => {
            if (data.status === 200) {
              showSuccessDialog(t("submit") + " " + t("success"), "", locale);
              updateFn();
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

export default AddressCard;
