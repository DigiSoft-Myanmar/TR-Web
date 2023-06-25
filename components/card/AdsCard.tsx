import { fileUrl } from "@/types/const";
import { fetcher } from "@/util/fetcher";
import { getInitials, getText } from "@/util/textHelper";
import { Ads } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import Avatar from "../presentational/Avatar";

function AdsCard({ ads }: { ads: any }) {
  const { data: membershipData } = useSWR("/api/memberships", fetcher);
  const router = useRouter();
  const { locale } = router;
  return (
    <div className="flex flex-row gap-3 w-[280px] max-w-[280px] items-center">
      <Image
        src={fileUrl + ads.adsImg}
        width={ads.adsWidth}
        height={ads.adsHeight}
        className="w-[100px] h-[100px] rounded-md"
        alt="ads"
      />
      <div className="flex flex-col gap-1">
        <div className="flex flex-row items-center gap-3 flex-wrap">
          <Avatar profile={ads.seller.profile} username={ads.seller.username} />

          <h3 className="text-sm font-semibold">
            {ads.seller.username}{" "}
            {ads.seller.displayName ? (
              <span>({ads.seller.displayName})</span>
            ) : (
              <></>
            )}
          </h3>
        </div>
        <div>
          <p className="text-xs">
            Size: {ads.adsWidth} x {ads.adsHeight}
          </p>
          <p className="text-xs">Suitable for: {ads.adsPlacement}</p>
          <p className="text-xs line-clamp-1">
            Membership:{" "}
            {getText(
              membershipData?.find((z: any) => z.id === ads.seller.membershipId)
                .name,
              membershipData?.find((z: any) => z.id === ads.seller.membershipId)
                .nameMM,
              locale
            )}
          </p>
          <p className="text-xs">
            Used / Free: {1} /{" "}
            {
              membershipData?.find((z: any) => z.id === ads.seller.membershipId)
                .freeAdsLimit
            }
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdsCard;
