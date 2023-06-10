import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import FormInput from "@/components/presentational/FormInput";
import { AttrType } from "@prisma/client";
import { Attribute } from "@/models/product";
import { showSuccessDialog, showUnauthorizedDialog } from "@/util/swalFunction";
import { getHeaders } from "@/util/authHelper";
import { useSession } from "next-auth/react";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  title: string;
  attribute: any;
  setUpdate: Function;
}

function AttributeModal({
  isModalOpen,
  setModalOpen,
  title,
  attribute,
  setUpdate,
}: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();

  const schema = z.object({
    name: z.string().min(1, { message: t("inputError") }),
    nameMM: z.string().min(1, { message: t("inputError") }),
    type: z.string(),
  });

  const { register, handleSubmit, watch, formState, reset } =
    useForm<Attribute>({
      mode: "onChange",
      defaultValues: attribute,
      resolver: zodResolver(schema),
    });
  const { errors } = formState;
  const watchFields = watch();
  const [isSubmit, setSubmit] = React.useState(false);
  const { data: session }: any = useSession();

  React.useEffect(() => {
    if (attribute) {
      reset(attribute);
    } else {
      reset({});
    }
  }, [attribute]);

  function submitAttribute(data: Attribute) {
    setSubmit(true);
    if (attribute && attribute.id) {
      if (getHeaders(session)) {
        fetch("/api/products/attributes?id=" + attribute.id, {
          method: "PUT",
          body: JSON.stringify(data),
          headers: getHeaders(session),
        })
          .then((data) => data.json())
          .then((json) => {
            setSubmit(false);
            setUpdate(true);
            setModalOpen(false);
            showSuccessDialog(t("submitSuccess"));
          });
      } else {
        showUnauthorizedDialog(router.locale, () => {
          router.push("/login");
        });
      }
    } else {
      if (getHeaders(session)) {
        fetch("/api/products/attributes", {
          method: "POST",
          body: JSON.stringify(data),
          headers: getHeaders(session),
        })
          .then((data) => data.json())
          .then((json) => {
            setSubmit(false);
            setUpdate(true);
            setModalOpen(false);
            showSuccessDialog(t("submitSuccess"));
          });
      } else {
        showUnauthorizedDialog(router.locale, () => {
          router.push("/login");
        });
      }
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
                  <form onSubmit={handleSubmit(submitAttribute)}>
                    <div className="mt-2 flex flex-col gap-3">
                      <FormInput
                        label={t("name") + " " + t("eng")}
                        placeHolder={t("enter") + " " + t("name")}
                        error={errors.name?.message}
                        type="text"
                        defaultValue={attribute?.name}
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
                        defaultValue={attribute?.nameMM}
                        formControl={{ ...register("nameMM") }}
                        currentValue={watchFields.nameMM}
                      />

                      <label className={`text-sm font-medium text-green-600`}>
                        {t("type")}
                      </label>

                      <fieldset className="flex flex-wrap gap-3">
                        <legend className="sr-only">Type</legend>
                        {Object.values(AttrType).map((e, index) => (
                          <div key={index}>
                            <input
                              type="radio"
                              value={e}
                              id={e}
                              className="peer hidden"
                              {...register("type")}
                              checked={watchFields.type === e}
                            />

                            <label
                              htmlFor={e}
                              className="flex cursor-pointer items-center justify-center rounded-md border border-gray-100 py-2 px-3 text-gray-900 hover:border-gray-200 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white"
                            >
                              <p className="text-sm font-medium">{t(e)}</p>
                            </label>
                          </div>
                        ))}
                      </fieldset>
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

export default AttributeModal;
