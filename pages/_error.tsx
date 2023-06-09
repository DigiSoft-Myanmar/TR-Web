import nextI18nextConfig from "../next-i18next.config";
import { isInternal } from "@/util/authHelper";
import { useSession } from "next-auth/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import Link from "next/link";
import React from "react";

type Props = {
  statusCode?: number;
};

function _error({ statusCode }: Props) {
  const { data: session }: any = useSession();
  return (
    <div>
      <div className="relative mx-auto bg-white">
        <div
          className={`grid ${
            isInternal(session)
              ? "h-[calc(100vh-17vh)] px-4 py-8"
              : "h-screen max-h-screen bg-sellerBg"
          } place-content-center px-4`}
        >
          <div className="text-center">
            <h1 className="text-9xl font-black text-gray-200">{statusCode}</h1>

            <p
              className={`text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl`}
            >
              Uh-oh!
            </p>

            <p className="mt-4 text-gray-500">
              {statusCode === 404
                ? "We can't find that page."
                : "Something went wrong. We are fixing it."}
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-focus focus:outline-none focus:ring"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps({ res, err, locale }: any) {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;

  return {
    props: {
      statusCode,
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default _error;
