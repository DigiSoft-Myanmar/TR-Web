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
import { FAQ } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { showErrorDialog } from "@/util/swalFunction";
import FormInput from "@/components/presentational/FormInput";
import FormInputTextArea from "@/components/presentational/FormInputTextArea";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  FAQ: any;
  onClickFn: Function;
  title: string;
}

function FAQModal({
  isModalOpen,
  setModalOpen,
  FAQ: parentFAQ,
  onClickFn,
  title,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [isSubmit, setSubmit] = React.useState(false);

  const schema = z.object({
    question: z.string().min(1, { message: t("inputError") }),
    questionMM: z.string().min(1, { message: t("inputError") }),
    answer: z.string().min(1, { message: t("inputError") }),
    answerMM: z.string().min(1, { message: t("inputError") }),
    fAQGroupId: z.string().min(1, { message: t("inputError") }),
  });

  const { register, handleSubmit, watch, formState, reset } = useForm<FAQ>({
    mode: "onChange",
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const watchFields = watch();

  React.useEffect(() => {
    reset(parentFAQ);
  }, [parentFAQ]);

  function submitFAQ(data: FAQ) {
    if (data.fAQGroupId) {
      setSubmit(true);
      onClickFn(data, setSubmit);
    } else {
      showErrorDialog(t("fillInformation"));
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
                      <FormInput
                        label="Question (ENG)"
                        placeHolder="Enter Question (ENG)"
                        error={errors.question?.message}
                        type="text"
                        defaultValue={parentFAQ?.question}
                        formControl={{
                          ...register("question"),
                        }}
                        currentValue={watchFields.question}
                      />

                      <FormInput
                        label="Question (MM)"
                        placeHolder="Enter Question (MM)"
                        error={errors.questionMM?.message}
                        type="text"
                        defaultValue={parentFAQ?.questionMM}
                        formControl={{
                          ...register("questionMM"),
                        }}
                        currentValue={watchFields.questionMM}
                      />

                      <FormInputTextArea
                        label="Answer (ENG)"
                        placeHolder="Enter Answer (ENG)"
                        error={errors.answer?.message}
                        defaultValue={parentFAQ?.answer}
                        formControl={{
                          ...register("answer"),
                        }}
                        currentValue={watchFields.answer}
                      />

                      <FormInputTextArea
                        label="Answer (MM)"
                        placeHolder="Enter Answer (MM)"
                        error={errors.answerMM?.message}
                        defaultValue={parentFAQ?.answerMM}
                        formControl={{
                          ...register("answerMM"),
                        }}
                        currentValue={watchFields.answerMM}
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

export default FAQModal;
