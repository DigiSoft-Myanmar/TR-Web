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
import { FAQGroup } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import FormInput from "@/components/presentational/FormInput";
import FormInputTextArea from "@/components/presentational/FormInputTextArea";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  FAQGroup: any;
  onClickFn: Function;
  title: string;
}

function FAQGroupModal({
  isModalOpen,
  setModalOpen,
  FAQGroup: parentFAQGroup,
  onClickFn,
  title,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [FAQGroup, setFAQGroup] = React.useState<any>({});
  const [error, setError] = React.useState<any>({});
  const [isSubmit, setSubmit] = React.useState(false);

  const schema = z.object({
    title: z.string().min(1, { message: t("inputError") }),
    titleMM: z.string().min(1, { message: t("inputError") }),
    description: z.string().min(1, { message: t("inputError") }),
    descriptionMM: z.string().min(1, { message: t("inputError") }),
  });

  const { register, handleSubmit, watch, formState, reset } = useForm<FAQGroup>(
    {
      mode: "onChange",
      resolver: zodResolver(schema),
    },
  );
  const { errors } = formState;
  const watchFields = watch();

  function submitFAQ(data: FAQGroup) {
    if (FAQGroup?.icon) {
      setSubmit(true);
      let d = { ...data, icon: FAQGroup.icon };
      onClickFn(d, setSubmit);
    } else {
      showErrorDialog(t("fillInformation"));
    }
  }

  React.useEffect(() => {
    setError({});
  }, [isModalOpen]);

  React.useEffect(() => {
    if (parentFAQGroup) {
      reset(parentFAQGroup);
      setFAQGroup(parentFAQGroup);
    } else {
      reset({});
      setFAQGroup(undefined);
    }
  }, [parentFAQGroup]);

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
                      <div className="flex w-full flex-col items-center">
                        <IconPicker
                          value={FAQGroup.icon}
                          onChange={(v: any) => {
                            setFAQGroup((prevValue: any) => {
                              return { ...prevValue, icon: v };
                            });
                            setError((prevValue: any) => {
                              return {
                                ...prevValue,
                                iconError: "",
                                iconErrorMM: "",
                              };
                            });
                          }}
                        />
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
                        defaultValue={FAQGroup?.title}
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
                        defaultValue={FAQGroup?.titleMM}
                        formControl={{
                          ...register("titleMM"),
                        }}
                        currentValue={watchFields.titleMM}
                      />

                      <FormInputTextArea
                        label="Description (ENG)"
                        placeHolder="Enter Description (ENG)"
                        error={errors.description?.message}
                        defaultValue={FAQGroup?.description}
                        formControl={{
                          ...register("description"),
                        }}
                        currentValue={watchFields.description}
                      />

                      <FormInputTextArea
                        label="Description (MM)"
                        placeHolder="Enter Description (MM)"
                        error={errors.descriptionMM?.message}
                        defaultValue={FAQGroup?.descriptionMM}
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
    </>
  );
}

export default FAQGroupModal;
