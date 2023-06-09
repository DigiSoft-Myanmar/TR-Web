import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/presentational/FormInput";
import { Membership } from "@/models/contents";
import { showSuccessDialog } from "@/util/swalFunction";
import FormInputTextArea from "@/components/presentational/FormInputTextArea";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  title: string;
  membership?: any;
  setUpdate: Function;
}

function MembershipModal({
  isModalOpen,
  setModalOpen,
  title,
  membership,
  setUpdate,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [isSubmit, setSubmit] = React.useState(false);

  const schema = z.object({
    name: z.string().min(1, { message: t("inputError") }),
    nameMM: z.string().min(1, { message: t("inputError") }),
    description: z.string().min(1, { message: t("inputDescriptionError") }),
    descriptionMM: z.string().min(1, { message: t("inputDescriptionMMError") }),
    price: z
      .number({
        required_error: t("inputValidPrice"),
        invalid_type_error: t("inputValidNumber"),
      })
      .min(0, {
        message: t("inputValidPrice"),
      })
      .nonnegative({ message: t("inputValidPrice") }),
    percentagePerTransaction: z
      .number({
        required_error: t("inputValidPercentage"),
        invalid_type_error: t("inputValidPercentage"),
      })
      .min(0, {
        message: t("inputValidPercentage"),
      })
      .max(100, {
        message: t("inputValidPercentage"),
      })
      .nonnegative({ message: t("inputValidPercentage") }),
    productLimit: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    isInfinity: z.boolean(),
  });

  const { register, handleSubmit, watch, formState, reset } =
    useForm<Membership>({
      mode: "onChange",
      resolver: zodResolver(schema),
    });

  React.useEffect(() => {
    if (membership) {
      if (membership.productLimit) {
        reset(membership);
      } else {
        reset({ ...membership, productLimit: 0 });
      }
    } else {
      reset({
        productLimit: 0,
      });
    }
  }, [membership]);

  const { errors } = formState;
  const watchFields = watch();

  React.useEffect(() => {
    console.log(errors);
  }, [errors]);

  function submitMembership(data: any) {
    setSubmit(true);
    if (membership && membership.id) {
      fetch("/api/memberships?id=" + membership.id, {
        method: "PUT",
        body: JSON.stringify(data),
      })
        .then((data) => data.json())
        .then((json) => {
          setSubmit(false);
          setUpdate(true);
          setModalOpen(false);
          showSuccessDialog(t("submitSuccess"));
        });
    } else {
      fetch("/api/memberships", { method: "POST", body: JSON.stringify(data) })
        .then((data) => data.json())
        .then((json) => {
          setSubmit(false);
          setUpdate(true);
          setModalOpen(false);
          showSuccessDialog(t("submitSuccess"));
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
                  <form onSubmit={handleSubmit(submitMembership)}>
                    <div className="mt-2 flex flex-col gap-3">
                      <FormInput
                        label={"Membership Title (Eng)"}
                        placeHolder={"Enter membership title (eng)"}
                        error={errors.name?.message}
                        type="text"
                        defaultValue={membership?.name}
                        formControl={{ ...register("name") }}
                        currentValue={watchFields.name}
                      />

                      <FormInput
                        label={"Membership Title (MM)"}
                        placeHolder={"Enter membership title (mm)"}
                        error={errors.nameMM?.message}
                        type="text"
                        defaultValue={membership?.nameMM}
                        formControl={{ ...register("nameMM") }}
                        currentValue={watchFields.nameMM}
                      />

                      <FormInputTextArea
                        label={t("description") + t("eng")}
                        placeHolder={
                          t("enter") + " " + t("description") + " " + t("eng")
                        }
                        error={errors.description?.message}
                        defaultValue={membership?.description}
                        formControl={{ ...register("description") }}
                        currentValue={watchFields.description}
                      />

                      <FormInputTextArea
                        label={t("description") + " " + t("mm")}
                        placeHolder={
                          t("enter") + " " + t("description") + " " + t("mm")
                        }
                        error={errors.descriptionMM?.message}
                        defaultValue={membership?.descriptionMM}
                        formControl={{ ...register("descriptionMM") }}
                        currentValue={watchFields.descriptionMM}
                      />

                      <FormInput
                        label={"Membership Fees (Yearly)"}
                        placeHolder={"Enter membership fees (yearly)"}
                        error={errors.price?.message}
                        type="number"
                        defaultValue={membership?.price}
                        formControl={{
                          ...register("price", {
                            valueAsNumber: true,
                          }),
                        }}
                        enableZero={true}
                        currentValue={watchFields.price}
                      />

                      <FormInput
                        label={t("percentagePerTrans")}
                        placeHolder={t("enter") + " " + t("percentagePerTrans")}
                        error={errors.percentagePerTransaction?.message}
                        type="number"
                        defaultValue={membership?.percentagePerTransaction}
                        formControl={{
                          ...register("percentagePerTransaction", {
                            valueAsNumber: true,
                          }),
                        }}
                        currentValue={watchFields.percentagePerTransaction}
                        enableZero={true}
                      />

                      <label className={`text-sm font-medium text-green-600`}>
                        {t("unlimitedProductListing")}
                      </label>

                      <label
                        htmlFor="unlimitedProductListing"
                        className="relative h-8 w-14 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          id="unlimitedProductListing"
                          className="peer sr-only"
                          {...register("isInfinity")}
                        />

                        <span className="absolute inset-0 rounded-full bg-gray-300 transition peer-checked:bg-primary"></span>

                        <span className="absolute inset-0 m-1 h-6 w-6 rounded-full bg-white transition peer-checked:translate-x-6"></span>
                      </label>

                      {watchFields.isInfinity === true ? (
                        <></>
                      ) : (
                        <FormInput
                          label={t("productLimit")}
                          placeHolder={t("enter") + " " + t("productLimit")}
                          error={errors.productLimit?.message}
                          type="number"
                          defaultValue={membership?.productLimit}
                          formControl={{
                            ...register("productLimit", {
                              setValueAs: (v) => (v ? parseInt(v) : 0),
                            }),
                          }}
                          currentValue={watchFields.productLimit}
                        />
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
    </>
  );
}

export default MembershipModal;
