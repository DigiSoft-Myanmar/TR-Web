import React from "react";

import { Navigation, Pagination, Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
  showUnauthorizedDialog,
} from "@/util/swalFunction";
import FAQCard from "./FAQCard";
import FAQModal from "../modal/sideModal/FAQModal";
import { FAQ, FAQGroup, Role } from "@prisma/client";
import useMaxProd from "@/hooks/useMaxProd";
import { getHeaders } from "@/util/authHelper";

interface Props {
  data: any;
  updateFn: Function;
}

function FAQList({ data, updateFn }: Props) {
  const maxProd = useMaxProd(220, 5);
  const { t } = useTranslation("common");
  const [currentGroup, setCurrentGroup] = React.useState(data[0].id);
  const { data: session }: any = useSession();
  const { locale } = useRouter();
  const router = useRouter();
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [FAQ, setFAQ] = React.useState<any>({});

  return data ? (
    <>
      {session &&
      (session.role === Role.Admin ||
        session.role === Role.Staff ||
        session.role === Role.SuperAdmin) ? (
        <></>
      ) : (
        <div className="mb-10 flex flex-col items-center space-y-10">
          <h3 className="text-2xl font-semibold">{t("howCanWeHelp")}</h3>
          <p className="text-sm">{t("chooseCategory")}</p>
        </div>
      )}
      <div className="w-full overflow-hidden sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl">
        <Swiper
          // install Swiper modules
          modules={[Navigation, Pagination, Autoplay]}
          autoplay={{
            delay: 2500,
            disableOnInteraction: true,
            pauseOnMouseEnter: true,
          }}
          slidesPerView={maxProd}
          rewind={true}
          pagination={{ clickable: true }}
          scrollbar={{ draggable: true }}
          className="hidden w-full lg:flex"
        >
          {data.map((e: any, index: number) => (
            <SwiperSlide
              key={index}
              className={`w-full p-10 ${data.length > maxProd ? "pb-14" : ""}`}
            >
              <FAQCard
                {...e}
                currentGroup={currentGroup}
                updateFn={updateFn}
                onClickFn={() => {
                  setCurrentGroup(e.id.toString());
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {currentGroup && data.find((e: any) => e.id === currentGroup) && (
        <div
          className={`mt-10 flex flex-col items-center ${
            session &&
            (session.role === Role.Admin ||
              session.role === Role.Staff ||
              session.role === Role.SuperAdmin)
              ? ""
              : "min-h-screen"
          }`}
        >
          <h3 className="text-2xl font-medium uppercase">
            {locale === "mm" &&
            data.find((e: any) => e.id === currentGroup)!.titleMM
              ? data.find((e: any) => e.id === currentGroup)?.titleMM
              : data.find((e: any) => e.id === currentGroup)?.title}
          </h3>
          <p className="my-5 font-light">
            {locale === "mm" &&
            data.find((e: any) => e.id === currentGroup).descriptionMM
              ? data.find((e: any) => e.id === currentGroup).descriptionMM
              : data.find((e: any) => e.id === currentGroup).description}
          </p>
          {data.find((e: any) => e.id === currentGroup).FAQ &&
            data.find((e: any) => e.id === currentGroup).FAQ.length > 0 && (
              <div className="mt-10 flow-root w-full max-w-2xl">
                <div className="-my-8 divide-y divide-primary">
                  {data
                    .find((e: any) => e.id === currentGroup)
                    .FAQ.map((e: any, index: number) => (
                      <details className="group w-full py-8" key={index} open>
                        <summary className="flex w-full cursor-pointer items-center justify-between">
                          <h5 className="w-full text-lg font-medium text-gray-900">
                            {locale === "mm" && e.questionMM
                              ? e.questionMM
                              : e.question}
                          </h5>

                          {session &&
                            (session.role === Role.Admin ||
                              session.role === Role.Staff ||
                              session.role === Role.SuperAdmin) && (
                              <div className="flex items-center justify-end space-x-5">
                                <button
                                  onClick={(eve) => {
                                    eve.stopPropagation();
                                    showConfirmationDialog(
                                      t("deleteConfirmation"),
                                      "",
                                      locale,
                                      () => {
                                        fetch(
                                          `/api/faqs?groupId=${encodeURIComponent(
                                            currentGroup
                                          )}&id=${encodeURIComponent(e.id)}`,
                                          {
                                            method: "DELETE",
                                            headers: getHeaders(session),
                                          }
                                        ).then(async (data) => {
                                          if (data.status === 200) {
                                            updateFn();
                                            showSuccessDialog(
                                              t("delete") + " " + t("success"),
                                              "",
                                              locale
                                            );
                                          } else {
                                            let json = await data.json();
                                            showErrorDialog(
                                              json.error,
                                              json.errorMM,
                                              locale
                                            );
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
                                  onClick={(eve) => {
                                    eve.stopPropagation();
                                    setModalOpen(true);
                                    setFAQ({
                                      id: e.id,
                                      question: e.question,
                                      questionMM: e.questionMM,
                                      answer: e.answer,
                                      answerMM: e.answerMM,
                                      fAQGroupId: e.fAQGroupId,
                                    });
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

                          <span className="relative ml-1.5 h-5 w-5 flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </span>
                        </summary>

                        <p className="mt-4 whitespace-pre-line border-t pt-4 leading-relaxed text-gray-700">
                          {locale === "mm" && e.answerMM
                            ? e.answerMM
                            : e.answer}
                        </p>
                      </details>
                    ))}
                </div>
              </div>
            )}
        </div>
      )}
      {session &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin) && (
          <FAQModal
            FAQ={FAQ}
            isModalOpen={isModalOpen}
            setModalOpen={setModalOpen}
            onClickFn={(data: any, setSubmit: Function) => {
              setSubmit(true);
              if (getHeaders(session)) {
                fetch("/api/faqs?groupId=" + currentGroup + "&id=" + FAQ.id, {
                  method: "PUT",
                  body: JSON.stringify(data),
                  headers: getHeaders(session),
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
              } else {
                showUnauthorizedDialog(locale, () => {
                  router.push("/login");
                });
              }
            }}
            title={locale === "mm" ? "FAQ ပြင်ဆင်ရန်" : "Edit FAQ"}
          />
        )}
    </>
  ) : (
    <></>
  );
}

export default FAQList;
