import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { z } from "zod";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import FormInput from "@/components/presentational/FormInput";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import FormInputTextArea from "@/components/presentational/FormInputTextArea";
import { useSession } from "next-auth/react";
import { getHeaders } from "@/util/authHelper";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  data: any;
  updateFn: Function;
  type: string;
  apiPath: string;
  isColor?: boolean;
}

function TextModal({
  isModalOpen,
  setModalOpen,
  data,
  updateFn,
  type,
  apiPath,
  isColor,
}: Props) {
  const { data: session }: any = useSession();
  const router = useRouter();
  const { t } = useTranslation("common");
  const schema = z.object({
    name: z.string().min(1, { message: t("inputError") }),
    nameMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    descriptionMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
  });
  const { register, handleSubmit, watch, formState, reset } = useForm<any>({
    mode: "onChange",
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const { locale } = useRouter();
  const watchFields = watch();
  const [isSubmit, setSubmit] = React.useState(false);
  const [color, setColor] = React.useState<string>("");

  React.useEffect(() => {
    if (data) {
      reset(data);
      setColor(data.color);
    } else {
      reset({
        name: "",
        nameMM: "",
        description: "",
        descriptionMM: "",
      });
      setColor("");
    }
  }, [data]);

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

  function submitManufacture(submitData: any) {
    setSubmit(true);
    if (isColor === true) {
      submitData.color = color;
    }
    if (data && data.id) {
      fetch(apiPath + "?id=" + data.id, {
        method: "PUT",
        body: JSON.stringify(submitData),
        headers: getHeaders(session),
      }).then(async (data) => {
        setSubmit(false);

        if (data.status === 200) {
          updateFn();
          setModalOpen(false);
          showSuccessDialog(t("submitSuccess"));
        } else {
          let json = await data.json();
          if (json.error) {
            showErrorDialog(json.error, json.errorMM, locale);
          } else {
            showErrorDialog(JSON.stringify(json));
          }
        }
      });
    } else {
      fetch(apiPath, {
        method: "POST",
        body: JSON.stringify(submitData),
        headers: session
          ? {
              appid: session.username,
              appsecret: session.id,
            }
          : {},
      }).then(async (data) => {
        setSubmit(false);

        if (data.status === 200) {
          updateFn();
          setModalOpen(false);
          showSuccessDialog(t("submitSuccess"));
        } else {
          let json = await data.json();
          if (json.error) {
            showErrorDialog(json.error, json.errorMM, locale);
          } else {
            showErrorDialog(JSON.stringify(json));
          }
        }
      });
    }
  }

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
              <div className="absolute top-0 right-0 bottom-0 flex max-w-md min-w-[400px] transform overflow-auto rounded-l-xl bg-primary shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto bg-white p-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="text-darkShade flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">
                      {data ? "Update " + type : "Create " + type}
                    </h3>
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
                  <form onSubmit={handleSubmit(submitManufacture)}>
                    <div className="mt-2 flex flex-col gap-3">
                      <FormInput
                        label={t("name") + " " + t("eng")}
                        placeHolder={
                          t("enter") + " " + t("name") + " " + t("eng")
                        }
                        error={errors.name?.message}
                        type="text"
                        defaultValue={data?.name}
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
                        defaultValue={data?.nameMM}
                        formControl={{ ...register("nameMM") }}
                        currentValue={watchFields.nameMM}
                      />

                      {isColor === true && (
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            setColor(e.currentTarget.value);
                          }}
                        />
                      )}
                      <FormInputTextArea
                        label={t("description") + " " + t("eng")}
                        error={errors.description?.message}
                        formControl={{ ...register("description") }}
                        placeHolder=""
                        currentValue={watchFields.description}
                        defaultValue={data?.description}
                        optional={true}
                      />

                      <FormInputTextArea
                        label={t("description") + " " + t("mm")}
                        error={errors.descriptionMM?.message}
                        formControl={{ ...register("descriptionMM") }}
                        placeHolder=""
                        currentValue={watchFields.descriptionMM}
                        defaultValue={data?.descriptionMM}
                        optional={true}
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

export default TextModal;
