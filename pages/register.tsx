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
import { Content, PromoCode } from "@prisma/client";
import { formatAmount, getText } from "@/util/textHelper";
import { PrivacyType } from "@/types/pageType";

export type RegisterType = {
  username: string;
  phoneNum: string;
  otp?: string;
  isCheck: boolean;
};

function Register({
  siteInfo,
  promoCode,
}: {
  siteInfo: Content;
  promoCode: PromoCode | null;
}) {
  const { locale } = useRouter();
  const { t } = useTranslation("common");
  const { accessKey } = useRouter().query;
  const [isOTP, setOTP] = React.useState(false);

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
    isCheck: z.boolean(),
  });
  const [isSubmit, setSubmit] = React.useState(false);
  const { register, handleSubmit, watch, formState } = useForm<RegisterType>({
    mode: "onChange",
    defaultValues: {},
    resolver: zodResolver(registerShema),
  });
  const { errors }: any = formState;
  const watchFields: any = watch();

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

        let response = await registerWithOTP(data);
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
      <section className="relative flex w-full flex-row flex-wrap items-stretch justify-start">
        <div className="absolute top-0 bottom-0 left-0 right-0">
          <Image
            src={fileUrl + siteInfo?.registerImg}
            width={1080}
            height={500}
            alt="banner"
            className="h-full min-h-[500px] w-full bg-cover bg-center bg-no-repeat"
          />
          <div className="absolute inset-0 bg-white/75 sm:bg-transparent sm:bg-gradient-to-r sm:from-white/95 sm:to-white/25 lg:hidden"></div>
        </div>
        {/* <div className="absolute inset-0 bg-white/75 sm:bg-transparent sm:bg-gradient-to-r sm:from-white/95 sm:to-white/25"></div> */}
        <div className="relative mx-auto max-w-screen-xl px-4 py-32 sm:px-6 lg:flex lg:items-center lg:px-8">
          <div className="mx-auto max-w-lg rounded-lg bg-white pt-10 shadow-2xl">
            <h1 className="text-center text-2xl font-bold text-primary sm:text-3xl">
              {getText("Create an account", "အကောင့်အသစ်ပြုလုပ်မည်။", locale)}
            </h1>

            <p className="mx-auto mt-4 max-w-md text-center text-gray-600">
              {promoCode
                ? getText(
                    `Let's get started with your first purchase ${
                      promoCode.isPercent === true
                        ? promoCode.discount + "%"
                        : formatAmount(promoCode.discount, locale, true)
                    } discount.`,
                    `သင်၏ ပထမဆုံးဝယ်ယူမှုအား ${
                      promoCode.isPercent === true
                        ? promoCode.discount + "%"
                        : formatAmount(promoCode.discount, locale, true)
                    } လျှော့စျေးဖြင့်၀ယ်ယူလိုက်ပါ။`,
                    locale
                  )
                : ""}
            </p>

            <form
              onSubmit={handleSubmit(registerSubmit)}
              onKeyDown={(e) => checkKeyDown(e)}
              className="mt-6 mb-0 space-y-4 rounded-lg border-t bg-white p-8"
            >
              <p className="text-lg font-medium">
                {getText("Register buyer", "၀ယ်ယူသူအသစ်ပြုလုပ်မည်", locale)}
              </p>

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

              <div>
                <label htmlFor="MarketingAccept" className="flex gap-4">
                  <input
                    type="checkbox"
                    id="MarketingAccept"
                    className="checkbox-primary checkbox"
                    {...register("isCheck")}
                  />

                  <span className="text-sm text-gray-700">
                    {getText(
                      "I want to receive emails about discounts, product updates and announcements.",
                      "လျော့စျေးများ၊ ထုတ်ကုန်အသစ်များနှင့် ကြေငြာချက်များ၏ အီးမေးလ်များ လက်ခံရယူလိုပါသည်",
                      locale
                    )}
                  </span>
                </label>
              </div>

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

              <div className="flex flex-row items-center justify-center">
                <Link
                  href="/sell"
                  className="group relative inline-flex items-center overflow-hidden rounded px-3 py-2 text-primary focus:outline-none focus:ring active:text-primary"
                >
                  <span className="absolute right-0 translate-x-full transition-transform group-hover:-translate-x-1">
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>

                  <span className="text-sm font-medium transition-all group-hover:mr-4">
                    {getText(
                      "Register as Seller",
                      "ရောင်းချသူအဖြစ် အကောင့်အသစ်ပြုလုပ်ရန်",
                      locale
                    )}
                  </span>
                </Link>
              </div>

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
  const promoCode = await prisma.promoCode.findFirst({
    where: {
      isCouponUsageInfinity: true,
      isCouponUsagePerUserInfinity: false,
      couponUsagePerUser: 1,
    },
  });

  return {
    props: {
      promoCode: JSON.parse(JSON.stringify(promoCode)),
      siteInfo: JSON.parse(JSON.stringify(siteInfo)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Register;
