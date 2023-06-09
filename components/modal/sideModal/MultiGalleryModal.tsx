import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import { Role } from "@prisma/client";
import SelectImage from "@/components/presentational/SelectImage";
import { ImgType } from "@/types/orderTypes";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  fileSrc: string[];
  setFileSrc: Function;
  sellerId?: string;
  isSeller: boolean;
  type: ImgType;
}

function MultiGalleryModal({
  isModalOpen,
  setModalOpen,
  fileSrc,
  setFileSrc,
  sellerId,
  isSeller,
  type,
}: Props) {
  const { data: session }: any = useSession();
  const router = useRouter();
  const { t } = useTranslation("common");
  const limit = 15;
  const [path, setPath] = React.useState(
    sellerId
      ? `/api/gallery?type=${type}&limit=${limit}&seller=${sellerId}`
      : `/api/gallery?type=${type}&limit=${limit}`,
  );
  const [page, setPage] = React.useState(1);
  const { data } = useSWR(path, fetcher);
  const [file, setFile] = React.useState(fileSrc);

  React.useEffect(() => {
    setFile(fileSrc);
  }, [fileSrc]);

  React.useEffect(() => {
    let p = `/api/gallery?type=${type}&limit=${limit}&page=` + page;
    if (isSeller === true) {
      if (sellerId) {
        p += "&seller=" + sellerId;
      }
    }
    setPath(p);
  }, [page, sellerId, isSeller, type]);

  React.useEffect(() => {
    router.beforePopState(({ as }) => {
      if (as !== router.asPath) {
        if (isModalOpen === true) {
          setModalOpen(false);
          return false;
        }
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [router, isModalOpen, setModalOpen]);
  return (
    <>
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            {isModalOpen === true && (
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
              </Transition.Child>
            )}

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="my-8 inline-block w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto bg-white p-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="text-darkShade flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">Choose from gallery</h3>
                    <button
                      className="bg-lightShade flex rounded-md p-2 focus:outline-none"
                      onClick={() => setModalOpen(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </Dialog.Title>
                  <div className="mt-2">
                    {/*  {isSeller === true &&
                      session &&
                      (session.role === Role.Admin ||
                        session.role === Role.Staff ||
                        session.role === Role.SuperAdmin) && (
                        <div className="flex flex-col space-y-3 px-4 py-2">
                          <label className="text-sm text-slate-500">
                            {t("seller")}
                          </label>
                          <SellerSelectBox
                            setSelected={(e: any) => {
                              setSeller(e._id);
                            }}
                            selected={seller}
                            isSearch={true}
                          />
                        </div>
                      )} */}
                    {data && data.docs ? (
                      data.docs.length > 0 ? (
                        <>
                          <div className="flex flex-wrap justify-start gap-3 px-4 py-2">
                            {data.docs.map((elem: any, index: number) => (
                              <SelectImage
                                key={index}
                                src={`/api/files/${elem.filename}`}
                                isChecked={file?.includes(`${elem.filename}`)}
                                setChecked={() =>
                                  setFile((prevValue) => {
                                    let d = [...prevValue];
                                    if (d.includes(elem.filename)) {
                                      d = d.filter(
                                        (e: string) => e !== elem.filename,
                                      );
                                    } else {
                                      d.push(elem.filename);
                                    }
                                    if (d.length > 5) {
                                      return [...prevValue];
                                    }
                                    return d;
                                  })
                                }
                              />
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-10 p-10 lg:p-20">
                          <h3 className="text-3xl font-semibold">
                            {t("noData")}
                          </h3>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            data-name="Layer 1"
                            className="h-1/3 w-1/3 px-20"
                            viewBox="0 0 647.63626 632.17383"
                          >
                            <path
                              d="M687.3279,276.08691H512.81813a15.01828,15.01828,0,0,0-15,15v387.85l-2,.61005-42.81006,13.11a8.00676,8.00676,0,0,1-9.98974-5.31L315.678,271.39691a8.00313,8.00313,0,0,1,5.31006-9.99l65.97022-20.2,191.25-58.54,65.96972-20.2a7.98927,7.98927,0,0,1,9.99024,5.3l32.5498,106.32Z"
                              transform="translate(-276.18187 -133.91309)"
                              fill="#f2f2f2"
                            />
                            <path
                              d="M725.408,274.08691l-39.23-128.14a16.99368,16.99368,0,0,0-21.23-11.28l-92.75,28.39L380.95827,221.60693l-92.75,28.4a17.0152,17.0152,0,0,0-11.28028,21.23l134.08008,437.93a17.02661,17.02661,0,0,0,16.26026,12.03,16.78926,16.78926,0,0,0,4.96972-.75l63.58008-19.46,2-.62v-2.09l-2,.61-64.16992,19.65a15.01489,15.01489,0,0,1-18.73-9.95l-134.06983-437.94a14.97935,14.97935,0,0,1,9.94971-18.73l92.75-28.4,191.24024-58.54,92.75-28.4a15.15551,15.15551,0,0,1,4.40966-.66,15.01461,15.01461,0,0,1,14.32032,10.61l39.0498,127.56.62012,2h2.08008Z"
                              transform="translate(-276.18187 -133.91309)"
                              fill="#3f3d56"
                            />
                            <path
                              d="M398.86279,261.73389a9.0157,9.0157,0,0,1-8.61133-6.3667l-12.88037-42.07178a8.99884,8.99884,0,0,1,5.9712-11.24023l175.939-53.86377a9.00867,9.00867,0,0,1,11.24072,5.9707l12.88037,42.07227a9.01029,9.01029,0,0,1-5.9707,11.24072L401.49219,261.33887A8.976,8.976,0,0,1,398.86279,261.73389Z"
                              transform="translate(-276.18187 -133.91309)"
                              fill="#e71d2a"
                            />
                            <circle
                              cx="190.15351"
                              cy="24.95465"
                              r="20"
                              fill="#e71d2a"
                            />
                            <circle
                              cx="190.15351"
                              cy="24.95465"
                              r="12.66462"
                              fill="#fff"
                            />
                            <path
                              d="M878.81836,716.08691h-338a8.50981,8.50981,0,0,1-8.5-8.5v-405a8.50951,8.50951,0,0,1,8.5-8.5h338a8.50982,8.50982,0,0,1,8.5,8.5v405A8.51013,8.51013,0,0,1,878.81836,716.08691Z"
                              transform="translate(-276.18187 -133.91309)"
                              fill="#e6e6e6"
                            />
                            <path
                              d="M723.31813,274.08691h-210.5a17.02411,17.02411,0,0,0-17,17v407.8l2-.61v-407.19a15.01828,15.01828,0,0,1,15-15H723.93825Zm183.5,0h-394a17.02411,17.02411,0,0,0-17,17v458a17.0241,17.0241,0,0,0,17,17h394a17.0241,17.0241,0,0,0,17-17v-458A17.02411,17.02411,0,0,0,906.81813,274.08691Zm15,475a15.01828,15.01828,0,0,1-15,15h-394a15.01828,15.01828,0,0,1-15-15v-458a15.01828,15.01828,0,0,1,15-15h394a15.01828,15.01828,0,0,1,15,15Z"
                              transform="translate(-276.18187 -133.91309)"
                              fill="#3f3d56"
                            />
                            <path
                              d="M801.81836,318.08691h-184a9.01015,9.01015,0,0,1-9-9v-44a9.01016,9.01016,0,0,1,9-9h184a9.01016,9.01016,0,0,1,9,9v44A9.01015,9.01015,0,0,1,801.81836,318.08691Z"
                              transform="translate(-276.18187 -133.91309)"
                              fill="#e71d2a"
                            />
                            <circle
                              cx="433.63626"
                              cy="105.17383"
                              r="20"
                              fill="#e71d2a"
                            />
                            <circle
                              cx="433.63626"
                              cy="105.17383"
                              r="12.18187"
                              fill="#fff"
                            />
                          </svg>
                        </div>
                      )
                    ) : (
                      <p>Loading</p>
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
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2"
                      onClick={() => {
                        setModalOpen(false);
                        setFileSrc(file);
                      }}
                    >
                      Choose
                    </button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default MultiGalleryModal;
