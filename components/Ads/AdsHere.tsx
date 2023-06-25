import { fileUrl } from "@/types/const";
import { AdsLocation } from "@/util/adsHelper";
import { Ads, AdsPlacement, Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

function AdsHere({
  column,
  adsLocations,
  defaultImg,
  imgList,
}: {
  column: number;
  adsLocations: AdsLocation[];
  defaultImg: string;
  imgList: Ads[][];
}) {
  const { data: session }: any = useSession();
  const router = useRouter();

  return (
    <div className="flex flex-row items-center justify-between gap-3 my-5 max-w-screen-xl mx-auto w-full">
      {imgList?.map((z: any, index: number) => (
        <div key={index} className="flex-1">
          {z?.length > 0 ? (
            z.map((b: Ads, index2: number) =>
              b.url ? (
                <a
                  target="_blank"
                  href={b.url}
                  onClick={(e) => {
                    try {
                      fetch("https://api.ipify.org/?format=json")
                        .then((data) => data.json())
                        .then((json) => {
                          fetch(
                            "/api/ads/clickCount?adsId=" +
                              b.id.toString() +
                              "&adsLocation=" +
                              encodeURIComponent(adsLocations[index]) +
                              "&ip=" +
                              json.ip,
                            {
                              method: "POST",
                            }
                          );
                        });
                      return true;
                    } catch (err) {
                      fetch(
                        "/api/ads/clickCount?adsId=" +
                          b.id.toString() +
                          "&adsLocation=" +
                          encodeURIComponent(adsLocations[index]) +
                          {
                            method: "POST",
                          }
                      );
                      return true;
                    }
                  }}
                >
                  <img
                    src={fileUrl + b.adsImg}
                    key={index2}
                    className="max-h-[300px] w-full object-contain"
                  />
                </a>
              ) : (
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    try {
                      fetch("https://api.ipify.org/?format=json")
                        .then((data) => data.json())
                        .then((json) => {
                          fetch(
                            "/api/ads/clickCount?adsId=" +
                              b.id.toString() +
                              "&adsLocation=" +
                              encodeURIComponent(adsLocations[index]) +
                              "&ip=" +
                              json.ip,
                            {
                              method: "POST",
                            }
                          );
                        });
                      return true;
                    } catch (err) {
                      fetch(
                        "/api/ads/clickCount?adsId=" +
                          b.id.toString() +
                          "&adsLocation=" +
                          encodeURIComponent(adsLocations[index]) +
                          {
                            method: "POST",
                          }
                      );
                      return true;
                    }
                  }}
                >
                  <img
                    src={fileUrl + b.adsImg}
                    key={index2}
                    className="max-h-[300px] w-full object-contain"
                  />
                </div>
              )
            )
          ) : (
            <Link
              className="cursor-pointer"
              href={
                session &&
                (session.role === Role.Seller || session.role === Role.Trader)
                  ? "/ads"
                  : "/sell"
              }
            >
              <img
                src={fileUrl + defaultImg}
                className="max-h-[300px] min-h-[300px] w-full object-contain"
              />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdsHere;
