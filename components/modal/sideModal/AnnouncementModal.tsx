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
import {
  showErrorDialog,
  showSuccessDialog,
  showUnauthorizedDialog,
} from "@/util/swalFunction";
import { getHeaders } from "@/util/authHelper";
import { useSession } from "next-auth/react";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  title: string;
  announcement: any;
  setUpdate: Function;
}

function AnnouncementModal({
  isModalOpen,
  setModalOpen,
  title,
  announcement: parentAnnounce,
  setUpdate,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [isSubmit, setSubmit] = React.useState(false);

  const schema = z.object({
    bannerText: z.string().min(1, { message: t("inputError") }),
    bannerTextMM: z.string().min(1, { message: t("inputError") }),
    index: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
  });

  const { register, handleSubmit, watch, formState, reset } = useForm<any>({
    mode: "onChange",
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const watchFields = watch();
  const { data: session }: any = useSession();

  function submitAnnouncement(data: any) {
    setSubmit(true);
    if (parentAnnounce && (parentAnnounce.id || parentAnnounce._id)) {
      let id = parentAnnounce.id ? parentAnnounce.id : parentAnnounce._id;
      if (getHeaders(session)) {
        fetch("/api/siteManagement/banner?id=" + id, {
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
        fetch("/api/siteManagement/banner", {
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
    if (parentAnnounce) {
      reset(parentAnnounce);
    } else {
      reset({});
    }
  }, [parentAnnounce]);

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
                  <form onSubmit={handleSubmit(submitAnnouncement)}>
                    <div className="mt-2 flex flex-col gap-3">
                      <FormInput
                        label={t("announcement") + " " + t("eng")}
                        placeHolder={
                          t("enter") + " " + t("announcement") + " " + t("eng")
                        }
                        error={errors.bannerText?.message}
                        type="text"
                        defaultValue={parentAnnounce?.bannerText}
                        formControl={{ ...register("bannerText") }}
                        currentValue={watchFields.bannerText}
                      />

                      <FormInput
                        label={t("announcementText") + t("mm")}
                        placeHolder={
                          t("enter") +
                          " " +
                          t("announcementText") +
                          " " +
                          t("mm")
                        }
                        error={errors.bannerTextMM?.message}
                        type="text"
                        defaultValue={parentAnnounce?.bannerTextMM}
                        formControl={{ ...register("bannerTextMM") }}
                        currentValue={watchFields.bannerTextMM}
                      />

                      <FormInput
                        label={t("index") + " (eg. 1, 2, ...)"}
                        placeHolder={t("enter") + " " + t("index")}
                        error={errors.index?.message}
                        type="number"
                        defaultValue={parentAnnounce?.index}
                        formControl={{
                          ...register("index", {
                            setValueAs: (v) => (v ? parseInt(v) : undefined),
                          }),
                        }}
                        currentValue={watchFields.index}
                      />

                      <p className="my-3 text-sm text-gray-500">
                        If you want to highlight{" "}
                        <span className="font-semibold text-primary">text</span>{" "}
                        like this add #text#
                      </p>
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

export default AnnouncementModal;
