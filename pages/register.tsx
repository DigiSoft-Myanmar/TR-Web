import Navbar from "@/components/navbar/Navbar";
import FormInput from "@/components/presentational/FormInput";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import nextI18nextConfig from "@/next-i18next.config";
import { defaultDescription, fileUrl } from "@/types/const";
import { registerWithOTP, sendOTP } from "@/util/login";
import { showErrorDialog } from "@/util/swalFunction";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import prisma from "@/prisma/prisma";
import { Content, PromoCode, Role } from "@prisma/client";
import { formatAmount, getText } from "@/util/textHelper";
import { PrivacyType } from "@/types/pageType";

import { Navigation, Pagination, Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export type RegisterType = {
  username: string;
  phoneNum: string;
  otp?: string;
  isCheck: boolean;
};

function Register({ siteInfo }: { siteInfo: Content }) {
  const { locale } = useRouter();
  const { t } = useTranslation("common");
  const { accessKey } = useRouter().query;
  const [isOTP, setOTP] = React.useState(false);
  const roleList = [Role.Trader, Role.Buyer, Role.Seller];

  console.log(siteInfo);

  const registerShema = z.object({
    username: z.string().min(1, { message: t("inputError") }),
    phoneNum: z.string().regex(new RegExp("^\\+959\\d{7,9}$"), {
      message: t("inputValidPhoneError"),
    }),
    otp:
      isOTP === true
        ? z.string().min(1, { message: t("inputError") })
        : z
            .string()
            .min(1, { message: t("inputError") })
            .optional()
            .or(z.literal("")),
  });
  const [isSubmit, setSubmit] = React.useState(false);
  const { register, handleSubmit, watch, formState } = useForm<RegisterType>({
    mode: "onChange",
    defaultValues: {},
    resolver: zodResolver(registerShema),
  });
  const { errors }: any = formState;
  const watchFields: any = watch();
  const [role, setRole] = React.useState<any>(Role.Buyer);

  const captchaContainer = React.useRef<HTMLDivElement | null>(null);

  const checkKeyDown = (e: any) => {
    if (e.code === "Enter") {
      e.preventDefault();
      registerSubmit(watchFields);
    }
  };

  async function registerSubmit(data: any) {
    if (isOTP === false) {
      setSubmit(true);
      let response = await sendOTP(
        data.phoneNum.toString(),
        captchaContainer,
        false
      );
      if (response && response.isSuccess === true) {
        setOTP(true);
        setSubmit(false);
      } else if (response) {
        setOTP(false);
        showErrorDialog(response.error, response.errorMM, locale);
        setSubmit(false);
      }
    } else {
      if (data.otp) {
        setSubmit(true);

        let response = await registerWithOTP({ ...data, role: role });
        if (response.isSuccess === true) {
          signIn("credentials", {
            idToken: response.idToken,
            callbackUrl: "/",
            redirect: true,
          });
          setSubmit(false);
        } else {
          showErrorDialog(response.error, response.errorMM, locale);
          setSubmit(false);
        }
      } else {
        showErrorDialog("Please input otp.", "", locale);
      }
    }
  }

  return (
    <div>
      <Head>
        <title>Register | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="relative flex w-full flex-row items-stretch justify-start">
        <div className="hidden lg:flex flex-col bg-white w-1/2 px-4 py-32 sm:px-6 lg:items-center lg:px-8">
          <Swiper
            // install Swiper modules
            modules={[Navigation, Pagination, Autoplay]}
            autoplay={{
              delay: 2500,
              disableOnInteraction: true,
              pauseOnMouseEnter: true,
            }}
            rewind={true}
            scrollbar={{ draggable: true }}
            spaceBetween={10}
            slidesPerView={1}
            className="w-[400px] max-w-[400px]"
          >
            {siteInfo?.credentialFeatures.map((e: any, index1: number) => (
              <SwiperSlide key={index1} className="max-w-[400px] w-full">
                <div className=" flex flex-col items-center">
                  <Image
                    src={fileUrl + e.icon}
                    width={1080}
                    height={300}
                    alt="banner"
                    className="h-full min-h-[300px] w-full max-h-[300px] object-contain"
                  />
                  <h3 className="text-primaryText text-lg font-semibold mt-10">
                    {getText(e.title, e.titleMM, locale)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getText(e.description, e.descriptionMM, locale)}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        {/* <div className="absolute inset-0 bg-white/75 sm:bg-transparent sm:bg-gradient-to-r sm:from-white/95 sm:to-white/25"></div> */}
        <div className="relative lg:w-1/2 w-full px-4 py-32 sm:px-6 lg:flex lg:items-center lg:px-8 bg-primary">
          <div className="mx-auto max-w-lg rounded-lg bg-white pt-10 shadow-2xl">
            <h1 className="text-center text-2xl font-bold text-primary sm:text-3xl">
              {getText("Create an account", "အကောင့်အသစ်ပြုလုပ်မည်။", locale)}
            </h1>

            <form
              onSubmit={handleSubmit(registerSubmit)}
              onKeyDown={(e) => checkKeyDown(e)}
              className="mt-6 mb-0 space-y-4 rounded-lg border-t bg-white p-8"
            >
              <div>
                <label className={`text-sm font-medium text-gray-400`}>
                  Role
                  <span className="text-primary">*</span>
                </label>
                <div className="mt-1 flex flex-wrap items-center justify-start gap-3">
                  {roleList.map((elem, index) => (
                    <div
                      className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 px-3 shadow-sm transition-colors hover:bg-primary/50 hover:text-white ${
                        role === elem
                          ? "border-primary text-primary ring-1 ring-primary"
                          : "border-gray-200"
                      } `}
                      key={index}
                      onClick={(e) => {
                        setRole(elem);
                      }}
                    >
                      <label
                        className={`block flex-grow cursor-pointer px-4 text-sm font-medium`}
                      >
                        <span className="whitespace-nowrap"> {t(elem)} </span>
                      </label>
                      {elem === role && (
                        <svg
                          className="top-4 right-4 h-5 w-5 cursor-pointer"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <FormInput
                label={"Username"}
                placeHolder={"Enter Username"}
                error={errors.username?.message}
                type="text"
                formControl={{ ...register("username") }}
                currentValue={watchFields.username}
                icon={
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
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                }
              />

              <FormInput
                label={"Phone"}
                placeHolder={"Enter Phone"}
                error={errors.phoneNum?.message}
                type="text"
                formControl={{ ...register("phoneNum") }}
                currentValue={watchFields.phoneNum}
                icon={
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
                      d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                  </svg>
                }
              />

              {isOTP === true && (
                <FormInput
                  label={t("otp")}
                  placeHolder={t("enter") + " " + t("otp")}
                  error={errors.otp?.message}
                  type="text"
                  formControl={{ ...register("otp") }}
                  currentValue={watchFields.otp}
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  }
                />
              )}

              <div className="w-full">
                <p className="text-sm text-gray-500">
                  {getText(
                    "By creating an account, you agree to our",
                    "အကောင့်တစ်ခုဖန်တီးခြင်းဖြင့် သင်သည် ကျွန်ုပ်တို့၏",
                    locale
                  )}{" "}
                  <Link
                    href={
                      accessKey
                        ? "/legal?type=" +
                          encodeURIComponent(PrivacyType.termsNConditions) +
                          "&accessKey=" +
                          accessKey
                        : "/legal?type=" +
                          encodeURIComponent(PrivacyType.termsNConditions)
                    }
                    className="text-gray-700 underline"
                  >
                    terms and conditions
                  </Link>{" "}
                  {getText("and", "နှင့်", locale)}{" "}
                  <Link
                    href={
                      accessKey
                        ? "/legal?type=" +
                          encodeURIComponent(PrivacyType.privacy) +
                          "&accessKey=" +
                          accessKey
                        : "/legal?type=" +
                          encodeURIComponent(PrivacyType.privacy)
                    }
                    className="text-gray-700 underline"
                  >
                    privacy policy
                  </Link>
                  {getText(".", "တို့အားသဘောတူပါသည်။", locale)}
                </p>
              </div>

              <SubmitBtn
                isSubmit={isSubmit}
                submitTxt="Loading..."
                text={
                  isOTP
                    ? getText("Register", "အကောင့်အသစ်ပြုလုပ်ရန်", locale)
                    : getText("Request OTP", "OTP ရယူရန်", locale)
                }
              />

              <p className="text-center text-sm text-gray-500">
                {getText(
                  "Already have an account?",
                  "အကောင့်ရှိပြီးသားဖြစ်သဖြင့်",
                  locale
                )}
                <Link className="ml-3 underline" href="/login">
                  {getText("Sign in", "၀င်ရောက်ရန်", locale)}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
      <div ref={captchaContainer}></div>
    </div>
  );
}

export async function getServerSideProps({ locale }: any) {
  const siteInfo = await prisma.content.findFirst({});

  return {
    props: {
      siteInfo: JSON.parse(JSON.stringify(siteInfo)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Register;
