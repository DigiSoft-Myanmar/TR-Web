import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import CategoryModal from "@/components/modal/sideModal/CategoryModal";
import Image from "next/image";
import CategoryCard from "@/components/card/CategoryCard";
import AttributeModal from "@/components/modal/sideModal/AttributeModal";
import AttributeCard from "@/components/card/AttributeCard";
import { Attribute, Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { useQuery } from "react-query";
import EmptyScreen from "@/components/screen/EmptyScreen";

function Attributes() {
  const { t } = useTranslation("common");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const { data: session }: any = useSession();
  const [isUpdate, setUpdate] = React.useState(false);
  const { isLoading, error, data, refetch } = useQuery("attributesData", () =>
    fetch("/api/products/attributes").then((res) => {
      let json = res.json();
      return json;
    })
  );

  React.useEffect(() => {
    if (isUpdate === true) {
      refetch();
      setUpdate(false);
    }
  }, [isUpdate]);

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>Attributes | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto p-5">
        <h3 className="text-lg font-semibold text-gray-700">Attributes</h3>
        {data && data.length > 0 ? (
          <section className="mt-5 flex flex-row flex-wrap items-start gap-5">
            {data.map((e: Attribute, index: number) => (
              <AttributeCard key={index} {...e} setUpdate={setUpdate} />
            ))}
          </section>
        ) : (
          <EmptyScreen
            onClickFn={() => {
              setModalOpen(true);
            }}
          />
        )}
        <button
          className="fixed right-3 bottom-3 rounded-full bg-primary p-3 text-white"
          onClick={() => setModalOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        </button>
      </div>

      <AttributeModal
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        attribute={undefined}
        setUpdate={setUpdate}
        title={t("newAttribute")}
      />
    </div>
  ) : (
    <ErrorScreen statusCode={401} />
  );
}

export async function getServerSideProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Attributes;
