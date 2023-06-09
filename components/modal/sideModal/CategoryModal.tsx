import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import ColorPicker from "@/components/presentational/ColorPicker";
import SingleUploadModal from "./SingleUploadModal";
import SingleGalleryModal from "./SingleGalleryModal";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/presentational/FormInput";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import { ImgType } from "@/types/orderTypes";
import Image from "next/image";
import { fileUrl } from "@/types/const";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  title: string;
  category: any;
  setUpdate: Function;
}

function CategoryModal({
  isModalOpen,
  setModalOpen,
  title,
  category: parentCategory,
  setUpdate,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
  const [chooseModalOpen, setChooseModalOpen] = React.useState(false);
  const [isSubmit, setSubmit] = React.useState(false);
  const [category, setCategory] = React.useState<any>();

  const schema = z.object({
    name: z.string().min(1, { message: t("inputError") }),
    nameMM: z.string().min(1, { message: t("inputError") }),
    slug: z.string().min(1, { message: t("inputError") }),
  });

  const { register, handleSubmit, watch, formState, reset } = useForm<any>({
    mode: "onChange",
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const watchFields = watch();

  function submitCategory(data: any) {
    if (category.icon && category.color) {
      setSubmit(true);
      let d = { ...category, ...data };

      if (parentCategory && parentCategory.id) {
        fetch("/api/products/categories?id=" + parentCategory.id, {
          method: "PUT",
          body: JSON.stringify(d),
        })
          .then((data) => data.json())
          .then((json) => {
            setSubmit(false);
            setUpdate(true);
            setModalOpen(false);
            showSuccessDialog(t("submitSuccess"));
          });
      } else {
        fetch("/api/products/categories", {
          method: "POST",
          body: JSON.stringify(d),
        })
          .then((data) => data.json())
          .then((json) => {
            setSubmit(false);
            setUpdate(true);
            setModalOpen(false);
            showSuccessDialog(t("submitSuccess"));
          });
      }
    } else {
      showErrorDialog(t("fillInformation"));
    }
  }

  React.useEffect(() => {
    if (parentCategory) {
      reset(parentCategory);
      setCategory(parentCategory);
    } else {
      reset({});
      setCategory(undefined);
    }
  }, [parentCategory]);

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
                    className="text-darkShade flex items-center text-lg font-medium leading-6"
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
                  <form onSubmit={handleSubmit(submitCategory)}>
                    <div className="mt-2 flex flex-col gap-3">
                      <FormInput
                        label={t("name") + " " + t("eng")}
                        placeHolder={t("enter") + " " + t("name")}
                        error={errors.name?.message}
                        type="text"
                        defaultValue={category?.name}
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
                        defaultValue={category?.nameMM}
                        formControl={{ ...register("nameMM") }}
                        currentValue={watchFields.nameMM}
                      />

                      <FormInput
                        label={t("slug")}
                        placeHolder={t("enter") + " " + t("slug")}
                        error={errors.slug?.message}
                        type="text"
                        defaultValue={category?.slug}
                        formControl={{ ...register("slug") }}
                        currentValue={watchFields.slug}
                      />

                      {category?.icon && (
                        <Image
                          src={fileUrl + category.icon}
                          className="h-10 w-10"
                          width={40}
                          height={40}
                          alt="icon"
                        />
                      )}

                      <div>
                        <label
                          className={`text-sm font-medium ${
                            !category?.icon
                              ? "text-error"
                              : category?.icon
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {t("icon")}
                        </label>

                        <div className={`relative mt-1 flex w-full flex-row`}>
                          <span className="inline-flex divide-x overflow-hidden rounded-md border bg-white shadow-sm">
                            <button
                              type="button"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:relative"
                              onClick={() => {
                                setUploadModalOpen(true);
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
                                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                />
                              </svg>

                              {t("upload")}
                            </button>

                            <button
                              type="button"
                              className="flex items-center py-2 px-4 text-sm text-gray-700 hover:bg-gray-50 focus:relative"
                              title="Choose"
                              onClick={() => {
                                setChooseModalOpen(true);
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
                        {!category?.icon && (
                          <span className="p-2 text-xs text-error">
                            {t("inputError")}
                          </span>
                        )}
                      </div>

                      <ColorPicker
                        color={category?.color ? category?.color : "#DE711B"}
                        setColor={(color: any) => {
                          setCategory((prevValue: any) => {
                            return {
                              ...prevValue,
                              color: color,
                            };
                          });
                        }}
                      />
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
      <SingleUploadModal
        type={ImgType.Category}
        isModalOpen={uploadModalOpen}
        setModalOpen={setUploadModalOpen}
        setFileSrc={(e: string) => {
          setCategory((prevValue: any) => {
            return { ...prevValue, icon: e };
          });
        }}
      />
      <SingleGalleryModal
        type={ImgType.Category}
        isModalOpen={chooseModalOpen}
        setModalOpen={setChooseModalOpen}
        fileSrc={category?.icon}
        setFileSrc={(e: string) => {
          setCategory((prevValue: any) => {
            return { ...prevValue, icon: e };
          });
        }}
        sellerId={""}
        isSeller={false}
      />
    </>
  );
}

export default CategoryModal;
