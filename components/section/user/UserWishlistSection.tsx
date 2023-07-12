import AuctionCard from "@/components/card/AuctionCard";
import ProductCard from "@/components/card/ProductCard";
import { isInternal } from "@/util/authHelper";
import { ProductType, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

function UserWishlistSection({ user }: { user: User }) {
  const { data } = useQuery(["wishlistData", user.id], () =>
    fetch("/api/wished?id=" + user.id).then((res) => {
      let json = res.json();
      return json;
    })
  );
  const { data: session } = useSession();
  const { t } = useTranslation("common");

  return (
    <div
      className={`${
        isInternal(session)
          ? "py-5 flex flex-col gap-5"
          : "mx-6 px-4 py-5 flex flex-col gap-5"
      }`}
    >
      <h3 className="text-lg ml-3 mt-3">{t("wishedList")}</h3>
      {data && data.productIds.length > 0 ? (
        <div className="bg-white p-3 rounded-md border grid grid-cols-auto200 gap-3">
          {data.products.map((b, index) => (
            <React.Fragment key={index}>
              {b.type === ProductType.Auction ? (
                <AuctionCard product={b} />
              ) : (
                <ProductCard product={b} />
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="grid p-10 bg-white place-content-center rounded-md border">
          <h1 className="tracking-widest text-gray-500 uppercase">
            This user doesn't set wishlist yet.
          </h1>
        </div>
      )}
    </div>
  );
}

export default UserWishlistSection;
