import { isInternal } from "@/util/authHelper";
import { getNotiTime } from "@/util/textHelper";
import { Notification } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

interface Props {
  data: Notification;
}

function NotiCard({ data }: Props) {
  const router = useRouter();
  const { data: session }: any = useSession();
  return (
    <div
      className={`flex bg-white p-5 shadow-md flex-col space-y-8 relative cursor-pointer`}
      onClick={() => {
        let d: any = data.details;
        if (d.web) {
          if (d.buyer === session.id) {
            router.push("/bidHistory");
          } else if (d.seller === session.id) {
            router.push("/auctions");
          } else {
            router.push(d.web);
          }
        }
      }}
    >
      <div className="flex-grow flex flex-col space-y-3">
        <div className="flex gap-3 relative shrink-0">
          {data.image ? (
            <img
              className="w-12 h-12 rounded-full"
              src={"/api/files/" + data.image}
              alt=""
            />
          ) : (
            <img
              className="w-12 h-12 rounded-full"
              src="/assets/logo.png"
              alt="logo"
            />
          )}
          <div className="flex flex-col gap-1.5 flex-grow">
            <h3 className={`font-semibold text-gray-800`}>{data.title}</h3>
            <h3 className={`text-sm text-gray-600`}>{data.body}</h3>
            <div className="flex items-center flex-wrap">
              <span className="text-xs font-medium text-gold flex-grow">
                {getNotiTime(data.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotiCard;
