import React, { Fragment } from "react";
import { Dialog, Disclosure, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import { showWarningDialog } from "@/util/swalFunction";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  chooseCategories: string[];
  setChooseCategories: Function;
  allowChangeParent: boolean;
}

function ProductCategoryModal({
  isModalOpen,
  setModalOpen,
  chooseCategories,
  setChooseCategories,
  allowChangeParent,
}: Props) {
  const router = useRouter();
  const { data } = useSWR("/api/products/categories", fetcher);
  const { data: catOriginal } = useSWR(
    "/api/products/categories?isOriginal=true",
    fetcher
  );
  const { t } = useTranslation("common");

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

  function check(check: boolean, elem: any) {
    if (allowChangeParent === true) {
      if (check === true) {
        setChooseCategories([elem.id], [elem]);
      } else {
        setChooseCategories([], []);
      }
    } else {
      showWarningDialog(
        "Cannot change parent category",
        "မိခင်အမျိုးအစားကို ပြောင်းလဲ၍မရပါ။",
        router.locale
      );
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
              <div className="absolute top-0 right-0 bottom-0 flex w-[400px] transform overflow-auto rounded-l-xl bg-primary shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto bg-white p-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">{t("chooseCategory")}</h3>
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
                    <div className="flex flex-col py-2">
                      {data ? (
                        data.map((elem: any, index: number) => (
                          <Disclosure key={index}>
                            {({ open }) => (
                              <>
                                <div className="flex w-full items-center py-2.5">
                                  <div className="flex flex-grow items-center space-x-5">
                                    <div className="flex h-5 items-center">
                                      <input
                                        type="checkbox"
                                        className="checkbox-primary checkbox"
                                        onChange={(e) => {
                                          check(e.currentTarget.checked, elem);
                                        }}
                                        checked={
                                          chooseCategories.find(
                                            (e) => e === elem.id
                                          )
                                            ? true
                                            : false
                                        }
                                      />
                                    </div>
                                    <label
                                      className="text-gray-800"
                                      onClick={(e) => {
                                        if (
                                          chooseCategories.find(
                                            (e) => e === elem.id
                                          )
                                        ) {
                                          check(false, elem);
                                        } else {
                                          check(true, elem);
                                        }
                                      }}
                                    >
                                      {router.locale && router.locale === "mm"
                                        ? elem.nameMM
                                        : elem.name}
                                    </label>
                                  </div>
                                  {elem.subCategory &&
                                    elem.subCategory.length > 0 && (
                                      <Disclosure.Button>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className={`${
                                            open ? "rotate-180 transform" : ""
                                          } text-brand} h-5 w-5`}
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      </Disclosure.Button>
                                    )}
                                </div>
                                {elem.subCategory &&
                                  elem.subCategory.length > 0 &&
                                  elem.subCategory.map(
                                    (el: any, subIndex: number) => (
                                      <SubCategories
                                        allCategories={catOriginal}
                                        subDetail={el}
                                        key={subIndex}
                                        reducedCategories={data}
                                        chooseCategories={chooseCategories}
                                        setChooseCategories={
                                          setChooseCategories
                                        }
                                        allowChangeParent={allowChangeParent}
                                      />
                                    )
                                  )}
                              </>
                            )}
                          </Disclosure>
                        ))
                      ) : (
                        <div className="loading-bar"></div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex w-full justify-end ">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary/10 px-4 py-2 text-sm font-medium text-info hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2"
                      onClick={() => setModalOpen(false)}
                    >
                      {t("choose")}
                    </button>
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

interface SubProps {
  subDetail: any;
  chooseCategories: string[];
  setChooseCategories: Function;
  allCategories: any;
  reducedCategories: any;
  allowChangeParent: boolean;
}

function SubCategories({
  subDetail,
  allCategories,
  chooseCategories,
  setChooseCategories,
  reducedCategories,
  allowChangeParent,
}: SubProps) {
  const { locale } = useRouter();

  function getParentId(id: string) {
    let elem = allCategories.find((e: any) => e.id === id);
    if (elem.parentId) {
      return elem.parentId;
    } else {
      return null;
    }
  }

  function getSubIdList(id: string) {
    let subCategory = allCategories.filter((e: any) => e.parentId === id);

    if (subCategory) {
      return subCategory.map((e: any) => e.id);
    } else {
      return [];
    }
  }

  function getAllParentCategories(id: string) {
    let catList = [];
    let currentCategoryId = id;
    let parentId = getParentId(id);
    let parentId2 = getParentId(parentId);
    if (parentId2) {
      catList.push(parentId2);
    }
    if (parentId) {
      catList.push(parentId);
    }
    catList.push(currentCategoryId);
    return catList;
  }

  function getAllSubCategories(id: string) {
    let subIdList = getSubIdList(id);
    return subIdList;
  }

  function getCategoryList(id: string[]) {
    let d: any = [];
    for (let i = 0; i < id.length; i++) {
      d.push(allCategories.find((e: any) => e.id === id[i]));
    }
    return d;
  }

  function check(checked: boolean, elem: any) {
    if (checked === true) {
      let r = getAllParentCategories(elem.id);
      let choosen = [...chooseCategories, ...r];
      let unique = Array.from(new Set(choosen));
      let parentsList = reducedCategories.filter(
        (e: any) => unique && unique.includes(e.id)
      );

      if (parentsList.length > 1) {
        if (r.filter((e) => !e.parentId)) {
          if (allowChangeParent === true) {
            setChooseCategories(r, getCategoryList(r));
          } else {
            showWarningDialog(
              "Cannot change parent category",
              "မိခင်အမျိုးအစားကို ပြောင်းလဲ၍မရပါ။",
              locale
            );
          }
        }
      } else {
        setChooseCategories(unique, getCategoryList(unique));
      }
    } else {
      let r = getAllSubCategories(elem.id);
      r.push(elem.id);
      setChooseCategories(
        chooseCategories.filter((e: any) => r && !r.includes(e)),
        getCategoryList(
          chooseCategories.filter((e: any) => r && !r.includes(e))
        )
      );
    }
  }

  return (
    <Disclosure.Panel className="px-4 text-sm">
      <Disclosure as="div">
        {({ open }) => (
          <>
            <div className="flex w-full items-center py-2.5">
              <div className="flex flex-grow items-center space-x-5">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox"
                    onChange={(e) => {
                      check(e.currentTarget.checked, subDetail);
                    }}
                    checked={
                      chooseCategories.find((e) => e === subDetail.id)
                        ? true
                        : false
                    }
                  />
                </div>
                <label
                  className="font-medium"
                  onClick={(e) => {
                    if (chooseCategories.find((e) => e === subDetail.id)) {
                      check(false, subDetail);
                    } else {
                      check(true, subDetail);
                    }
                  }}
                >
                  {locale === "mm" ? subDetail.nameMM : subDetail.name}
                </label>
              </div>
              {subDetail.subCategory && subDetail.subCategory.length > 0 && (
                <Disclosure.Button>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`${
                      open ? "rotate-180 transform" : ""
                    } text-brand} h-5 w-5`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Disclosure.Button>
              )}
            </div>
            {subDetail.subCategory && subDetail.subCategory.length > 0 && (
              <Disclosure.Panel className="px-4 text-sm">
                {subDetail.subCategory.map((el: any, subIndex: number) => (
                  <SubCategories
                    subDetail={el}
                    key={subIndex}
                    allCategories={allCategories}
                    chooseCategories={chooseCategories}
                    setChooseCategories={setChooseCategories}
                    reducedCategories={reducedCategories}
                    allowChangeParent={allowChangeParent}
                  />
                ))}
              </Disclosure.Panel>
            )}
          </>
        )}
      </Disclosure>
    </Disclosure.Panel>
  );
}

export default ProductCategoryModal;
