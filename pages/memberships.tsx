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
import { Ads, Content, Membership } from "@prisma/client";
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
import MembershipTable from "@/components/presentational/MembershipTable";
import { encryptPhone } from "@/util/encrypt";
import AdsHere from "@/components/Ads/AdsHere";
import { AdsLocation, AdsPage } from "@/util/adsHelper";
import { IconPickerItem } from "react-fa-icon-picker";

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
    getText(siteInfo?.membershipTitle, siteInfo?.membershipTitleMM, locale)
  );
  const headDescription = getHighlightText(
    getText(
      siteInfo?.membershipDescription,
      siteInfo?.membershipDescriptionMM,
      locale
    )
  );

  const { isLoading, error, data } = useQuery("membershipsData", () =>
    fetch("/api/memberships").then((res) => {
      let json = res.json();
      return json;
    })
  );

  const { data: adsData } = useQuery("adsDataMembership", () =>
    fetch("/api/siteManagement/ads?placement=" + AdsPage.Membership).then(
      (res) => {
        let json = res.json();
        return json;
      }
    )
  );

  return (
    <>
      <div>
        <Head>
          <title>Member | Treasure Rush</title>
          <meta name="description" content={defaultDescription} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <section className="px-10 md:px-20">
          <div className="max-w-screen-xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:gap-16 lg:grid-cols-2">
              <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:h-full lg:order-last">
                {siteInfo.membershipHeroImg && (
                  <img
                    src={fileUrl + siteInfo.membershipHeroImg}
                    className="max-w-[500px]"
                  />
                )}
              </div>

              <div className="lg:py-24">
                <h2 className="text-3xl font-bold sm:text-4xl leading-loose sm:leading-loose">
                  {headTitle.map((e: any, index: number) => (
                    <span
                      key={index}
                      className={
                        e.isHighlight === true
                          ? "font-extrabold text-primary"
                          : ""
                      }
                    >
                      {e.text}
                    </span>
                  ))}
                </h2>

                <p className="mt-4 text-gray-600 leading-8">
                  {headDescription.map((e: any, index: number) => (
                    <span
                      key={index}
                      className={
                        e.isHighlight === true ? "font-bold text-primary" : ""
                      }
                    >
                      {e.text}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </section>

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

        <AdsHere
          column={1}
          adsLocations={[AdsLocation.Memberships1]}
          defaultImg={
            siteInfo?.defaultAdsOneCol ? siteInfo.defaultAdsOneCol : ""
          }
          imgList={[
            adsData?.filter((z: Ads) =>
              z.adsLocations.find(
                (b: any) => b.location === AdsLocation.Memberships1
              )
            ),
          ]}
        />

        <section className="relative z-20 overflow-hidden pt-20 pb-12 lg:pt-[120px] lg:pb-[90px]">
          <div className="container mx-auto">
            <div className="-mx-4 flex flex-wrap">
              <div className="w-full px-4">
                <div className="mx-auto mb-[60px] max-w-screen-xl text-center lg:mb-20 flex flex-col">
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
                  <p className="text-body-color text-base mt-3">
                    {getText(
                      "Ready to take your business to the next level? ",
                      "သင့်လုပ်ငန်းကို နောက်တစ်ဆင့်တက်လှမ်းရန်",
                      locale
                    )}
                  </p>
                  <span className="text-body-color text-base mt-1">
                    {getText(
                      "Join Treasure Rush and watch your earnings grow.",
                      "Treasure Rush ဖြင့် လက်တွဲလိုက်ပြီး သင့်စီးပွားရေးတိုးတက်မှုကို စောင့်ကြည့်လိုက်ပါ။",
                      locale
                    )}
                  </span>
                </div>
              </div>
            </div>
            <MembershipTable data={data} />
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
