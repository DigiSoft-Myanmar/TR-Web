import { formatAmount } from "@/util/textHelper";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";

function ProductBidSection({
  productId,
  setBidLength,
}: {
  productId: string;
  setBidLength: Function;
}) {
  const { locale } = useRouter();
  const { data: bidList, refetch } = useQuery(
    ["productBidInfo", productId],
    () =>
      fetch("/api/auction/bid?id=" + encodeURIComponent(productId)).then(
        (res) => {
          let json = res.json();
          return json;
        }
      )
  );

  React.useEffect(() => {
    if (bidList) {
      setBidLength(bidList.length);
    }
  }, [bidList]);

  return bidList ? (
    <div className="flex flex-col gap-5 p-3 w-full">
      <h3 className="font-semibold text-sm">
        Total Bids: <span>{bidList.length}</span>
      </h3>
      {bidList.map((z, index) => (
        <div className="flex flex-col gap-1 border-b pb-3" key={index}>
          <div className="flex flex-row items-center justify-between gap-3 text-sm flex-wrap">
            <p>
              {z.createdByUserId}{" "}
              {z.isOwn === true && (
                <span className="text-info bg-info/20 rounded-md text-xs px-2 py-1 ml-3">
                  {z.isOwn ? "Bidded by me" : ""}
                </span>
              )}
            </p>
            <span>{formatAmount(z.amount, locale, true)}</span>
          </div>
          <span className="text-xs text-gray-500">
            At{" "}
            {new Date(z.createdAt).toLocaleDateString("en-ca", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <></>
  );
}

export default ProductBidSection;
