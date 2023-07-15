import FormInput from "@/components/presentational/FormInput";
import FormInputTextArea from "@/components/presentational/FormInputTextArea";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import nextI18nextConfig from "@/next-i18next.config";
import prisma from "@/prisma/prisma";
import { defaultDescription, fileUrl, isMaintainence } from "@/types/const";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import {
  formatAmount,
  getHighlightText,
  getText,
  getTotalCountByBrand,
} from "@/util/textHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import { Brand, Content, Role, State } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { IconPickerItem } from "react-fa-icon-picker";
import { useForm } from "react-hook-form";
import { z } from "zod";

export type ContactMessage = {
  name: string;
  email: String;
  phone: String;
  message: String;
};

function About({
  siteInfo,
  buyerCount,
  sellerCount,
  subscriberCount,
}: {
  siteInfo: Content;
  subscriberCount: number;
  buyerCount: number;
  sellerCount: number;
}) {
  const { asPath } = useRouter();
  const contactRef = React.useRef<HTMLElement | null>(null);
  const router = useRouter();
  const { locale } = useRouter();
  const { accessKey } = useRouter().query;
  const { t } = useTranslation("common");
  const headTitle = getHighlightText(
    getText(siteInfo?.aboutTitle, siteInfo?.aboutTitleMM, locale)
  );
  const headDescription = getHighlightText(
    getText(siteInfo?.aboutDescription, siteInfo?.aboutDescriptionMM, locale)
  );
  const homeTitle = getHighlightText(
    getText(siteInfo?.aboutTitle, siteInfo?.aboutTitleMM, locale)
  );
  const homeDescription = getHighlightText(
    getText(siteInfo?.aboutDescription, siteInfo?.aboutDescriptionMM, locale)
  );
  const { data: session }: any = useSession();

  const schema = z.object({
    name: z.string().min(1, { message: t("inputError") }),
    email: z.string().email({ message: t("inputValidEmailError") }),
    phone: z.string().regex(new RegExp("^\\+959\\d{7,9}$"), {
      message: t("inputValidPhoneError"),
    }),
    message: z.string().min(1, { message: t("inputError") }),
  });

  const { register, handleSubmit, watch, formState, reset } =
    useForm<ContactMessage>({
      mode: "onChange",
      resolver: zodResolver(schema),
    });

  const { errors } = formState;
  const watchFields = watch();
  const [isSubmit, setSubmit] = React.useState(false);
  //TODO socket
  //let { fsmToken } = useSocket();

  React.useEffect(() => {
    if (session) {
      if (watchFields?.phone?.length > 0) {
        reset({
          ...watchFields,
          phone: session.phoneNum,
          email: session.email,
          name: session.username,
        });
      } else {
        reset({
          ...watchFields,
          phone: "+959",
        });
      }
    } else {
      if (watchFields?.phone?.length > 0) {
      } else {
        reset({
          ...watchFields,
          phone: "+959",
        });
      }
    }
  }, [watchFields?.phone, session]);

  async function submitRegister(regData: ContactMessage) {
    let p = "/api/feedbacks";
    /* if (fsmToken) {
        p += "?token=" + fsmToken;
      } */
    setSubmit(true);
    fetch(p, {
      method: "POST",
      body: JSON.stringify(regData),
    }).then(async (data) => {
      setSubmit(false);
      if (data.status === 200) {
        showSuccessDialog(
          "Message received. Our team will respond as soon as possible.",
          "ပေးပို့ခြင်းအောင်မြင်ပါသည်။ ပြည်တွင်းဖြစ် အသင်းမှ အမြန်ဆုံးအကြောင်းပြန်ပေးပါမည်။",
          locale,
          () => {
            reset({
              phone: "+959",
            });
          }
        );
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

  React.useEffect(() => {
    const hash = asPath.split("#")[1];
    if (contactRef.current && hash === "contact") {
      const headerHeight = 100;
      const buffer = 25;
      const scrollToEl = contactRef.current;

      const topOfElement =
        window.pageYOffset +
        scrollToEl.getBoundingClientRect().top -
        headerHeight -
        buffer;
      window.scroll({ top: topOfElement, behavior: "smooth" });
    } else if (hash !== "contact") {
      window.scroll({ top: 0, behavior: "smooth" });
    }
  }, [asPath, contactRef]);

  return (
    <div className="bg-white pb-10">
      <Head>
        <title>About | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto max-w-screen-xl px-4 py-8">
        <section className="mt-5">
          <div className="mx-auto max-w-screen-xl px-4 pb-12 sm:px-6 md:pb-16 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h4 className="text-center text-sm font-semibold text-primary">
                {getText("About Us", "ကျွန်ုပ်တို့အကြောင်း", locale)}
              </h4>

              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
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
              </h2>

              <p className="mt-4 text-gray-500 sm:text-xl">
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
            </div>

            <div className="mt-8 sm:mt-12">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col rounded-lg border border-gray-100 px-4 py-8 text-center">
                  <dt className="order-last text-lg font-medium text-gray-500">
                    {getText("Total Customers", "၀ယ်ယူသူအရေအတွက်", locale)}
                  </dt>

                  <dd className="text-4xl font-extrabold text-primary md:text-5xl">
                    {formatAmount(buyerCount, locale, false, true)}
                  </dd>
                </div>

                <div className="flex flex-col rounded-lg border border-gray-100 px-4 py-8 text-center">
                  <dt className="order-last text-lg font-medium text-gray-500">
                    {getText("Total Sellers", "စီးပွားရှင်အရေအတွက်", locale)}
                  </dt>

                  <dd className="text-4xl font-extrabold text-primary md:text-5xl">
                    {formatAmount(sellerCount, locale, false, true)}
                  </dd>
                </div>

                <div className="flex flex-col rounded-lg border border-gray-100 px-4 py-8 text-center">
                  <dt className="order-last text-lg font-medium text-gray-500">
                    {getText(
                      "Total Subscribers",
                      "စုစုပေါင်း စာရင်းသွင်းသူများ",
                      locale
                    )}
                  </dt>

                  <dd className="text-4xl font-extrabold text-primary md:text-5xl">
                    {formatAmount(subscriberCount, locale, false, true)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="">
          <div className="mx-auto max-w-screen-xl px-4 py-8 sm:py-12 sm:px-6 lg:py-16 lg:px-8">
            <div className="mx-auto text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                {homeTitle.map((e: any, index: number) => (
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
              </h2>

              <p className="mt-4 text-center sm:text-xl sm:leading-relaxed">
                {homeDescription.map((e: any, index: number) => (
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
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {siteInfo?.membershipFeatures.map((e: any, index: number) => (
                <div
                  key={index}
                  className="flex flex-col items-start justify-start gap-3 rounded-xl bg-primary/10 p-8 shadow-xl transition"
                >
                  <span className="rounded-md bg-primary/20 p-2">
                    <IconPickerItem icon={e.icon} size={24} color={"#DE711B"} />
                  </span>

                  <h2 className="text-primaryText mt-4 text-xl font-bold">
                    {getText(e.title, e.titleMM, locale)}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {getText(e.description, e.descriptionMM, locale)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href={
                  accessKey
                    ? "/marketplace?accessKey=" + accessKey
                    : "/marketplace"
                }
                className="inline-block rounded bg-primary px-12 py-3 text-sm font-medium text-white transition hover:bg-primary-focus focus:outline-none focus:ring focus:ring-yellow-400"
              >
                {t("shopNow")}
              </Link>
            </div>
          </div>
        </section>

        <section
          className="mt-10 flex min-h-[1150px] flex-col space-y-5"
          ref={contactRef}
          id="#contact"
        >
          <div className={`relative w-full`}>
            {siteInfo && siteInfo?.googleMapUrl && (
              <iframe
                src={siteInfo?.googleMapUrl}
                className="absolute h-[500px] min-h-[500px] w-full bg-cover bg-center bg-no-repeat"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            )}
            <div className="relative top-64 mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-lg rounded-lg bg-white pt-10 shadow-2xl">
                <h1 className="text-center text-2xl font-bold text-primary sm:text-3xl">
                  {getText("Contact Us", "ဆက်သွယ်ရန်", locale)}
                </h1>

                <p className="mx-auto mt-4 max-w-md text-center text-gray-600">
                  {getText(
                    "Need help? Our team is ready to assist you. Contact us for all your e-commerce needs.",
                    "အကူအညီလိုအပ်နေပါသလာ။ ပြည်တွင်းဖြစ်အသင်းမှ သင့်အားအကူအညီပေးရန် အသင့်ရှိနေပါသည်။ သင်၏ စီးပွားရေး လိုအပ်ချက်များအားလုံးအတွက် ကျွန်ုပ်တို့ထံ ဆက်သွယ်ပါ။",
                    locale
                  )}
                </p>
                <form
                  className="mt-6 mb-0 space-y-4 rounded-lg border-t bg-white p-8"
                  onSubmit={handleSubmit(submitRegister)}
                >
                  <FormInput
                    label={t("name")}
                    placeHolder={t("enter") + " " + t("name")}
                    error={errors.name?.message}
                    type="text"
                    formControl={{ ...register("name") }}
                    currentValue={watchFields.name}
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
                    error={errors.phone?.message}
                    type="text"
                    formControl={{ ...register("phone") }}
                    currentValue={watchFields.phone}
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
                  <FormInputTextArea
                    label={getText("Message", "အကြောင်းအရာ", locale)}
                    placeHolder={
                      t("enter") +
                      " " +
                      getText("Message", "အကြောင်းအရာ", locale)
                    }
                    error={errors.message?.message}
                    formControl={{ ...register("message") }}
                    currentValue={watchFields.message}
                  />

                  <SubmitBtn
                    isSubmit={isSubmit}
                    submitTxt="Loading..."
                    text={getText("Send Message", "OTP ရယူရန်", locale)}
                  />
                </form>
              </div>
            </div>
          </div>
        </section>
        <section className="my-10">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="rounded-md bg-primary/10 p-3 text-primary">
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
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </span>
              <h2 className="text-primaryText mt-4 text-xl font-bold">
                {getText("Email us:", "အီးမေးလ်ပို့ရန်", locale)}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {getText(
                  "Email us for general queries, including marketing and partnership opportunities.",
                  "စျေးကွက်ရှာဖွေရေးနှင့် မိတ်ဖက်အခွင့်အလမ်းများအပါအဝင် အထွေထွေမေးခွန်းများအတွက် ကျွန်ုပ်တို့ထံ အီးမေးလ်ပို့ပါ။",
                  locale
                )}
              </p>
              <a
                className="mt-3 text-lg font-bold text-primary hover:underline hover:underline-offset-4"
                href={"mailto:" + siteInfo?.email}
                target="_blank"
                rel="noreferrer"
              >
                {siteInfo?.email}
              </a>
            </div>

            <div className="flex flex-col items-center justify-center gap-1">
              <span className="rounded-md bg-primary/10 p-3 text-primary">
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
                    d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                  />
                </svg>
              </span>
              <h2 className="text-primaryText mt-4 text-xl font-bold">
                {getText("Call us:", "ဖုန်းဖြင့်ဆက်သွယ်ရန်", locale)}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {getText(
                  "Call us to speak to a member of our team. We are always happy to help.",
                  "မိတ်ဆွေတို့အား ကူညီရန် ကျွန်တော့်တို့ဘက်မှ အသင်းသားများ အသင့်ရှိနေပါသည်။ လူကြီးမင်း၏ အခက်အခဲအားပြောပြရန် ဖုန်းဖြင့်ဆက်သွယ်ပါ။",
                  locale
                )}
              </p>
              <a
                className="mt-3 text-lg font-bold text-primary hover:underline hover:underline-offset-4"
                href={"tel:" + siteInfo?.phone}
                target="_blank"
                rel="noreferrer"
              >
                {siteInfo?.phone}
              </a>
            </div>

            <div className="group flex flex-col items-center justify-center gap-1">
              <span className="rounded-md bg-primary/10 p-3 text-primary">
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
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
              </span>
              <h2 className="text-primaryText mt-4 text-xl font-bold">
                {getText("Address", "လိပ်စာ", locale)}
              </h2>
              <p className="mt-1 text-center text-sm text-slate-500">
                {getText(
                  "Find us here. Our address is your destination for all things e-commerce.",
                  "သင့်စီးပွားရေးအတွက် လိုအပ်သည့်အရာအားလုံးသည် ဤနေရာတွင် ရှိပါသည်။",
                  locale
                )}
              </p>
              <a
                className="mt-3 text-lg font-bold text-primary hover:underline hover:underline-offset-4"
                href={siteInfo?.googleMapUrl1!}
                target="_blank"
                rel="noreferrer"
              >
                {getText(siteInfo?.address, siteInfo.addressMM, locale)}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale }: any) {
  const siteInfo = await prisma.content.findFirst({});

  const buyerCount = await prisma.user.count({
    where: {
      isBlocked: false,
      isDeleted: false,
      role: {
        in: [Role.Trader, Role.Buyer],
      },
    },
  });

  const sellerCount = await prisma.user.count({
    where: {
      isBlocked: false,
      isDeleted: false,
      sellAllow: true,
      role: {
        in: [Role.Trader, Role.Seller],
      },
    },
  });
  const subscriberCount = await prisma.subscribe.count({});

  return {
    props: {
      siteInfo: JSON.parse(JSON.stringify(siteInfo)),
      buyerCount: buyerCount,
      sellerCount: sellerCount,
      subscriberCount: subscriberCount,
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default About;
