import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { FeedbackType, UGCReportType } from "@prisma/client";
import { useQuery } from "react-query";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import { useSession } from "next-auth/react";
import FormInputCheckbox from "@/components/presentational/FormInputCheckbox";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getHeaders, isInternal } from "@/util/authHelper";
import FormInputTextArea from "@/components/presentational/FormInputTextArea";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  type: FeedbackType;
  id: string;
}

function ReportDialog({ isModalOpen, setModalOpen, type, id }: Props) {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  const [reportType, setReportType] = React.useState([]);

  const { data: reportData, refetch } = useQuery(["UGCReport", id, type], () =>
    fetch(
      "/api/feedbacks/ugcReports?id=" +
        encodeURIComponent(id) +
        "&type=" +
        encodeURIComponent(type)
    ).then((res) => {
      let json = res.json();
      return json;
    })
  );

  const schema = z.object({
    details: z
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
  const watchFields = watch();

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

  React.useEffect(() => {
    if (session && reportData && reportData.canReport === true) {
    } else if (
      session &&
      reportData &&
      reportData.canReport === false &&
      isInternal(session) === false
    ) {
      showErrorDialog(
        "Cannot report since you have no past purchased with this " +
          (type === FeedbackType.Product ? "product." : " user.")
      );
      setModalOpen(false);
    }
  }, [reportData, session]);

  function submitReview(data: any) {
    fetch("/api/feedbacks/ugcReports", {
      method: "POST",
      body: JSON.stringify(
        type === FeedbackType.Product
          ? {
              details: data.details,
              reasons: reportType,
              productId: id.toString(),
              feedbackType: FeedbackType.Product,
            }
          : {
              details: data.details,
              reasons: reportType,
              sellerId: id.toString(),
              feedbackType: FeedbackType.User,
            }
      ),
      headers: getHeaders(session),
    }).then((data) => {
      if (data.status === 200) {
        showSuccessDialog("Submit success", "", locale, () => {
          setModalOpen(false);
        });
      } else {
        showErrorDialog("Error");
      }
    });
  }

  return reportData && reportData.canReport === true ? (
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
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="text-darkShade flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">Report {type}</h3>
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
                  <div className="mt-2">
                    <form onSubmit={handleSubmit(submitReview)}>
                      {Object.values(UGCReportType).map((z, index) => (
                        <div className="form-control flex" key={index}>
                          <label className="label cursor-pointer">
                            <input
                              type="checkbox"
                              className="checkbox-primary checkbox"
                              checked={reportType.find((b) => b === z)}
                              onChange={(e) => {
                                setReportType((prevValue) => {
                                  if (prevValue.find((b) => b === z)) {
                                    return prevValue.filter((b) => b !== z);
                                  } else {
                                    return [...prevValue, z];
                                  }
                                });
                              }}
                            />
                            <span className="label-text ml-3 flex-grow">
                              {z}
                            </span>
                          </label>
                        </div>
                      ))}

                      <FormInputTextArea
                        label="Details"
                        placeHolder="Enter Details"
                        error={errors.details?.message}
                        formControl={{
                          ...register("details"),
                        }}
                        currentValue={watchFields.details}
                        optional={true}
                      />

                      <div className="flex flex-row items-center justify-end">
                        <button
                          className="bg-primary text-white rounded-md px-3 py-2 text-sm hover:bg-primary-focus"
                          type="submit"
                        >
                          {t("submitFeedback")}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  ) : (
    <></>
  );
}

export default ReportDialog;
