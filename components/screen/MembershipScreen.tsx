import { showErrorDialog } from "@/util/swalFunction";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import React, { useRef } from "react";
import { useMembership } from "@/context/MemberContext";
import InformationSection from "../section/membership/InformationSection";
import SearchSection from "../section/membership/SearchSection";
import SKUSection from "../section/membership/SKUSection";
import ReportSection from "../section/membership/ReportSection";
import AdsSection from "../section/membership/AdsSection";
import ConfirmationSection from "../section/membership/ConfirmationSection";

enum Step {
  Information,
  TopSearch,
  SKUListing,
  Reports,
  Advertisements,
  Confirmation,
}

function MembershipScreen() {
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();

  const submitInfoRef = useRef<HTMLButtonElement | null>();
  const submitAdsRef = useRef<HTMLButtonElement | null>();
  const submitSKURef = useRef<HTMLButtonElement | null>();
  const submitTopSearchRef = useRef<HTMLButtonElement | null>();
  const submitReportsRef = useRef<HTMLButtonElement | null>();

  const {
    membership,
    infoValid,
    SKUValid,
    adsValid,
    reportValid,
    topSearchValid,
  } = useMembership();

  const [isFullScreen, setFullScreen] = React.useState(false);

  const stepList = [
    Step.Information,
    Step.TopSearch,
    Step.SKUListing,
    Step.Reports,
    Step.Advertisements,
    Step.Confirmation,
  ];

  const [currentStep, setCurrentStep] = React.useState(Step.Information);

  const stepDetails = [
    {
      step: Step.Information,
      title: t("memberInfo"),
      description: t("fillMemberInfo"),
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
      step: Step.TopSearch,
      title: t("topSearchMember"),
      description: t("fillTopSearchMember"),
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
            d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      step: Step.SKUListing,
      title: t("skuListingMember"),
      description: t("fillSKUListingMember"),
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
            d="M12 3.75v16.5M2.25 12h19.5M6.375 17.25a4.875 4.875 0 004.875-4.875V12m6.375 5.25a4.875 4.875 0 01-4.875-4.875V12m-9 8.25h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5zm12.621-9.44c-1.409 1.41-4.242 1.061-4.242 1.061s-.349-2.833 1.06-4.242a2.25 2.25 0 013.182 3.182zM10.773 7.63c1.409 1.409 1.06 4.242 1.06 4.242S9 12.22 7.592 10.811a2.25 2.25 0 113.182-3.182z"
          />
        </svg>
      ),
    },

    {
      step: Step.Reports,
      title: t("reportsMember"),
      description: t("fillReportsMember"),
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
            d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
          />
        </svg>
      ),
    },
    {
      step: Step.Advertisements,
      title: t("adsMember"),
      description: t("fillAdsMember"),
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
            d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"
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
    if (newStep === Step.TopSearch) {
      return infoValid;
    }
    if (newStep === Step.SKUListing) {
      return infoValid && topSearchValid;
    }
    if (newStep === Step.Reports) {
      return infoValid && topSearchValid && SKUValid;
    }
    if (newStep === Step.Advertisements) {
      return infoValid && topSearchValid && SKUValid && reportValid;
    }
    if (newStep === Step.Confirmation) {
      return infoValid && topSearchValid && SKUValid && reportValid && adsValid;
    }
    return true;
  }

  function nextFn() {
    setCurrentStep((prevValue) => {
      let nextStep: any = prevValue;
      let index = stepList.findIndex((e) => e === nextStep);
      if (index < stepList.length - 1) {
        nextStep = stepList[index + 1];
      }
      return nextStep;
    });
  }

  function backFn() {
    setCurrentStep((prevValue) => {
      let prevStep: any = prevValue;
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
            {!membership?.id ? (
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
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                    />
                  </svg>

                  <h3 className="text-lg font-semibold">
                    {t("addMembership")}
                  </h3>
                </div>
                <p
                  className={`mt-5 text-sm text-gray-100 ${
                    isFullScreen ? "text-center" : ""
                  }`}
                >
                  {t("addMembershipDescription")}
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
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                    />
                  </svg>

                  <h3 className="text-lg font-semibold">
                    {t("updateMembership")}
                  </h3>
                </div>
                <p
                  className={`mt-5 text-sm text-gray-100 ${
                    isFullScreen ? "text-center" : ""
                  }`}
                >
                  {t("updateMembershipDescription")}
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
                      if (currentStep === Step.Information) {
                        submitInfoRef.current?.click();
                      } else if (currentStep === Step.Advertisements) {
                        submitAdsRef.current?.click();
                      } else if (currentStep === Step.Reports) {
                        submitReportsRef.current?.click();
                      } else if (currentStep === Step.SKUListing) {
                        submitSKURef.current?.click();
                      } else if (currentStep === Step.TopSearch) {
                        submitTopSearchRef.current?.click();
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
                <InformationSection nextFn={nextFn} submitRef={submitInfoRef} />
              ) : currentStep === Step.TopSearch ? (
                <SearchSection
                  backFn={backFn}
                  nextFn={nextFn}
                  submitRef={submitTopSearchRef}
                />
              ) : currentStep === Step.SKUListing ? (
                <SKUSection
                  backFn={backFn}
                  nextFn={nextFn}
                  submitRef={submitSKURef}
                />
              ) : currentStep === Step.Reports ? (
                <ReportSection
                  backFn={backFn}
                  nextFn={nextFn}
                  submitRef={submitReportsRef}
                />
              ) : currentStep === Step.Advertisements ? (
                <AdsSection
                  backFn={backFn}
                  nextFn={nextFn}
                  submitRef={submitAdsRef}
                />
              ) : currentStep === Step.Confirmation ? (
                <ConfirmationSection
                  backFn={backFn}
                  currentStep={stepList.findIndex((e) => e === currentStep) + 1}
                />
              ) : (
                <></>
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

export default MembershipScreen;
