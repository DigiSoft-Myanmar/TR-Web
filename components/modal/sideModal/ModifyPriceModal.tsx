import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaPlus } from "react-icons/fa";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import FormInput from "@/components/presentational/FormInput";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  title: string;
  setPrice: Function;
}
type Form = {
  price: number;
};

function ModifyPriceModal({
  isModalOpen,
  setModalOpen,
  title,
  setPrice,
}: Props) {
  const [isPercent, setPercent] = React.useState(false);
  const router = useRouter();
  const { t } = useTranslation("common");

  const schema = z.object({
    price:
      isPercent === false
        ? z
            .number({
              invalid_type_error: t("inputValidNumber"),
              required_error: "",
            })
            .min(1, {
              message: t("inputValidAmount"),
            })
            .nonnegative({ message: t("inputValidAmount") })
        : z
            .number({
              invalid_type_error: t("inputValidNumber"),
              required_error: "",
            })
            .min(0, {
              message: t("inputValidPercentage"),
            })
            .max(100, {
              message: t("inputValidPercentage"),
            })
            .nonnegative({ message: t("inputValidPercentage") }),
  });

  const { register, handleSubmit, watch, formState, reset } = useForm<Form>({
    mode: "onChange",
    defaultValues: {
      price: 0,
    },
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const watchFields = watch();

  React.useEffect(() => {
    reset({
      price: 0,
    });
  }, [isModalOpen]);

  function submitForm(data: Form) {
    setPrice(data.price, isPercent);
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
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-80" />
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
              <div className="bg-brandDark absolute top-0 right-0 bottom-0 flex w-full max-w-md transform overflow-auto shadow-xl transition-all">
                <div className="dark:bg-bgDark inline-block w-full overflow-y-auto bg-gray-100 p-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">{title}</h3>
                    <button
                      className="bg-lightShade dark:bg-bgDark flex rounded-md p-2 focus:outline-none"
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
                  <form onSubmit={handleSubmit(submitForm)}>
                    <div className="mt-6 flex flex-col space-y-5">
                      <div className="flex flex-row items-start">
                        <div className="flex-grow">
                          <FormInput
                            disableRoundedRight={true}
                            label={"Modify price"}
                            placeHolder={"Enter modify price"}
                            error={errors.price?.message}
                            type="number"
                            formControl={{
                              ...register("price", {
                                setValueAs: (v) =>
                                  v ? parseInt(v) : undefined,
                              }),
                            }}
                            currentValue={watchFields.price}
                            optional={true}
                          />
                        </div>
                        <div
                          className="mt-7 cursor-pointer rounded-r-md border border-l-0 bg-white p-2 text-center"
                          onClick={() => {
                            setPercent((prevValue) => !prevValue);
                          }}
                        >
                          {isPercent === true ? "%" : "MMK"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex w-full justify-end ">
                      <SubmitBtn
                        isSubmit={false}
                        submitTxt={"Loading..."}
                        text="OK"
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

export default ModifyPriceModal;
