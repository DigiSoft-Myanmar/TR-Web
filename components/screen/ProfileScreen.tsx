import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import React, { useRef } from "react";
import { Role } from "@prisma/client";
import { useProfile } from "@/context/ProfileContext";
import LocationPickerFull from "../presentational/LocationPickerFull";
import ProfileSection from "../section/profile/ProfileSection";
import NRCSection from "../section/profile/NRCSection";
import PasswordSection from "../section/profile/PasswordSection";
import CategoriesSection from "../section/profile/CategoriesSection";
import SellerInfoSection from "../section/profile/SellerInfoSection";
import StatusSection from "../section/profile/StatusSection";
import ConfirmationSection from "../section/profile/ConfirmationSection";
import { showErrorDialog } from "@/util/swalFunction";
import { formatAmount } from "@/util/textHelper";
import { useRouter } from "next/router";

enum Step {
  Profile,
  NRC,
  MailPassword,
  PreferredCategories,
  SellerInformation,
  Status,
  Confirmation,
}

function ProfileScreen({ content }: { content: any }) {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const { data: session }: any = useSession();

  const submitProfileRef = useRef<HTMLButtonElement | null>();
  const submitNRCRef = useRef<HTMLButtonElement | null>();
  const submitMailRef = useRef<HTMLButtonElement | null>();
  const submitSellerRef = useRef<HTMLButtonElement | null>();
  const submitStatusRef = useRef<HTMLButtonElement | null>();

  const {
    user,
    setUser,
    isNRCValid,
    isCategoriesValid,
    isProfileValid,
    isSellerValid,
  } = useProfile();

  const [isFullScreen, setFullScreen] = React.useState(false);

  const stepList =
    user.role === Role.Seller || user.role === Role.Trader
      ? [
          Step.Profile,
          Step.NRC,
          Step.MailPassword,
          Step.PreferredCategories,
          Step.SellerInformation,
          Step.Status,
          Step.Confirmation,
        ]
      : user.role === Role.Buyer
      ? [
          Step.Profile,
          Step.NRC,
          Step.MailPassword,
          Step.PreferredCategories,
          Step.Status,
          Step.Confirmation,
        ]
      : [
          Step.Profile,
          Step.NRC,
          Step.MailPassword,
          Step.Status,
          Step.Confirmation,
        ];

  const [currentStep, setCurrentStep] = React.useState(Step.Profile);

  const stepDetails = [
    {
      step: Step.Profile,
      title: t("profileInfo"),
      description: t("fillProfileInfo"),
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
      step: Step.NRC,
      title: t("nrcInfo"),
      description: t("fillNRCInfo"),
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
            d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
          />
        </svg>
      ),
    },
    {
      step: Step.MailPassword,
      title: t("mailInfo"),
      description: t("fillMillInfo"),
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
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      ),
    },

    {
      step: Step.PreferredCategories,
      title: t("categoriesInfo"),
      description: t("fillCategoriesInfo"),
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
            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
          />
        </svg>
      ),
    },
    {
      step: Step.SellerInformation,
      title: t("sellerInfo"),
      description: t("fillSellerInfo"),
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
            d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
          />
        </svg>
      ),
    },
    {
      step: Step.Status,
      title: t("status"),
      description: t("fillProfileStatus"),
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

  function verify(newStep: Step) {
    if (newStep === Step.Profile) {
      return true;
    }
    if (newStep === Step.NRC) {
      return isProfileValid;
    }
    if (newStep === Step.MailPassword) {
      return isProfileValid && isNRCValid;
    }
    if (newStep === Step.PreferredCategories) {
      return isProfileValid && isNRCValid;
    }
    if (newStep === Step.SellerInformation) {
      return isProfileValid && isNRCValid && isCategoriesValid;
    }
    if (newStep === Step.Status) {
      return isProfileValid && isNRCValid && isSellerValid && isCategoriesValid;
    }
    if (newStep === Step.Confirmation) {
      return isProfileValid && isNRCValid && isSellerValid && isCategoriesValid;
    }
    return true;
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
            {!user.id ? (
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
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>

                  <h3 className="text-lg font-semibold">{t("addUser")}</h3>
                </div>
                <p
                  className={`mt-5 text-sm text-gray-100 ${
                    isFullScreen ? "text-center" : ""
                  }`}
                >
                  {t("addUserDescription")}
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
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>

                  <h3 className="text-lg font-semibold">{t("updateUser")}</h3>
                </div>
                <p
                  className={`mt-5 text-sm text-gray-100 ${
                    isFullScreen ? "text-center" : ""
                  }`}
                >
                  {t("updateUserDescription")}
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
                className="flex flex-row items-center gap-3 cursor-pointer"
                onClick={() => {
                  if (verify(e)) {
                    if (currentStep < e) {
                      if (currentStep === Step.Profile) {
                        submitProfileRef.current?.click();
                      } else if (currentStep === Step.NRC) {
                        submitNRCRef.current?.click();
                      } else if (currentStep === Step.MailPassword) {
                        submitMailRef.current?.click();
                      } else if (currentStep === Step.SellerInformation) {
                        submitSellerRef.current?.click();
                      } else if (currentStep === Step.Status) {
                        submitStatusRef.current?.click();
                      } else {
                        setCurrentStep(e);
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
                    {formatAmount(index + 1, locale)}.{" "}
                    {stepDetails.find((a) => a.step === e)?.title}
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
              {currentStep === Step.Profile ? (
                <ProfileSection nextFn={nextFn} submitRef={submitProfileRef} />
              ) : currentStep === Step.NRC ? (
                <NRCSection
                  backFn={backFn}
                  nextFn={nextFn}
                  submitRef={submitNRCRef}
                />
              ) : currentStep === Step.MailPassword ? (
                <PasswordSection
                  backFn={backFn}
                  nextFn={nextFn}
                  submitRef={submitMailRef}
                />
              ) : currentStep === Step.PreferredCategories ? (
                <CategoriesSection backFn={backFn} nextFn={nextFn} />
              ) : currentStep === Step.SellerInformation ? (
                <SellerInfoSection
                  backFn={backFn}
                  nextFn={nextFn}
                  submitRef={submitSellerRef}
                  content={content}
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

export default ProfileScreen;
