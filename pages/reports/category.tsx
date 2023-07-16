import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import MyanmarMap from "@/components/presentational/MyanmarMap";
import { useQuery } from "react-query";
import { useSession } from "next-auth/react";
import { formatAmount, getText } from "@/util/textHelper";
import { useRouter } from "next/router";
import ReportStatsCard from "@/components/card/ReportStatsCard";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import OrderSmallTbl from "@/components/muiTable/OrderTbl";
import prisma from "@/prisma/prisma";
import { Brand, User } from "@prisma/client";
import ReportBuyerModal from "@/components/modal/sideModal/ReportBuyerModal";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import ReportCategoryModal from "@/components/modal/sideModal/ReportCategoryModal";
import { showErrorDialog } from "@/util/swalFunction";

let Orders = "orderCount";
let UnitSold = "unitSold";
let Profits = "profits";

export type FilterTypeCategory = {
  startDate: Date | null;
  endDate: Date | null;
  sellerId: String;
  categoryId: String;
  seller?: User;
};

function Default() {
  const { t } = useTranslation("common");
  const [filterModalOpen, setFilterModalOpen] = React.useState(false);
  const { data: session }: any = useSession();
  const [filterType, setFilterType] = React.useState<FilterTypeCategory>({
    categoryId: "",
    endDate: null,
    startDate: null,
    sellerId: "",
    seller: undefined,
  });
  const graphRef = React.useRef<HTMLDivElement>(null);
  const [currentTab, setCurrentTab] = React.useState(Profits);
  const { data, isLoading, isFetching, refetch } = useQuery(
    "categoryReport",
    () => {
      const params: any = {
        startDate: filterType.startDate
          ? filterType.startDate.toLocaleDateString("en-ca")
          : "",
        endDate: filterType.endDate
          ? filterType.endDate.toLocaleDateString("en-ca")
          : "",
        sellerId: filterType.sellerId,
        categoryId: filterType.categoryId,
      };
      let d: any = new URLSearchParams(params).toString();
      return fetch(`/api/reports/category?${d}`).then((res) => {
        let json = res.json();
        return json;
      });
    }
  );
  const router = useRouter();
  const { locale } = router;

  React.useEffect(() => {
    if (filterType.startDate && filterType.endDate) {
      refetch();
    }
  }, [filterType]);

  async function div2PDF() {
    if (data && data.stats.totalOrders && data.stats.totalOrders > 0) {
      let graphChart = graphRef!.current;
      const pdf = new jsPDF("p", "pt", "a4");

      var width = pdf.internal.pageSize.getWidth();
      var height = pdf.internal.pageSize.getHeight();

      let blob = await fetch("/assets/logo_full.png").then((r) => r.blob());
      let dataUrl: any = await new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      pdf.addImage(dataUrl, "png", width - 120 * 3, 0, 120, 70);

      pdf.setFont("Pyidaungsu");
      pdf.setFontSize(12);
      pdf.text("Category Report", 40, 110);

      pdf.setFontSize(9);

      pdf.text("Export Information", 40, 130);
      let exportStart = 140;

      if (data.startDate && data.endDate) {
        let sDate = new Date(data.startDate);
        let eDate = new Date(data.endDate);
        pdf.text(
          "Date: " +
            sDate.toLocaleDateString("en-ca", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            }) +
            " to " +
            eDate.toLocaleDateString("en-ca", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            }),
          40,
          exportStart
        );
        exportStart += 10;
      }
      if (data.seller) {
        //seller
        let textDimensions = pdf.getTextDimensions(
          "Seller: " + data.seller.username,
          { maxWidth: width - 120 }
        );
        pdf.text("Seller: " + data.seller.username, 40, exportStart, {
          maxWidth: width - 120,
        });
        exportStart += textDimensions.h;
      }
      if (data.category) {
        //categories
        let textDimensions = pdf.getTextDimensions(
          "Category: " + data.category.name,
          { maxWidth: width - 120 }
        );
        pdf.text("Category: " + data.category.name, 40, exportStart, {
          maxWidth: width - 120,
        });
        exportStart += textDimensions.h;
      }

      let exportBottom = exportStart + 10;

      pdf.text("Total Information", 40, exportBottom);

      pdf.setFontSize(9);
      pdf.text(
        "Total Amount: " +
          formatAmount(Number(data.stats.totalAmount), locale, true),
        40,
        exportBottom + 10
      );
      pdf.text(
        "Total Orders: " +
          formatAmount(Number(data.stats.totalOrders), locale, false),
        40,
        exportBottom + 20
      );
      pdf.text(
        "Total Unit Sold: " +
          formatAmount(Number(data.stats.totalUnitSold), locale, false),
        40,
        exportBottom + 30
      );
      pdf.text(
        "Total Unique Buyers: " +
          formatAmount(Number(data.stats.totalUniqueBuyers), locale, false),
        40,
        exportBottom + 40
      );
      pdf.text(
        "Total Auctions: " +
          formatAmount(Number(data.stats.totalAuctions), locale, false),
        40,
        exportBottom + 50
      );
      pdf.line(20, exportBottom + 60, width - 20, exportBottom + 60);

      pdf.addPage();

      let graphFinish = await html2canvas(graphChart!).then((canvas) => {
        const img = canvas.toDataURL("image/png");

        pdf.addImage(img, "png", 60, 40, width - 80, graphChart!.clientHeight);
        return true;
      });

      pdf.addPage();

      let pdfBody = data.orders.map((e: any) => {
        return [
          e.orderNo,
          "Shipped",
          e.orderBy.username,
          formatAmount(e.total, locale, true, false),
          new Date(e.createdAt).toLocaleDateString("en-ca", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          }),
        ];
      });

      autoTable(pdf, {
        didDrawPage: function (data: any) {
          pdf.setFontSize(12);
          pdf.setTextColor(40);
          pdf.text("Order Details", data.settings.margin.left, 22);
        },
        head: [["Order No", "Status", "Order By", "Sub Total", "Ordered Date"]],
        body: pdfBody,
        headStyles: { fillColor: [30, 41, 59] },
      });

      if (graphFinish === true) {
        pdf.save("categoryReport.pdf");
      }
    } else {
      showErrorDialog("No orders exists.");
    }
  }

  return (
    <>
      <div>
        <Head>
          <title>Category Reports | Treasure Rush</title>
          <meta name="description" content={defaultDescription} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="relative">
          <header aria-label="Page Header">
            <div className="mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 bg-white shadow-md">
              <div className="sm:flex sm:items-center sm:justify-between max-w-screen-xl mx-auto px-5">
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    Category Report
                  </h1>

                  {data && (
                    <div className="mt-3 text-sm text-gray-500 flex flex-row gap-3 flex-wrap">
                      {data.startDate && data.endDate ? (
                        <div className="flex flex-row items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-5 w-5 opacity-75"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                            />
                          </svg>
                          <span>
                            {new Date(data.startDate).toLocaleDateString(
                              "en-ca",
                              {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                              }
                            )}{" "}
                            to{" "}
                            {new Date(data.endDate).toLocaleDateString(
                              "en-ca",
                              {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      ) : (
                        <></>
                      )}

                      {data.seller ? (
                        <div className="flex flex-row items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-5 w-5 opacity-75"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                            />
                          </svg>

                          <span>{data.seller.username}</span>
                        </div>
                      ) : (
                        <></>
                      )}

                      {data.category ? (
                        <div className="flex flex-row items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-5 w-5 opacity-75"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                            />
                          </svg>

                          <span>
                            {getText(
                              data.category.name,
                              data.category.nameMM,
                              locale
                            )}
                          </span>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
                  <button
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-5 py-3 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring"
                    type="button"
                    onClick={() => {
                      div2PDF();
                    }}
                  >
                    <span className="text-sm font-medium"> Export </span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </button>

                  <button
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary/80 focus:outline-none focus:ring"
                    type="button"
                    onClick={() => {
                      setFilterModalOpen(true);
                    }}
                  >
                    <span className="text-sm font-medium"> Filter </span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              {data && (
                <div className="sm:flex sm:items-center sm:justify-between max-w-screen-xl mx-auto px-5 mt-5 gap-3">
                  <ReportStatsCard
                    title="Total Amount"
                    value={data.stats.totalAmount}
                    isMMK={true}
                  />
                  <ReportStatsCard
                    title="Total Orders"
                    value={data.stats.totalOrders}
                    isMMK={false}
                  />
                  <ReportStatsCard
                    title="Total Unit Sold"
                    value={data.stats.totalUnitSold}
                    isMMK={false}
                  />
                  <ReportStatsCard
                    title="Total Unique Buyers"
                    value={data.stats.totalUniqueBuyers}
                    isMMK={false}
                  />
                  <ReportStatsCard
                    title="Total Auctions"
                    value={data.stats.totalAuctions}
                    isMMK={false}
                  />
                </div>
              )}
            </div>
          </header>
          <section className="mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="flex flex-col lg:flex-row px-5 gap-5 bg-white shadow-md">
              {/* <div className="flex flex-col gap-3 items-center justify-center">
                <div className="flex flex-row items-center border rounded-md divide-x p-2 bg-white">
                  <div
                    className={`flex flex-row items-center gap-3 cursor-pointer px-3 py-2 ${
                      currentTab === Orders
                        ? "bg-primary text-white rounded-md"
                        : "bg-white"
                    }`}
                    onClick={() => {
                      setCurrentTab(Orders);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"
                      />
                    </svg>
                    <span
                      className={currentTab === Orders ? "text-sm" : "hidden"}
                    >
                      Orders
                    </span>
                  </div>
                  <div
                    className={`flex flex-row items-center gap-3 cursor-pointer px-3 py-2 ${
                      currentTab === Profits
                        ? "bg-primary text-white rounded-md"
                        : "bg-white"
                    }`}
                    onClick={() => {
                      setCurrentTab(Profits);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span
                      className={currentTab === Profits ? "text-sm" : "hidden"}
                    >
                      Profits
                    </span>
                  </div>
                  <div
                    className={`flex flex-row items-center gap-3 cursor-pointer px-3 py-2 ${
                      currentTab === UnitSold
                        ? "bg-primary text-white rounded-md"
                        : "bg-white"
                    }`}
                    onClick={() => {
                      setCurrentTab(UnitSold);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                      />
                    </svg>
                    <span
                      className={currentTab === UnitSold ? "text-sm" : "hidden"}
                    >
                      Units Sold
                    </span>
                  </div>
                </div>
                {data && (
                  <MyanmarMap
                    stats={[
                      data.stateList.find((z) => z.name === "Sagaing Region")[
                        currentTab
                      ],
                      data.stateList.find((z) => z.name === "Kachin State")[
                        currentTab
                      ],
                      data.stateList.find(
                        (z) => z.name === "Taninthayi Region"
                      )[currentTab],
                      data.stateList.find((z) => z.name === "Shan State")[
                        currentTab
                      ],
                      data.stateList.find((z) => z.name === "Magway Region")[
                        currentTab
                      ],
                      data.stateList.find((z) => z.name === "Ayeyawady Region")[
                        currentTab
                      ],
                      data.stateList.find((z) => z.name === "Chin State")[
                        currentTab
                      ],
                      data.stateList.find((z) => z.name === "Rakhine State")[
                        currentTab
                      ],
                      data.stateList.find((z) => z.name === "Mon State")[
                        currentTab
                      ],
                      data.stateList.find((z) => z.name === "Yangon Region")[
                        currentTab
                      ],
                      data.stateList.find((z) => z.name === "Bago Region")[
                        currentTab
                      ],
                      data.stateList.find((z) => z.name === "Mandalay Region")[
                        currentTab
                      ] +
                        data.stateList.find((z) => z.name === "Nay Pyi Taw")[
                          currentTab
                        ],
                      data.stateList.find((z) => z.name === "Kayin State")[
                        currentTab
                      ],
                      data.stateList.find((z) => z.name === "Kayah State")[
                        currentTab
                      ],
                    ]}
                  />
                )}
              </div> */}
              {data?.monthStats && data?.monthStats.length > 0 && (
                <div className="flex flex-col gap-3 w-full">
                  <div
                    className="p-5 flex flex-col gap-5 rounded-md"
                    ref={graphRef}
                  >
                    <div
                      style={{ width: "100%" }}
                      className="text-xs flex flex-col gap-5"
                    >
                      <div className="flex flex-col w-full">
                        <div className="flex flex-col gap-3 flex-1">
                          <h4 className="font-light text-base text-gray-500 font-inter my-2 text-center">
                            Order Stats
                          </h4>

                          <div className="flex flex-col lg:flex-row gap-3 items-start">
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart
                                width={500}
                                height={200}
                                data={data.monthStats.map((item1: any) => {
                                  let date = new Date(item1.start);

                                  let v: any = {
                                    name: item1.title,
                                    Orders: item1.orderCount,
                                  };

                                  return v;
                                })}
                                syncId="anyId"
                                margin={{
                                  top: 10,
                                  right: 30,
                                  left: 0,
                                  bottom: 0,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                  formatter={(value) => {
                                    return formatAmount(
                                      Number(value),
                                      locale,
                                      false,
                                      true
                                    );
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="Orders"
                                  stroke="#8884d8"
                                  fill="#8884d8"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 flex-1">
                          <h4 className="font-light text-base text-gray-500 font-inter my-2 text-center">
                            Unit Sold Stats
                          </h4>

                          <div className="flex flex-col lg:flex-row gap-3 items-start">
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart
                                width={500}
                                height={200}
                                data={data.monthStats.map((item1: any) => {
                                  let date = new Date(item1.start);

                                  let v: any = {
                                    name: item1.title,
                                    "Units Sold": item1.unitSolds,
                                  };

                                  return v;
                                })}
                                syncId="anyId"
                                margin={{
                                  top: 10,
                                  right: 30,
                                  left: 0,
                                  bottom: 0,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                  formatter={(value) => {
                                    return formatAmount(
                                      Number(value),
                                      locale,
                                      false,
                                      true
                                    );
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="Units Sold"
                                  stroke="#8884d8"
                                  fill="#8884d8"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 flex-1">
                          <h4 className="font-light text-base text-gray-500 font-inter my-2 text-center">
                            Profits Stats
                          </h4>

                          <div className="flex flex-col lg:flex-row gap-3 items-start">
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart
                                width={500}
                                height={200}
                                data={data.monthStats.map((item1: any) => {
                                  let date = new Date(item1.start);

                                  let v: any = {
                                    name: item1.title,
                                    Profits: item1.profits,
                                  };

                                  return v;
                                })}
                                syncId="anyId"
                                margin={{
                                  top: 10,
                                  right: 30,
                                  left: 0,
                                  bottom: 0,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                  formatter={(value) => {
                                    return formatAmount(
                                      Number(value),
                                      locale,
                                      true,
                                      true
                                    );
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="Profits"
                                  stroke="#8884d8"
                                  fill="#8884d8"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {data && data.orders && (
              <div className="mt-10">
                <OrderSmallTbl data={data.orders} />
              </div>
            )}
          </section>
        </div>
      </div>
      <ReportCategoryModal
        isModalOpen={filterModalOpen}
        setModalOpen={setFilterModalOpen}
        filterType={filterType}
        filterFn={(filterData: FilterTypeCategory) => {
          setFilterType(filterData);
        }}
        resetFilterFn={() => {
          setFilterType({
            endDate: null,
            startDate: null,
            categoryId: "",
            sellerId: "",
            seller: undefined,
          });
        }}
      />
    </>
  );
}

export async function getServerSideProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Default;
