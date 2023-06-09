import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaPlus } from "react-icons/fa";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import { formatDate } from "@/util/textHelper";

interface Props {
  currentMessage: any;
  isModalOpen: boolean;
  setModalOpen: Function;
  updateFn: Function;
}

function MessageSideModal({
  isModalOpen,
  setModalOpen,
  currentMessage: e,
  updateFn,
}: Props) {
  const router = useRouter();
  const { locale } = useRouter();
  const { t } = useTranslation("common");
  const [data, setData] = React.useState<any>({});

  React.useEffect(() => {
    if (e) {
      setData({ isSolved: e.isSolved, solution: e.solution });
    }
  }, [e]);

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
                <div className="inline-block w-full overflow-y-auto bg-gray-100 p-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">Edit Message</h3>
                    <button
                      className="flex rounded-md bg-gray-100 p-2 focus:outline-none"
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
                  <div className="mt-8">
                    <div className="mt-3 flex flex-col space-y-5">
                      <strong className="font-medium sm:text-lg">
                        {e?.name}
                      </strong>

                      <strong className="flex items-center gap-3 font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                          <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                        </svg>
                        <a
                          href={"mailto:" + e?.email}
                          target="_blank"
                          className="hover:underline"
                          rel="noreferrer"
                        >
                          {e?.email}
                        </a>
                      </strong>

                      <strong className="flex items-center gap-3 font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <a
                          href={"tel:" + e?.phone}
                          target="_blank"
                          className="hover:underline"
                          rel="noreferrer"
                        >
                          {e?.phone}
                        </a>
                      </strong>

                      <p className="w-full border-t pt-5 text-sm text-gray-700 line-clamp-2">
                        {e?.message}
                      </p>

                      {e?.createdDate && (
                        <div className="mt-2 sm:flex sm:items-center sm:gap-2">
                          <p className="hidden flex-grow sm:block sm:text-xs sm:text-gray-500">
                            Posted by
                            <a
                              href=""
                              className="ml-3 hidden font-medium underline hover:text-gray-700 sm:block sm:text-xs sm:text-gray-500"
                            >
                              {formatDate(e?.createdDate, locale)}
                            </a>
                          </p>
                        </div>
                      )}

                      <textarea
                        className="w-full rounded-lg border p-3 text-sm"
                        placeholder="Solution"
                        rows={8}
                        id="message"
                        defaultValue={data?.solution}
                        onChange={(e) => {
                          let d = e.currentTarget.value;
                          setData((prevValue: any) => {
                            return { ...prevValue, solution: d };
                          });
                        }}
                      ></textarea>

                      <div className="form-control flex">
                        <label className="label cursor-pointer">
                          <input
                            type="checkbox"
                            className="checkbox-primary checkbox"
                            checked={data.isSolved === true ? true : false}
                            onChange={(e) => {
                              let d = e.currentTarget.checked;
                              setData((prevValue: any) => {
                                return { ...prevValue, isSolved: d };
                              });
                            }}
                          />
                          <span className="label-text ml-3 flex-grow">
                            Solved
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex w-full justify-end ">
                    <button
                      type="button"
                      className="rounded-md bg-primary px-7 py-3 text-sm text-white hover:bg-primary/50"
                      onClick={() => {
                        fetch("/api/feedbacks?id=" + e?.id, {
                          method: "PUT",
                          body: JSON.stringify(data),
                        }).then(async (d) => {
                          if (d.status === 200) {
                            showSuccessDialog(
                              t("submit") + " " + t("success"),
                              "",
                              locale,
                            );
                            updateFn();
                          } else {
                            let json = await d.json();
                            if (json.error) {
                              showErrorDialog(json.error, json.errorMM, locale);
                            } else {
                              showErrorDialog(
                                t("somethingWentWrong"),
                                "",
                                locale,
                              );
                            }
                          }
                          setModalOpen(false);
                        });
                      }}
                    >
                      {t("submit")}
                    </button>
                  </div>
                  {e?.device?.deviceName && (
                    <div className="mt-2 sm:flex sm:items-center sm:gap-2">
                      <p className="hidden flex-grow sm:block sm:text-xs sm:text-gray-500">
                        Device Name
                      </p>
                      <a
                        href=""
                        className="ml-3 hidden font-medium underline hover:text-gray-700 sm:block sm:text-xs sm:text-gray-500"
                      >
                        {e?.device?.deviceName}
                      </a>
                    </div>
                  )}
                  {e?.device?.brand && (
                    <div className="mt-2 sm:flex sm:items-center sm:gap-2">
                      <p className="hidden flex-grow sm:block sm:text-xs sm:text-gray-500">
                        Device Brand Name
                      </p>
                      <a
                        href=""
                        className="ml-3 hidden font-medium underline hover:text-gray-700 sm:block sm:text-xs sm:text-gray-500"
                      >
                        {e?.device?.brand}
                      </a>
                    </div>
                  )}
                  {e?.device?.manufacturer && (
                    <div className="mt-2 sm:flex sm:items-center sm:gap-2">
                      <p className="hidden flex-grow sm:block sm:text-xs sm:text-gray-500">
                        Device manufacturer
                      </p>
                      <a
                        href=""
                        className="ml-3 hidden font-medium underline hover:text-gray-700 sm:block sm:text-xs sm:text-gray-500"
                      >
                        {e?.device?.manufacturer}
                      </a>
                    </div>
                  )}

                  {e?.device?.modelId && (
                    <div className="mt-2 sm:flex sm:items-center sm:gap-2">
                      <p className="hidden flex-grow sm:block sm:text-xs sm:text-gray-500">
                        Device model Id
                      </p>
                      <a
                        href=""
                        className="ml-3 hidden font-medium underline hover:text-gray-700 sm:block sm:text-xs sm:text-gray-500"
                      >
                        {e?.device?.modelId}
                      </a>
                    </div>
                  )}

                  {e?.device?.modelName && (
                    <div className="mt-2 sm:flex sm:items-center sm:gap-2">
                      <p className="hidden flex-grow sm:block sm:text-xs sm:text-gray-500">
                        Device model name
                      </p>
                      <a
                        href=""
                        className="ml-3 hidden font-medium underline hover:text-gray-700 sm:block sm:text-xs sm:text-gray-500"
                      >
                        {e?.device?.modelName}
                      </a>
                    </div>
                  )}

                  {e?.device?.osBuildId && (
                    <div className="mt-2 sm:flex sm:items-center sm:gap-2">
                      <p className="hidden flex-grow sm:block sm:text-xs sm:text-gray-500">
                        Device OS Build ID
                      </p>
                      <a
                        href=""
                        className="ml-3 hidden font-medium underline hover:text-gray-700 sm:block sm:text-xs sm:text-gray-500"
                      >
                        {e?.device?.osBuildId}
                      </a>
                    </div>
                  )}

                  {e?.device?.osName && (
                    <div className="mt-2 sm:flex sm:items-center sm:gap-2">
                      <p className="hidden flex-grow sm:block sm:text-xs sm:text-gray-500">
                        Device OS Name
                      </p>
                      <a
                        href=""
                        className="ml-3 hidden font-medium underline hover:text-gray-700 sm:block sm:text-xs sm:text-gray-500"
                      >
                        {e?.device?.osName}
                      </a>
                    </div>
                  )}

                  {e?.device?.osVersion && (
                    <div className="mt-2 sm:flex sm:items-center sm:gap-2">
                      <p className="hidden flex-grow sm:block sm:text-xs sm:text-gray-500">
                        Device OS Version
                      </p>
                      <a
                        href=""
                        className="ml-3 hidden font-medium underline hover:text-gray-700 sm:block sm:text-xs sm:text-gray-500"
                      >
                        {e?.device?.osVersion}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default MessageSideModal;
