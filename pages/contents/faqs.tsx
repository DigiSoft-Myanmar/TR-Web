import FAQList from "@/components/card/FAQList";
import FAQGroupModal from "@/components/modal/sideModal/FAQGroupModal";
import EmptyScreen from "@/components/screen/EmptyScreen";
import ErrorScreen from "@/components/screen/ErrorScreen";
import LoadingScreen from "@/components/screen/LoadingScreen";
import nextI18nextConfig from "@/next-i18next.config";
import { defaultDescription } from "@/types/const";
import { getHeaders } from "@/util/authHelper";
import { fetcher } from "@/util/fetcher";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";
import useSWR from "swr";

function FAQs() {
  const { t: commonT } = useTranslation("common");
  const { isLoading, error, data, refetch } = useQuery("faqsData", () =>
    fetch("/api/faqs").then((res) => {
      let json = res.json();
      return json;
    })
  );
  const { data: session }: any = useSession();
  const { locale } = useRouter();
  const [isModalOpen, setModalOpen] = React.useState(false);

  function updateFn() {
    refetch();
  }

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <>
      <div className="flex min-h-screen flex-col pb-10 pt-10 lg:pt-0">
        <Head>
          <title>FAQs | Pyi Twin Phyit</title>
          <meta name="description" content={defaultDescription} />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <section>
          {data && data.length > 0 ? (
            <FAQList data={data} updateFn={updateFn} />
          ) : !data ? (
            <LoadingScreen />
          ) : (
            <EmptyScreen
              onClickFn={() => {
                setModalOpen(true);
              }}
            />
          )}
        </section>
        <div
          className="group fixed bottom-5 right-5 z-40 cursor-pointer rounded-full bg-primary p-4 text-white shadow-md shadow-primary"
          onClick={() => {
            setModalOpen(true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-white transition duration-100 ease-in-out"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
      </div>
      <FAQGroupModal
        FAQGroup={{}}
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        title={
          locale === "mm"
            ? "မေးလေ့ရှိသောမေးခွန်းအုပ်စုအသစ်ဖွဲ့ရန်"
            : "New FAQ Group"
        }
        onClickFn={(data: any, setSubmit: Function) => {
          setSubmit(true);

          fetch("/api/faqs/group", {
            method: "POST",
            body: JSON.stringify(data),
            headers: getHeaders(session),
          }).then(async (data) => {
            setSubmit(false);
            if (data.status === 200) {
              showSuccessDialog(
                commonT("submit") + " " + commonT("success"),
                "",
                locale
              );
              updateFn();
            } else {
              let json = await data.json();
              if (json.error) {
                showErrorDialog(json.error, json.errorMM, locale);
              } else {
                showErrorDialog(commonT("somethingWentWrong"), "", locale);
              }
            }
            setModalOpen(false);
          });
        }}
      />
    </>
  ) : (
    <ErrorScreen statusCode={401} />
  );
}

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default FAQs;
