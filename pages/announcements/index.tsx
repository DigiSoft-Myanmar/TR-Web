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
import { Category, PromoCode, Role } from "@prisma/client";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { useQuery } from "react-query";
import EmptyScreen from "@/components/screen/EmptyScreen";
import { useRouter } from "next/router";
//import PromotionModal from "@/components/modal/sideModal/PromotionModal";
import LoadingScreen from "@/components/screen/LoadingScreen";
import PromoTbl from "@/components/muiTable/PromoTbl";

function PromoCodePage() {
  const { isLoading, error, data, refetch } = useQuery("promoData", () =>
    fetch("/api/promoCode").then((res) => {
      let json = res.json();
      return json;
    })
  );
  const [isModalOpen, setModalOpen] = React.useState(false);
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  const [title, setTitle] = React.useState("Create Promo Code");
  const [promotion, setPromotion] = React.useState<any>({
    isAllowAllBrand: true,
    isAllowAllBuyers: true,
    brandIds: [],
    isPercent: false,
    isCouponUsagePerUserInfinity: true,
    isCouponUsageInfinity: true,
  });
  const { locale } = useRouter();

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>Promo Codes | Pyi Twin Phyit</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto">
        {data && data.length > 0 ? (
          <section className="flex flex-col space-y-5">
            <PromoTbl
              data={data}
              refetch={() => {
                refetch();
              }}
            />
          </section>
        ) : !data ? (
          <LoadingScreen />
        ) : (
          <EmptyScreen
            onClickFn={() => {
              setModalOpen(true);
              setTitle("Create Promo Code");
              setPromotion({
                isAllowAllBrand: true,
                isAllowAllBuyers: true,
                brandIds: [],
                isPercent: false,
                isCouponUsagePerUserInfinity: true,
                isCouponUsageInfinity: true,
              });
              setModalOpen(true);
              setTitle("Create Promo Code");
            }}
          />
        )}
        <button
          className="fixed right-3 bottom-3 rounded-full bg-primary p-3 text-white"
          onClick={() => {
            setModalOpen(true);
            setTitle("Create Promo Code");
            setPromotion({
              isAllowAllBrand: true,
              isAllowAllBuyers: true,
              brandIds: [],
              isPercent: false,
              isCouponUsagePerUserInfinity: true,
              isCouponUsageInfinity: true,
            });
          }}
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

      {/*  <PromotionModal
        title={title}
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        promotion={promotion}
        setUpdate={() => {
          refetch();
        }}
      /> */}
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

export default PromoCodePage;
