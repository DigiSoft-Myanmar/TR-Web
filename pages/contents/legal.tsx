import nextI18nextConfig from "@/next-i18next.config";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import Swal from "sweetalert2";
import "suneditor/dist/css/suneditor.min.css";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { defaultDescription } from "@/types/const";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import { Legal, Role } from "@prisma/client";
import prisma from "@/prisma/prisma";
import { getHeaders } from "@/util/authHelper";

export enum PrivacyType {
  accessibility = "Accessibility",
  cookie = "Cookie",
  privacy = "Privacy Policy",
  return = "Return & Refund Policy",
  termsNConditions = "Terms & Conditions",
}

const FormInputRichText: any = dynamic(
  () => import("@/components/presentational/FormInputRichTextSun"),
  {
    ssr: false,
  }
);

function LegalPage({ data }: { data: Legal }) {
  const router = useRouter();
  const { locale } = router;
  const [currentType, setCurrentType] = React.useState<PrivacyType>(
    PrivacyType.accessibility
  );
  const [content, setContent] = React.useState("");
  const [contentMM, setContentMM] = React.useState("");
  const { t } = useTranslation("common");
  const [isSubmit, setSubmit] = React.useState(false);

  const { type } = router.query;

  const { data: session }: any = useSession();

  React.useEffect(() => {
    if (type) {
      if (type === PrivacyType.privacy) {
        setCurrentType(type);
        setContent(data?.privacyPoliy ? data?.privacyPoliy : "");
        setContentMM(data?.privacyPoliyMM ? data?.privacyPoliyMM : "");
      } else if (type === PrivacyType.accessibility) {
        setCurrentType(type);
        setContent(data?.accessibility ? data?.accessibility : "");
        setContentMM(data?.accessibilityMM ? data?.accessibilityMM : "");
      } else if (type === PrivacyType.cookie) {
        setCurrentType(type);
        setContent(data?.cookie ? data?.cookie : "");
        setContentMM(data?.cookieMM ? data?.cookieMM : "");
      } else if (type === PrivacyType.return) {
        setCurrentType(type);
        setContent(data?.returnPolicy ? data?.returnPolicy : "");
        setContentMM(data?.returnPolicyMM ? data?.returnPolicyMM : "");
      } else if (type === PrivacyType.termsNConditions) {
        setCurrentType(type);
        setContent(data?.termsNConditions ? data?.termsNConditions : "");
        setContentMM(data?.termsNConditionsMM ? data?.termsNConditionsMM : "");
      }
    }
  }, [type, data]);

  if (
    session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin)
  ) {
    return (
      <div className="flex flex-col space-y-5 rounded-md bg-white">
        <Head>
          <title>{t(currentType)} | Pyi Twin Phyit</title>
          <meta name="description" content={defaultDescription} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <ul className="flex overflow-x-auto bg-white">
          {Object.values(PrivacyType).map((e, index) => (
            <li className="flex-1" key={index}>
              <Link
                href={`/contents/legal?type=${encodeURIComponent(e)}`}
                className={`relative block px-4 py-6 ${
                  currentType === e ? "text-primary" : "text-gray-400"
                }`}
              >
                <div className="flex items-center justify-center">
                  <span className="ml-3 whitespace-nowrap text-sm font-medium">
                    {e}
                  </span>
                </div>
                {currentType === e ? (
                  <span className="absolute bottom-0 left-0 right-0 h-1 w-full bg-primary"></span>
                ) : (
                  <span className="absolute bottom-0 left-0 right-0 h-1 w-full bg-gray-200"></span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className={`flex w-full flex-col space-y-5 p-10`}>
          <FormInputRichText
            content={content}
            label={currentType + "-" + "(ENG)"}
            setContent={(e: string) => {
              setContent(e);
            }}
          />

          {content && content.length > 0 && (
            <>
              <FormInputRichText
                content={contentMM}
                label={currentType + "-" + "(MM)"}
                setContent={(e: string) => {
                  setContentMM(e);
                }}
              />
            </>
          )}
          <div className="flex w-full justify-end">
            <div>
              <SubmitBtn
                isSubmit={isSubmit}
                submitTxt={t("submitting")}
                text={t("submit")}
                onClick={() => {
                  setSubmit(true);
                  let updateBody: any = {};
                  switch (currentType) {
                    case PrivacyType.accessibility:
                      updateBody.accessibility = content;
                      updateBody.accessibilityMM = contentMM;
                      break;
                    case PrivacyType.cookie:
                      updateBody.cookie = content;
                      updateBody.cookieMM = contentMM;
                      break;
                    case PrivacyType.privacy:
                      updateBody.privacyPoliy = content;
                      updateBody.privacyPoliyMM = contentMM;
                      break;
                    case PrivacyType.return:
                      updateBody.returnPolicy = content;
                      updateBody.returnPolicyMM = contentMM;
                      break;
                    case PrivacyType.termsNConditions:
                      updateBody.termsNConditions = content;
                      updateBody.termsNConditionsMM = contentMM;
                      break;
                  }

                  fetch("/api/legal", {
                    method: "POST",
                    body: JSON.stringify(updateBody),
                    headers: getHeaders(session),
                  }).then(async (data) => {
                    setSubmit(false);
                    if (data.status === 200) {
                      showSuccessDialog(
                        t("submit") + " " + t("success"),
                        "",
                        locale,
                        () => {
                          router.reload();
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
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <ErrorScreen statusCode={401} />;
  }
}

export async function getServerSideProps({ locale }: any) {
  const legal = await prisma.legal.findFirst({});
  return {
    props: {
      data: JSON.parse(JSON.stringify(legal)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default LegalPage;
