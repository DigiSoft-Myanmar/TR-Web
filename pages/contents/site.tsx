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

enum SiteImg {
  Home,
  Sell,
  Login,
  Register,
  SellRegister,
  Mobile,
}

function ContactPage({ data }: { data: any }) {
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  const router = useRouter();
  const { locale } = router;
  const [isSubmit, setSubmit] = React.useState(false);
  const [homeImg, setHomeImg] = React.useState<any>();
  const [sellImg, setSellImg] = React.useState<any>();
  const [sellRegImg, setSellRegImg] = React.useState<any>();
  const [loginImg, setLoginImg] = React.useState<any>();
  const [mobileImg, setMobileImg] = React.useState<any>();

  const [registerImg, setRegisterImg] = React.useState<any>();
  const [homeBannerImg, setHomeBannerImg] = React.useState(data?.homeBannerImg);
  const [sellBannerImg, setSellBannerImg] = React.useState(data?.sellBannerImg);
  const [loginBannerImg, setLoginBannerImg] = React.useState(data?.loginImg);
  const [registerBannerImg, setRegisterBannerImg] = React.useState(
    data?.registerImg
  );
  const [sellRegisterImg, setSellRegisterImg] = React.useState(
    data?.sellRegisterImg
  );
  const [mobileBannerImg, setMobileBannerImg] = React.useState<any>(
    data?.mobileImg
  );

  const [features, setFeatures] = React.useState<FeatureType[]>(
    data?.howToOrder ? data.howToOrder : []
  );
  const [title, setTitle] = React.useState("");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [feature, setFeature] = React.useState<FeatureType>();
  const [updateIndex, setUpdateIndex] = React.useState(-1);
  const [imgType, setImgType] = React.useState(SiteImg.Home);
  const [isGalleryModalOpen, setGalleryModalOpen] = React.useState(false);

  const schema = z.object({
    homeTitle: z.string().min(1, { message: t("inputError") }),
    homeTitleMM: z.string().min(1, { message: t("inputError") }),
    homeDescription: z.string().min(1, { message: t("inputError") }),
    homeDescriptionMM: z.string().min(1, { message: t("inputError") }),

    sellTitle: z.string().min(1, { message: t("inputError") }),
    sellTitleMM: z.string().min(1, { message: t("inputError") }),
    sellDescription: z.string().min(1, { message: t("inputError") }),
    sellDescriptionMM: z.string().min(1, { message: t("inputError") }),

    mobileTitle: z.string().min(1, { message: t("inputError") }),
    mobileTitleMM: z.string().min(1, { message: t("inputError") }),
    mobileDescription: z.string().min(1, { message: t("inputError") }),
    mobileDescriptionMM: z.string().min(1, { message: t("inputError") }),
  });

  const { register, handleSubmit, watch, formState, reset } = useForm<any>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: data,
  });
  const { errors } = formState;
  const watchFields = watch();

  async function submit(data: any) {
    setSubmit(true);
    const uploadImg = await Promise.all([
      uploadHomeBanner(),
      uploadSellBanner(),
      uploadLoginBanner(),
      uploadRegisterBanner(),
      uploadSellRegisterBanner(),
      uploadMobileBanner(),
    ]);
    let b: any = { howToOrder: features, ...data };
    if (homeImg) {
      b.homeBannerImg = uploadImg[0];
    } else {
      b.homeBannerImg = homeBannerImg;
    }
    if (sellImg) {
      b.sellBannerImg = uploadImg[1];
    } else {
      b.sellBannerImg = sellBannerImg;
    }
    if (loginImg) {
      b.loginImg = uploadImg[2];
    } else {
      b.loginImg = loginBannerImg;
    }
    if (registerImg) {
      b.registerImg = uploadImg[3];
    } else {
      b.registerImg = registerBannerImg;
    }
    if (sellRegImg) {
      b.sellRegisterImg = uploadImg[4];
    } else {
      b.sellRegisterImg = sellRegisterImg;
    }
    if (mobileImg) {
      b.mobileImg = uploadImg[5];
    } else {
      b.mobileImg = mobileBannerImg;
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

  async function uploadHomeBanner() {
    if (homeImg) {
      const FormData = require("form-data");
      let form = new FormData();
      form.append("theFiles", homeImg);

      let res = fetch("/api/gallery?type=" + ImgType.SiteManagement, {
        method: "POST",
        body: form,
        headers: getHeaders(session),
      })
        .then((data) => {
          if (data.status === 200) {
            return data.json();
          } else {
            if (data.status === 413) {
              showErrorDialog(t("fileTooLarge"));
            } else {
              showErrorDialog(data.statusText);
            }
          }
        })
        .then((json) => {
          if (json && json.filesData) {
            let filesData = [...json.filesData];
            let imgArr = filesData.map((elem) => `${elem.filename}`);
            return imgArr[0];
          } else {
            return "";
          }
        });
      return res;
    } else {
      return "";
    }
  }

  async function uploadSellBanner() {
    if (sellImg) {
      const FormData = require("form-data");
      let form = new FormData();
      form.append("theFiles", sellImg);

      let res = fetch("/api/gallery?type=" + ImgType.SiteManagement, {
        method: "POST",
        body: form,
        headers: getHeaders(session),
      })
        .then((data) => {
          if (data.status === 200) {
            return data.json();
          } else {
            if (data.status === 413) {
              showErrorDialog(t("fileTooLarge"));
            } else {
              showErrorDialog(data.statusText);
            }
          }
        })
        .then((json) => {
          if (json && json.filesData) {
            let filesData = [...json.filesData];
            let imgArr = filesData.map((elem) => `${elem.filename}`);
            return imgArr[0];
          } else {
            return "";
          }
        });
      return res;
    } else {
      return "";
    }
  }

  async function uploadLoginBanner() {
    if (loginImg) {
      const FormData = require("form-data");
      let form = new FormData();
      form.append("theFiles", loginImg);

      let res = fetch("/api/gallery?type=" + ImgType.SiteManagement, {
        method: "POST",
        body: form,
        headers: getHeaders(session),
      })
        .then((data) => {
          if (data.status === 200) {
            return data.json();
          } else {
            if (data.status === 413) {
              showErrorDialog(t("fileTooLarge"));
            } else {
              showErrorDialog(data.statusText);
            }
          }
        })
        .then((json) => {
          if (json && json.filesData) {
            let filesData = [...json.filesData];
            let imgArr = filesData.map((elem) => `${elem.filename}`);
            return imgArr[0];
          } else {
            return "";
          }
        });
      return res;
    } else {
      return "";
    }
  }

  async function uploadRegisterBanner() {
    if (registerImg) {
      const FormData = require("form-data");
      let form = new FormData();
      form.append("theFiles", registerImg);

      let res = fetch("/api/gallery?type=" + ImgType.SiteManagement, {
        method: "POST",
        body: form,
        headers: getHeaders(session),
      })
        .then((data) => {
          if (data.status === 200) {
            return data.json();
          } else {
            if (data.status === 413) {
              showErrorDialog(t("fileTooLarge"));
            } else {
              showErrorDialog(data.statusText);
            }
          }
        })
        .then((json) => {
          if (json && json.filesData) {
            let filesData = [...json.filesData];
            let imgArr = filesData.map((elem) => `${elem.filename}`);
            return imgArr[0];
          } else {
            return "";
          }
        });
      return res;
    } else {
      return "";
    }
  }

  async function uploadSellRegisterBanner() {
    if (sellRegImg) {
      const FormData = require("form-data");
      let form = new FormData();
      form.append("theFiles", sellRegImg);

      let res = fetch("/api/gallery?type=" + ImgType.SiteManagement, {
        method: "POST",
        body: form,
        headers: getHeaders(session),
      })
        .then((data) => {
          if (data.status === 200) {
            return data.json();
          } else {
            if (data.status === 413) {
              showErrorDialog(t("fileTooLarge"));
            } else {
              showErrorDialog(data.statusText);
            }
          }
        })
        .then((json) => {
          if (json && json.filesData) {
            let filesData = [...json.filesData];
            let imgArr = filesData.map((elem) => `${elem.filename}`);
            return imgArr[0];
          } else {
            return "";
          }
        });
      return res;
    } else {
      return "";
    }
  }

  async function uploadMobileBanner() {
    if (mobileImg) {
      const FormData = require("form-data");
      let form = new FormData();
      form.append("theFiles", mobileImg);

      let res = fetch("/api/gallery?type=" + ImgType.SiteManagement, {
        method: "POST",
        body: form,
        headers: getHeaders(session),
      })
        .then((data) => {
          if (data.status === 200) {
            return data.json();
          } else {
            if (data.status === 413) {
              showErrorDialog(t("fileTooLarge"));
            } else {
              showErrorDialog(data.statusText);
            }
          }
        })
        .then((json) => {
          if (json && json.filesData) {
            let filesData = [...json.filesData];
            let imgArr = filesData.map((elem) => `${elem.filename}`);
            return imgArr[0];
          } else {
            return "";
          }
        });
      return res;
    } else {
      return "";
    }
  }

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>Site Management | Pyi Twin Phyit</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto max-w-screen-xl px-4 py-8">
        <form
          onSubmit={handleSubmit(submit)}
          className="rounded-md bg-white p-5"
        >
          <div className="flex flex-row flex-wrap items-stretch justify-center gap-5">
            <div className="flex flex-col items-center">
              <div className="mb-3 flex flex-row items-center gap-3">
                <span className="p-2 text-xs">Banner Image for Home Page</span>
                <button
                  className="rounded-full bg-primary/20 p-0.5 text-primary hover:bg-primary-focus hover:text-white"
                  type="button"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    setGalleryModalOpen(true);
                    setImgType(SiteImg.Home);
                  }}
                >
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
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </button>
              </div>
              {homeImg ? (
                <div className="relative flex cursor-pointer flex-row items-center justify-center">
                  <Image
                    src={URL.createObjectURL(homeImg)}
                    width={500}
                    height={200}
                    alt="Profile"
                    quality={100}
                    className="h-[200px] w-full rounded-md border p-2"
                  />
                  <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setHomeImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </label>
                </div>
              ) : homeBannerImg ? (
                <div className="relative flex cursor-pointer flex-row items-center justify-center">
                  <Image
                    src={fileUrl + homeBannerImg}
                    width={500}
                    height={200}
                    alt="Home Banner"
                    quality={100}
                    className="h-[200px] w-full rounded-md border p-2"
                  />
                  <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setHomeImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </label>
                </div>
              ) : (
                <div className="flex w-full justify-center">
                  <label className="relative flex h-[200px] w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-gray-200">
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
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setHomeImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <span className="absolute bottom-0 right-0 flex w-fit items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </span>
                  </label>
                </div>
              )}
              {!data?.homeBannerImg && homeImg === undefined && (
                <span className="mt-3 p-2 text-xs text-error">
                  Input Banner Image for Home Page
                </span>
              )}
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-3 flex flex-row items-center gap-3">
                <span className="p-2 text-xs">Banner Image for Sell Page</span>
                <button
                  className="rounded-full bg-primary/20 p-0.5 text-primary hover:bg-primary-focus hover:text-white"
                  type="button"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    setGalleryModalOpen(true);
                    setImgType(SiteImg.Sell);
                  }}
                >
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
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </button>
              </div>
              {sellImg ? (
                <div className="relative flex cursor-pointer flex-row items-center justify-center">
                  <Image
                    src={URL.createObjectURL(sellImg)}
                    width={500}
                    height={200}
                    alt="Sell Img"
                    quality={100}
                    className="h-[200px] w-full rounded-md border p-2"
                  />
                  <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setSellImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </label>
                </div>
              ) : sellBannerImg ? (
                <div className="relative flex cursor-pointer flex-row items-center justify-center">
                  <Image
                    src={fileUrl + sellBannerImg}
                    width={500}
                    height={200}
                    alt="Home Banner"
                    quality={100}
                    className="h-[200px] w-full rounded-md border p-2"
                  />
                  <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setSellImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </label>
                </div>
              ) : (
                <div className="flex w-full justify-center">
                  <label className="relative flex h-[200px] w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-gray-200">
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
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setSellImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <span className="absolute bottom-0 right-0 flex w-fit items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </span>
                  </label>
                </div>
              )}
              {!sellBannerImg && sellImg === undefined && (
                <span className="mt-3 p-2 text-xs text-error">
                  Input Banner Image for Sell Page
                </span>
              )}
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-3 flex flex-row items-center gap-3">
                <span className="p-2 text-xs">Banner Image for Login Page</span>
                <button
                  className="rounded-full bg-primary/20 p-0.5 text-primary hover:bg-primary-focus hover:text-white"
                  type="button"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    setGalleryModalOpen(true);
                    setImgType(SiteImg.Login);
                  }}
                >
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
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </button>
              </div>
              {loginImg ? (
                <div className="relative flex cursor-pointer flex-row items-center justify-center">
                  <Image
                    src={URL.createObjectURL(loginImg)}
                    width={500}
                    height={200}
                    alt="Profile"
                    quality={100}
                    className="h-[200px] w-full rounded-md border p-2"
                  />
                  <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setLoginImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </label>
                </div>
              ) : loginBannerImg ? (
                <div className="relative flex cursor-pointer flex-row items-center justify-center">
                  <Image
                    src={fileUrl + loginBannerImg}
                    width={500}
                    height={200}
                    alt="Login Banner"
                    quality={100}
                    className="h-[200px] w-full rounded-md border p-2"
                  />
                  <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setLoginImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </label>
                </div>
              ) : (
                <div className="flex w-full justify-center">
                  <label className="relative flex h-[200px] w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-gray-200">
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
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setLoginImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <span className="absolute bottom-0 right-0 flex w-fit items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </span>
                  </label>
                </div>
              )}
              {!data?.loginImg && loginImg === undefined && (
                <span className="mt-3 p-2 text-xs text-error">
                  Input Banner Image for Login Page
                </span>
              )}
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-3 flex flex-row items-center gap-3">
                <span className="p-2 text-xs">
                  Banner Image for Register Page
                </span>
                <button
                  className="rounded-full bg-primary/20 p-0.5 text-primary hover:bg-primary-focus hover:text-white"
                  type="button"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    setGalleryModalOpen(true);
                    setImgType(SiteImg.Register);
                  }}
                >
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
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </button>
              </div>
              {registerImg ? (
                <div className="relative flex cursor-pointer flex-row items-center justify-center">
                  <Image
                    src={URL.createObjectURL(registerImg)}
                    width={500}
                    height={200}
                    alt="Register"
                    quality={100}
                    className="h-[200px] w-full rounded-md border p-2"
                  />
                  <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setRegisterImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </label>
                </div>
              ) : registerBannerImg ? (
                <div className="relative flex cursor-pointer flex-row items-center justify-center">
                  <Image
                    src={fileUrl + registerBannerImg}
                    width={500}
                    height={200}
                    alt="Register Banner"
                    quality={100}
                    className="h-[200px] w-full rounded-md border p-2"
                  />
                  <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setRegisterImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </label>
                </div>
              ) : (
                <div className="flex w-full justify-center">
                  <label className="relative flex h-[200px] w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-gray-200">
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
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setRegisterImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <span className="absolute bottom-0 right-0 flex w-fit items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </span>
                  </label>
                </div>
              )}
              {!data?.registerImg && registerImg === undefined && (
                <span className="mt-3 p-2 text-xs text-error">
                  Input Banner Image for Register Page
                </span>
              )}
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-3 flex flex-row items-center gap-3">
                <span className="p-2 text-xs">
                  Banner Image for Sell Register Page
                </span>
                <button
                  className="rounded-full bg-primary/20 p-0.5 text-primary hover:bg-primary-focus hover:text-white"
                  type="button"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    setGalleryModalOpen(true);
                    setImgType(SiteImg.SellRegister);
                  }}
                >
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
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </button>
              </div>
              {sellRegImg ? (
                <div className="relative flex cursor-pointer flex-row items-center justify-center">
                  <Image
                    src={URL.createObjectURL(sellRegImg)}
                    width={500}
                    height={200}
                    alt="Register"
                    quality={100}
                    className="h-[200px] w-full rounded-md border p-2"
                  />
                  <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setSellRegImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </label>
                </div>
              ) : sellRegisterImg ? (
                <div className="relative flex cursor-pointer flex-row items-center justify-center">
                  <Image
                    src={fileUrl + sellRegisterImg}
                    width={500}
                    height={200}
                    alt="Sell Register Banner"
                    quality={100}
                    className="h-[200px] w-full rounded-md border p-2"
                  />
                  <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setSellRegImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </label>
                </div>
              ) : (
                <div className="flex w-full justify-center">
                  <label className="relative flex h-[200px] w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-gray-200">
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
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setSellRegImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <span className="absolute bottom-0 right-0 flex w-fit items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </span>
                  </label>
                </div>
              )}
              {!data?.sellRegisterImg && sellRegImg === undefined && (
                <span className="mt-3 p-2 text-xs text-error">
                  Input Banner Image for Sell Register Page
                </span>
              )}
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-3 flex flex-row items-center gap-3">
                <span className="p-2 text-xs">
                  Banner Image for Mobile Banner Page
                </span>
                <button
                  className="rounded-full bg-primary/20 p-0.5 text-primary hover:bg-primary-focus hover:text-white"
                  type="button"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    setGalleryModalOpen(true);
                    setImgType(SiteImg.Mobile);
                  }}
                >
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
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </button>
              </div>
              {mobileImg ? (
                <div className="relative flex cursor-pointer flex-row items-center justify-center">
                  <Image
                    src={URL.createObjectURL(mobileImg)}
                    width={500}
                    height={200}
                    alt="Register"
                    quality={100}
                    className="h-[200px] w-full rounded-md border p-2"
                  />
                  <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setMobileImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </label>
                </div>
              ) : mobileBannerImg ? (
                <div className="relative flex cursor-pointer flex-row items-center justify-center">
                  <Image
                    src={fileUrl + mobileBannerImg}
                    width={500}
                    height={200}
                    alt="Sell Register Banner"
                    quality={100}
                    className="h-[200px] w-full rounded-md border p-2"
                  />
                  <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setMobileImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </label>
                </div>
              ) : (
                <div className="flex w-full justify-center">
                  <label className="relative flex h-[200px] w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-gray-200">
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
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      multiple={false}
                      onChange={(e) => {
                        let fileList = e.currentTarget.files;
                        if (fileList) {
                          for (let i = 0; i < fileList.length; i++) {
                            if (fileList[i].size > 2097152) {
                              showErrorDialog(t("fileTooLarge"), "", locale);
                            } else {
                              setMobileImg(fileList[0]);
                            }
                          }
                        }
                      }}
                    />
                    <span className="absolute bottom-0 right-0 flex w-fit items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </span>
                  </label>
                </div>
              )}
              {!data?.mobileImg && mobileImg === undefined && (
                <span className="mt-3 p-2 text-xs text-error">
                  Input Banner Image for Mobile Banner
                </span>
              )}
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-3">
            <FormInput
              label={"Home Title (ENG)"}
              placeHolder={"Enter Home Title (ENG)"}
              error={errors.homeTitle?.message}
              type="text"
              defaultValue={data?.homeTitle}
              formControl={{ ...register("homeTitle") }}
              currentValue={watchFields.homeTitle}
            />

            <FormInput
              label={"Home Title (MM)"}
              placeHolder={"Enter Home Title (MM)"}
              error={errors.homeTitleMM?.message}
              type="text"
              defaultValue={data?.homeTitleMM}
              formControl={{ ...register("homeTitleMM") }}
              currentValue={watchFields.homeTitleMM}
            />

            <FormInputTextArea
              label={"Home Description (ENG)"}
              placeHolder={"Enter Home Description (ENG)"}
              error={errors.homeDescription?.message}
              defaultValue={data?.homeDescription}
              formControl={{ ...register("homeDescription") }}
              currentValue={watchFields.homeDescription}
            />

            <FormInputTextArea
              label={"Home Description (MM)"}
              placeHolder={"Enter Home Description (MM)"}
              error={errors.homeDescriptionMM?.message}
              defaultValue={data?.homeDescriptionMM}
              formControl={{ ...register("homeDescriptionMM") }}
              currentValue={watchFields.homeDescriptionMM}
            />

            <FormInput
              label={"Sell Title (ENG)"}
              placeHolder={"Enter Sell Title (ENG)"}
              error={errors.sellTitle?.message}
              type="text"
              defaultValue={data?.sellTitle}
              formControl={{ ...register("sellTitle") }}
              currentValue={watchFields.sellTitle}
            />

            <FormInput
              label={"Sell Title (MM)"}
              placeHolder={"Enter Sell Title (MM)"}
              error={errors.sellTitleMM?.message}
              type="text"
              defaultValue={data?.sellTitleMM}
              formControl={{ ...register("sellTitleMM") }}
              currentValue={watchFields.sellTitleMM}
            />

            <FormInputTextArea
              label={"Sell Description (ENG)"}
              placeHolder={"Enter Sell Description (ENG)"}
              error={errors.sellDescription?.message}
              defaultValue={data?.sellDescription}
              formControl={{ ...register("sellDescription") }}
              currentValue={watchFields.sellDescription}
            />

            <FormInputTextArea
              label={"Sell Description (MM)"}
              placeHolder={"Enter Sell Description (MM)"}
              error={errors.sellDescriptionMM?.message}
              defaultValue={data?.sellDescriptionMM}
              formControl={{ ...register("sellDescriptionMM") }}
              currentValue={watchFields.sellDescriptionMM}
            />

            <FormInput
              label={"Mobile Title (ENG)"}
              placeHolder={"Enter Mobile Title (ENG)"}
              error={errors.mobileTitle?.message}
              type="text"
              defaultValue={data?.mobileTitle}
              formControl={{ ...register("mobileTitle") }}
              currentValue={watchFields.mobileTitle}
            />

            <FormInput
              label={"Mobile Title (MM)"}
              placeHolder={"Enter Mobile Title (MM)"}
              error={errors.mobileTitleMM?.message}
              type="text"
              defaultValue={data?.mobileTitleMM}
              formControl={{ ...register("mobileTitleMM") }}
              currentValue={watchFields.mobileTitleMM}
            />

            <FormInputTextArea
              label={"Mobile Description (ENG)"}
              placeHolder={"Enter Mobile Description (ENG)"}
              error={errors.mobileDescription?.message}
              defaultValue={data?.mobileDescription}
              formControl={{ ...register("mobileDescription") }}
              currentValue={watchFields.mobileDescription}
            />

            <FormInputTextArea
              label={"Mobile Description (MM)"}
              placeHolder={"Enter Mobile Description (MM)"}
              error={errors.mobileDescriptionMM?.message}
              defaultValue={data?.mobileDescriptionMM}
              formControl={{ ...register("mobileDescriptionMM") }}
              currentValue={watchFields.mobileDescriptionMM}
            />

            <p className="my-3 text-sm text-gray-500">
              If you want to highlight{" "}
              <span className="font-semibold text-primary">text</span> like this
              add #text#
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-3 border-t pt-5">
            <div className="flex flex-row items-center gap-3">
              <h3 className="text-semibold text-sm">How to order</h3>
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
                    <IconPickerItem icon={e.icon} size={24} color={"#DE711B"} />
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
      <SingleGalleryModal
        type={ImgType.SiteManagement}
        isSeller={false}
        isModalOpen={isGalleryModalOpen}
        setModalOpen={setGalleryModalOpen}
        fileSrc={
          imgType === SiteImg.Home
            ? homeBannerImg
            : imgType === SiteImg.Sell
            ? sellBannerImg
            : imgType === SiteImg.Login
            ? loginBannerImg
            : imgType === SiteImg.Register
            ? registerBannerImg
            : imgType === SiteImg.SellRegister
            ? sellRegisterImg
            : ""
        }
        setFileSrc={(e: string) => {
          switch (imgType) {
            case SiteImg.Sell:
              setSellImg(undefined);
              setSellBannerImg(e);
              break;
            case SiteImg.Home:
              setHomeImg(undefined);
              setHomeBannerImg(e);
              break;
            case SiteImg.Login:
              setLoginImg(undefined);
              setLoginBannerImg(e);
              break;
            case SiteImg.Register:
              setRegisterImg(undefined);
              setRegisterBannerImg(e);
              break;
            case SiteImg.SellRegister:
              setSellRegImg(undefined);
              setSellRegisterImg(e);
              break;
            case SiteImg.Mobile:
              setMobileImg(undefined);
              setMobileBannerImg(e);
              break;
          }
        }}
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

export default ContactPage;
