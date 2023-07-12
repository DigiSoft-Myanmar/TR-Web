import Navbar from "@/components/navbar/Navbar";
import FormInput from "@/components/presentational/FormInput";

import SubmitBtn from "@/components/presentational/SubmitBtn";
import { firebaseAuth } from "@/lib/firebase";
import nextI18nextConfig from "@/next-i18next.config";
import prisma from "@/prisma/prisma";
import { authErrors } from "@/types/authErrors";
import { defaultDescription, fileUrl } from "@/types/const";
import { loginWithOTP, sendOTP, verifyEmailLogin } from "@/util/login";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import { getText } from "@/util/textHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import { Content } from "@prisma/client";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Navigation, Pagination, Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type PhoneLogin = {
  phoneNum?: string;
  otp?: string;
};

type EmailLogin = {
  email?: string;
  password?: string;
};

type ForgotPwd = {
  email?: string;
  password?: string;
};

function Login({ siteInfo }: { siteInfo: Content }) {
  const { locale } = useRouter();
  const [isPhone, setPhone] = React.useState(true);
  const { t } = useTranslation("common");
  const { accessKey } = useRouter().query;

  const emailLoginShema = z.object({
    email: z.string().email({
      message: t("inputValidEmailError"),
    }),
    password: z.string().min(6, { message: t("inputPasswordError") }),
  });

  const forgotPasswordShema = z.object({
    email: z.string().email({
      message: t("inputValidEmailError"),
    }),
  });
  const [isOTP, setOTP] = React.useState(false);

  const phoneLoginShema = z.object({
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
  const [isForgot, setForgot] = React.useState(false);
  const [isSubmit, setSubmit] = React.useState(false);
  const { register, handleSubmit, watch, formState, reset } = useForm<
    PhoneLogin | EmailLogin | ForgotPwd
  >({
    mode: "onChange",
    defaultValues: {},
    resolver: zodResolver(
      isForgot
        ? forgotPasswordShema
        : isPhone
        ? phoneLoginShema
        : emailLoginShema
    ),
  });

  const { errors }: any = formState;
  const watchFields: any = watch();

  const captchaContainer = React.useRef<HTMLDivElement | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    if (isPhone === true) {
      if (watchFields?.phoneNum?.length > 0) {
      } else {
        reset({
          ...watchFields,
          phoneNum: "+959",
        });
      }
    }
  }, [watchFields?.phoneNum, isPhone]);

  const checkKeyDown = (e: any) => {
    if (e.code === "Enter") {
      e.preventDefault();
      loginSubmit(watchFields);
    }
  };

  async function loginSubmit(data: any) {
    if (isForgot === true) {
      setSubmit(true);
      sendPasswordResetEmail(firebaseAuth, data.email!)
        .then(() => {
          setSubmit(false);
          showSuccessDialog(
            "Password reset link sent successfully.",
            "စကား၀ှက်အသစ်ပြန်လည်သတ်မှတ်ရန် link အား အီးမေလ်းသို့ပို့ဆောင်ထားပါသည်။",
            locale,
            () => {
              setForgot(false);
            }
          );
        })
        .catch((err: any) => {
          setSubmit(false);
          let errText = "";
          if (err.code) {
            let errCode = err.code.replace("auth/", "");
            if (errCode in authErrors) {
              errText = authErrors[errCode];
            } else {
              errText = "Something went wrong. Please try again.";
            }
          } else {
            errText = "Something went wrong. Please try again.";
          }
          showErrorDialog(errText, "", locale);
        });
    } else {
      if (isPhone === false) {
        setSubmit(true);
        let response = await verifyEmailLogin(data.email);
        if (response && response.isSuccess === true) {
          signInWithEmailAndPassword(firebaseAuth, data.email, data.password)
            .then(async (credential) => credential.user.getIdToken(true))
            .then((idToken) => {
              setSubmit(false);

              signIn("credentials", {
                idToken,
                callbackUrl: "/",
                redirect: true,
              });
            })
            .catch((err) => {
              setSubmit(false);
              let errText = "";
              if (err.code) {
                let errCode = err.code.replace("auth/", "");
                if (errCode in authErrors) {
                  errText = authErrors[errCode];
                } else {
                  errText = "Something went wrong. Please try again.";
                }
              } else {
                errText = "Something went wrong. Please try again.";
              }
              showErrorDialog(errText, "", locale);
            });
        } else {
          setSubmit(false);
          showErrorDialog(response.error, response.errorMM, locale);
        }
      } else {
        if (isOTP === false) {
          setSubmit(true);
          let response = await sendOTP(
            data.phoneNum.toString(),
            captchaContainer,
            true
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
          setSubmit(true);

          let response = await loginWithOTP(data);
          if (response.isSuccess === true) {
            signIn("credentials", {
              idToken: response.idToken,
              callbackUrl: "/",
              redirect: true,
            });
            setSubmit(false);
          } else {
            setSubmit(false);

            showErrorDialog(response.error, response.errorMM, locale);
          }
        }
      }
    }
  }

  return (
    <>
      <div>
        <Head>
          <title>Login | Treasure Rush</title>
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
              slidesPerView={1}
              rewind={true}
              pagination={{ clickable: true }}
              scrollbar={{ draggable: true }}
            >
              {siteInfo?.credentialFeatures.map((e: any, index: number) => (
                <SwiperSlide key={index} className={`w-full`}>
                  <div className=" flex flex-col items-center">
                    <Image
                      src={fileUrl + e.icon}
                      width={1080}
                      height={300}
                      alt="banner"
                      className="h-full min-h-[300px] w-full max-h-[300px] object-contain"
                    />
                    <h3 className="text-primaryText whitespace-nowrap text-lg font-semibold mt-10">
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
          <div className="relative w-full lg:w-1/2 px-4 py-32 sm:px-6 lg:flex lg:items-center lg:px-8 bg-red-600">
            <div
              className={`mx-auto min-w-[400px] max-w-lg rounded-lg bg-white pt-10 shadow-2xl lg:min-w-[500px]`}
            >
              {isForgot === false ? (
                <>
                  <h1 className="text-center text-2xl font-bold text-primary sm:text-3xl">
                    {getText("Log in", "၀င်ရောက်ရန်", locale)}
                  </h1>

                  <p className="mx-auto mt-4 min-w-[400px] text-center text-gray-600 lg:min-w-[500px] ">
                    {getText(
                      "Welcome to Treasure Rush",
                      "Treasure Rush မှ ကြိုဆိုပါသည်။",
                      locale
                    )}{" "}
                    <br />
                    {getText(
                      "Please input your login credentials below to continue.",
                      "ဆက်လက်ဆောင်ရွက်ရန် အောက်တွင် သင်၏ အကောင့်ဝင်ရောက်မှုအထောက်အထားများကို ထည့်သွင်းပါ။",
                      locale
                    )}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-center text-2xl font-bold text-primary sm:text-3xl">
                    {getText(
                      "Reset Password",
                      "စကား၀ှက်အသစ်သတ်မှတ်ရန်",
                      locale
                    )}
                  </h1>

                  <p className="mx-auto mt-4 min-w-[400px] text-center text-gray-600 lg:min-w-[500px] ">
                    {getText(
                      "Password reset link will sent to your email address.",
                      "စကားဝှက်ပြန်လည်သတ်မှတ်ခြင်းလင့်ခ်သည် သင့်အီးမေးလ်လိပ်စာသို့ ပေးပို့မည်ဖြစ်သည်။",
                      locale
                    )}{" "}
                  </p>
                </>
              )}
              <form
                className={`mt-6 mb-0 space-y-4 rounded-lg border-t bg-white p-8`}
                onSubmit={handleSubmit(loginSubmit)}
                onKeyDown={(e) => checkKeyDown(e)}
              >
                {isForgot === true ? (
                  <></>
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      {getText("Sign in using", "၀င်ရောက်နည်း", locale)}{" "}
                    </p>
                    <span className="text-lg font-semibold text-primary">
                      {isPhone
                        ? getText("Phone number", "ဖုန်းဖြင့်", locale)
                        : getText("E-mail address", "အီးမေလ်းဖြင့်", locale)}
                    </span>
                  </>
                )}
                {isForgot === true ? (
                  <div className={`flex flex-col space-y-4`}>
                    <FormInput
                      label={t("email")}
                      placeHolder={t("enter") + " " + t("email")}
                      error={errors.email?.message}
                      type="email"
                      formControl={{ ...register("email") }}
                      currentValue={watchFields.email}
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
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                      }
                    />

                    <SubmitBtn
                      isSubmit={isSubmit}
                      submitTxt="Loading..."
                      text={getText(
                        "Reset Password",
                        "စကား၀ှက်အသစ်သတ်မှတ်ရန်",
                        locale
                      )}
                    />
                  </div>
                ) : (
                  <>
                    <div
                      className={`${
                        isPhone === true ? "flex" : "hidden"
                      } flex-col space-y-4`}
                    >
                      <FormInput
                        label={t("phone")}
                        placeHolder={t("enter") + " " + t("phone")}
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

                      <SubmitBtn
                        isSubmit={isSubmit}
                        submitTxt="Loading..."
                        text={isOTP ? t("signIn") : "Request OTP"}
                      />
                      <div className="flex flex-row items-center justify-center">
                        <button
                          className="group relative inline-flex items-center overflow-hidden rounded px-3 py-2 text-primary focus:outline-none focus:ring active:text-primary"
                          type="button"
                          onClick={() => setPhone(false)}
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
                              "Login with E-mail address",
                              "အီးမေလ်းဖြင့် ၀င်ရောက်ရန်",
                              locale
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div
                      className={`${
                        isPhone === false ? "flex" : "hidden"
                      } flex-col space-y-4`}
                    >
                      <FormInput
                        label={t("email")}
                        placeHolder={t("enter") + " " + t("email")}
                        error={errors.email?.message}
                        type="email"
                        formControl={{ ...register("email") }}
                        currentValue={watchFields.email}
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
                              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                            />
                          </svg>
                        }
                      />

                      <FormInput
                        label={t("password")}
                        placeHolder={t("enter") + " " + t("password")}
                        error={errors.password?.message}
                        type={showPassword === true ? "text" : "password"}
                        formControl={{ ...register("password") }}
                        currentValue={watchFields.password}
                        icon={
                          showPassword === true ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 cursor-pointer"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowPassword(false);
                              }}
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
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-5 w-5 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowPassword(true);
                              }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                              />
                            </svg>
                          )
                        }
                      />

                      <SubmitBtn
                        isSubmit={isSubmit}
                        submitTxt="Loading..."
                        text={t("signIn")}
                      />
                      <div className="flex flex-row items-center justify-center">
                        <button
                          className="group relative inline-flex items-center overflow-hidden rounded px-3 py-2 text-primary focus:outline-none focus:ring active:text-primary"
                          type="button"
                          onClick={() => setPhone(true)}
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
                              "Login with phone",
                              "ဖုန်းဖြင့် ၀င်ရောက်ရန်",
                              locale
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {isForgot === false && (
                  <p className="mt-4 text-center text-sm text-gray-500 sm:mt-0">
                    {getText(
                      `Don't have an account? `,
                      "အကောင့်မရှိပါသဖြင့်",
                      locale
                    )}
                    <Link
                      href={
                        accessKey
                          ? "/register?accessKey=" + accessKey
                          : "/register"
                      }
                      className="text-gray-700 underline"
                    >
                      {getText("Register", "အကောင့်အသစ်ပြုလုပ်ရန်", locale)}
                    </Link>
                    .
                  </p>
                )}
                <div className="flex items-center justify-center">
                  <button
                    className="mt-4 text-center text-sm text-gray-700 underline sm:mt-0"
                    type="button"
                    onClick={() => {
                      setForgot((prevValue) => !prevValue);
                    }}
                  >
                    {isForgot === true
                      ? getText("Back to Login", "၀င်ရောက်ရန်", locale)
                      : getText(
                          "Forget Password?",
                          "စကား၀ှက်မေ့နေပါသလား။",
                          locale
                        )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
      <div ref={captchaContainer}></div>
    </>
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

export default Login;
