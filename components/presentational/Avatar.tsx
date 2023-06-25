import { fileUrl } from "@/types/const";
import { getInitials } from "@/util/textHelper";
import Image from "next/image";
import React from "react";

function Avatar({
  profile,
  username,
  isLarge,
}: {
  profile?: string;
  username: string;
  isLarge?: boolean;
}) {
  return (
    <div className="bg-primary p-0.5 rounded-full">
      <div className="rounded-full">
        {profile ? (
          <Image
            src={fileUrl + profile}
            width={isLarge === true ? 56 : 20}
            height={isLarge === true ? 56 : 20}
            alt={username!}
            className="object-contain rounded-full"
          />
        ) : (
          <div className="avatar">
            <div className="avatar placeholder">
              <div
                className={`bg-neutral-focus text-neutral-content rounded-full ${
                  isLarge === true
                    ? "w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px]"
                    : "w-5 h-5 min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px]"
                }`}
              >
                <span>{getInitials(username)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Avatar;
