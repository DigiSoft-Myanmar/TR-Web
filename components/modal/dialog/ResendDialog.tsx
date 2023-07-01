import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { Role, User } from "@prisma/client";
import { getText } from "@/util/textHelper";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import { showSuccessDialog } from "@/util/swalFunction";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  orderNo?: number;
  internalUsers: User[];
  buyerEmail?: string;
  sellerList: User[];
}

function ResendDialog({
  isModalOpen,
  setModalOpen,
  orderNo,
  internalUsers,
  buyerEmail,
  sellerList,
}: Props) {
  const router = useRouter();
  const { locale } = router;
  const [sendList, setSendList] = React.useState<string[]>([]);
  const [isSubmit, setSubmit] = React.useState(false);
  const [message, setMessage] = React.useState<any>();
  const [progress, setProgress] = React.useState(0);
  const [isNodeMail, setNodeMail] = React.useState(true);

  React.useEffect(() => {
    let emailList: string[] = [];
    if (buyerEmail) {
      emailList.push(buyerEmail);
    }
    emailList = [
      ...emailList,
      ...internalUsers
        .filter(
          (z) => z.role === Role.SuperAdmin && z.email && z.email.length > 0
        )
        .map((z) => z.email!),
    ];
    setSendList(emailList);
  }, [buyerEmail, internalUsers]);

  React.useEffect(() => {
    if (progress >= 100) {
      setSubmit(false);
      showSuccessDialog("Sending message successfully", "", locale, () => {
        setModalOpen(false);
      });
    }
  }, [progress]);

  React.useEffect(() => {
    setMessage("");
    setProgress(0);
  }, [isModalOpen]);

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
                    <h3 className="flex-grow">Resend Order #{orderNo} Email</h3>
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
                  <div className="mt-2 flex flex-col gap-3 max-h-[500px] overflow-y-auto">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500">
                        Buyer
                      </label>
                      {buyerEmail ? (
                        <div className="form-control flex">
                          <label className="label cursor-pointer">
                            <input
                              type="checkbox"
                              className="checkbox-primary checkbox"
                              checked={
                                sendList.find((z) => z === buyerEmail)
                                  ? true
                                  : false
                              }
                              onChange={(e) => {
                                setSendList((prevValue) => {
                                  if (prevValue.find((z) => z === buyerEmail)) {
                                    return prevValue.filter(
                                      (z) => z !== buyerEmail
                                    );
                                  } else {
                                    return [...prevValue, buyerEmail];
                                  }
                                });
                              }}
                            />
                            <span className={`label-text ml-3 flex-grow`}>
                              {buyerEmail}
                            </span>
                          </label>
                        </div>
                      ) : (
                        <p className="text-sm">Email not set</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500">
                        Sellers
                      </label>
                      {sellerList.filter(
                        (z) =>
                          z.email &&
                          z.email.length > 0 &&
                          z.isBlocked === false &&
                          z.isDeleted === false
                      ).length > 0 ? (
                        sellerList
                          .filter(
                            (z) =>
                              z.email &&
                              z.email.length > 0 &&
                              z.isBlocked === false &&
                              z.isDeleted === false
                          )
                          .map((a, index) => (
                            <div className="form-control flex" key={index}>
                              <label className="label cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="checkbox-primary checkbox"
                                  checked={
                                    sendList.find((z) => z === a.email)
                                      ? true
                                      : false
                                  }
                                  onChange={(e) => {
                                    setSendList((prevValue) => {
                                      if (
                                        prevValue.find((z) => z === a.email!)
                                      ) {
                                        return prevValue.filter(
                                          (z) => z !== a.email
                                        );
                                      } else {
                                        return [...prevValue, a.email!];
                                      }
                                    });
                                  }}
                                />
                                <span className={`label-text ml-3 flex-grow`}>
                                  {a.email}
                                </span>
                              </label>
                            </div>
                          ))
                      ) : (
                        <p className="text-sm">No Seller Users with Email</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500">
                        Admins
                      </label>
                      {internalUsers.filter(
                        (z) =>
                          z.role === Role.Admin &&
                          z.email &&
                          z.email.length > 0 &&
                          z.isBlocked === false &&
                          z.isDeleted === false
                      ).length > 0 ? (
                        internalUsers
                          .filter(
                            (z) =>
                              z.role === Role.Admin &&
                              z.email &&
                              z.email.length > 0 &&
                              z.isBlocked === false &&
                              z.isDeleted === false
                          )
                          .map((a, index) => (
                            <div className="form-control flex" key={index}>
                              <label className="label cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="checkbox-primary checkbox"
                                  checked={
                                    sendList.find((z) => z === a.email)
                                      ? true
                                      : false
                                  }
                                  onChange={(e) => {
                                    setSendList((prevValue) => {
                                      if (
                                        prevValue.find((z) => z === a.email!)
                                      ) {
                                        return prevValue.filter(
                                          (z) => z !== a.email
                                        );
                                      } else {
                                        return [...prevValue, a.email!];
                                      }
                                    });
                                  }}
                                />
                                <span className={`label-text ml-3 flex-grow`}>
                                  {a.email}
                                </span>
                              </label>
                            </div>
                          ))
                      ) : (
                        <p className="text-sm">No Admin Users with Email</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500">
                        Staffs
                      </label>
                      {internalUsers.filter(
                        (z) =>
                          z.role === Role.Staff &&
                          z.email &&
                          z.email.length > 0 &&
                          z.isBlocked === false &&
                          z.isDeleted === false
                      ).length > 0 ? (
                        internalUsers
                          .filter(
                            (z) =>
                              z.role === Role.Staff &&
                              z.email &&
                              z.email.length > 0 &&
                              z.isBlocked === false &&
                              z.isDeleted === false
                          )
                          .map((a, index) => (
                            <div className="form-control flex" key={index}>
                              <label className="label cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="checkbox-primary checkbox"
                                  checked={
                                    sendList.find((z) => z === a.email)
                                      ? true
                                      : false
                                  }
                                  onChange={(e) => {
                                    setSendList((prevValue) => {
                                      if (
                                        prevValue.find((z) => z === a.email!)
                                      ) {
                                        return prevValue.filter(
                                          (z) => z !== a.email
                                        );
                                      } else {
                                        return [...prevValue, a.email!];
                                      }
                                    });
                                  }}
                                />
                                <span className={`label-text ml-3 flex-grow`}>
                                  {a.email}
                                </span>
                              </label>
                            </div>
                          ))
                      ) : (
                        <p className="text-sm">No Staff Users with Email</p>
                      )}
                    </div>
                    {/* <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500">
                        Use Nodemailer?
                      </label>
                      <div className="form-control flex">
                        <label className="label cursor-pointer">
                          <input
                            type="checkbox"
                            className="checkbox-primary checkbox"
                            checked={isNodeMail}
                            onChange={(e) => {
                              setNodeMail((prevValue) => !prevValue);
                            }}
                          />
                          <span className={`label-text ml-3 flex-grow`}>
                            Nodemailer
                          </span>
                        </label>
                      </div>
                    </div> */}
                  </div>

                  <div className="sticky bottom-0 mt-4 flex w-full justify-end ">
                    <SubmitBtn
                      isSubmit={isSubmit}
                      submitTxt="Loading..."
                      text={"Send"}
                      onClick={() => {
                        const params: any = {
                          orderNo: orderNo,
                          isMailer: isNodeMail,
                          sendTo: sendList,
                        };
                        let d: any = new URLSearchParams(params).toString();
                        setSubmit(true);
                        const eventSource = new EventSource(
                          `/api/orders/sendEmail?${d}`
                        );
                        let sentCount = 0;
                        eventSource.addEventListener("message", (event) => {
                          const message: any = event.data.trim();
                          if (message.startsWith("Sending email to")) {
                            setMessage(message);
                          } else if (message.startsWith("Email sent to")) {
                            sentCount++;
                            const percent = parseFloat(
                              ((sentCount / sendList.length) * 100).toFixed(0)
                            );
                            setProgress(percent);
                          }
                        });

                        eventSource.addEventListener("error", (event) => {
                          console.error(event);
                          eventSource.close();
                        });
                      }}
                    />
                  </div>
                  {message ? (
                    <div className="flex flex-col gap-1 mt-5">
                      <div className="flex flex-row items-center gap-1">
                        <span className="text-xs flex-grow line-clamp-1">
                          {message}
                        </span>
                        <span className="text-xs">{progress} %</span>
                      </div>
                      <div className="relative">
                        <div className="bg-gray-400 h-1"></div>
                        <div
                          className="bg-success h-1 absolute top-0 z-10"
                          style={{
                            width: progress + "%",
                          }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <></>
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

export default ResendDialog;
