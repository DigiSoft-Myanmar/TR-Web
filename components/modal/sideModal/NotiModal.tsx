import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { fetcher } from "@/util/fetcher";
import useSWR from "swr";
import NotiCard from "@/components/card/NotiCard";
import { isInternal } from "@/util/authHelper";
import { useSession } from "next-auth/react";
import { sortBy } from "lodash";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
}

function NotiModal({ isModalOpen, setModalOpen }: Props) {
  const router = useRouter();
  const { data: session }: any = useSession();
  const { data } = useSWR("/api/notifications/list", fetcher);

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
              <div className="absolute top-0 right-0 bottom-0 flex max-w-md min-w-[400px] transform overflow-auto rounded-l-xl bg-primary shadow-xl transition-all">
                <div
                  className={`inline-block w-full overflow-y-auto bg-gray-100 text-left align-middle`}
                >
                  <Dialog.Title
                    as="div"
                    className={`text-primaryText bg-white flex items-center text-lg font-medium leading-6 shadow-lg p-6 sticky top-0 z-10`}
                  >
                    <h3 className="flex-grow">Notifications</h3>
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
                  <div
                    className={`flex flex-col space-y-5 mb-10 p-3 bg-gray-100 `}
                  >
                    {data ? (
                      sortBy(data, (e) => e.createdAt)
                        .reverse()
                        .map((elem: any, index: number) => (
                          <NotiCard data={elem} key={index} />
                        ))
                    ) : (
                      <p>No Notification</p>
                    )}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default NotiModal;
