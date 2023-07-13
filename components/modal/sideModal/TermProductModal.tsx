import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import FormInput from "@/components/presentational/FormInput";
import { Term } from "@/models/product";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import { AttrType } from "@prisma/client";
import ColorPicker from "@/components/presentational/ColorPicker";
import SingleGalleryModal from "./SingleGalleryModal";
import { ImgType } from "@/types/orderTypes";
import { useSession } from "next-auth/react";
import { getHeaders } from "@/util/authHelper";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  title: string;
  term: any;
  type: AttrType;
  updateData: Function;
}

function TermProductModal({
  isModalOpen,
  setModalOpen,
  title,
  term,
  type,
  updateData,
}: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [isSubmit, setSubmit] = React.useState(false);
  const [terms, setTerms] = React.useState<any>();

  const [file, setFile] = React.useState<FileList | null>();
  const [fileSrc, setFileSrc] = React.useState("");

  const [galleryModalOpen, setGalleryModalOpen] = React.useState(false);

  const schema = z.object({
    name: z.string().min(1, { message: t("inputError") }),
    nameMM: z.string().min(1, { message: t("inputError") }),
  });

  const { register, handleSubmit, watch, formState, reset } = useForm<Term>({
    mode: "onChange",
    defaultValues: term,
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const watchFields = watch();
  const { data: session }: any = useSession();

  async function uploadFile(file: FileList) {
    const FormData = require("form-data");
    let form = new FormData();
    for (let i = 0; i < file!.length; i++) {
      form.append("theFiles", file![i]);
    }
    if (getHeaders(session)) {
      return fetch("/api/gallery", {
        method: "POST",
        body: form,
        headers: getHeaders(session),
      }).then(async (data) => {
        if (data.status === 200) {
          let json = await data.json();
          return { isSuccess: true, fileName: json.filesData[0].filename };
        } else {
          if (data.status === 413) {
            showErrorDialog(t("fileTooLarge"), "", router.locale);
          } else {
            showErrorDialog(data.statusText, "", router.locale);
          }
          return { isSuccess: false };
        }
      });
    } else {
      return { isSuccess: false };
    }
  }

  React.useEffect(() => {
    setTerms(term);
  }, [term]);

  React.useEffect(() => {
    reset(term);
  }, [term]);

  async function submitTerm(data: Term) {
    let v = terms?.value;
    if (type === AttrType.Image) {
      if (file) {
        let response = await uploadFile(file);
        if (response.isSuccess === true) {
          v = response.fileName;
        } else {
          return;
        }
      } else {
        v = fileSrc;
      }
    }
    if (type === AttrType.Color || type === AttrType.Image) {
      if (!v || v.length === 0) {
        showErrorDialog(t("fillInformation"));
        return;
      }
    }
    updateData({ ...data, attributeId: term.attributeId, value: v });
    setModalOpen(false);
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
              <div className="absolute top-0 right-0 bottom-0 flex min-w-[400px] max-w-md transform overflow-auto rounded-l-xl bg-primary shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto bg-white p-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="flex items-center text-lg font-medium leading-6 text-primary"
                  >
                    <h3 className="flex-grow">{title}</h3>
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
                  <form onSubmit={handleSubmit(submitTerm)}>
                    <div className="mt-2 flex flex-col gap-3">
                      <FormInput
                        label={t("name") + " " + t("eng")}
                        placeHolder={t("enter") + " " + t("name")}
                        error={errors.name?.message}
                        type="text"
                        defaultValue={term?.name}
                        formControl={{ ...register("name") }}
                        currentValue={watchFields.name}
                      />

                      <FormInput
                        label={t("name") + " " + t("mm")}
                        placeHolder={
                          t("enter") + " " + t("name") + " " + t("mm")
                        }
                        error={errors.nameMM?.message}
                        type="text"
                        defaultValue={term?.nameMM}
                        formControl={{ ...register("nameMM") }}
                        currentValue={watchFields.nameMM}
                      />

                      {type === AttrType.Color ? (
                        <>
                          <ColorPicker
                            color={term?.value}
                            setColor={(hex: string) => {
                              setTerms((prevValue: any) => {
                                return {
                                  ...prevValue,
                                  value: hex,
                                };
                              });
                            }}
                          />
                        </>
                      ) : (
                        type === AttrType.Image && (
                          <>
                            {file ? (
                              <div className="flex flex-col items-center ">
                                <img
                                  draggable={false}
                                  className="h-16 w-16 rounded-md object-cover shadow-md"
                                  src={URL.createObjectURL(file[0])}
                                />
                              </div>
                            ) : fileSrc ? (
                              <div className="flex flex-col items-center ">
                                <img
                                  draggable={false}
                                  className="h-16 w-16 rounded-md object-cover shadow-md"
                                  src={`/api/files/` + fileSrc}
                                />
                              </div>
                            ) : (
                              term &&
                              term.value && (
                                <div className="flex flex-col items-center ">
                                  <img
                                    draggable={false}
                                    className="h-16 w-16 rounded-md object-cover shadow-md"
                                    src={`/api/files/` + term.value}
                                  />
                                </div>
                              )
                            )}
                            <div
                              className={`relative mt-1 flex w-full flex-row justify-center`}
                            >
                              <span className="inline-flex divide-x overflow-hidden rounded-md border bg-white shadow-sm">
                                <label className="flex w-full cursor-pointer items-center justify-center rounded-l-md border px-8 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:bg-transparent focus:outline-none focus:ring">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mr-3 h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                    />
                                  </svg>
                                  <span className="text-center text-sm">
                                    {t("upload")}
                                  </span>
                                  <input
                                    id="dropzone-file"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    multiple={false}
                                    onChange={(e) => {
                                      setFileSrc("");
                                      let fileList = e.currentTarget.files;
                                      if (fileList) {
                                        for (
                                          let i = 0;
                                          i < fileList.length;
                                          i++
                                        ) {
                                          if (fileList[i].size > 5242880) {
                                            setFile(undefined);
                                            showErrorDialog(
                                              t("fileTooLarge"),
                                              "",
                                              router.locale
                                            );
                                          } else {
                                            setFile(e.currentTarget.files);
                                          }
                                        }
                                      }
                                    }}
                                  />
                                </label>

                                <button
                                  type="button"
                                  className="flex items-center py-2 px-4 text-sm text-gray-700 hover:bg-gray-50 focus:relative"
                                  title="Choose"
                                  onClick={(e) => {
                                    setFile(undefined);
                                    setGalleryModalOpen(true);
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="mr-3 h-4 w-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                    />
                                  </svg>

                                  {t("choose")}
                                </button>
                              </span>
                            </div>
                          </>
                        )
                      )}
                    </div>

                    <div className="mt-4 flex w-full justify-end ">
                      <SubmitBtn
                        isSubmit={isSubmit}
                        submitTxt="Loading..."
                        text={t("submit")}
                      />
                    </div>
                  </form>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      <SingleGalleryModal
        isModalOpen={galleryModalOpen}
        setModalOpen={setGalleryModalOpen}
        fileSrc={fileSrc}
        setFileSrc={setFileSrc}
        type={ImgType.Attribute}
        isSeller={false}
      />
    </>
  );
}

export default TermProductModal;
