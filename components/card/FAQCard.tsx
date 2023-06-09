import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import { IconPickerItem } from "react-fa-icon-picker";
import FAQGroupModal from "../modal/sideModal/FAQGroupModal";
import FAQModal from "../modal/sideModal/FAQModal";

interface Props {
  id: string;
  icon: any;
  title: string;
  titleMM: string;
  description: string;
  descriptionMM: string;
  updateFn: Function;
  currentGroup: string;
  onClickFn: Function;
}

function FAQCard({
  id,
  icon,
  title,
  titleMM,
  description,
  descriptionMM,
  updateFn,
  currentGroup,
  onClickFn,
}: Props) {
  const { locale } = useRouter();
  const { t } = useTranslation("common");
  const [isHover, setHover] = React.useState(false);
  const { data: session }: any = useSession();
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [isFAQModalopen, setFAQModalOpen] = React.useState(false);
  const [FAQGroup, setFAQGroup] = React.useState({
    icon,
    title,
    titleMM,
    description,
    descriptionMM,
  });

  return (
    <>
      <div
        className="group relative flex w-[220px] min-w-[220px] max-w-[220px] flex-1 cursor-pointer flex-col items-center space-y-5 rounded-sm border-t-4 border-primary bg-white p-8 shadow-xl"
        onMouseEnter={(e) => {
          setHover(true);
        }}
        onMouseLeave={(e) => {
          setHover(false);
        }}
        onClick={(e) => {
          onClickFn();
        }}
      >
        <div className="text-gray-500 group-hover:text-primary">
          <IconPickerItem
            icon={icon}
            size={24}
            color={currentGroup === id ? "#DE711B" : "#2b2b2b"}
          />
        </div>
        <p
          className={`mt-4 text-lg uppercase ${
            currentGroup === id
              ? "font-semibold text-primary"
              : "font-light text-gray-500"
          }`}
        >
          {locale === "mm" && titleMM.length > 0 ? titleMM : title}
        </p>
        {session &&
          (session.role === Role.Admin ||
            session.role === Role.Staff ||
            session.role === Role.SuperAdmin) && (
            <div className="flex items-center justify-end space-x-5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFAQModalOpen(true);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showConfirmationDialog(
                    t("deleteConfirmation"),
                    "",
                    locale,
                    () => {
                      fetch(`/api/faqs/group?id=${encodeURIComponent(id!)}`, {
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(true);
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
          )}
      </div>
      {session &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin) && (
          <>
            <FAQGroupModal
              FAQGroup={FAQGroup}
              isModalOpen={isModalOpen}
              setModalOpen={setModalOpen}
              title={
                locale === "mm"
                  ? "မေးလေ့ရှိသောမေးခွန်းအုပ်စုအသစ်ဖွဲ့ရန်"
                  : "New FAQ Group"
              }
              onClickFn={(data: any, setSubmit: Function) => {
                setSubmit(true);
                fetch("/api/faqs/group?id=" + id, {
                  method: "PUT",
                  body: JSON.stringify(data),
                }).then(async (data) => {
                  setSubmit(false);
                  if (data.status === 200) {
                    showSuccessDialog(
                      t("submit") + " " + t("success"),
                      "",
                      locale
                    );
                    updateFn();
                  } else {
                    let json = await data.json();
                    if (json.error) {
                      showErrorDialog(json.error, json.errorMM, locale);
                    } else {
                      showErrorDialog(t("somethingWentWrong"), "", locale);
                    }
                  }
                  setModalOpen(false);
                });
              }}
            />
            <FAQModal
              FAQ={{
                fAQGroupId: id,
              }}
              isModalOpen={isFAQModalopen}
              onClickFn={(data: any, setSubmit: Function) => {
                setSubmit(true);
                fetch("/api/faqs?groupId=" + id, {
                  method: "POST",
                  body: JSON.stringify(data),
                }).then(async (data) => {
                  setSubmit(false);
                  if (data.status === 200) {
                    showSuccessDialog(
                      t("submit") + " " + t("success"),
                      "",
                      locale
                    );
                    updateFn();
                  } else {
                    let json = await data.json();
                    if (json.error) {
                      showErrorDialog(json.error, json.errorMM, locale);
                    } else {
                      showErrorDialog(t("somethingWentWrong"), "", locale);
                    }
                  }
                  setFAQModalOpen(false);
                });
              }}
              setModalOpen={setFAQModalOpen}
              title={locale === "mm" ? "FAQ အသစ်ထည့်ရန်" : "Create FAQ"}
            />
          </>
        )}
    </>
  );
}

export default FAQCard;
