import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription, fileUrl } from "@/types/const";
import { useSession } from "next-auth/react";
import { Content, Role } from "@prisma/client";
import ErrorScreen from "@/components/screen/ErrorScreen";
import prisma from "@/prisma/prisma";
import { useRouter } from "next/router";
import { FeatureType } from "@/types/pageType";
import { IconPickerItem } from "react-fa-icon-picker";
import { getText } from "@/util/textHelper";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import FeaturesModal from "@/components/modal/sideModal/FeaturesModal";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import Image from "next/image";
import { ImgType } from "@/types/orderTypes";
import SingleGalleryModal from "@/components/modal/sideModal/SingleGalleryModal";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/presentational/FormInput";
import FormInputTextArea from "@/components/presentational/FormInputTextArea";
import { getHeaders } from "@/util/authHelper";
import SingleUploadModal from "@/components/modal/sideModal/SingleUploadModal";
import ImgFeaturesModal from "@/components/modal/sideModal/ImgFeatureModal";

enum SiteImg {
  Home,
  Sell,
  Login,
  Register,
  SellRegister,
  Mobile,
}

enum Page {
  Home,
  Membership,
  Credentials,
  Forgot,
  About,
}

function ContactPage({ data }: { data: Content }) {
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  const router = useRouter();
  const { locale } = router;
  const [isSubmit, setSubmit] = React.useState(false);

  const [features, setFeatures] = React.useState<any[]>(
    data?.membershipFeatures ? data.membershipFeatures : []
  );
  const [credentialFeatures, setCredentialFeatures] = React.useState<any[]>(
    data?.credentialFeatures ? data.credentialFeatures : []
  );
  const [imgType, setImgType] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [feature, setFeature] = React.useState<FeatureType>();
  const [imgFeature, setImgFeature] = React.useState<FeatureType>();
  const [updateIndex, setUpdateIndex] = React.useState(-1);
  const [currentTab, setCurrentTab] = React.useState(Page.Home);
  const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
  const [content, setContent] = React.useState<any>(data);
  const [isImgModalOpen, setImgModalOpen] = React.useState(false);

  const schema = z.object({
    homeHeroSectionDescription: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    homeHeroSectionDescriptionMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),

    auctionHeroSectionTitle: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    auctionHeroSectionTitleMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    auctionHeroSectionDescription: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    auctionHeroSectionDescriptionMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),

    featuredHeroSectionTitle: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    featuredHeroSectionTitleMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    featuredHeroSectionDescription: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    featuredHeroSectionDescriptionMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),

    promotionHeroSectionTitle: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    promotionHeroSectionTitleMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    promotionHeroSectionDescription: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    promotionHeroSectionDescriptionMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),

    membershipTitle: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    membershipTitleMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    membershipDescription: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    membershipDescriptionMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),

    mobileHeroSectionTitle: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    mobileHeroSectionTitleMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    mobileHeroSectionDescription: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    mobileHeroSectionDescriptionMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),

    aboutTitle: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    aboutTitleMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    aboutDescription: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    aboutDescriptionMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
  });

  const { register, handleSubmit, watch, formState, reset } = useForm<Content>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: data,
  });
  const { errors } = formState;
  const watchFields = watch();

  React.useEffect(() => {
    if (data) {
      setContent(data);
    } else {
      setContent({});
    }
  }, [data]);

  async function submit(data: any) {
    setSubmit(true);

    let b: any = { ...content, ...data };
    if (features) {
      b.membershipFeatures = features;
    }
    if (credentialFeatures) {
      b.credentialFeatures = credentialFeatures;
    }
    if (b.id) {
      delete b.id;
    }

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
        <title>Site Management | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto max-w-screen-xl px-4 py-8">
        <form
          onSubmit={handleSubmit(submit)}
          className="rounded-md bg-white p-5"
        >
          <h3 className="text-lg font-semibold text-gray-700">
            Customize Site Information
          </h3>
          <div className="flex flex-col mt-5 justify-between gap-5">
            <div className="tabs">
              <div
                className={
                  currentTab === Page.Home
                    ? "tab tab-bordered border-primary text-primary font-semibold"
                    : "tab tab-bordered"
                }
                onClick={() => {
                  setCurrentTab(Page.Home);
                }}
              >
                Home Page
              </div>
              <div
                className={
                  currentTab === Page.Membership
                    ? "tab tab-bordered border-primary text-primary font-semibold"
                    : "tab tab-bordered"
                }
                onClick={() => {
                  setCurrentTab(Page.Membership);
                }}
              >
                Membership Page
              </div>
              <div
                className={
                  currentTab === Page.Credentials
                    ? "tab tab-bordered border-primary text-primary font-semibold"
                    : "tab tab-bordered"
                }
                onClick={() => {
                  setCurrentTab(Page.Credentials);
                }}
              >
                Credentials Page
              </div>
              <div
                className={
                  currentTab === Page.Forgot
                    ? "tab tab-bordered border-primary text-primary font-semibold"
                    : "tab tab-bordered"
                }
                onClick={() => {
                  setCurrentTab(Page.Forgot);
                }}
              >
                Forgot Page
              </div>
              <div
                className={
                  currentTab === Page.About
                    ? "tab tab-bordered border-primary text-primary font-semibold"
                    : "tab tab-bordered"
                }
                onClick={() => {
                  setCurrentTab(Page.About);
                }}
              >
                About Page
              </div>
            </div>
            {currentTab === Page.Home ? (
              <div className="mt-5 flex flex-col gap-5">
                <details className="group">
                  <summary className="flex flex-row cursor-pointer">
                    <h3 className="ml-3 text-sm font-semibold text-gray-700">
                      Home Hero Section
                    </h3>
                    <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div
                    role="homeHero"
                    className="space-y-8 md:space-y-0 md:space-x-8 md:flex md:items-center bg-gray-100 p-3 mt-3"
                  >
                    <div className="flex flex-row w-full gap-3">
                      <div className="flex-1 flex flex-col gap-3">
                        <FormInputTextArea
                          label={"Home Description (ENG)"}
                          optional={true}
                          placeHolder={"Enter Home Description (ENG)"}
                          error={errors.homeHeroSectionDescription?.message}
                          defaultValue={data?.homeHeroSectionDescription}
                          formControl={{
                            ...register("homeHeroSectionDescription"),
                          }}
                          currentValue={watchFields.homeHeroSectionDescription}
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        <FormInputTextArea
                          label={"Home Description (MM)"}
                          optional={true}
                          placeHolder={"Enter Home Description (MM)"}
                          error={errors.homeHeroSectionDescriptionMM?.message}
                          defaultValue={data?.homeHeroSectionDescriptionMM}
                          formControl={{
                            ...register("homeHeroSectionDescriptionMM"),
                          }}
                          currentValue={
                            watchFields.homeHeroSectionDescriptionMM
                          }
                        />
                      </div>
                    </div>

                    {content?.homeHeroImg ? (
                      <Image
                        src={fileUrl + encodeURIComponent(content?.homeHeroImg)}
                        alt="Home Hero Image"
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        width={400}
                        height={400}
                      />
                    ) : data?.homeHeroImg ? (
                      <Image
                        src={fileUrl + encodeURIComponent(data?.homeHeroImg)}
                        alt="Home Hero Image"
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        width={400}
                        height={400}
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        onClick={() => {
                          setUploadModalOpen(true);
                          setImgType("homeHeroImg");
                        }}
                      >
                        <svg
                          className="w-12 h-12 text-gray-200"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 640 512"
                        >
                          <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
                        </svg>
                      </div>
                    )}
                    <span className="sr-only">Loading...</span>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex flex-row cursor-pointer">
                    <h3 className="ml-3 text-sm font-semibold text-gray-700">
                      Auction Hero Section
                    </h3>
                    <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div
                    role="actionHero"
                    className="space-y-8 md:space-y-0 md:space-x-8 md:flex md:items-center bg-gray-100 p-3 mt-3"
                  >
                    <div className="flex flex-row w-full gap-3">
                      <div className="flex-1 flex flex-col gap-3">
                        <FormInput
                          label={"Auction Title (EN)"}
                          placeHolder={"Enter Auction Title (EN)"}
                          error={errors.auctionHeroSectionTitle?.message}
                          type="text"
                          defaultValue={data?.auctionHeroSectionTitle}
                          formControl={{
                            ...register("auctionHeroSectionTitle"),
                          }}
                          currentValue={watchFields.auctionHeroSectionTitle}
                          optional={true}
                        />
                        <FormInputTextArea
                          label={"Auction Description (ENG)"}
                          optional={true}
                          placeHolder={"Enter Auction Description (ENG)"}
                          error={errors.auctionHeroSectionDescription?.message}
                          defaultValue={data?.auctionHeroSectionDescription}
                          formControl={{
                            ...register("auctionHeroSectionDescription"),
                          }}
                          currentValue={
                            watchFields.auctionHeroSectionDescription
                          }
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        <FormInput
                          label={"Auction Title (MM)"}
                          placeHolder={"Enter Auction Title (MM)"}
                          error={errors.auctionHeroSectionTitleMM?.message}
                          type="text"
                          defaultValue={data?.auctionHeroSectionTitleMM}
                          formControl={{
                            ...register("auctionHeroSectionTitleMM"),
                          }}
                          currentValue={watchFields.auctionHeroSectionTitleMM}
                          optional={true}
                        />
                        <FormInputTextArea
                          label={"Auction Description (MM)"}
                          optional={true}
                          placeHolder={"Enter Auction Description (MM)"}
                          error={
                            errors.auctionHeroSectionDescriptionMM?.message
                          }
                          defaultValue={data?.auctionHeroSectionDescriptionMM}
                          formControl={{
                            ...register("auctionHeroSectionDescriptionMM"),
                          }}
                          currentValue={
                            watchFields.auctionHeroSectionDescriptionMM
                          }
                        />
                      </div>
                    </div>

                    {content?.auctionHeroImg ? (
                      <Image
                        src={
                          fileUrl + encodeURIComponent(content?.auctionHeroImg)
                        }
                        alt="Auction Hero Image"
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        width={400}
                        height={400}
                      />
                    ) : data?.auctionHeroImg ? (
                      <Image
                        src={fileUrl + encodeURIComponent(data?.auctionHeroImg)}
                        alt="Auction Hero Image"
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        width={400}
                        height={400}
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        onClick={() => {
                          setUploadModalOpen(true);
                          setImgType("auctionHeroImg");
                        }}
                      >
                        <svg
                          className="w-12 h-12 text-gray-200"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 640 512"
                        >
                          <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
                        </svg>
                      </div>
                    )}
                    <span className="sr-only">Loading...</span>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex flex-row cursor-pointer">
                    <h3 className="ml-3 text-sm font-semibold text-gray-700">
                      Feature Hero Section
                    </h3>
                    <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </summary>

                  <div
                    role="featureHero"
                    className="space-y-8 md:space-y-0 md:space-x-8 md:flex md:items-center bg-gray-100 p-3 mt-3"
                  >
                    <div className="flex flex-row w-full gap-3">
                      <div className="flex-1 flex flex-col gap-3">
                        <FormInput
                          label={"Featured Title (EN)"}
                          placeHolder={"Enter Featured Title (EN)"}
                          error={errors.featuredHeroSectionTitle?.message}
                          type="text"
                          defaultValue={data?.featuredHeroSectionTitle}
                          formControl={{
                            ...register("featuredHeroSectionTitle"),
                          }}
                          currentValue={watchFields.featuredHeroSectionTitle}
                          optional={true}
                        />
                        <FormInputTextArea
                          label={"Featured Description (ENG)"}
                          optional={true}
                          placeHolder={"Enter Featured Description (ENG)"}
                          error={errors.featuredHeroSectionDescription?.message}
                          defaultValue={data?.featuredHeroSectionDescription}
                          formControl={{
                            ...register("featuredHeroSectionDescription"),
                          }}
                          currentValue={
                            watchFields.featuredHeroSectionDescription
                          }
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        <FormInput
                          label={"Feature Title (MM)"}
                          placeHolder={"Enter Feature Title (MM)"}
                          error={errors.featuredHeroSectionTitleMM?.message}
                          type="text"
                          defaultValue={data?.featuredHeroSectionTitleMM}
                          formControl={{
                            ...register("featuredHeroSectionTitleMM"),
                          }}
                          currentValue={watchFields.featuredHeroSectionTitleMM}
                          optional={true}
                        />
                        <FormInputTextArea
                          label={"Featured Description (MM)"}
                          optional={true}
                          placeHolder={"Enter Featured Description (MM)"}
                          error={
                            errors.featuredHeroSectionDescriptionMM?.message
                          }
                          defaultValue={data?.featuredHeroSectionDescriptionMM}
                          formControl={{
                            ...register("featuredHeroSectionDescriptionMM"),
                          }}
                          currentValue={
                            watchFields.featuredHeroSectionDescriptionMM
                          }
                        />
                      </div>
                    </div>

                    {content?.featureHeroImg ? (
                      <Image
                        src={
                          fileUrl + encodeURIComponent(content?.featureHeroImg)
                        }
                        alt="Featured Hero Image"
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        width={400}
                        height={400}
                      />
                    ) : data?.featureHeroImg ? (
                      <Image
                        src={fileUrl + encodeURIComponent(data?.featureHeroImg)}
                        alt="Featured Hero Image"
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        width={400}
                        height={400}
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        onClick={() => {
                          setUploadModalOpen(true);
                          setImgType("featureHeroImg");
                        }}
                      >
                        <svg
                          className="w-12 h-12 text-gray-200"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 640 512"
                        >
                          <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
                        </svg>
                      </div>
                    )}
                    <span className="sr-only">Loading...</span>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex flex-row cursor-pointer">
                    <h3 className="ml-3 text-sm font-semibold text-gray-700">
                      Promotion Hero Section
                    </h3>
                    <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </summary>

                  <div
                    role="promotionHero"
                    className="space-y-8 md:space-y-0 md:space-x-8 md:flex md:items-center bg-gray-100 p-3 mt-3"
                  >
                    <div className="flex flex-row w-full gap-3">
                      <div className="flex-1 flex flex-col gap-3">
                        <FormInput
                          label={"Promotion Title (EN)"}
                          placeHolder={"Enter Promotion Title (EN)"}
                          error={errors.promotionHeroSectionTitle?.message}
                          type="text"
                          defaultValue={data?.promotionHeroSectionTitle}
                          formControl={{
                            ...register("promotionHeroSectionTitle"),
                          }}
                          currentValue={watchFields.promotionHeroSectionTitle}
                          optional={true}
                        />
                        <FormInputTextArea
                          label={"Promotion Description (ENG)"}
                          optional={true}
                          placeHolder={"Enter Promotion Description (ENG)"}
                          error={
                            errors.promotionHeroSectionDescription?.message
                          }
                          defaultValue={data?.promotionHeroSectionDescription}
                          formControl={{
                            ...register("promotionHeroSectionDescription"),
                          }}
                          currentValue={
                            watchFields.promotionHeroSectionDescription
                          }
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        <FormInput
                          label={"Promotion Title (MM)"}
                          placeHolder={"Enter Promotion Title (MM)"}
                          error={errors.promotionHeroSectionTitleMM?.message}
                          type="text"
                          defaultValue={data?.promotionHeroSectionTitleMM}
                          formControl={{
                            ...register("promotionHeroSectionTitleMM"),
                          }}
                          currentValue={watchFields.promotionHeroSectionTitleMM}
                          optional={true}
                        />
                        <FormInputTextArea
                          label={"Promotion Description (MM)"}
                          optional={true}
                          placeHolder={"Enter Promotion Description (MM)"}
                          error={
                            errors.promotionHeroSectionDescriptionMM?.message
                          }
                          defaultValue={data?.promotionHeroSectionDescriptionMM}
                          formControl={{
                            ...register("promotionHeroSectionDescriptionMM"),
                          }}
                          currentValue={
                            watchFields.promotionHeroSectionDescriptionMM
                          }
                        />
                      </div>
                    </div>

                    {content?.promotionHeroImg ? (
                      <Image
                        src={
                          fileUrl +
                          encodeURIComponent(content?.promotionHeroImg)
                        }
                        alt="Promotion Hero Image"
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        width={400}
                        height={400}
                      />
                    ) : data?.promotionHeroImg ? (
                      <Image
                        src={
                          fileUrl + encodeURIComponent(data?.promotionHeroImg)
                        }
                        alt="Promotion Hero Image"
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        width={400}
                        height={400}
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        onClick={() => {
                          setUploadModalOpen(true);
                          setImgType("promotionHeroImg");
                        }}
                      >
                        <svg
                          className="w-12 h-12 text-gray-200"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 640 512"
                        >
                          <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
                        </svg>
                      </div>
                    )}
                    <span className="sr-only">Loading...</span>
                  </div>
                </details>

                {/* <details className="group">
                  <summary className="flex flex-row cursor-pointer">
                    <h3 className="ml-3 text-sm font-semibold text-gray-700">
                      Mobile Hero Section
                    </h3>
                    <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </summary>

                  <div
                    role="mobileHero"
                    className="space-y-8 md:space-y-0 md:space-x-8 md:flex md:items-center bg-gray-100 p-3 mt-3"
                  >
                    <div className="flex flex-row w-full gap-3">
                      <div className="flex-1 flex flex-col gap-3">
                        <FormInput
                          label={"Mobile Title (EN)"}
                          placeHolder={"Enter Mobile Title (EN)"}
                          error={errors.mobileHeroSectionTitle?.message}
                          type="text"
                          defaultValue={data?.mobileHeroSectionTitle}
                          formControl={{
                            ...register("mobileHeroSectionTitle"),
                          }}
                          currentValue={watchFields.mobileHeroSectionTitle}
                          optional={true}
                        />
                        <FormInputTextArea
                          label={"Mobile Description (ENG)"}
                          optional={true}
                          placeHolder={"Enter Mobile Description (ENG)"}
                          error={errors.mobileHeroSectionDescription?.message}
                          defaultValue={data?.mobileHeroSectionDescription}
                          formControl={{
                            ...register("mobileHeroSectionDescription"),
                          }}
                          currentValue={
                            watchFields.mobileHeroSectionDescription
                          }
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        <FormInput
                          label={"Mobile Title (MM)"}
                          placeHolder={"Enter Mobile Title (MM)"}
                          error={errors.mobileHeroSectionTitleMM?.message}
                          type="text"
                          defaultValue={data?.mobileHeroSectionTitleMM}
                          formControl={{
                            ...register("mobileHeroSectionTitleMM"),
                          }}
                          currentValue={watchFields.mobileHeroSectionTitleMM}
                          optional={true}
                        />
                        <FormInputTextArea
                          label={"Mobile Description (MM)"}
                          optional={true}
                          placeHolder={"Enter Mobile Description (MM)"}
                          error={errors.mobileHeroSectionDescriptionMM?.message}
                          defaultValue={data?.mobileHeroSectionDescriptionMM}
                          formControl={{
                            ...register("mobileHeroSectionDescriptionMM"),
                          }}
                          currentValue={
                            watchFields.mobileHeroSectionDescriptionMM
                          }
                        />
                      </div>
                    </div>

                    {content?.mobileImg ? (
                      <Image
                        src={fileUrl + encodeURIComponent(content?.mobileImg)}
                        alt="Mobile Hero Image"
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        width={400}
                        height={400}
                      />
                    ) : data?.mobileImg ? (
                      <Image
                        src={fileUrl + encodeURIComponent(data?.mobileImg)}
                        alt="Mobile Hero Image"
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        width={400}
                        height={400}
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        onClick={() => {
                          setUploadModalOpen(true);
                          setImgType("mobileImg");
                        }}
                      >
                        <svg
                          className="w-12 h-12 text-gray-200"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 640 512"
                        >
                          <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
                        </svg>
                      </div>
                    )}
                    <span className="sr-only">Loading...</span>
                  </div>
                </details> */}
              </div>
            ) : currentTab === Page.Membership ? (
              <div className="mt-5 flex flex-col gap-5">
                <details className="group">
                  <summary className="flex flex-row cursor-pointer">
                    <h3 className="ml-3 text-sm font-semibold text-gray-700">
                      Membership Hero Section
                    </h3>
                    <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div
                    role="membershipHero"
                    className="space-y-8 md:space-y-0 md:space-x-8 md:flex md:items-center bg-gray-100 p-3 mt-3"
                  >
                    <div className="flex flex-row w-full gap-3">
                      <div className="flex-1 flex flex-col gap-3">
                        <FormInput
                          label={"Membership Title (EN)"}
                          placeHolder={"Enter Membership Title (EN)"}
                          error={errors.membershipTitle?.message}
                          type="text"
                          defaultValue={data?.membershipTitle}
                          formControl={{
                            ...register("membershipTitle"),
                          }}
                          currentValue={watchFields.membershipTitle}
                          optional={true}
                        />
                        <FormInputTextArea
                          label={"Membership Description (ENG)"}
                          optional={true}
                          placeHolder={"Enter Membership Description (ENG)"}
                          error={errors.membershipDescription?.message}
                          defaultValue={data?.membershipDescription}
                          formControl={{
                            ...register("membershipDescription"),
                          }}
                          currentValue={watchFields.membershipDescription}
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        <FormInput
                          label={"Membership Title (MM)"}
                          placeHolder={"Enter Membership Title (MM)"}
                          error={errors.membershipTitleMM?.message}
                          type="text"
                          defaultValue={data?.membershipTitleMM}
                          formControl={{
                            ...register("membershipTitleMM"),
                          }}
                          currentValue={watchFields.membershipTitleMM}
                          optional={true}
                        />
                        <FormInputTextArea
                          label={"Membership Description (MM)"}
                          optional={true}
                          placeHolder={"Enter Membership Description (MM)"}
                          error={errors.membershipDescriptionMM?.message}
                          defaultValue={data?.membershipDescriptionMM}
                          formControl={{
                            ...register("membershipDescriptionMM"),
                          }}
                          currentValue={watchFields.membershipDescriptionMM}
                        />
                      </div>
                    </div>

                    {content?.membershipHeroImg ? (
                      <Image
                        src={
                          fileUrl +
                          encodeURIComponent(content?.membershipHeroImg)
                        }
                        alt="Membership Hero Image"
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        width={400}
                        height={400}
                      />
                    ) : data?.membershipHeroImg ? (
                      <Image
                        src={
                          fileUrl + encodeURIComponent(data?.promotionHeroImg)
                        }
                        alt="Membership Hero Image"
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        width={400}
                        height={400}
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                        onClick={() => {
                          setUploadModalOpen(true);
                          setImgType("membershipHeroImg");
                        }}
                      >
                        <svg
                          className="w-12 h-12 text-gray-200"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 640 512"
                        >
                          <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
                        </svg>
                      </div>
                    )}
                    <span className="sr-only">Loading...</span>
                  </div>
                </details>
                <div className="flex flex-col gap-3 border-t pt-5 ml-3">
                  <div className="flex flex-row items-center gap-3">
                    <h3 className="text-semibold text-sm">
                      Membership Features
                    </h3>
                    <button
                      className="rounded-full bg-primary/20 p-0.5 text-primary hover:bg-primary-focus hover:text-white"
                      type="button"
                      onClick={(evt) => {
                        evt.stopPropagation();
                        setModalOpen(true);
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
              </div>
            ) : currentTab === Page.Credentials ? (
              <div className="mt-5 flex flex-col gap-5">
                <div className="flex flex-col gap-3 ml-3">
                  <div className="flex flex-row items-center gap-3">
                    <h3 className="text-semibold text-sm">
                      Credentials Banner
                    </h3>
                    <button
                      className="rounded-full bg-primary/20 p-0.5 text-primary hover:bg-primary-focus hover:text-white"
                      type="button"
                      onClick={(evt) => {
                        evt.stopPropagation();
                        setImgModalOpen(true);
                        setTitle("Create Credentials");
                        setImgFeature(undefined);
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
                    {credentialFeatures.map((e: any, index: number) => (
                      <div
                        className="flex cursor-pointer flex-col items-center space-y-3 rounded-md bg-primary/10 px-3 py-2 hover:bg-primary/30"
                        key={index}
                      >
                        <span className="p-2 text-primary">
                          <Image
                            alt=""
                            src={fileUrl + encodeURIComponent(e.icon)}
                            width={100}
                            height={100}
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
                              setImgModalOpen(true);
                              setTitle("Update Credential Feature");
                              setImgFeature(e);
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
                                  setCredentialFeatures((prevValue) => {
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
            ) : currentTab === Page.Forgot ? (
              <div className="mt-5 flex flex-col gap-5">
                {content?.forgotPwdImg ? (
                  <Image
                    src={fileUrl + encodeURIComponent(content?.forgotPwdImg)}
                    alt="Forgot Hero Image"
                    className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                    width={400}
                    height={400}
                  />
                ) : data?.forgotPwdImg ? (
                  <Image
                    src={fileUrl + encodeURIComponent(data?.forgotPwdImg)}
                    alt="Forgot Hero Image"
                    className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                    width={400}
                    height={400}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96"
                    onClick={() => {
                      setUploadModalOpen(true);
                      setImgType("forgotPwdImg");
                    }}
                  >
                    <svg
                      className="w-12 h-12 text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 640 512"
                    >
                      <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
                    </svg>
                  </div>
                )}
              </div>
            ) : currentTab === Page.About ? (
              <div className="mt-5 flex flex-col gap-5">
                <details className="group">
                  <summary className="flex flex-row cursor-pointer">
                    <h3 className="ml-3 text-sm font-semibold text-gray-700">
                      About Hero Section
                    </h3>
                    <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div
                    role="aboutHero"
                    className="space-y-8 md:space-y-0 md:space-x-8 md:flex md:items-center bg-gray-100 p-3 mt-3"
                  >
                    <div className="flex flex-row w-full gap-3">
                      <div className="flex-1 gap-3 flex flex-col">
                        <FormInput
                          label={"About Title (EN)"}
                          placeHolder={"Enter About Title (EN)"}
                          error={errors.aboutTitle?.message}
                          type="text"
                          defaultValue={data?.aboutTitle}
                          formControl={{
                            ...register("aboutTitle"),
                          }}
                          currentValue={watchFields.aboutTitle}
                          optional={true}
                        />
                        <FormInputTextArea
                          label={"About Description (ENG)"}
                          optional={true}
                          placeHolder={"Enter About Description (ENG)"}
                          error={errors.aboutDescription?.message}
                          defaultValue={data?.aboutDescription}
                          formControl={{
                            ...register("aboutDescription"),
                          }}
                          currentValue={watchFields.aboutDescription}
                        />
                      </div>
                      <div className="flex-1 gap-3 flex flex-col">
                        <FormInput
                          label={"About Title (MM)"}
                          placeHolder={"Enter About Title (MM)"}
                          error={errors.aboutTitleMM?.message}
                          type="text"
                          defaultValue={data?.aboutTitleMM}
                          formControl={{
                            ...register("aboutTitleMM"),
                          }}
                          currentValue={watchFields.aboutTitleMM}
                          optional={true}
                        />
                        <FormInputTextArea
                          label={"About Description (MM)"}
                          optional={true}
                          placeHolder={"Enter About Description (MM)"}
                          error={errors.aboutDescriptionMM?.message}
                          defaultValue={data?.aboutDescriptionMM}
                          formControl={{
                            ...register("aboutDescriptionMM"),
                          }}
                          currentValue={watchFields.aboutDescriptionMM}
                        />
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="flex w-full justify-end mt-5">
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
            setFeatures((prevValue) => {
              return [...prevValue, e];
            });
          } else {
            setFeatures((prevValue) => {
              let d = [...prevValue];
              d[updateIndex] = e;
              return d;
            });
          }
          setModalOpen(false);
        }}
        setModalOpen={setModalOpen}
        title={title}
      />
      <ImgFeaturesModal
        feature={imgFeature}
        isModalOpen={isImgModalOpen}
        onClickFn={(e: FeatureType) => {
          if (updateIndex === -1) {
            setCredentialFeatures((prevValue) => {
              return [...prevValue, e];
            });
          } else {
            setCredentialFeatures((prevValue) => {
              let d = [...prevValue];
              d[updateIndex] = e;
              return d;
            });
          }
          setImgModalOpen(false);
        }}
        setModalOpen={setImgModalOpen}
        title={title}
      />
      <SingleUploadModal
        type={ImgType.SiteManagement}
        isModalOpen={uploadModalOpen}
        setModalOpen={setUploadModalOpen}
        setFileSrc={(e: string) => {
          setContent((prevValue: any) => {
            let d = { ...prevValue };
            d[imgType] = e;
            return d;
          });
        }}
      />
    </div>
  ) : (
    <ErrorScreen statusCode={401} />
  );
}

export async function getServerSideProps({ locale }: any) {
  let data = await prisma.content.findFirst({});

  Object.keys(data).forEach((i) =>
    data[i] === null ? (data[i] = "") : data[i]
  );

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default ContactPage;
