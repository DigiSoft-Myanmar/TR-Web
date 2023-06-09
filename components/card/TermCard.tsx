import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import { formatAmount, getText } from "@/util/textHelper";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import AttributeModal from "../modal/sideModal/AttributeModal";
import TermModal from "../modal/sideModal/TermModal";

function TermCard({
  name,
  nameMM,
  value,
  prodCount,
  id,
  setUpdate,
  attrId,
  type,
}: any) {
  const { t } = useTranslation("common");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const { locale } = useRouter();
  return (
    <>
      <div
        className={`group flex min-w-[250px] cursor-pointer flex-col justify-between rounded-sm border border-slate-200 bg-white p-4 transition-shadow hover:shadow-lg`}
      >
        <div className="flex flex-row items-center justify-between">
          <h3 className="px-2 text-lg font-bold text-primary">
            {formatAmount(prodCount, locale)}
          </h3>
          <p className="px-2 text-sm font-medium uppercase tracking-widest text-gray-500">
            {getText(name, nameMM, locale)}
          </p>
          <div>
            <button
              className="px-2 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
            >
              <span className="sr-only">Edit</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                />
              </svg>
            </button>
            <button
              className="px-2 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                showConfirmationDialog(
                  t("deleteConfirmation"),
                  "",
                  locale,
                  () => {
                    fetch(`/api/products/terms?id=${encodeURIComponent(id)}`, {
                      method: "DELETE",
                    }).then(async (data) => {
                      if (data.status === 200) {
                        setUpdate(true);
                        showSuccessDialog(
                          t("delete") + " " + t("success"),
                          "",
                          locale,
                        );
                      } else {
                        let json = await data.json();
                        showErrorDialog(json.error, json.errorMM, locale);
                      }
                    });
                  },
                );
              }}
            >
              <span className="sr-only">Delete</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <TermModal
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        title={t("updateTerm")}
        setUpdate={setUpdate}
        term={{
          name: name,
          nameMM: nameMM,
          id: id,
          attributeId: attrId,
          value: value,
        }}
        type={type}
      />
    </>
  );
}
export default TermCard;
