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
import { Content, Legal, Role } from "@prisma/client";
import prisma from "@/prisma/prisma";
import { getHeaders } from "@/util/authHelper";

export enum PrivacyType {
  SKUListing = "SKU Listing",
  TopSearch = "Top Search",
  CategoryReport = "Category Sales Report",
  BuyerProfileReport = "Buyer Profile Report",
  Ads = "Ads",
  Onboarding = "Onboarding",
  CustomerService = "Customer Service",
}

const FormInputRichText: any = dynamic(
  () => import("@/components/presentational/FormInputRichTextSun"),
  {
    ssr: false,
  }
);

function ConfPage({ data }: { data: Content }) {
  const router = useRouter();
  const { locale } = router;
  const [currentType, setCurrentType] = React.useState<PrivacyType>(
    PrivacyType.SKUListing
  );
  const [content, setContent] = React.useState("");
  const [contentMM, setContentMM] = React.useState("");
  const { t } = useTranslation("common");
  const [isSubmit, setSubmit] = React.useState(false);

  const { type } = router.query;

  const { data: session }: any = useSession();

  React.useEffect(() => {
    if (type) {
      if (type === PrivacyType.SKUListing) {
        setCurrentType(type);
        setContent(data?.SKUDetails ? data?.SKUDetails : "");
        setContentMM(data?.SKUDetailsMM ? data?.SKUDetailsMM : "");
      } else if (type === PrivacyType.Ads) {
        setCurrentType(type);
        setContent(data?.adsDetails ? data?.adsDetails : "");
        setContentMM(data?.adsDetailsMM ? data?.adsDetailsMM : "");
      } else if (type === PrivacyType.BuyerProfileReport) {
        setCurrentType(type);
        setContent(data?.buyerReportDetails ? data?.buyerReportDetails : "");
        setContentMM(
          data?.buyerReportDetailsMM ? data?.buyerReportDetailsMM : ""
        );
      } else if (type === PrivacyType.CategoryReport) {
        setCurrentType(type);
        setContent(data?.saleReportDetails ? data?.saleReportDetails : "");
        setContentMM(
          data?.saleReportDetailsMM ? data?.saleReportDetailsMM : ""
        );
      } else if (type === PrivacyType.CustomerService) {
        setCurrentType(type);
        setContent(
          data?.customerServiceDetails ? data?.customerServiceDetails : ""
        );
        setContentMM(
          data?.customerServiceDetailsMM ? data?.customerServiceDetailsMM : ""
        );
      } else if (type === PrivacyType.Onboarding) {
        setCurrentType(type);
        setContent(data?.onBoardingDetails ? data?.onBoardingDetails : "");
        setContentMM(
          data?.onBoardingDetailsMM ? data?.onBoardingDetailsMM : ""
        );
      } else if (type === PrivacyType.TopSearch) {
        setCurrentType(type);
        setContent(data?.topSearchDetails ? data?.topSearchDetails : "");
        setContentMM(data?.topSearchDetailsMM ? data?.topSearchDetailsMM : "");
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
          <title>{t(currentType)} | Treasure Rush</title>
          <meta name="description" content={defaultDescription} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <ul className="flex overflow-x-auto bg-white">
          {Object.values(PrivacyType).map((e, index) => (
            <li className="flex-1" key={index}>
              <Link
                href={`/contents/memberships/conf?type=${encodeURIComponent(
                  e
                )}`}
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
                    case PrivacyType.Ads:
                      updateBody.adsDetails = content;
                      updateBody.adsDetailsMM = contentMM;
                      break;
                    case PrivacyType.BuyerProfileReport:
                      updateBody.buyerReportDetails = content;
                      updateBody.buyerReportDetails = contentMM;
                      break;
                    case PrivacyType.CategoryReport:
                      updateBody.saleReportDetails = content;
                      updateBody.saleReportDetails = contentMM;
                      break;
                    case PrivacyType.CustomerService:
                      updateBody.customerServiceDetails = content;
                      updateBody.customerServiceDetailsMM = contentMM;
                      break;
                    case PrivacyType.Onboarding:
                      updateBody.onBoardingDetails = content;
                      updateBody.onBoardingDetailsMM = contentMM;
                      break;
                    case PrivacyType.SKUListing:
                      updateBody.SKUDetails = content;
                      updateBody.SKUDetailsMM = contentMM;
                      break;
                    case PrivacyType.TopSearch:
                      updateBody.topSearchDetails = content;
                      updateBody.topSearchDetailsMM = contentMM;
                      break;
                  }

                  fetch("/api/siteManagement", {
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
  const content = await prisma.content.findFirst({});
  return {
    props: {
      data: JSON.parse(JSON.stringify(content)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default ConfPage;
