import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import { useSession } from "next-auth/react";
import { Content, Role } from "@prisma/client";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import prisma from "@/prisma/prisma";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import FormInput from "@/components/presentational/FormInput";
import { FeatureType } from "@/types/pageType";
import { IconPickerItem } from "react-fa-icon-picker";
import { useRouter } from "next/router";
import { getText } from "@/util/textHelper";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import FeaturesModal from "@/components/modal/sideModal/FeaturesModal";
import FormInputTextArea from "@/components/presentational/FormInputTextArea";
import { getHeaders } from "@/util/authHelper";

function AboutPage({ data }: { data: any }) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const { data: session }: any = useSession();
  const [isSubmit, setSubmit] = React.useState(false);
  const [features, setFeatures] = React.useState<FeatureType[]>(
    data?.homeFeatures ? data.homeFeatures : []
  );

  const [sellFeatures, setSellFeatures] = React.useState<FeatureType[]>(
    data?.sellFeatures ? data.sellFeatures : []
  );
  const [title, setTitle] = React.useState("");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [isSellFeature, setIsSellFeature] = React.useState(false);
  const [feature, setFeature] = React.useState<FeatureType>();
  const [updateIndex, setUpdateIndex] = React.useState(-1);

  const schema = z.object({
    aboutTitle: z.string().min(1, { message: t("inputError") }),
    aboutTitleMM: z.string().min(1, { message: t("inputError") }),
    aboutDescription: z.string().min(1, { message: t("inputError") }),
    aboutDescriptionMM: z.string().min(1, { message: t("inputError") }),
    playStoreURL: z.string().min(1, { message: t("inputError") }),
    appStoreURL: z.string().min(1, { message: t("inputError") }),
  });

  const { register, handleSubmit, watch, formState, reset } = useForm<any>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: data,
  });
  const { errors } = formState;
  const watchFields = watch();

  function submit(data: Content) {
    setSubmit(true);
    let b = { ...data, homeFeatures: features, sellFeatures: sellFeatures };
    fetch("/api/siteManagement", {
      body: JSON.stringify(b),
      method: "POST",
      headers: getHeaders(session),
    }).then(async (data) => {
      setSubmit(false);
      if (data.status === 200) {
        showSuccessDialog(t("submit") + " " + t("success"), "", locale);
        router.reload();
      } else {
        let json = await data.json();
        if (json.error) {
          showErrorDialog(json.error, json.errorMM, locale);
        } else {
          showErrorDialog(t("somethingWentWrong"), "", locale);
        }
      }
    });
  }

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>About | Pyi Twin Phyit</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto max-w-screen-xl px-4 py-8">
        <form
          onSubmit={handleSubmit(submit)}
          className="rounded-md bg-white p-5"
        >
          <div className="mt-2 flex flex-col gap-3">
            <FormInput
              label={"Title (ENG)"}
              placeHolder={"Enter Title (ENG)"}
              error={errors.aboutTitle?.message}
              type="text"
              defaultValue={data?.aboutTitle}
              formControl={{ ...register("aboutTitle") }}
              currentValue={watchFields.aboutTitle}
            />

            <FormInput
              label={"Title (MM)"}
              placeHolder={"Enter Title (MM)"}
              error={errors.aboutTitleMM?.message}
              type="text"
              defaultValue={data?.aboutTitleMM}
              formControl={{ ...register("aboutTitleMM") }}
              currentValue={watchFields.aboutTitleMM}
            />

            <FormInputTextArea
              label={"Description (ENG)"}
              placeHolder={"Enter Description (ENG)"}
              error={errors.aboutDescription?.message}
              defaultValue={data?.aboutDescription}
              formControl={{ ...register("aboutDescription") }}
              currentValue={watchFields.aboutDescription}
            />

            <FormInputTextArea
              label={"Description (MM)"}
              placeHolder={"Enter Description (MM)"}
              error={errors.aboutDescriptionMM?.message}
              defaultValue={data?.aboutDescriptionMM}
              formControl={{ ...register("aboutDescriptionMM") }}
              currentValue={watchFields.aboutDescriptionMM}
            />

            <FormInput
              label={"Play Store URL"}
              placeHolder={"Enter Play Store URL"}
              error={errors.playStoreURL?.message}
              type="text"
              defaultValue={data?.playStoreURL}
              formControl={{ ...register("playStoreURL") }}
              currentValue={watchFields.playStoreURL}
            />

            <FormInput
              label={"App Store URL"}
              placeHolder={"Enter App Store URL"}
              error={errors.appStoreURL?.message}
              type="text"
              defaultValue={data?.appStoreURL}
              formControl={{ ...register("appStoreURL") }}
              currentValue={watchFields.appStoreURL}
            />

            <p className="mt-3 text-sm text-gray-500">
              If you want to highlight{" "}
              <span className="font-semibold text-primary">text</span> like this
              add #text#
            </p>
            <div className="mt-5 flex flex-col gap-3 border-t pt-5">
              <div className="flex flex-row items-center gap-3">
                <h3 className="text-semibold text-sm">Home Features</h3>
                <button
                  className="rounded-full bg-primary/20 p-0.5 text-primary hover:bg-primary-focus hover:text-white"
                  type="button"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    setModalOpen(true);
                    setIsSellFeature(false);
                    setTitle("Create Feature");
                    setFeature(undefined);
                    setUpdateIndex(-1);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-row flex-wrap items-stretch gap-5">
                {features.map((e: any, index: number) => (
                  <div
                    className="flex cursor-pointer flex-row items-center space-x-3 rounded-md bg-primary/10 px-3 py-2 hover:bg-primary/30"
                    key={index}
                  >
                    <span className="rounded-full bg-primary/20 p-2 text-primary">
                      <IconPickerItem
                        icon={e.icon}
                        size={24}
                        color={"#DE711B"}
                      />
                    </span>
                    <div className="flex flex-col space-y-1">
                      <h3 className="text-primaryText whitespace-nowrap text-sm font-semibold">
                        {getText(e.title, e.titleMM, locale)}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {getText(e.description, e.descriptionMM, locale)}
                      </p>
                    </div>
                    <div className="flex flex-row items-center justify-end gap-3">
                      <button
                        type="button"
                        className="hover:text-primary"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setModalOpen(true);
                          setIsSellFeature(false);
                          setTitle("Update Feature");
                          setFeature(e);
                          setUpdateIndex(index);
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
                        type="button"
                        className="hover:text-primary"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          showConfirmationDialog(
                            t("deleteConfirmation"),
                            "",
                            locale,
                            () => {
                              setFeatures((prevValue) => {
                                let d = [...prevValue];
                                d.splice(index, 1);
                                return d;
                              });
                            }
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
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t pt-5">
              <div className="flex flex-row items-center gap-3">
                <h3 className="text-semibold text-sm">Sell Features</h3>
                <button
                  className="rounded-full bg-primary/20 p-0.5 text-primary hover:bg-primary-focus hover:text-white"
                  type="button"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    setModalOpen(true);
                    setIsSellFeature(true);
                    setTitle("Create Sell Feature");
                    setFeature(undefined);
                    setUpdateIndex(-1);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-row flex-wrap items-stretch gap-5">
                {sellFeatures.map((e: any, index: number) => (
                  <div
                    className="flex cursor-pointer flex-row items-center space-x-3 rounded-md bg-primary/10 px-3 py-2 hover:bg-primary/30"
                    key={index}
                  >
                    <span className="rounded-full bg-primary/20 p-2 text-primary">
                      <IconPickerItem
                        icon={e.icon}
                        size={24}
                        color={"#DE711B"}
                      />
                    </span>
                    <div className="flex flex-col space-y-1">
                      <h3 className="text-primaryText whitespace-nowrap text-sm font-semibold">
                        {getText(e.title, e.titleMM, locale)}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {getText(e.description, e.descriptionMM, locale)}
                      </p>
                    </div>
                    <div className="flex flex-row items-center justify-end gap-3">
                      <button
                        type="button"
                        className="hover:text-primary"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setModalOpen(true);
                          setIsSellFeature(true);
                          setTitle("Update Sell Feature");
                          setFeature(e);
                          setUpdateIndex(index);
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
                        type="button"
                        className="hover:text-primary"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          showConfirmationDialog(
                            t("deleteConfirmation"),
                            "",
                            locale,
                            () => {
                              setSellFeatures((prevValue) => {
                                let d = [...prevValue];
                                d.splice(index, 1);
                                return d;
                              });
                            }
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
                ))}
              </div>
            </div>
          </div>

          <div className="flex w-full justify-end">
            <div>
              <SubmitBtn
                isSubmit={isSubmit}
                submitTxt="Loading..."
                text={t("submit")}
              />
            </div>
          </div>
        </form>
      </div>
      <FeaturesModal
        feature={feature}
        isModalOpen={isModalOpen}
        onClickFn={(e: FeatureType) => {
          if (updateIndex === -1) {
            if (isSellFeature === true) {
              setSellFeatures((prevValue) => {
                return [...prevValue, e];
              });
            } else {
              setFeatures((prevValue) => {
                return [...prevValue, e];
              });
            }
          } else {
            if (isSellFeature === true) {
              setSellFeatures((prevValue) => {
                let d = [...prevValue];
                d[updateIndex] = e;
                return d;
              });
            } else {
              setFeatures((prevValue) => {
                let d = [...prevValue];
                d[updateIndex] = e;
                return d;
              });
            }
          }
          setModalOpen(false);
        }}
        setModalOpen={setModalOpen}
        title={title}
      />
    </div>
  ) : (
    <ErrorScreen statusCode={401} />
  );
}

export async function getServerSideProps({ locale }: any) {
  let data = await prisma.content.findFirst({});

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default AboutPage;
