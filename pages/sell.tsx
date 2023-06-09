import Navbar from "@/components/navbar/Navbar";
import { Listbox, Transition } from "@headlessui/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment, useRef } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { defaultDescription, fileUrl } from "@/types/const";
import MembershipCard from "@/components/card/MembershipCard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import nextI18nextConfig from "@/next-i18next.config";
import { useQuery } from "react-query";
import { Content, Membership } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/presentational/FormInput";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import { registerWithOTP, sendOTP } from "@/util/login";
import { showErrorDialog } from "@/util/swalFunction";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { getHighlightText, getText } from "@/util/textHelper";
import prisma from "@/prisma/prisma";
import { PrivacyType } from "@/types/pageType";

export type Register = {
  username: string;
  brandName?: string;
  email?: String;
  phoneNum: String;
  otp: String;
  currentMembership?: any;
};

function Sell({ siteInfo }: { siteInfo: Content }) {
  const captchaContainer = React.useRef<HTMLDivElement | null>(null);

  const { locale } = useRouter();
  const headTitle = getHighlightText(
    getText(siteInfo?.sellTitle, siteInfo?.sellTitleMM, locale)
  );
  const headDescription = getHighlightText(
    getText(siteInfo?.sellDescription, siteInfo?.sellDescriptionMM, locale)
  );

  const { isLoading, error, data } = useQuery("membershipsData", () =>
    fetch("/api/memberships").then((res) => {
      let json = res.json();
      return json;
    })
  );
  const { t } = useTranslation("common");
  const [isOTP, setOTP] = React.useState(false);
  const [isAllPlan, setIsAllPlan] = React.useState(false);

  const schema = z.object({
    username: z.string().min(1, { message: t("inputError") }),
    brandName: z.string().min(1, { message: t("inputError") }),
    email: z.string().email({ message: t("inputValidEmailError") }),
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

  const { register, handleSubmit, watch, formState, reset } = useForm<Register>(
    {
      mode: "onChange",
      resolver: zodResolver(schema),
    }
  );

  const { errors } = formState;
  const watchFields = watch();
  const [isSubmit, setSubmit] = React.useState(false);

  const registerRef = useRef<any>(null);
  const detailsRef = useRef<any>(null);
  const [currentLevel, setCurrentLevel] = React.useState<any>();
  const { accessKey } = useRouter().query;

  React.useEffect(() => {
    if (watchFields?.phoneNum?.length > 0) {
    } else {
      reset({
        ...watchFields,
        phoneNum: "+959",
      });
    }
  }, [watchFields?.phoneNum]);

  async function submitRegister(regData: Register) {
    if (isOTP === false) {
      setSubmit(true);
      let response = await sendOTP(
        regData.phoneNum.toString(),
        captchaContainer,
        false
      );
      if (response && response.isSuccess === true) {
        setOTP(true);
        setSubmit(false);
      } else if (response) {
        setOTP(false);
        setSubmit(false);

        showErrorDialog(response.error, response.errorMM, locale);
      }
    } else {
      if (regData.otp) {
        setSubmit(true);

        let response = await registerWithOTP({
          ...regData,
          currentMembership: currentLevel,
        });
        if (response.isSuccess === true) {
          let phoneNum: any = regData.phoneNum;
          signIn("credentials", {
            idToken: response.idToken,
            callbackUrl: "/account/" + encodeURIComponent(phoneNum),
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

  React.useEffect(() => {
    if (data && data.length > 0) {
      setCurrentLevel(data[0]);
    }
  }, [data]);
  return (
    <>
      <div>
        <Head>
          <title>Member | Pyi Twin Phyit</title>
          <meta name="description" content={defaultDescription} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <section className={`relative min-h-[500px] w-full`}>
          <div className="absolute top-0 bottom-0 left-0 right-0">
            <Image
              src={fileUrl + siteInfo?.sellBannerImg}
              width={1080}
              height={500}
              alt="banner"
              className="h-full min-h-[500px] w-full bg-cover bg-center bg-no-repeat"
            />
            <div className="absolute inset-0 bg-white/75 sm:bg-transparent sm:bg-gradient-to-r sm:from-white/95 sm:to-white/25 lg:hidden"></div>
          </div>
          <div className="relative mx-auto flex h-full max-w-screen-xl flex-col items-center justify-center px-4 sm:px-6 lg:flex lg:min-h-[500px] lg:items-start lg:px-8">
            <div className="max-w-xl text-center sm:text-left">
              <h1 className="text-3xl font-extrabold sm:text-5xl">
                {headTitle.map((e: any, index: number) => (
                  <span
                    key={index}
                    className={
                      e.isHighlight === true
                        ? "block font-extrabold text-[#B65E16]"
                        : ""
                    }
                  >
                    {e.text}
                  </span>
                ))}
              </h1>

              <p className="mt-4 max-w-lg sm:text-xl sm:leading-relaxed">
                {headDescription.map((e: any, index: number) => (
                  <span
                    key={index}
                    className={
                      e.isHighlight === true
                        ? "font-extrabold text-[#B65E16]"
                        : ""
                    }
                  >
                    {e.text}
                  </span>
                ))}
              </p>

              <div className="mt-8 flex flex-wrap gap-4 text-center">
                <button
                  type="button"
                  onClick={() =>
                    registerRef.current.scrollIntoView({ behavior: "smooth" })
                  }
                  className="block w-full cursor-pointer rounded bg-primary px-12 py-3 text-sm font-medium text-white shadow hover:bg-primary-focus focus:outline-none focus:ring active:bg-rose-500 sm:w-auto"
                >
                  {getText("Register", "စာရင်းသွင်းရန်", locale)}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    detailsRef.current.scrollIntoView({ behavior: "smooth" })
                  }
                  className="block w-full rounded bg-white px-12 py-3 text-sm font-medium text-primary shadow hover:text-primary-focus focus:outline-none focus:ring active:text-rose-500 sm:w-auto"
                >
                  {getText("Learn more", "ပိုမိုလေ့လာရန်", locale)}
                </button>
              </div>
            </div>
          </div>
        </section>
        {/* <FeatureSection
          features={siteInfo?.sellFeatures}
          disableMarginBottom={true}
        />
         */}
        <section className={`relative min-h-full w-full`}>
          <div className="absolute top-0 bottom-0 left-0 right-0">
            <Image
              src={fileUrl + siteInfo?.sellRegisterImg}
              width={1080}
              height={500}
              alt="banner"
              className="h-full min-h-[500px] w-full bg-cover bg-center bg-no-repeat"
            />
            <div className="absolute inset-0 bg-white/75 sm:bg-transparent sm:bg-gradient-to-r sm:from-white/95 sm:to-white/25 lg:hidden"></div>
          </div>
          <div
            className="relative mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8"
            ref={registerRef}
          >
            <div className="mx-auto max-w-lg rounded-lg bg-white pt-10 shadow-2xl">
              <h1 className="text-center text-2xl font-bold text-primary sm:text-3xl">
                {getText(
                  "Grow your business with us",
                  "သင့်စီးပွားရေးအား ပြည်တွင်းဖြစ်ဖြင့် တိုးချဲ့လိုက်ပါ။",
                  locale
                )}
              </h1>

              <p className="mx-auto mt-4 max-w-md text-center text-gray-600">
                {getText(
                  "Sell smarter, not harder. Join Pyi Twin Phyit to maximize your sales potential and grow your business with ease.",
                  "စမတ်ကျကျရောင်းချရန်၊ သင်၏ရောင်းအားကို မြှင့်တင်ရန်နှင့် သင့်လုပ်ငန်းကို လွယ်ကူစွာ ကြီးထွားစေရန် ပြည်တွင်းဖြစ်ဖြင့် ပူးပေါင်းလိုက်ပါ။",
                  locale
                )}
              </p>

              <form
                className="mt-6 mb-0 space-y-4 rounded-lg border-t bg-white p-8"
                onSubmit={handleSubmit(submitRegister)}
              >
                <p className="text-lg font-medium">
                  {getText("Register brand", "စီးပွားရေးမှတ်ပုံတင်ရန်", locale)}
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <FormInput
                    label={t("ownerName")}
                    placeHolder={t("enter") + " " + t("ownerName")}
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
                        className="h-5 w-5 text-gray-400"
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
                    label={t("brandName")}
                    placeHolder={t("enter") + " " + t("brandName")}
                    error={errors.brandName?.message}
                    type="text"
                    formControl={{ ...register("brandName") }}
                    currentValue={watchFields.brandName}
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                        />
                      </svg>
                    }
                  />
                </div>
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
                      className="h-5 w-5 text-gray-400"
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
                      className="h-5 w-5 text-gray-400"
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
                    label={t("OTP")}
                    placeHolder={t("enter") + " " + t("OTP")}
                    error={errors.otp?.message}
                    type="password"
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
                  <label
                    htmlFor="membership"
                    className="text-sm font-medium text-gray-400"
                  >
                    {getText("Membership", "အသင်းဝင်", locale)}
                  </label>

                  <div className="relative mt-1">
                    <Listbox value={currentLevel} onChange={setCurrentLevel}>
                      <div className="relative mt-1">
                        <Listbox.Button className="relative w-full cursor-default rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary/30 sm:text-sm">
                          <span className="block truncate">
                            {currentLevel?.name}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {data &&
                              data.map(
                                (member: Membership, memberIdx: number) => (
                                  <Listbox.Option
                                    key={memberIdx}
                                    className={({ active }) =>
                                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                        active
                                          ? "bg-amber-100 text-amber-900"
                                          : "text-gray-900"
                                      }`
                                    }
                                    value={member}
                                  >
                                    {({ selected }) => (
                                      <>
                                        <span
                                          className={`block truncate ${
                                            selected
                                              ? "font-medium"
                                              : "font-normal"
                                          }`}
                                        >
                                          {member.name}
                                        </span>
                                        {selected ? (
                                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                            <CheckIcon
                                              className="h-5 w-5"
                                              aria-hidden="true"
                                            />
                                          </span>
                                        ) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                )
                              )}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>
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
        <section
          className="relative z-20 overflow-hidden pt-20 pb-12 lg:pt-[120px] lg:pb-[90px]"
          ref={detailsRef}
        >
          <div className="container mx-auto">
            <div className="-mx-4 flex flex-wrap">
              <div className="w-full px-4">
                <div className="mx-auto mb-[60px] max-w-[510px] text-center lg:mb-20">
                  <span className="mb-2 block text-lg font-semibold text-primary">
                    {getText("Pricing Table", "စျေးနှုန်းဇယား", locale)}
                  </span>
                  <h2 className="text-dark mb-4 text-3xl font-bold sm:text-4xl md:text-[40px]">
                    {getText(
                      "Our Pricing Plan",
                      "ကျွန်ုပ်တို့၏စျေးနှုန်းအစီအစဉ်",
                      locale
                    )}
                  </h2>
                  <p className="text-body-color text-base">
                    {getText(
                      "Ready to take your business to the next level? Join Pyi Twin Phyit and watch your earnings grow.",
                      "သင့်လုပ်ငန်းကို နောက်တစ်ဆင့်တက်လှမ်းရန်နှင့် သင့်စီးပွားရေးတိုးတက်မှုကို စောင့်ကြည့်ရန် ပြည်တွင်းဖြစ်ဖြင့် လက်တွဲလိုက်ပါ။",
                      locale
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="-mx-4 flex flex-wrap justify-center">
              {data && data.length > 3 && isAllPlan === false
                ? [
                    data[0],
                    data[(data.length / 2).toFixed(0)],
                    data[data.length - 1],
                  ].map((e: any, index: number) => (
                    <MembershipCard
                      key={index}
                      {...e}
                      button={
                        <button
                          className={
                            currentLevel?.name === e.name
                              ? "block w-full rounded-md border border-primary bg-primary p-4 text-center text-base font-semibold text-white transition hover:bg-opacity-90"
                              : "block w-full rounded-md border border-[#D4DEFF] bg-transparent p-4 text-center text-base font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-white"
                          }
                          onClick={() => {
                            setCurrentLevel(e);
                            registerRef.current.scrollIntoView({
                              behavior: "smooth",
                            });
                          }}
                        >
                          {getText(
                            "Choose " + e.name,
                            e.nameMM + " ရွေးရန်",
                            locale
                          )}
                        </button>
                      }
                    />
                  ))
                : data?.map((e: any, index: number) => (
                    <MembershipCard
                      key={index}
                      {...e}
                      button={
                        <button
                          className={
                            currentLevel?.name === e.name
                              ? "block w-full rounded-md border border-primary bg-primary p-4 text-center text-base font-semibold text-white transition hover:bg-opacity-90"
                              : "block w-full rounded-md border border-[#D4DEFF] bg-transparent p-4 text-center text-base font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-white"
                          }
                          onClick={() => {
                            setCurrentLevel(e);
                            registerRef.current.scrollIntoView({
                              behavior: "smooth",
                            });
                          }}
                        >
                          {getText(
                            "Choose " + e.name,
                            e.nameMM + " ရွေးရန်",
                            locale
                          )}
                        </button>
                      }
                    />
                  ))}
            </div>
            {data && data.length > 3 && (
              <div className="flex w-full items-center justify-center">
                <button
                  className="btn-primary rounded-md px-3 py-2"
                  onClick={() => {
                    setIsAllPlan((prevValue) => !prevValue);
                  }}
                >
                  {isAllPlan === false
                    ? getText(
                        "See all plans",
                        "အစီအစဉ်အားလုံးကို ကြည့်ရန်။",
                        locale
                      )
                    : getText(
                        "Minimize plans",
                        "အစီအစဉ်များကို လျှော့ချရန်။",
                        locale
                      )}
                </button>
              </div>
            )}
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

export default Sell;
