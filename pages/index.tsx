import Link from "next/link";
import Layout from "../components/Layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import Image from "next/image";

export function IndexPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  return (
    <div>
      <button
        className="bg-sellerBg/50 backdrop-blur  border border-primary rounded-md p-3 hover:bg-primary hover:text-primaryText transition text-gray-300"
        onClick={() => {
          router.push(router.route, router.asPath, {
            locale: router && router.locale === "mm" ? "en" : "mm",
          });
        }}
      >
        {router && router.locale && router.locale === "mm" ? (
          <div className="flex flex-row items-center gap-3">
            <Image
              src="/assets/icon/myanmar.svg"
              width={20}
              height={20}
              className="h-5 w-5"
              alt="myanmar"
            />
            <span className="lg:block hidden text-sm">မြန်မာ</span>
          </div>
        ) : (
          <div className="flex flex-row items-center gap-3">
            <Image
              src="/assets/icon/eng.svg"
              width={20}
              height={20}
              className="h-5 w-5"
              alt="english"
            />
            <span className="lg:block hidden text-sm">English</span>
          </div>
        )}
      </button>
      <div className="bg-red-500 px-3 py-2 text-white">{t("home")}</div>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      // Will be passed to the page component as props
    },
  };
}

export default IndexPage;
