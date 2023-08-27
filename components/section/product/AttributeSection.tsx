import TermModal from "@/components/modal/sideModal/TermModal";
import TermProductModal from "@/components/modal/sideModal/TermProductModal";
import EmptyScreen from "@/components/screen/EmptyScreen";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { useProduct } from "@/context/ProductContext";
import { fetcher } from "@/util/fetcher";
import {
  showConfirmationDialog,
  showErrorDialog,
  showWarningDialog,
} from "@/util/swalFunction";
import { formatAmount } from "@/util/textHelper";
import { AttrType, Role } from "@prisma/client";
import { differenceBy } from "lodash";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";

type Props = {
  backFn: Function;
  nextFn: Function;
};

function AttributeSection({ backFn, nextFn }: Props) {
  const { t } = useTranslation("common");
  const { product, setProduct } = useProduct();
  const { data } = useSWR("/api/products/attributes", fetcher);
  const { locale } = useRouter();

  const [attributes, setAttributes] = React.useState<any>([]);
  const [termIndex, setTermIndex] = React.useState(-1);
  const [termModalOpen, setTermModalOpen] = React.useState(false);
  const [term, setTerm] = React.useState<any>();
  const [type, setType] = React.useState<any>();
  const router = useRouter();
  const { data: session }: any = useSession();

  React.useEffect(() => {
    if (data && data.length > 0) {
      let attrArr: any = [...data];
      if (product.attributes) {
        for (let i = 0; i < attrArr.length; i++) {
          let prodAttr = product.attributes.find(
            (a: any) => a.id === attrArr[i].id
          );
          if (prodAttr && prodAttr.Term) {
            const difference = differenceBy(
              prodAttr.Term,
              attrArr[i].Term,
              "name"
            );
            attrArr[i].Term = [...attrArr[i].Term, ...difference];
          }
        }
      }
      setAttributes(attrArr);
    }
  }, [data, product]);

  function deleteTerm(attrIndex: any, name: string) {
    showConfirmationDialog(t("deleteConfirmation"), "", locale, () => {
      let attr = [...attributes];
      let index = attr[attrIndex].Term.findIndex((e: any) => e.name === name);
      if (index >= 0) {
        attr[attrIndex].Term.splice(index, 1);
      }
      setAttributes(attr);
    });
  }

  return (
    <>
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-gray-500">
          {t("step")} {formatAmount(2, locale)}
        </h3>
        <p className="my-1 text-xl font-bold">{t("attributes")}</p>
        <span className="mb-10 text-sm">{t("fillAttributes")}</span>
        <form
          className="flex flex-col space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            nextFn();
          }}
        >
          {data ? (
            <div className="flex flex-col space-y-5">
              {attributes.map((elem: any, index: number) => (
                <div className="flex flex-col space-y-3" key={index}>
                  <div className="flex items-center space-x-3 border-b py-3">
                    <h3 className="font-medium">
                      {locale === "mm" ? elem.nameMM : elem.name}
                    </h3>
                    <button
                      type="button"
                      className={`rounded-md bg-primary p-1 text-white focus:outline-none`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTerm({
                          attributeId: elem.id,
                        });
                        setType(elem.type);
                        setTermIndex(-1);
                        setTermModalOpen(true);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {elem.Term && elem.Term.length > 0 ? (
                      elem.Term.map((el: any, termIndex: number) => (
                        <div
                          key={termIndex}
                          className={`flex cursor-pointer items-center space-x-3 rounded-lg border px-3 shadow-sm transition-colors hover:bg-primary-focus hover:text-white ${
                            product.attributes &&
                            product.attributes.find(
                              (e: any) =>
                                e.id === elem.id &&
                                e.Term.find((a: any) => a.name === el.name)
                            )
                              ? "border-primary  ring-1 ring-primary"
                              : "border-gray-500"
                          } `}
                          onClick={(e) => {
                            let attr: any = [];
                            if (product.attributes) {
                              attr = [...product.attributes];
                            }
                            let prodAttrIndex: number = attr.findIndex(
                              (e: any) => e.id === elem.id
                            );
                            if (prodAttrIndex >= 0) {
                              let isExists = attr[prodAttrIndex].Term.find(
                                (e: any) => e.name === el.name
                              );
                              if (isExists) {
                                if (product.variations) {
                                  let variationExists = product.variations.find(
                                    (e: any) =>
                                      e.attributes.find(
                                        (z: any) =>
                                          (el.id && z.id === el.id) ||
                                          el.name === z.name
                                      )
                                  );
                                  if (variationExists) {
                                    showWarningDialog(
                                      "Variation already exists cannot remove.",
                                      "ရှိနှင့်ပြီးသား ပုံစံကွဲများကို ဖယ်ရှား၍မရပါ။",
                                      locale
                                    );
                                  } else {
                                    attr[prodAttrIndex].Term = attr[
                                      prodAttrIndex
                                    ].Term.filter(
                                      (e: any) => e.name !== el.name
                                    );
                                    if (attr[prodAttrIndex].Term.length === 0) {
                                      attr = attr.filter(
                                        (e: any) => e.id !== elem.id
                                      );
                                    }
                                  }
                                } else {
                                  attr[prodAttrIndex].Term = attr[
                                    prodAttrIndex
                                  ].Term.filter((e: any) => e.name !== el.name);
                                  if (attr[prodAttrIndex].Term.length === 0) {
                                    attr = attr.filter(
                                      (e: any) => e.id !== elem.id
                                    );
                                  }
                                }
                              } else {
                                attr[prodAttrIndex].Term.push(el);
                              }
                            } else {
                              attr.push({
                                id: elem.id,
                                name: elem.name,
                                nameMM: elem.nameMM,
                                type: elem.type,
                                Term: [el],
                              });
                            }

                            setProduct({ ...product, attributes: attr });
                          }}
                        >
                          {elem.type === AttrType.Color ? (
                            <div
                              className="h-5 w-5 rounded-md shadow-md"
                              style={{ backgroundColor: el.value }}
                            ></div>
                          ) : (
                            elem.type === AttrType.Image && (
                              <div className="h-5 w-5 rounded-md shadow-md">
                                <img
                                  src={"/api/files/" + el.value}
                                  className="object-cover"
                                />
                              </div>
                            )
                          )}
                          <label
                            className={`block flex-grow cursor-pointer p-4 text-sm font-medium`}
                          >
                            <span className="whitespace-nowrap">
                              {locale === "mm" ? el.nameMM : el.name}
                            </span>
                          </label>
                          {product.attributes &&
                            product.attributes.find(
                              (e: any) =>
                                e.id === elem.id &&
                                e.Term.find((a: any) => a.name === el.name)
                            ) && (
                              <svg
                                className="top-4 right-4 h-5 w-5 cursor-pointer"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          {el.id ? (
                            <></>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  let attr: any = [];
                                  if (product.attributes) {
                                    attr = [...product.attributes];
                                  }
                                  let prodAttrIndex: number = attr.findIndex(
                                    (e: any) => e.id === elem.id
                                  );
                                  if (prodAttrIndex >= 0) {
                                    let isExists = attr[
                                      prodAttrIndex
                                    ].Term.find((e: any) => e.name === el.name);
                                    if (isExists) {
                                      if (product.variations) {
                                        let variationExists =
                                          product.variations.find((e: any) =>
                                            e.attributes.find(
                                              (z: any) =>
                                                (el.id && z.id === el.id) ||
                                                el.name === z.name
                                            )
                                          );
                                        if (variationExists) {
                                          showWarningDialog(
                                            "Variation already exists cannot remove.",
                                            "ရှိနှင့်ပြီးသား ပုံစံကွဲများကို ဖယ်ရှား၍မရပါ။",
                                            locale
                                          );
                                        } else {
                                          deleteTerm(index, el.name);
                                        }
                                      } else {
                                        deleteTerm(index, el.name);
                                      }
                                    } else {
                                      deleteTerm(index, el.name);
                                    }
                                  } else {
                                    deleteTerm(index, el.name);
                                  }
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTerm({
                                    name: el.name,
                                    nameMM: el.nameMM,
                                    attributeId: elem.id,
                                  });
                                  setTermIndex(termIndex);
                                  setType(elem.type);
                                  setTermModalOpen(true);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>{t("noData")}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : session && session.role === Role.Seller ? (
            <ErrorScreen statusCode={404} />
          ) : (
            <EmptyScreen
              onClickFn={() => {
                router.push("/products/attributes");
              }}
            />
          )}

          <span className="mt-5 flex justify-end divide-x overflow-hidden">
            <button
              type="button"
              className={`inline-block rounded-l-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
              title="Previous"
              onClick={() => {
                backFn();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M20.25 12a.75.75 0 01-.75.75H6.31l5.47 5.47a.75.75 0 11-1.06 1.06l-6.75-6.75a.75.75 0 010-1.06l6.75-6.75a.75.75 0 111.06 1.06l-5.47 5.47H19.5a.75.75 0 01.75.75z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              className={`inline-flex items-center gap-3 rounded-r-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
              title="Next"
              type="submit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M3.75 12a.75.75 0 01.75-.75h13.19l-5.47-5.47a.75.75 0 011.06-1.06l6.75 6.75a.75.75 0 010 1.06l-6.75 6.75a.75.75 0 11-1.06-1.06l5.47-5.47H4.5a.75.75 0 01-.75-.75z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </span>
        </form>
      </div>
      <TermProductModal
        title={term && term.name ? t("updateTerm") : t("newTerm")}
        isModalOpen={termModalOpen}
        setModalOpen={setTermModalOpen}
        term={term}
        type={type}
        updateData={(term: any) => {
          let attributeList: any = [];
          attributeList = [...attributes];

          let index = attributeList.findIndex(
            (e: any) => e.id === term.attributeId
          );
          if (termIndex === -1) {
            if (
              attributeList[index].Term.find((e: any) => e.name === term.name)
            ) {
              showErrorDialog("Duplicate name", "နာမည်တူနေပါသည်။", locale);
            } else {
              attributeList[index].Term.push(term);

              setAttributes(attributeList);
            }
          } else {
            if (
              !attributeList[index].Term.find(
                (e: any) => e.name === term.name
              ) ||
              attributeList[index].Term[termIndex].name === term.name
            ) {
              let prevValue = { ...attributeList[index].Term[termIndex] };

              let prod = { ...product };
              if (prod.variations) {
                let varia = [...prod.variations];
                for (let i = 0; i < varia.length; i++) {
                  let attr = varia[i].attributes.findIndex(
                    (e: any) =>
                      e.attributeId === term.attributeId &&
                      e.name === prevValue.name
                  );
                  if (attr >= 0) {
                    varia[i].attributes[attr] = term;
                  }
                }
                prod.variations = varia;
              }
              setProduct(prod);

              let attrList = [...attributeList];
              let termList = [...attrList[index].Term];
              termList[termIndex].name = term.name;
              termList[termIndex].nameMM = term.nameMM;
              termList[termIndex].value = term.value;
              attrList[index].Term = termList;
              setAttributes(attrList);
            } else {
              showErrorDialog("Duplicate name", "နာမည်တူနေပါသည်။", locale);
            }
          }
        }}
      />
    </>
  );
}

export default AttributeSection;
