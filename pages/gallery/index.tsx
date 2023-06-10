import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import Image from "next/image";
import SelectImage from "@/components/presentational/SelectImage";
import LoadingScreen from "@/components/screen/LoadingScreen";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import { ImgType } from "@/types/orderTypes";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { getHeaders } from "@/util/authHelper";

function GalleryPage() {
  const { t } = useTranslation("common");
  const imgType = ImgType.Product;
  const { locale } = useRouter();
  const [page, setPage] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState<any>([]);
  const limit = 50;
  const path = React.useMemo(() => {
    return `/api/gallery?type=${imgType}&limit=${limit}&page=${page}`;
  }, [ImgType, limit, page]);

  const { data, refetch } = useQuery("imgData", () =>
    fetch(path).then((res) => {
      let json = res.json();
      return json;
    })
  );
  const { data: session }: any = useSession();

  React.useEffect(() => {
    refetch();
  }, [path]);

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>{imgType} Gallery | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mx-auto flex flex-col items-center p-10">
        <h3 className="w-full px-5 text-lg font-semibold text-gray-700">
          Manage {imgType} Gallery
        </h3>
        <div className="mt-5 min-h-[70vh] w-full bg-white p-5">
          {data && data.docs ? (
            data.docs.length > 0 ? (
              <>
                <div className="flex w-full flex-wrap justify-start gap-3 px-4 py-2">
                  {data.docs.map((elem: any, index: number) => (
                    <div key={index} className="relative">
                      <SelectImage
                        src={`/api/files/${elem.filename}`}
                        isChecked={selectedImage.find(
                          (e: any) => e.filename === elem.filename
                        )}
                        setChecked={() =>
                          setSelectedImage((prevValue: any) => {
                            let d = [...prevValue];
                            if (
                              d.find((e: any) => e.filename === elem.filename)
                            ) {
                              d = d.filter(
                                (e: any) => e.filename !== elem.filename
                              );
                            } else {
                              d.push(elem);
                            }
                            return d;
                          })
                        }
                      />
                      {elem.usage && (
                        <span className="absolute top-0 z-10 w-[20px] rounded-br-md bg-primary p-1 text-center text-xs text-white">
                          {elem.usage.length}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex min-h-[70vh] w-full flex-col items-center justify-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-24 w-24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z"
                  />
                </svg>

                <h1 className="text-center text-2xl">No Data</h1>
              </div>
            )
          ) : (
            <LoadingScreen />
          )}
        </div>

        <div className="mt-4 flex w-full items-end justify-end">
          {data && (
            <div className="flex flex-grow flex-col items-start">
              <span className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {1 + (page - 1) * limit}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-900">
                  {limit + (page - 1) * limit > data.totalDocs
                    ? data.totalDocs
                    : limit + (page - 1) * limit}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {data?.totalDocs}
                </span>{" "}
                Entries
              </span>
              <div className="xs:mt-0 mt-2 inline-flex">
                <button
                  className="cursor-pointer rounded-l bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-primary-focus"
                  disabled={page === 1}
                  onClick={(e) => {
                    setPage(page - 1);
                  }}
                >
                  Prev
                </button>
                <button
                  className="cursor-pointer rounded-r bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-primary-focus"
                  disabled={page === data.totalPages}
                  onClick={(e) => {
                    setPage(page + 1);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-error px-4 py-2 text-sm font-medium text-white hover:bg-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2"
            onClick={() => {
              let isExists =
                selectedImage.filter((e: any) => e.usage?.length > 0).length >
                0;
              if (isExists === true) {
                showErrorDialog(
                  "Cannot performed this action since these images are used.",
                  ""
                );
              } else {
                showConfirmationDialog(
                  t("deleteConfirmation"),
                  "",
                  locale,
                  () => {
                    fetch("/api/gallery/manage", {
                      method: "DELETE",
                      body: JSON.stringify(selectedImage),
                      headers: getHeaders(session),
                    }).then(async (data) => {
                      if (data.status === 200) {
                        let json = await data.json();
                        showSuccessDialog(
                          json.deletedCount + " items deleted.",
                          "",
                          locale,
                          () => {
                            refetch();
                          }
                        );
                      } else {
                        let json = await data.json();
                        showErrorDialog(json.error, json.errorMM, locale);
                      }
                    });
                  }
                );
              }
            }}
          >
            Delete
          </button>
        </div>
      </main>
    </div>
  ) : (
    <ErrorScreen statusCode={401} />
  );
}

export async function getServerSideProps({ locale, params }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default GalleryPage;
