import OrderTbl from "@/components/muiTable/OrderTbl";
import ProductTbl from "@/components/muiTable/ProductTbl";
import UsageTbl from "@/components/muiTable/UsageTbl";
import { fileUrl, homeUrl } from "@/types/const";
import { fetcher } from "@/util/fetcher";
import { getPricing } from "@/util/pricing";
import { formatAmount, formatDate } from "@/util/textHelper";
import { Role, SiteVisit } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";

function OverviewSection({
  id,
  brandId,
  role,
}: {
  id: string;
  brandId: string;
  role: Role;
}) {
  const router = useRouter();
  const { locale } = router;
  const { data: session }: any = useSession();
  const { data: usageData } = useSWR("/api/user/usage?id=" + id, fetcher);
  const { data: salesUsage } = useSWR("/api/user/order?id=" + id, fetcher);
  const { data: sellerData } = useSWR(
    brandId ? "/api/user/sellerStats?id=" + brandId : "",
    fetcher,
  );

  return (
    <div className="flex flex-col gap-3 divide-y">
      {role === Role.Buyer && <OrderTbl data={salesUsage} />}
      {role === Role.Seller && (
        <div className="flex flex-col gap-3">
          {sellerData &&
            sellerData.bestSeller &&
            sellerData.bestSeller.byQty && (
              <div className="flex flex-row gap-5 border bg-white p-5 shadow-sm">
                {sellerData.bestSeller.byQty && (
                  <Link
                    href={
                      "/products/" +
                      sellerData.bestSeller.byQty.productData.slug
                    }
                    className="block flex-1 overflow-hidden rounded-lg border p-4 hover:bg-primary/10"
                  >
                    <Image
                      src={
                        fileUrl +
                        sellerData.bestSeller.byQty.productData.imgList[0]
                      }
                      width={200}
                      height={200}
                      alt={sellerData.bestSeller.byQty.productData.name}
                      className="h-[200px] max-h-[200px] w-full overflow-hidden rounded-md object-cover"
                    />

                    <div className="mt-2">
                      <dl>
                        <div>
                          <dt className="sr-only">Product Info</dt>

                          <dd className="flex items-center font-medium">
                            {sellerData.bestSeller.byQty.productData.name}{" "}
                            <span className="ml-2 rounded-md bg-primary px-2 py-1 text-xs text-white">
                              Best Seller
                            </span>
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-6 flex items-center justify-between gap-8 text-xs">
                        <div className="sm:inline-flex sm:shrink-0 sm:items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6 text-primary"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                            />
                          </svg>

                          <div className="mt-1.5 sm:ml-3 sm:mt-0">
                            <p className="text-gray-500">Units Sold</p>

                            <p className="font-medium">
                              {formatAmount(
                                sellerData.bestSeller.byQty.stats.quantity,
                                locale,
                                false,
                                true,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="sm:inline-flex sm:shrink-0 sm:items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6 text-primary"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                            />
                          </svg>

                          <div className="mt-1.5 sm:ml-3 sm:mt-0">
                            <p className="text-gray-500">Sales Amount</p>

                            <p className="font-medium">
                              {formatAmount(
                                sellerData.bestSeller.byQty.stats.totalPrice,
                                locale,
                                true,
                                true,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                {sellerData.bestSeller.byAmount && (
                  <Link
                    href={
                      "/products/" +
                      sellerData.bestSeller.byAmount.productData.slug
                    }
                    className="block flex-1 overflow-hidden rounded-lg border p-4 hover:bg-primary/10"
                  >
                    <Image
                      src={
                        fileUrl +
                        sellerData.bestSeller.byAmount.productData.imgList[0]
                      }
                      width={200}
                      height={200}
                      alt={sellerData.bestSeller.byAmount.productData.name}
                      className="h-[200px] max-h-[200px] w-full overflow-hidden rounded-md object-cover"
                    />

                    <div className="mt-2">
                      <dl>
                        <div>
                          <dt className="sr-only">Product Info</dt>

                          <dd className="flex items-center font-medium">
                            {sellerData.bestSeller.byAmount.productData.name}{" "}
                            <span className="ml-2 rounded-md bg-primary px-2 py-1 text-xs text-white">
                              Most Profitable
                            </span>
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-6 flex items-center justify-between gap-8 text-xs">
                        <div className="sm:inline-flex sm:shrink-0 sm:items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6 text-primary"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                            />
                          </svg>

                          <div className="mt-1.5 sm:ml-3 sm:mt-0">
                            <p className="text-gray-500">Units Sold</p>

                            <p className="font-medium">
                              {formatAmount(
                                sellerData.bestSeller.byAmount.stats.quantity,
                                locale,
                                false,
                                true,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="sm:inline-flex sm:shrink-0 sm:items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6 text-primary"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                            />
                          </svg>

                          <div className="mt-1.5 sm:ml-3 sm:mt-0">
                            <p className="text-gray-500">Sales Amount</p>

                            <p className="font-medium">
                              {formatAmount(
                                sellerData.bestSeller.byAmount.stats.totalPrice,
                                locale,
                                true,
                                true,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            )}
          <OrderTbl data={sellerData?.orderList ? sellerData.orderList : []} />

          <ProductTbl
            data={sellerData?.productList ? sellerData?.productList : []}
            sellerId={id}
          />
        </div>
      )}
      {session &&
        (session.role === Role.Admin ||
          session.role === Role.Staff ||
          session.role === Role.SuperAdmin) && <UsageTbl data={usageData} />}
    </div>
  );
}

export default OverviewSection;
