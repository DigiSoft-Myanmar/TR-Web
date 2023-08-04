import { fileUrl } from "@/types/const";
import { getInitials } from "@/util/textHelper";
import Image from "next/image";
import React from "react";

function Avatar({
  profile,
  username,
  isLarge,
  size,
}: {
  profile?: string;
  username: string;
  isLarge?: boolean;
  size?: number;
}) {
  return (
    <div className="bg-primary p-0.5 rounded-full">
      <div className="rounded-full">
        {profile ? (
          <Image
            src={fileUrl + profile}
            width={isLarge === true ? 56 : size > 0 ? size : 20}
            height={isLarge === true ? 56 : size > 0 ? size : 20}
            alt={username!}
            className="object-cover rounded-full"
            style={{
              minWidth:
                isLarge === true ? "56px" : size > 0 ? size + "px" : "20px",
              minHeight:
                isLarge === true ? "56px" : size > 0 ? size + "px" : "20px",
              maxWidth:
                isLarge === true ? "56px" : size > 0 ? size + "px" : "20px",
              maxHeight:
                isLarge === true ? "56px" : size > 0 ? size + "px" : "20px",
            }}
          />
        ) : (
          <div className="avatar">
            <div className="avatar placeholder">
              <div
                className={`text-neutral-content rounded-full ${
                  isLarge === true
                    ? "w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px]"
                    : "w-5 h-5 min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px]"
                }`}
                style={
                  size
                    ? {
                        minWidth: size + "px",
                        minHeight: size + "px",
                        maxWidth: size + "px",
                        maxHeight: size + "px",
                      }
                    : {}
                }
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
