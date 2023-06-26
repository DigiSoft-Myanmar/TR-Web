import { useProduct } from "@/context/ProductContext";
import { StockType } from "@prisma/client";
import fastCartesian from "fast-cartesian";
import _ from "lodash";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { Fragment } from "react";
import {
  variationsOptions,
  variationsPriceOptions,
  variationsStockOptions,
} from "@/types/variationsOptions";
import {
  showConfirmationDialog,
  showErrorDialog,
  showErrorHTMLDialog,
  showSuccessHTMLDialog,
} from "@/util/swalFunction";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import { Menu, Transition } from "@headlessui/react";
import EmptyScreen from "@/components/screen/EmptyScreen";
import VariationCard from "@/components/card/VariationCard";
import SelectBox from "@/components/presentational/SelectBox";
import VariationDetailsModal from "@/components/modal/sideModal/VariationDetailsModal";
import SetPriceModal from "@/components/modal/sideModal/SetPriceModal";
import { getSalePrice, verifyPrice } from "@/util/verify";
import ModifyPriceModal from "@/components/modal/sideModal/ModifyPriceModal";
import StockLevelModal from "@/components/modal/sideModal/StocklevelModal";
import ScheduleModal from "@/components/modal/sideModal/ScheduleModal";

type Props = {
  backFn: Function;
  nextFn: Function;
  currentStep: number;
};

function VariationSection({ backFn, nextFn, currentStep }: Props) {
  const { t } = useTranslation("common");

  const { locale } = useRouter();
  const [isNew, setIsNew] = React.useState(true);
  const [showList, setShowList] = React.useState<any>([]);
  const { product, setProduct } = useProduct();
  const [currentIndex, setCurrentIndex] = React.useState(-1);
  const [option, setOption] = React.useState("Select option");
  const [currentPage, setCurrentPage] = React.useState({
    name: "Page 1",
    value: "1",
    nameMM: "Page ၁",
  });
  const maxProd = 4;
  const totalPage = product.variations
    ? Math.ceil(product.variations.length / (maxProd * 2))
    : 1;
  const [variationModalOpen, setVariationModalOpen] = React.useState(false);
  const [currentVariation, setCurrentVariation] = React.useState<any>({});

  const [priceModalOpen, setPriceModalOpen] = React.useState(false);
  const [salePriceModalOpen, setSalePriceModalOpen] = React.useState(false);

  const [modifyPriceModalOpen, setModifyPriceModalOpen] = React.useState(false);
  const [modifySalePriceModalOpen, setModifySalePriceModalOpen] =
    React.useState(false);

  const [isIncrease, setIncrease] = React.useState(false);

  const [scheduleModalOpen, setScheduledModalOpen] = React.useState(false);
  const [stockLevelModalOpen, setStockLevelModalOpen] = React.useState(false);

  React.useEffect(() => {
    let variations: any[] = [];

    if (product.variations) {
      variations = [...product.variations];
    }
    setShowList(
      variations.slice(
        (parseInt(currentPage.value) - 1) * maxProd * 2,
        parseInt(currentPage.value) * maxProd * 2
      )
    );
  }, [product.variations, currentPage, maxProd]);

  function createAllVariations() {
    let variations: any = [];
    if (product.variations) {
      variations = [...product.variations];
    }
    let arr: any = [];

    product.attributes.forEach((e: any) => {
      arr.push(e.Term);
    });
    let vari = fastCartesian(arr);
    vari.forEach((elem, index) => {
      if (
        variations &&
        variations.find((e: any) =>
          _.isEqual(
            _.sortBy(e.attributes, (o) => o.id),
            _.sortBy(elem, (o: any) => o.id)
          )
        )
      ) {
      } else {
        variations.push({
          attributes: elem,
          stockType: StockType.InStock,
        });
      }
    });
    setProduct({ ...product, variations: variations });
  }

  function manageVariation() {
    let variations: any[] = [];

    if (product.variations) {
      variations = [...product.variations];
    }

    switch (option) {
      case variationsOptions.Add:
        setCurrentIndex(-1);
        setCurrentVariation({});
        setIsNew(true);
        setVariationModalOpen(true);
        break;
      case variationsOptions.CreateAll:
        createAllVariations();
        break;
      case variationsOptions.DeleteAll:
        showConfirmationDialog(t("deleteConfirmation"), "", locale, () => {
          setProduct({ ...product, variations: [] });
        });
        break;
      case variationsPriceOptions.SetRegular:
        setPriceModalOpen(true);
        break;
      case variationsPriceOptions.DecreaseRegular:
        setModifyPriceModalOpen(true);
        setIncrease(false);
        break;
      case variationsPriceOptions.IncreaseRegular:
        setModifyPriceModalOpen(true);
        setIncrease(true);
        break;
      case variationsPriceOptions.SetSales:
        setSalePriceModalOpen(true);
        break;
      case variationsPriceOptions.IncreaseSales:
        setModifySalePriceModalOpen(true);
        setIncrease(true);
        break;
      case variationsPriceOptions.DecreaseSales:
        setModifySalePriceModalOpen(true);
        setIncrease(false);
        break;
      case variationsPriceOptions.SetScheduled:
        setScheduledModalOpen(true);
        break;
      case variationsStockOptions.SetInStock:
        variations.forEach((elem) => {
          if (elem.stockLevel) {
            delete elem.stockLevel;
          }
          elem.stockType = StockType.InStock;
        });
        setProduct({ ...product, variations: variations });
        break;
      case variationsStockOptions.SetOutOfStock:
        variations.forEach((elem) => {
          if (elem.stockLevel) {
            delete elem.stockLevel;
          }
          elem.stockType = StockType.OutOfStock;
        });
        setProduct({ ...product, variations: variations });
        break;
      case variationsStockOptions.SetStockQty:
        setStockLevelModalOpen(true);
        break;
    }
  }

  return (
    <>
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-gray-500">
          {t("step")} {currentStep}
        </h3>
        <p className="my-1 text-xl font-bold">{t("pricing")}</p>
        <span className="mb-10 text-sm">{t("fillPricing")}</span>
        <div className="flex flex-col space-y-3">
          <div className="flex w-full space-x-5">
            <Menu as="div" className="relative w-full text-left">
              <div>
                <Menu.Button
                  className={`inline-flex w-full justify-start rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-opacity-90`}
                >
                  <span className="flex flex-grow">{option}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 -mr-1 flex h-5 w-5 text-violet-200 hover:text-violet-100"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-50 mt-2 w-full origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1 ">
                    {Object.values(variationsOptions).map(
                      (elem, variationIndex) => (
                        <Menu.Item key={variationIndex}>
                          {({ active }) => (
                            <button
                              className={`${
                                active ? `bg-primary text-white` : ""
                              } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                              onClick={() => setOption(elem)}
                            >
                              {elem}
                            </button>
                          )}
                        </Menu.Item>
                      )
                    )}
                  </div>
                  <div className="px-1 py-1">
                    {Object.values(variationsPriceOptions).map(
                      (elem, variationIndex) => (
                        <Menu.Item key={variationIndex}>
                          {({ active }) => (
                            <button
                              className={`${
                                active ? `bg-primary text-white` : ""
                              } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                              onClick={() => setOption(elem)}
                            >
                              {elem}
                            </button>
                          )}
                        </Menu.Item>
                      )
                    )}
                  </div>
                  <div className="px-1 py-1">
                    {Object.values(variationsStockOptions).map(
                      (elem, variationIndex) => (
                        <Menu.Item key={variationIndex}>
                          {({ active }) => (
                            <button
                              className={`${
                                active ? `bg-primary text-white` : ""
                              } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                              onClick={() => setOption(elem)}
                            >
                              {elem}
                            </button>
                          )}
                        </Menu.Item>
                      )
                    )}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            <div>
              <SubmitBtn
                isSubmit={false}
                submitTxt={"Loading..."}
                text={"Go"}
                onClick={() => manageVariation()}
              />
            </div>
          </div>

          {totalPage > 1 && (
            <div className="flex w-full justify-end">
              <SelectBox
                isSearch={false}
                list={Array.from(Array(totalPage), (_, index) => index + 1).map(
                  (e) => {
                    return {
                      name: "Page " + e.toString(),
                      value: e.toString(),
                    };
                  }
                )}
                setSelected={setCurrentPage}
                selected={currentPage}
              />
            </div>
          )}
          {product.variations && product.variations.length > 0 ? (
            <div className="mt-5 grid w-full grid-cols-auto280 gap-5">
              {showList &&
                showList.map((elem: any, index: number) => (
                  <VariationCard
                    key={index}
                    variation={elem}
                    editDetail={() => {
                      setCurrentVariation(elem);
                      setIsNew(false);
                      setVariationModalOpen(true);
                      setCurrentIndex(index);
                    }}
                    deleteVariation={() => {
                      showConfirmationDialog(
                        t("deleteConfirmation"),
                        "",
                        locale,
                        () => {
                          let variationList = [...product.variations];
                          variationList.splice(index, 1);
                          setProduct({ ...product, variations: variationList });
                        }
                      );
                    }}
                  />
                ))}
            </div>
          ) : (
            <EmptyScreen
              onClickFn={() => {
                setCurrentIndex(-1);
                setCurrentVariation({});
                setIsNew(true);
                setVariationModalOpen(true);
              }}
            />
          )}

          <span className="mt-5 flex justify-end divide-x overflow-hidden">
            <button
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
              type="button"
              onClick={() => {
                if (
                  product &&
                  product.variations &&
                  product.variations.length > 0 &&
                  product.variations.filter(
                    (z) => z.SKU && z.regularPrice && z.stockType
                  ).length === product.variations.length
                ) {
                  nextFn();
                } else if (
                  product.variations.filter(
                    (z) => z.SKU && z.regularPrice && z.stockType
                  ).length !== product.variations.length
                ) {
                  showErrorDialog(
                    "Please input SKU, regular price and stock type for all variations.",
                    "SKU, ပုံမှန်စျေးနှင့် ပစ္စည်းရရှိနိုင်မှု တန်ဖိုးအား အမျိုးအစားအကုန်တွင် ဖြည့်စွက်ပေးပါ။",
                    locale
                  );
                } else {
                  showErrorDialog(
                    "At least one variation is required.",
                    "အနည်းဆုံးတစ်ခုလိုအပ်ပါသည်။",
                    locale
                  );
                }
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
                  d="M3.75 12a.75.75 0 01.75-.75h13.19l-5.47-5.47a.75.75 0 011.06-1.06l6.75 6.75a.75.75 0 010 1.06l-6.75 6.75a.75.75 0 11-1.06-1.06l5.47-5.47H4.5a.75.75 0 01-.75-.75z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </span>
        </div>
      </div>
      <VariationDetailsModal
        currentIndex={currentIndex}
        variation={currentVariation}
        setVariation={setCurrentVariation}
        isModalOpen={variationModalOpen}
        isNew={isNew}
        setModalOpen={setVariationModalOpen}
      />
      <SetPriceModal
        isModalOpen={priceModalOpen}
        setModalOpen={setPriceModalOpen}
        title={"Set Regular Price"}
        setPrice={(e: any) => {
          let variations: any[] = [];

          if (product.variations) {
            variations = [...product.variations];
          }
          let successCnt = 0;
          variations.forEach((elem) => {
            let verify = verifyPrice(e, elem.salePrice, elem.isPercent);
            if (verify.isSuccess) {
              elem.regularPrice = e;
              successCnt++;
            }
          });
          if (successCnt === 0) {
            showErrorHTMLDialog(
              `<p>${variations.length - successCnt} ${t("update")} ${t(
                "failed"
              )}</p>`
            );
          } else {
            showSuccessHTMLDialog(
              `<p>${successCnt}  ${t("update")} ${t("success")}</p><p>${
                variations.length - successCnt
              } ${t("update")} ${t("failed")}</p>`
            );
          }

          setProduct({ ...product, variations: variations });
        }}
      />

      <ModifyPriceModal
        isModalOpen={salePriceModalOpen}
        setModalOpen={setSalePriceModalOpen}
        title={"Set Sale Price"}
        setPrice={(e: number, isPercent: boolean) => {
          let variations: any[] = [];

          if (product.variations) {
            variations = [...product.variations];
          }
          let successCnt = 0;
          variations.forEach((elem) => {
            let verify = verifyPrice(elem.regularPrice, e, false);
            if (verify.isSuccess) {
              if (isPercent === true) {
                elem.salePrice = getSalePrice(elem.regularPrice, e);
              } else {
                elem.salePrice = e;
              }
              elem.isPercent = false;
              successCnt++;
            }
          });
          if (successCnt === 0) {
            showErrorHTMLDialog(
              `<p>${variations.length - successCnt} ${t("update")} ${t(
                "failed"
              )}</p>`
            );
          } else {
            showSuccessHTMLDialog(
              `<p>${successCnt}  ${t("update")} ${t("success")}</p><p>${
                variations.length - successCnt
              } ${t("update")} ${t("failed")}</p>`
            );
          }
          setProduct({ ...product, variations: variations });
        }}
      />

      <ModifyPriceModal
        isModalOpen={modifyPriceModalOpen}
        setModalOpen={setModifyPriceModalOpen}
        title={isIncrease ? "Increase Regular Price" : "Decrease Regular Price"}
        setPrice={(e: number, isPercent: boolean) => {
          let variations: any[] = [];

          if (product.variations) {
            variations = [...product.variations];
          }
          let successCnt = 0;
          variations.forEach((elem) => {
            if (elem.regularPrice) {
              let amount =
                isPercent === true ? (e * elem.regularPrice) / 100 : e;
              let changeAmount = isIncrease
                ? elem.regularPrice + amount
                : elem.regularPrice - amount;
              changeAmount = Math.ceil(changeAmount);
              let verify = verifyPrice(
                changeAmount,
                elem.salePrice,
                elem.isPercent
              );
              if (verify.isSuccess) {
                elem.regularPrice = changeAmount;
                successCnt++;
              }
            }
          });
          if (successCnt === 0) {
            showErrorHTMLDialog(
              `<p>${variations.length - successCnt} ${t("update")} ${t(
                "failed"
              )}</p>`
            );
          } else {
            showSuccessHTMLDialog(
              `<p>${successCnt}  ${t("update")} ${t("success")}</p><p>${
                variations.length - successCnt
              } ${t("update")} ${t("failed")}</p>`
            );
          }
          setProduct({ ...product, variations: variations });
        }}
      />
      <ModifyPriceModal
        isModalOpen={modifySalePriceModalOpen}
        setModalOpen={setModifySalePriceModalOpen}
        title={isIncrease ? "Increase Sale Price" : "Decrease Sale Price"}
        setPrice={(e: number, isPercent: boolean) => {
          let variations: any[] = [];

          if (product.variations) {
            variations = [...product.variations];
          }
          let successCnt = 0;
          variations.forEach((elem) => {
            if (elem.salePrice) {
              let saleAmount = elem.salePrice;
              if (elem.isPercent === true) {
                saleAmount = getSalePrice(elem.regularPrice, elem.salePrice);
              }
              let amount = isPercent === true ? (e * saleAmount) / 100 : e;
              let changeAmount = isIncrease
                ? saleAmount + amount
                : saleAmount - amount;
              changeAmount = Math.ceil(changeAmount);

              let verify = verifyPrice(elem.regularPrice, changeAmount, false);
              if (verify.isSuccess) {
                elem.salePrice = changeAmount;
                elem.isPercent = false;
                successCnt++;
              }
            }
          });
          if (successCnt === 0) {
            showErrorHTMLDialog(
              `<p>${variations.length - successCnt} ${t("update")} ${t(
                "failed"
              )}</p>`
            );
          } else {
            showSuccessHTMLDialog(
              `<p>${successCnt}  ${t("update")} ${t("success")}</p><p>${
                variations.length - successCnt
              } ${t("update")} ${t("failed")}</p>`
            );
          }
          setProduct({ ...product, variations: variations });
        }}
      />
      <ScheduleModal
        isModalOpen={scheduleModalOpen}
        setModalOpen={setScheduledModalOpen}
        setSchedule={(startDate: string, endDate: string) => {
          let variations: any[] = [];

          if (product.variations) {
            variations = [...product.variations];
          }
          let successCnt = 0;
          variations.forEach((elem) => {
            if (elem.salePrice) {
              elem.isSalePeriod = true;
              elem.saleStartDate = startDate;
              elem.saleEndDate = endDate;
              successCnt++;
            }
          });
          if (successCnt === 0) {
            showErrorHTMLDialog(
              `<p>${variations.length - successCnt} ${t("update")} ${t(
                "failed"
              )}</p>`
            );
          } else {
            showSuccessHTMLDialog(
              `<p>${successCnt}  ${t("update")} ${t("success")}</p><p>${
                variations.length - successCnt
              } ${t("update")} ${t("failed")}</p>`
            );
          }
          setProduct({ ...product, variations: variations });
        }}
      />
      <StockLevelModal
        isModalOpen={stockLevelModalOpen}
        setModalOpen={setStockLevelModalOpen}
        setStockLevel={(e: any) => {
          let variations: any[] = [];

          if (product.variations) {
            variations = [...product.variations];
          }
          let successCnt = 0;

          variations.forEach((elem) => {
            elem.stockType = StockType.StockLevel;
            elem.stockLevel = e;
            successCnt++;
          });

          if (successCnt === 0) {
            showErrorHTMLDialog(
              `<p>${variations.length - successCnt} ${t("update")} ${t(
                "failed"
              )}</p>`
            );
          } else {
            showSuccessHTMLDialog(
              `<p>${successCnt}  ${t("update")} ${t("success")}</p><p>${
                variations.length - successCnt
              } ${t("update")} ${t("failed")}</p>`
            );
          }
          setProduct({ ...product, variations: variations });
        }}
      />
    </>
  );
}

export default VariationSection;
