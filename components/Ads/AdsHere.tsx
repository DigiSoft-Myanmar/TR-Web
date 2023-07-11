import { fileUrl } from "@/types/const";
import { AdsLocation } from "@/util/adsHelper";
import { Ads, AdsPlacement, Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

function AdsList({
  adsList,
  index,
  adsLocations,
}: {
  adsList: any[];
  index: number;
  adsLocations: any;
}) {
  const [currentItemIndex, setCurrentItemIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentItemIndex((prevIndex) => {
        if (prevIndex + 1 < adsList.length) {
          return prevIndex + 1;
        } else {
          return 0;
        }
      });
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [currentItemIndex, adsList]);

  return (
    <>
      {adsList[currentItemIndex].url ? (
        <a
          className="flex-1 w-full"
          target="_blank"
          href={adsList[currentItemIndex].url}
          onClick={(e) => {
            try {
              fetch("https://api.ipify.org/?format=json")
                .then((data) => data.json())
                .then((json) => {
                  fetch(
                    "/api/ads/clickCount?adsId=" +
                      adsList[currentItemIndex].id.toString() +
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
                  adsList[currentItemIndex].id.toString() +
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
            src={fileUrl + adsList[currentItemIndex].adsImg}
            className="max-h-[300px] w-full object-contain"
          />
        </a>
      ) : (
        <div
          className="cursor-pointer flex-1 w-full"
          onClick={(e) => {
            try {
              fetch("https://api.ipify.org/?format=json")
                .then((data) => data.json())
                .then((json) => {
                  fetch(
                    "/api/ads/clickCount?adsId=" +
                      adsList[currentItemIndex].id.toString() +
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
                  adsList[currentItemIndex].id.toString() +
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
            src={fileUrl + adsList[currentItemIndex].adsImg}
            className="max-h-[300px] w-full object-contain"
          />
        </div>
      )}
    </>
  );
}

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
    <div
      className={`flex flex-row items-center ${
        router.asPath === "/" ? "max-w-screen-xl" : ""
      } justify-between gap-3 my-5 mx-auto w-full`}
    >
      {imgList?.map((z: any, index: number) => (
        <div
          key={index}
          className="flex-1 flex flex-row items-center justify-between gap-3"
        >
          {z?.length > 0 ? (
            <AdsList adsList={z} index={index} adsLocations={adsLocations} />
          ) : (
            <Link
              className="cursor-pointer"
              href={
                session &&
                (session.role === Role.Seller || session.role === Role.Trader)
                  ? "/ads"
                  : "/memberships"
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
