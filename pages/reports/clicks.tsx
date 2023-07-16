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
import ReportClickModal from "@/components/modal/sideModal/ReportClickModal";
import AdsReportClick from "@/components/muiTable/AdsReportClick";
import ProdReportClick from "@/components/muiTable/ProdReportClick";

export type FilterTypeCategory = {
  startDate: Date | null;
  endDate: Date | null;
};

function Default() {
  const { t } = useTranslation("common");
  const [filterModalOpen, setFilterModalOpen] = React.useState(false);
  const { data: session }: any = useSession();
  const [filterType, setFilterType] = React.useState<FilterTypeCategory>({
    endDate: null,
    startDate: null,
  });
  const graphRef = React.useRef<HTMLDivElement>(null);
  const { data, isLoading, isFetching, refetch } = useQuery(
    "clickReport",
    () => {
      const params: any = {
        startDate: filterType.startDate
          ? filterType.startDate.toLocaleDateString("en-ca")
          : "",
        endDate: filterType.endDate
          ? filterType.endDate.toLocaleDateString("en-ca")
          : "",
      };
      let d: any = new URLSearchParams(params).toString();
      return fetch(`/api/reports/click?${d}`).then((res) => {
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
    if (data) {
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
      pdf.text("Click Reports", 40, 110);

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

      let exportBottom = exportStart + 10;

      pdf.text("Total Information", 40, exportBottom);

      pdf.setFontSize(9);
      pdf.text(
        "Total Site Visit: " +
          formatAmount(Number(data.stats.totalSiteVisits), locale, true),
        40,
        exportBottom + 10
      );
      pdf.text(
        "Total Product Clicks: " +
          formatAmount(Number(data.stats.totalProductVisits), locale, false),
        40,
        exportBottom + 20
      );
      pdf.text(
        "Total Auction Clicks: " +
          formatAmount(Number(data.stats.totalAuctionVisits), locale, false),
        40,
        exportBottom + 30
      );
      pdf.text(
        "Total Ads Clicked: " +
          formatAmount(Number(data.stats.totalAdsClick), locale, false),
        40,
        exportBottom + 40
      );
      pdf.line(20, exportBottom + 60, width - 20, exportBottom + 60);

      pdf.addPage();

      let graphFinish = await html2canvas(graphChart!).then((canvas) => {
        const img = canvas.toDataURL("image/png");

        pdf.addImage(img, "png", 60, 40, width - 80, graphChart!.clientHeight);
        return true;
      });

      pdf.addPage();

      let pdfBody = data.adsClick.map((e: any) => {
        return [
          e.adsLocation,
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
          pdf.text("Ads Clicked", data.settings.margin.left, 22);
        },
        head: [["Ads Location", "Clicked Date"]],
        body: pdfBody,
        headStyles: { fillColor: [30, 41, 59] },
      });

      pdf.addPage();

      let pdfBody2 = data.prodsClick.map((e: any) => {
        return [
          e.product.name,
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
          pdf.text("Product Clicked", data.settings.margin.left, 22);
        },
        head: [["Product", "Clicked Date"]],
        body: pdfBody2,
        headStyles: { fillColor: [30, 41, 59] },
      });

      if (graphFinish === true) {
        pdf.save("clickReport.pdf");
      }
    } else {
      showErrorDialog("No data exists.");
    }
  }

  return (
    <>
      <div>
        <Head>
          <title>Click Reports | Treasure Rush</title>
          <meta name="description" content={defaultDescription} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="relative">
          <header aria-label="Page Header">
            <div className="mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 bg-white shadow-md">
              <div className="sm:flex sm:items-center sm:justify-between max-w-screen-xl mx-auto px-5">
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    Click Reports
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
                    title="Total Site Visits"
                    value={data.stats.totalSiteVisits}
                    isMMK={false}
                  />
                  <ReportStatsCard
                    title="Total Producct Visits"
                    value={data.stats.totalProductVisits}
                    isMMK={false}
                  />
                  <ReportStatsCard
                    title="Total Auction Visits"
                    value={data.stats.totalAuctionVisits}
                    isMMK={false}
                  />
                  <ReportStatsCard
                    title="Total Unique Buyers"
                    value={data.stats.totalUniqueBuyers}
                    isMMK={false}
                  />
                  <ReportStatsCard
                    title="Total Ads Clicked"
                    value={data.stats.totalAdsClick}
                    isMMK={false}
                  />
                </div>
              )}
            </div>
          </header>
          <section className="mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="flex flex-col lg:flex-row px-5 gap-5 bg-white shadow-md">
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
                            Ads Stats
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
                                    Ads: item1.adsClick,
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
                                  dataKey="Ads"
                                  stroke="#8884d8"
                                  fill="#8884d8"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 flex-1">
                          <h4 className="font-light text-base text-gray-500 font-inter my-2 text-center">
                            Products Stats
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
                                    Product: item1.prodClick,
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
                                  dataKey="Product"
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
            {data && data.adsClick && (
              <div className="mt-10">
                <AdsReportClick data={data.adsClick} />
              </div>
            )}
            {data && data.prodsClick && (
              <div className="mt-10">
                <ProdReportClick data={data.prodsClick} />
              </div>
            )}
          </section>
        </div>
      </div>
      <ReportClickModal
        isModalOpen={filterModalOpen}
        setModalOpen={setFilterModalOpen}
        filterType={filterType}
        filterFn={(filterData: any) => {
          setFilterType(filterData);
        }}
        resetFilterFn={() => {
          setFilterType({
            endDate: null,
            startDate: null,
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
