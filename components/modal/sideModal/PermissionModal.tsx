import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { Role, UserDefinedRole } from "@prisma/client";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import {
  AuctionPermission,
  BrandPermission,
  BuyerPermission,
  ConditionPermission,
  OrderPermission,
  ProductPermission,
  ReportPermission,
  SellerPermission,
  StaffPermission,
  SubscribePermission,
  TraderPermission,
  otherPermission,
} from "@/types/permissionTypes";
import { getHeaders } from "@/util/authHelper";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  role?: UserDefinedRole;
  setUpdate: Function;
}

function PermissionModal({
  isModalOpen,
  setModalOpen,
  role,
  setUpdate,
}: Props) {
  const { t } = useTranslation("common");
  const [isSubmit, setSubmit] = React.useState(false);
  const [name, setName] = React.useState("");
  const [permissions, setPermissions] = React.useState<any>([]);
  const router = useRouter();
  const { locale } = router;
  const { data: session }: any = useSession();
  const [error, setError] = React.useState("");

  function submitFn() {
    if (role && role.id) {
      setSubmit(true);
      fetch("/api/roles?id=" + role.id, {
        method: "PUT",
        body: JSON.stringify({
          name: name,
          permission: permissions,
        }),
        headers: getHeaders(session),
      }).then(async (data) => {
        setSubmit(false);
        if (data.status === 200) {
          showSuccessDialog(
            t("submit") + " " + t("success"),
            "",
            locale,
            () => {
              setModalOpen(false);
              setUpdate(true);
            }
          );
        } else {
          let json = await data.json();
          showErrorDialog(json.error, json.errorMM, locale);
        }
      });
    } else {
      setSubmit(true);
      fetch("/api/roles", {
        method: "POST",
        body: JSON.stringify({
          name: name,
          permission: permissions,
        }),
        headers: getHeaders(session),
      }).then(async (data) => {
        setSubmit(false);
        if (data.status === 200) {
          showSuccessDialog(
            t("submit") + " " + t("success"),
            "",
            locale,
            () => {
              setModalOpen(false);
              setUpdate(true);
            }
          );
        } else {
          let json = await data.json();
          showErrorDialog(json.error, json.errorMM, locale);
        }
      });
    }
  }

  React.useEffect(() => {
    if (role) {
      setName(role.name);
      setPermissions(role.permission);
    } else {
      setName("");
      setPermissions([]);
    }
  }, [role]);

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
                <div className="inline-block w-full overflow-y-auto bg-white p-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="text-darkShade flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">
                      {role && role.id
                        ? "Update Custom Role"
                        : " Create Custom Role"}
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
                  <div className="mt-2 flex flex-col gap-3">
                    <div>
                      <label
                        className={`text-sm font-medium text-gray-400 ${
                          error
                            ? "text-error"
                            : name && name.length > 0 && !error
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        Name <span className="text-error">*</span>
                      </label>

                      <div className={`relative mt-1`}>
                        <input
                          type={"text"}
                          className={`w-full rounded-lg ${
                            error
                              ? "border-error"
                              : name && name.length > 0 && !error
                              ? "border-green-600"
                              : "border-gray-200"
                          } px-4 py-2 pr-12 text-sm leading-6 shadow-sm`}
                          placeholder={"Enter name"}
                          value={name}
                          onChange={(e) => {
                            let value = e.currentTarget.value;
                            if (!value) {
                              setError("Please input name");
                            }
                            setName(value);
                          }}
                        />
                      </div>
                      {error && (
                        <span className="p-2 text-xs text-error">{error}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <details className="group">
                        <summary className="flex flex-row cursor-pointer items-end">
                          <div className="flex flex-row items-center justify-between mt-3 flex-grow">
                            <div
                              className={`text-sm font-semibold text-gray-700`}
                            >
                              Buyers Permissions
                              <div className="ml-2 badge badge-primary badge-outline badge-sm">
                                {
                                  [...Object.keys(BuyerPermission)].filter(
                                    (element) => permissions.includes(element)
                                  ).length
                                }{" "}
                                / {[...Object.keys(BuyerPermission)].length}
                              </div>
                            </div>
                            {[...Object.keys(BuyerPermission)].every((e) =>
                              permissions.includes(e)
                            ) ? (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      [...Object.keys(BuyerPermission)].filter(
                                        (element) =>
                                          !prevValue.includes(element)
                                      )
                                    );
                                  });
                                }}
                              >
                                Disable All
                              </button>
                            ) : (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      new Set([
                                        ...prevValue,
                                        ...Object.keys(BuyerPermission),
                                      ])
                                    );
                                  });
                                }}
                              >
                                Allow All
                              </button>
                            )}
                          </div>
                          <div
                            className={`text-sm font-semibold text-gray-500`}
                          ></div>
                          <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="mt-1">
                          {Object.keys(BuyerPermission).map((value, index) => (
                            <div className="form-control flex" key={index}>
                              <label className="label cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="checkbox-primary checkbox"
                                  checked={permissions.find(
                                    (z: any) => z === value
                                  )}
                                  onChange={(e) => {
                                    setPermissions((prevValue: any) => {
                                      if (
                                        prevValue &&
                                        prevValue.find((z: any) => z === value)
                                      ) {
                                        return prevValue.filter(
                                          (z: any) => z !== value
                                        );
                                      } else {
                                        return [...prevValue, value];
                                      }
                                    });
                                  }}
                                />
                                <span className={`label-text ml-3 flex-grow`}>
                                  {BuyerPermission[value]}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>

                    <div className="flex flex-col gap-3 border-t">
                      <details className="group">
                        <summary className="flex flex-row cursor-pointer items-end">
                          <div className="flex flex-row items-center justify-between mt-3 flex-grow">
                            <div
                              className={`text-sm font-semibold text-gray-700`}
                            >
                              Sellers Permissions
                              <div className="ml-2 badge badge-primary badge-outline badge-sm">
                                {
                                  [...Object.keys(SellerPermission)].filter(
                                    (element) => permissions.includes(element)
                                  ).length
                                }{" "}
                                / {[...Object.keys(SellerPermission)].length}
                              </div>
                            </div>
                            {[...Object.keys(SellerPermission)].every((e) =>
                              permissions.includes(e)
                            ) ? (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      [...Object.keys(SellerPermission)].filter(
                                        (element) =>
                                          !prevValue.includes(element)
                                      )
                                    );
                                  });
                                }}
                              >
                                Disable All
                              </button>
                            ) : (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      new Set([
                                        ...prevValue,
                                        ...Object.keys(SellerPermission),
                                      ])
                                    );
                                  });
                                }}
                              >
                                Allow All
                              </button>
                            )}
                          </div>
                          <div
                            className={`text-sm font-semibold text-gray-500`}
                          ></div>
                          <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="mt-1">
                          {Object.keys(SellerPermission).map((value, index) => (
                            <div className="form-control flex" key={index}>
                              <label className="label cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="checkbox-primary checkbox"
                                  checked={permissions.find(
                                    (z: any) => z === value
                                  )}
                                  onChange={(e) => {
                                    setPermissions((prevValue: any) => {
                                      if (
                                        prevValue &&
                                        prevValue.find((z: any) => z === value)
                                      ) {
                                        return prevValue.filter(
                                          (z: any) => z !== value
                                        );
                                      } else {
                                        return [...prevValue, value];
                                      }
                                    });
                                  }}
                                />
                                <span className={`label-text ml-3 flex-grow`}>
                                  {SellerPermission[value]}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>

                    <div className="flex flex-col gap-3 border-t">
                      <details className="group">
                        <summary className="flex flex-row cursor-pointer items-end">
                          <div className="flex flex-row items-center justify-between mt-3 flex-grow">
                            <div
                              className={`text-sm font-semibold text-gray-700`}
                            >
                              Traders Permissions
                              <div className="ml-2 badge badge-primary badge-outline badge-sm">
                                {
                                  [...Object.keys(TraderPermission)].filter(
                                    (element) => permissions.includes(element)
                                  ).length
                                }{" "}
                                / {[...Object.keys(TraderPermission)].length}
                              </div>
                            </div>
                            {[...Object.keys(TraderPermission)].every((e) =>
                              permissions.includes(e)
                            ) ? (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      [...Object.keys(TraderPermission)].filter(
                                        (element) =>
                                          !prevValue.includes(element)
                                      )
                                    );
                                  });
                                }}
                              >
                                Disable All
                              </button>
                            ) : (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      new Set([
                                        ...prevValue,
                                        ...Object.keys(TraderPermission),
                                      ])
                                    );
                                  });
                                }}
                              >
                                Allow All
                              </button>
                            )}
                          </div>
                          <div
                            className={`text-sm font-semibold text-gray-500`}
                          ></div>
                          <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="mt-1">
                          {Object.keys(TraderPermission).map((value, index) => (
                            <div className="form-control flex" key={index}>
                              <label className="label cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="checkbox-primary checkbox"
                                  checked={permissions.find(
                                    (z: any) => z === value
                                  )}
                                  onChange={(e) => {
                                    setPermissions((prevValue: any) => {
                                      if (
                                        prevValue &&
                                        prevValue.find((z: any) => z === value)
                                      ) {
                                        return prevValue.filter(
                                          (z: any) => z !== value
                                        );
                                      } else {
                                        return [...prevValue, value];
                                      }
                                    });
                                  }}
                                />
                                <span className={`label-text ml-3 flex-grow`}>
                                  {TraderPermission[value]}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>

                    <div className="flex flex-col gap-3 border-t">
                      <details className="group">
                        <summary className="flex flex-row cursor-pointer items-end">
                          <div className="flex flex-row items-center justify-between mt-3 flex-grow">
                            <div
                              className={`text-sm font-semibold text-gray-700`}
                            >
                              Staffs Permissions
                              <div className="ml-2 badge badge-primary badge-outline badge-sm">
                                {
                                  [...Object.keys(StaffPermission)].filter(
                                    (element) => permissions.includes(element)
                                  ).length
                                }{" "}
                                / {[...Object.keys(StaffPermission)].length}
                              </div>
                            </div>
                            {[...Object.keys(StaffPermission)].every((e) =>
                              permissions.includes(e)
                            ) ? (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      [...Object.keys(StaffPermission)].filter(
                                        (element) =>
                                          !prevValue.includes(element)
                                      )
                                    );
                                  });
                                }}
                              >
                                Disable All
                              </button>
                            ) : (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      new Set([
                                        ...prevValue,
                                        ...Object.keys(StaffPermission),
                                      ])
                                    );
                                  });
                                }}
                              >
                                Allow All
                              </button>
                            )}
                          </div>
                          <div
                            className={`text-sm font-semibold text-gray-500`}
                          ></div>
                          <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="mt-1">
                          {Object.keys(StaffPermission).map((value, index) => (
                            <div className="form-control flex" key={index}>
                              <label className="label cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="checkbox-primary checkbox"
                                  checked={permissions.find(
                                    (z: any) => z === value
                                  )}
                                  onChange={(e) => {
                                    setPermissions((prevValue: any) => {
                                      if (
                                        prevValue &&
                                        prevValue.find((z: any) => z === value)
                                      ) {
                                        return prevValue.filter(
                                          (z: any) => z !== value
                                        );
                                      } else {
                                        return [...prevValue, value];
                                      }
                                    });
                                  }}
                                />
                                <span className={`label-text ml-3 flex-grow`}>
                                  {StaffPermission[value]}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>

                    <div className="flex flex-col gap-3 border-t">
                      <details className="group">
                        <summary className="flex flex-row cursor-pointer items-end">
                          <div className="flex flex-row items-center justify-between mt-3 flex-grow">
                            <div
                              className={`text-sm font-semibold text-gray-700`}
                            >
                              Subscribe Permissions
                              <div className="ml-2 badge badge-primary badge-outline badge-sm">
                                {
                                  [...Object.keys(SubscribePermission)].filter(
                                    (element) => permissions.includes(element)
                                  ).length
                                }{" "}
                                / {[...Object.keys(SubscribePermission)].length}
                              </div>
                            </div>
                            {[...Object.keys(SubscribePermission)].every((e) =>
                              permissions.includes(e)
                            ) ? (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      [
                                        ...Object.keys(SubscribePermission),
                                      ].filter(
                                        (element) =>
                                          !prevValue.includes(element)
                                      )
                                    );
                                  });
                                }}
                              >
                                Disable All
                              </button>
                            ) : (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      new Set([
                                        ...prevValue,
                                        ...Object.keys(SubscribePermission),
                                      ])
                                    );
                                  });
                                }}
                              >
                                Allow All
                              </button>
                            )}
                          </div>
                          <div
                            className={`text-sm font-semibold text-gray-500`}
                          ></div>
                          <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="mt-1">
                          {Object.keys(SubscribePermission).map(
                            (value, index) => (
                              <div className="form-control flex" key={index}>
                                <label className="label cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="checkbox-primary checkbox"
                                    checked={permissions.find(
                                      (z: any) => z === value
                                    )}
                                    onChange={(e) => {
                                      setPermissions((prevValue: any) => {
                                        if (
                                          prevValue &&
                                          prevValue.find(
                                            (z: any) => z === value
                                          )
                                        ) {
                                          return prevValue.filter(
                                            (z: any) => z !== value
                                          );
                                        } else {
                                          return [...prevValue, value];
                                        }
                                      });
                                    }}
                                  />
                                  <span className={`label-text ml-3 flex-grow`}>
                                    {SubscribePermission[value]}
                                  </span>
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </details>
                    </div>

                    <div className="flex flex-col gap-3 border-t">
                      <details className="group">
                        <summary className="flex flex-row cursor-pointer items-center">
                          <div className="flex flex-row items-center justify-between mt-3 flex-grow">
                            <div
                              className={`text-sm font-semibold text-gray-700`}
                            >
                              Products Permissions
                              <div className="ml-2 badge badge-primary badge-outline badge-sm">
                                {
                                  [...Object.keys(ProductPermission)].filter(
                                    (element) => permissions.includes(element)
                                  ).length
                                }{" "}
                                / {[...Object.keys(ProductPermission)].length}
                              </div>
                            </div>
                            {[...Object.keys(ProductPermission)].every((e) =>
                              permissions.includes(e)
                            ) ? (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      [
                                        ...Object.keys(ProductPermission),
                                      ].filter(
                                        (element) =>
                                          !prevValue.includes(element)
                                      )
                                    );
                                  });
                                }}
                              >
                                Disable All
                              </button>
                            ) : (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      new Set([
                                        ...prevValue,
                                        ...Object.keys(ProductPermission),
                                      ])
                                    );
                                  });
                                }}
                              >
                                Allow All
                              </button>
                            )}
                          </div>
                          <div
                            className={`text-sm font-semibold text-gray-500`}
                          ></div>
                          <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="mt-1">
                          {Object.keys(ProductPermission).map(
                            (value, index) => (
                              <div className="form-control flex" key={index}>
                                <label className="label cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="checkbox-primary checkbox"
                                    checked={permissions.find(
                                      (z: any) => z === value
                                    )}
                                    onChange={(e) => {
                                      setPermissions((prevValue: any) => {
                                        if (
                                          prevValue &&
                                          prevValue.find(
                                            (z: any) => z === value
                                          )
                                        ) {
                                          return prevValue.filter(
                                            (z: any) => z !== value
                                          );
                                        } else {
                                          return [...prevValue, value];
                                        }
                                      });
                                    }}
                                  />
                                  <span className={`label-text ml-3 flex-grow`}>
                                    {ProductPermission[value]}
                                  </span>
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </details>
                    </div>

                    <div className="flex flex-col gap-3 border-t">
                      <details className="group">
                        <summary className="flex flex-row cursor-pointer items-center">
                          <div className="flex flex-row items-center justify-between mt-3 flex-grow">
                            <div
                              className={`text-sm font-semibold text-gray-700`}
                            >
                              Brands Permissions
                              <div className="ml-2 badge badge-primary badge-outline badge-sm">
                                {
                                  [...Object.keys(BrandPermission)].filter(
                                    (element) => permissions.includes(element)
                                  ).length
                                }{" "}
                                / {[...Object.keys(BrandPermission)].length}
                              </div>
                            </div>
                            {[...Object.keys(BrandPermission)].every((e) =>
                              permissions.includes(e)
                            ) ? (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      [...Object.keys(BrandPermission)].filter(
                                        (element) =>
                                          !prevValue.includes(element)
                                      )
                                    );
                                  });
                                }}
                              >
                                Disable All
                              </button>
                            ) : (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      new Set([
                                        ...prevValue,
                                        ...Object.keys(BrandPermission),
                                      ])
                                    );
                                  });
                                }}
                              >
                                Allow All
                              </button>
                            )}
                          </div>
                          <div
                            className={`text-sm font-semibold text-gray-500`}
                          ></div>
                          <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="mt-1">
                          {Object.keys(BrandPermission).map((value, index) => (
                            <div className="form-control flex" key={index}>
                              <label className="label cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="checkbox-primary checkbox"
                                  checked={permissions.find(
                                    (z: any) => z === value
                                  )}
                                  onChange={(e) => {
                                    setPermissions((prevValue: any) => {
                                      if (
                                        prevValue &&
                                        prevValue.find((z: any) => z === value)
                                      ) {
                                        return prevValue.filter(
                                          (z: any) => z !== value
                                        );
                                      } else {
                                        return [...prevValue, value];
                                      }
                                    });
                                  }}
                                />
                                <span className={`label-text ml-3 flex-grow`}>
                                  {BrandPermission[value]}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>

                    <div className="flex flex-col gap-3 border-t">
                      <details className="group">
                        <summary className="flex flex-row cursor-pointer items-center">
                          <div className="flex flex-row items-center justify-between mt-3 flex-grow">
                            <div
                              className={`text-sm font-semibold text-gray-700`}
                            >
                              Conditions Permissions
                              <div className="ml-2 badge badge-primary badge-outline badge-sm">
                                {
                                  [...Object.keys(ConditionPermission)].filter(
                                    (element) => permissions.includes(element)
                                  ).length
                                }{" "}
                                / {[...Object.keys(ConditionPermission)].length}
                              </div>
                            </div>
                            {[...Object.keys(ConditionPermission)].every((e) =>
                              permissions.includes(e)
                            ) ? (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      [
                                        ...Object.keys(ConditionPermission),
                                      ].filter(
                                        (element) =>
                                          !prevValue.includes(element)
                                      )
                                    );
                                  });
                                }}
                              >
                                Disable All
                              </button>
                            ) : (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      new Set([
                                        ...prevValue,
                                        ...Object.keys(ConditionPermission),
                                      ])
                                    );
                                  });
                                }}
                              >
                                Allow All
                              </button>
                            )}
                          </div>
                          <div
                            className={`text-sm font-semibold text-gray-500`}
                          ></div>
                          <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="mt-1">
                          {Object.keys(ConditionPermission).map(
                            (value, index) => (
                              <div className="form-control flex" key={index}>
                                <label className="label cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="checkbox-primary checkbox"
                                    checked={permissions.find(
                                      (z: any) => z === value
                                    )}
                                    onChange={(e) => {
                                      setPermissions((prevValue: any) => {
                                        if (
                                          prevValue &&
                                          prevValue.find(
                                            (z: any) => z === value
                                          )
                                        ) {
                                          return prevValue.filter(
                                            (z: any) => z !== value
                                          );
                                        } else {
                                          return [...prevValue, value];
                                        }
                                      });
                                    }}
                                  />
                                  <span className={`label-text ml-3 flex-grow`}>
                                    {ConditionPermission[value]}
                                  </span>
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </details>
                    </div>

                    <div className="flex flex-col gap-3 border-t">
                      <details className="group">
                        <summary className="flex flex-row cursor-pointer items-center">
                          <div className="flex flex-row items-center justify-between mt-3 flex-grow">
                            <div
                              className={`text-sm font-semibold text-gray-700`}
                            >
                              Orders Permissions
                              <div className="ml-2 badge badge-primary badge-outline badge-sm">
                                {
                                  [...Object.keys(OrderPermission)].filter(
                                    (element) => permissions.includes(element)
                                  ).length
                                }{" "}
                                / {[...Object.keys(OrderPermission)].length}
                              </div>
                            </div>
                            {[...Object.keys(OrderPermission)].every((e) =>
                              permissions.includes(e)
                            ) ? (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      [...Object.keys(OrderPermission)].filter(
                                        (element) =>
                                          !prevValue.includes(element)
                                      )
                                    );
                                  });
                                }}
                              >
                                Disable All
                              </button>
                            ) : (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      new Set([
                                        ...prevValue,
                                        ...Object.keys(OrderPermission),
                                      ])
                                    );
                                  });
                                }}
                              >
                                Allow All
                              </button>
                            )}
                          </div>
                          <div
                            className={`text-sm font-semibold text-gray-500`}
                          ></div>
                          <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="mt-1">
                          {Object.keys(OrderPermission).map((value, index) => (
                            <div className="form-control flex" key={index}>
                              <label className="label cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="checkbox-primary checkbox"
                                  checked={permissions.find(
                                    (z: any) => z === value
                                  )}
                                  onChange={(e) => {
                                    setPermissions((prevValue: any) => {
                                      if (
                                        prevValue &&
                                        prevValue.find((z: any) => z === value)
                                      ) {
                                        return prevValue.filter(
                                          (z: any) => z !== value
                                        );
                                      } else {
                                        return [...prevValue, value];
                                      }
                                    });
                                  }}
                                />
                                <span className={`label-text ml-3 flex-grow`}>
                                  {OrderPermission[value]}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>

                    <div className="flex flex-col gap-3 border-t">
                      <details className="group">
                        <summary className="flex flex-row cursor-pointer items-center">
                          <div className="flex flex-row items-center justify-between mt-3 flex-grow">
                            <div
                              className={`text-sm font-semibold text-gray-700`}
                            >
                              Auction Permissions
                              <div className="ml-2 badge badge-primary badge-outline badge-sm">
                                {
                                  [...Object.keys(AuctionPermission)].filter(
                                    (element) => permissions.includes(element)
                                  ).length
                                }{" "}
                                / {[...Object.keys(AuctionPermission)].length}
                              </div>
                            </div>
                            {[...Object.keys(AuctionPermission)].every((e) =>
                              permissions.includes(e)
                            ) ? (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      [
                                        ...Object.keys(AuctionPermission),
                                      ].filter(
                                        (element) =>
                                          !prevValue.includes(element)
                                      )
                                    );
                                  });
                                }}
                              >
                                Disable All
                              </button>
                            ) : (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      new Set([
                                        ...prevValue,
                                        ...Object.keys(AuctionPermission),
                                      ])
                                    );
                                  });
                                }}
                              >
                                Allow All
                              </button>
                            )}
                          </div>
                          <div
                            className={`text-sm font-semibold text-gray-500`}
                          ></div>
                          <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="mt-1">
                          {Object.keys(AuctionPermission).map(
                            (value, index) => (
                              <div className="form-control flex" key={index}>
                                <label className="label cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="checkbox-primary checkbox"
                                    checked={permissions.find(
                                      (z: any) => z === value
                                    )}
                                    onChange={(e) => {
                                      setPermissions((prevValue: any) => {
                                        if (
                                          prevValue &&
                                          prevValue.find(
                                            (z: any) => z === value
                                          )
                                        ) {
                                          return prevValue.filter(
                                            (z: any) => z !== value
                                          );
                                        } else {
                                          return [...prevValue, value];
                                        }
                                      });
                                    }}
                                  />
                                  <span className={`label-text ml-3 flex-grow`}>
                                    {AuctionPermission[value]}
                                  </span>
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </details>
                    </div>

                    <div className="flex flex-col gap-3 border-t">
                      <details className="group">
                        <summary className="flex flex-row cursor-pointer items-center">
                          <div className="flex flex-row items-center justify-between mt-3 flex-grow">
                            <div
                              className={`text-sm font-semibold text-gray-700`}
                            >
                              Report Permissions
                              <div className="ml-2 badge badge-primary badge-outline badge-sm">
                                {
                                  [...Object.keys(ReportPermission)].filter(
                                    (element) => permissions.includes(element)
                                  ).length
                                }{" "}
                                / {[...Object.keys(ReportPermission)].length}
                              </div>
                            </div>
                            {[...Object.keys(ReportPermission)].every((e) =>
                              permissions.includes(e)
                            ) ? (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      [...Object.keys(ReportPermission)].filter(
                                        (element) =>
                                          !prevValue.includes(element)
                                      )
                                    );
                                  });
                                }}
                              >
                                Disable All
                              </button>
                            ) : (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      new Set([
                                        ...prevValue,
                                        ...Object.keys(ReportPermission),
                                      ])
                                    );
                                  });
                                }}
                              >
                                Allow All
                              </button>
                            )}
                          </div>
                          <div
                            className={`text-sm font-semibold text-gray-500`}
                          ></div>
                          <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="mt-1">
                          {Object.keys(ReportPermission).map((value, index) => (
                            <div className="form-control flex" key={index}>
                              <label className="label cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="checkbox-primary checkbox"
                                  checked={permissions.find(
                                    (z: any) => z === value
                                  )}
                                  onChange={(e) => {
                                    setPermissions((prevValue: any) => {
                                      if (
                                        prevValue &&
                                        prevValue.find((z: any) => z === value)
                                      ) {
                                        return prevValue.filter(
                                          (z: any) => z !== value
                                        );
                                      } else {
                                        return [...prevValue, value];
                                      }
                                    });
                                  }}
                                />
                                <span className={`label-text ml-3 flex-grow`}>
                                  {ReportPermission[value]}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>

                    <div className="flex flex-col gap-3 border-t">
                      <details className="group">
                        <summary className="flex flex-row cursor-pointer items-center">
                          <div className="flex flex-row items-center justify-between mt-3 flex-grow">
                            <div
                              className={`text-sm font-semibold text-gray-700`}
                            >
                              Others Permissions
                              <div className="ml-2 badge badge-primary badge-outline badge-sm">
                                {
                                  [...Object.keys(otherPermission)].filter(
                                    (element) => permissions.includes(element)
                                  ).length
                                }{" "}
                                / {[...Object.keys(otherPermission)].length}
                              </div>
                            </div>
                            {[...Object.keys(otherPermission)].every((e) =>
                              permissions.includes(e)
                            ) ? (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      [...Object.keys(otherPermission)].filter(
                                        (element) =>
                                          !prevValue.includes(element)
                                      )
                                    );
                                  });
                                }}
                              >
                                Disable All
                              </button>
                            ) : (
                              <button
                                className="bg-primary text-white rounded-md text-xs px-2 py-1"
                                onClick={() => {
                                  setPermissions((prevValue) => {
                                    return Array.from(
                                      new Set([
                                        ...prevValue,
                                        ...Object.keys(otherPermission),
                                      ])
                                    );
                                  });
                                }}
                              >
                                Allow All
                              </button>
                            )}
                          </div>
                          <div
                            className={`text-sm font-semibold text-gray-500`}
                          ></div>
                          <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="mt-1">
                          {Object.keys(otherPermission).map((value, index) => (
                            <div className="form-control flex" key={index}>
                              <label className="label cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="checkbox-primary checkbox"
                                  checked={permissions.find(
                                    (z: any) => z === value
                                  )}
                                  onChange={(e) => {
                                    setPermissions((prevValue: any) => {
                                      if (
                                        prevValue &&
                                        prevValue.find((z: any) => z === value)
                                      ) {
                                        return prevValue.filter(
                                          (z: any) => z !== value
                                        );
                                      } else {
                                        return [...prevValue, value];
                                      }
                                    });
                                  }}
                                />
                                <span className={`label-text ml-3 flex-grow`}>
                                  {otherPermission[value]}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  </div>

                  <div className="mt-4 flex w-full justify-end ">
                    <SubmitBtn
                      isSubmit={isSubmit}
                      submitTxt="Loading..."
                      text={t("submit")}
                      onClick={() => {
                        submitFn();
                      }}
                    />
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

export default PermissionModal;
