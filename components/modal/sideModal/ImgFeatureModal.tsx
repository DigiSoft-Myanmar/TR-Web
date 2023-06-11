import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaPlus } from "react-icons/fa";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { verifyText } from "@/util/verify";
import { IconPicker } from "react-fa-icon-picker";
import ErrorText from "@/components/presentational/ErrorText";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import FormInput from "@/components/presentational/FormInput";
import { FeatureType } from "@/types/pageType";
import FormInputTextArea from "@/components/presentational/FormInputTextArea";
import SingleUploadModal from "./SingleUploadModal";
import SingleGalleryModal from "./SingleGalleryModal";
import { ImgType } from "@/types/orderTypes";
import Image from "next/image";
import { fileUrl } from "@/types/const";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  feature: any;
  onClickFn: Function;
  title: string;
}

function ImgFeaturesModal({
  isModalOpen,
  setModalOpen,
  feature: parentFeature,
  onClickFn,
  title,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [feature, setFeature] = React.useState<any>();
  const [error, setError] = React.useState<any>({});
  const [isSubmit, setSubmit] = React.useState(false);
  const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
  const [chooseModalOpen, setChooseModalOpen] = React.useState(false);

  const schema = z.object({
    title: z.string().min(1, { message: t("inputError") }),
    titleMM: z.string().min(1, { message: t("inputError") }),
    description: z.string().min(1, { message: t("inputError") }),
    descriptionMM: z.string().min(1, { message: t("inputError") }),
  });

  const { register, handleSubmit, watch, formState, reset } =
    useForm<FeatureType>({
      mode: "onChange",
      resolver: zodResolver(schema),
    });
  const { errors } = formState;
  const watchFields = watch();

  function submitFAQ(data: FeatureType) {
    if (feature?.icon) {
      let d = { ...data, icon: feature.icon };
      onClickFn(d);
    } else {
      showErrorDialog(t("fillInformation"));
    }
  }

  React.useEffect(() => {
    setError({});
  }, [isModalOpen]);

  React.useEffect(() => {
    if (parentFeature) {
      reset(parentFeature);
      setFeature(parentFeature);
    } else {
      reset({});
      setFeature(undefined);
    }
  }, [parentFeature]);

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
  }, [router, isModalOpen]);
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
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
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
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="absolute top-0 right-0 bottom-0 flex w-full max-w-md transform overflow-auto  shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto bg-gray-100 p-6 text-left align-middle ">
                  <Dialog.Title
                    as="div"
                    className="flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">{title}</h3>
                    <button
                      className="bg-lightShade flex rounded-md p-2 focus:outline-none "
                      onClick={() => setModalOpen(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </Dialog.Title>
                  <form onSubmit={handleSubmit(submitFAQ)}>
                    <div className="mt-2 flex flex-col gap-3">
                      {feature?.icon && (
                        <Image
                          src={fileUrl + encodeURIComponent(feature.icon)}
                          className="h-10 w-10"
                          width={40}
                          height={40}
                          alt="icon"
                        />
                      )}

                      <div>
                        <label
                          className={`text-sm font-medium ${
                            !feature?.icon
                              ? "text-error"
                              : feature?.icon
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
                        {!feature?.icon && (
                          <span className="p-2 text-xs text-error">
                            {t("inputError")}
                          </span>
                        )}
                      </div>
                      <ErrorText
                        error={error.iconError}
                        errorMM={error.iconErrorMM}
                      />
                      <FormInput
                        label="Title (ENG)"
                        placeHolder="Enter Title (ENG)"
                        error={errors.title?.message}
                        type="text"
                        defaultValue={feature?.title}
                        formControl={{
                          ...register("title"),
                        }}
                        currentValue={watchFields.title}
                      />

                      <FormInput
                        label="Title (MM)"
                        placeHolder="Enter Title (MM)"
                        error={errors.titleMM?.message}
                        type="text"
                        defaultValue={feature?.titleMM}
                        formControl={{
                          ...register("titleMM"),
                        }}
                        currentValue={watchFields.titleMM}
                      />

                      <FormInputTextArea
                        label="Description (ENG)"
                        placeHolder="Enter Description (ENG)"
                        error={errors.description?.message}
                        defaultValue={feature?.description}
                        formControl={{
                          ...register("description"),
                        }}
                        currentValue={watchFields.description}
                      />

                      <FormInputTextArea
                        label="Description (MM)"
                        placeHolder="Enter Description (MM)"
                        error={errors.descriptionMM?.message}
                        defaultValue={feature?.descriptionMM}
                        formControl={{
                          ...register("descriptionMM"),
                        }}
                        currentValue={watchFields.descriptionMM}
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
        type={ImgType.SiteManagement}
        isModalOpen={uploadModalOpen}
        setModalOpen={setUploadModalOpen}
        setFileSrc={(e: string) => {
          setFeature((prevValue: any) => {
            return { ...prevValue, icon: e };
          });
        }}
      />
      <SingleGalleryModal
        type={ImgType.SiteManagement}
        isModalOpen={chooseModalOpen}
        setModalOpen={setChooseModalOpen}
        fileSrc={feature?.icon}
        setFileSrc={(e: string) => {
          setFeature((prevValue: any) => {
            return { ...prevValue, icon: e };
          });
        }}
        sellerId={""}
        isSeller={false}
      />
    </>
  );
}

export default ImgFeaturesModal;
