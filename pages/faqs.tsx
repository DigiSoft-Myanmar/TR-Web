import FAQList from "@/components/card/FAQList";
import Navbar from "@/components/navbar/Navbar";
import ErrorScreen from "@/components/screen/ErrorScreen";
import LoadingScreen from "@/components/screen/LoadingScreen";
import nextI18nextConfig from "@/next-i18next.config";
import { defaultDescription } from "@/types/const";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import React from "react";
import { useQuery } from "react-query";

function FAQs() {
  const { isLoading, error, data, refetch } = useQuery("faqsData", () =>
    fetch("/api/faqs").then((res) => {
      let json = res.json();
      return json;
    })
  );
  return (
    <div className="flex min-h-screen flex-col px-5 pb-10 pt-10 lg:px-10">
      <Head>
        <title>FAQs | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section>
        {data && data.length > 0 ? (
          <FAQList data={data} updateFn={() => {}} />
        ) : !data ? (
          <LoadingScreen />
        ) : (
          <ErrorScreen statusCode={501} />
        )}
      </section>
    </div>
  );
}

export async function getServerSideProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default FAQs;
