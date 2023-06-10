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
import { useSession } from "next-auth/react";
import { Category, Role } from "@prisma/client";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { useQuery } from "react-query";
import EmptyScreen from "@/components/screen/EmptyScreen";

function Categories() {
  const { isLoading, error, data, refetch } = useQuery("categoriesData", () =>
    fetch("/api/products/categories").then((res) => {
      let json = res.json();
      return json;
    })
  );
  const [isModalOpen, setModalOpen] = React.useState(false);
  const { t } = useTranslation("common");
  const [isUpdate, setUpdate] = React.useState(false);
  const { data: session }: any = useSession();

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
        <title>Categories | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto p-5">
        <h3 className="text-lg font-semibold text-gray-700">Categories</h3>
        {data && data.length > 0 ? (
          <section className="mt-5 flex flex-row flex-wrap items-start gap-5">
            {data.map((e: Category, index: number) => (
              <CategoryCard
                key={index}
                {...e}
                setUpdate={setUpdate}
                level={0}
              />
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

      <CategoryModal
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        title={t("newCategory")}
        category={undefined}
        setUpdate={setUpdate}
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

export default Categories;
