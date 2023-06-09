import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import prisma from "@/prisma/prisma";
import { defaultDescription } from "@/types/const";
import { Legal } from "@prisma/client";
import { useSession } from "next-auth/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { getText } from "@/util/textHelper";
import { upperCase } from "lodash";
import { PrivacyType } from "@/types/pageType";

function Legal({ legalInfo }: { legalInfo: Legal }) {
  const { data: session, status } = useSession();
  const { type } = useRouter().query;
  const privacyArticleRef = React.useRef<HTMLDivElement | null>(null);
  const { locale } = useRouter();

  React.useEffect(() => {
    let parser = new DOMParser();
    if (legalInfo) {
      let info = "";
      switch (type) {
        case PrivacyType.accessibility:
          info = getText(
            legalInfo.accessibility,
            legalInfo.accessibilityMM,
            locale
          );
          break;
        case PrivacyType.cookie:
          info = getText(legalInfo.cookie, legalInfo.cookieMM, locale);
          break;
        case PrivacyType.privacy:
          info = getText(
            legalInfo.privacyPoliy,
            legalInfo.privacyPoliyMM,
            locale
          );

          break;

        case PrivacyType.termsNConditions:
          info = getText(
            legalInfo.termsNConditions,
            legalInfo.termsNConditionsMM,
            locale
          );
          break;
        case PrivacyType.return:
          info = getText(
            legalInfo.returnPolicy,
            legalInfo.returnPolicyMM,
            locale
          );
          break;
        default:
          info = getText(
            legalInfo.termsNConditions,
            legalInfo.termsNConditionsMM,
            locale
          );
          break;
      }

      let doc = parser.parseFromString(info, "text/html");
      if (privacyArticleRef.current) {
        privacyArticleRef.current.innerHTML = "";
        privacyArticleRef.current.appendChild(doc.body);
      }
    }
  }, [legalInfo, type, locale]);

  return (
    <div>
      <Head>
        <title>
          {type === PrivacyType.return
            ? "Return & Refund Policy"
            : type
            ? type.toString()
            : "Terms & Conditions"}
          | Pyi Twin Phyit
        </title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="min-h-screen">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold sm:text-4xl">
              {type === PrivacyType.return
                ? "Return & Refund Policy"
                : type === PrivacyType.termsNConditions
                ? "Terms & Conditions"
                : type
                ? type.toString()
                : "Terms & Conditions"}
            </h2>
          </div>

          <div className="mt-8 flex flex-col items-center gap-8">
            <div className="lg:py-16">
              <div ref={privacyArticleRef}></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export async function getServerSideProps({ locale }: any) {
  const legalInfo = await prisma.legal.findFirst({});
  return {
    props: {
      legalInfo: JSON.parse(JSON.stringify(legalInfo)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Legal;
