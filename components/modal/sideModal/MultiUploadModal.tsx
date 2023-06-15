import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { showErrorDialog, showUnauthorizedDialog } from "@/util/swalFunction";
import ProductImg from "@/components/card/ProductImg";
import { ImgType } from "@/types/orderTypes";
import { useSession } from "next-auth/react";
import { getHeaders } from "@/util/authHelper";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  fileLimit: number;
  setFileSrc: Function;
  sellerId?: string;
  type: ImgType;
}

function MultiUploadModal({
  isModalOpen,
  setModalOpen,
  fileLimit,
  setFileSrc,
  type,
  sellerId,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [uploadFiles, setUploadFiles] = React.useState<FileList>();
  const [totalSize, setTotalSize] = React.useState(0);
  const [uploadingImg, setUploadingImg] = React.useState(false);
  const dropZone = React.useRef<HTMLDivElement | null>(null);
  const { data: session }: any = useSession();

  React.useEffect(() => {
    if (uploadingImg === false) {
      setUploadFiles(undefined);
    }
  }, [isModalOpen, uploadingImg]);

  React.useEffect(() => {
    if (uploadingImg === false) {
      setModalOpen(false);
    }
  }, [uploadingImg]);

  function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  function upload() {
    const FormData = require("form-data");
    let form = new FormData();
    for (let i = 0; i < uploadFiles!.length; i++) {
      form.append("theFiles", uploadFiles![i]);
    }
    if (sellerId) {
      form.append(
        "data",
        JSON.stringify({
          sellerId: sellerId,
        })
      );
    }

    setUploadingImg(true);
    if (getHeaders(session)) {
      fetch("/api/gallery?type=" + type, {
        method: "POST",
        body: form,
        headers: getHeaders(session),
      })
        .then((data) => {
          if (data.status === 200) {
            return data.json();
          } else {
            if (data.status === 413) {
              showErrorDialog(t("fileTooLarge"));
            } else {
              showErrorDialog(data.statusText);
            }
          }
        })
        .then((json) => {
          if (json && json.filesData) {
            let filesData = [...json.filesData];
            let imgArr = filesData.map((elem) => `${elem.filename}`);
            setFileSrc(imgArr);
            setUploadingImg(false);
          }
        });
    } else {
      showUnauthorizedDialog(router.locale, () => {
        router.push("/login");
      });
    }
  }

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
              <div className="absolute top-0 right-0 bottom-0 flex w-[400px] transform overflow-auto rounded-l-xl bg-primary shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto bg-white p-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="text-darkShade flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">Upload Image</h3>
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
                    {uploadFiles && uploadFiles.length > 0 ? (
                      <div className="flex flex-col space-y-5">
                        <div className="flex">
                          <h3 className="flex-grow font-semibold">
                            {t("totalImg")}
                          </h3>
                          <p className="text-lg">
                            {uploadFiles.length} ({formatBytes(totalSize)})
                          </p>
                        </div>
                        {uploadingImg === false ? (
                          <div className="flex justify-end space-x-3">
                            <button
                              type="button"
                              className="rounded-md bg-primary px-7 py-3 text-sm text-white hover:bg-primary-focus"
                              onClick={() => setUploadFiles(undefined)}
                            >
                              {t("back")}
                            </button>
                            <button
                              type="button"
                              className="rounded-md bg-primary px-7 py-3 text-sm text-white hover:bg-primary-focus"
                              onClick={() => {
                                upload();
                              }}
                            >
                              {t("upload")}
                            </button>
                          </div>
                        ) : (
                          <div className="w-full">
                            <div className="loading-bar"></div>
                          </div>
                        )}
                        <div className="flex flex-col space-y-3">
                          {uploadFiles &&
                            uploadFiles.length > 0 &&
                            [...Array(uploadFiles.length)].map((file, i) => (
                              <div
                                className="flex w-full overflow-hidden bg-white shadow-lg"
                                key={i}
                              >
                                <ProductImg
                                  imgUrl={URL.createObjectURL(uploadFiles[i])}
                                  roundedAll={true}
                                  title={uploadFiles[i].name}
                                  width={128}
                                />
                                <div className="flex flex-grow flex-col items-start space-y-5 rounded-r-md bg-white p-3 text-gray-800">
                                  <p className="text-sm line-clamp-2">
                                    {uploadFiles[i].name}
                                  </p>
                                  <p className="text-sm">
                                    {formatBytes(uploadFiles[i].size)}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex w-full items-center justify-center">
                        <label
                          htmlFor="dropzone-file"
                          className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                        >
                          <div
                            className="flex flex-col items-center justify-center pt-5 pb-6"
                            ref={dropZone}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              let fileList = e.dataTransfer.files;
                              let f: any = [];
                              let size = 0;
                              if (
                                fileList.length > fileLimit &&
                                fileLimit !== -1
                              ) {
                                setTotalSize(0);
                                setUploadFiles(undefined);
                                setFileSrc([]);
                                showErrorDialog(t("tooManyFiles"));
                              } else {
                                for (let i = 0; i < fileList.length; i++) {
                                  if (fileList[i].type.includes("image/")) {
                                    size += fileList[i].size;
                                    f.push(fileList[i]);
                                  }
                                }
                                setTotalSize(size);
                                setUploadFiles(f);
                              }
                              e.preventDefault();
                            }}
                          >
                            <svg
                              aria-hidden="true"
                              className="mb-3 h-10 w-10 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              ></path>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              SVG, PNG, JPG or GIF (MAX. 2MB)
                            </p>
                          </div>
                          <input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                            multiple={true}
                            accept="image/*"
                            onChange={(e) => {
                              let fileList = e.currentTarget.files;
                              let size = 0;
                              if (fileList) {
                                if (
                                  fileList.length > fileLimit &&
                                  fileLimit !== -1
                                ) {
                                  setTotalSize(0);
                                  setUploadFiles(undefined);
                                  setFileSrc("");
                                  showErrorDialog(t("tooManyFiles"));
                                } else {
                                  for (let i = 0; i < fileList.length; i++) {
                                    size += fileList[i].size;
                                  }
                                  setTotalSize(size);
                                  setUploadFiles(fileList);
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex w-full justify-end ">
                    {(!uploadFiles || uploadFiles.length === 0) && (
                      <div className="mt-4 flex w-full justify-end ">
                        <button
                          type="button"
                          className="rounded-md bg-primary px-7 py-3 text-sm text-white hover:bg-primary-focus"
                          onClick={() => setModalOpen(false)}
                        >
                          {t("close")}
                        </button>
                      </div>
                    )}
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

export default MultiUploadModal;
