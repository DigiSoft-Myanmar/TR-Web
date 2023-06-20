import { AdsLocation } from "@/util/adsHelper";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import React from "react";
import AdsHere from "./AdsHere";

interface Props {
  adsList1: any;
  adsList2: any;
  adsLocations: AdsLocation[];
}
function TwoColsAds({ adsList1, adsList2, adsLocations }: Props) {
  const { data: session } = useSession();
  const { t } = useTranslation("common");
  const [currentIndex1, setCurrentindex1] = React.useState(0);
  const [currentIndex2, setCurrentindex2] = React.useState(0);

  React.useEffect(() => {
    let timer1 = setTimeout(() => {
      if (adsList1.length > 1) {
        if (currentIndex1 + 1 >= adsList1.length) {
          setCurrentindex1(0);
        } else {
          setCurrentindex1(currentIndex1 + 1);
        }
      }
    }, 5 * 1000);
    return () => {
      clearTimeout(timer1);
    };
  }, [adsList1, currentIndex1]);

  React.useEffect(() => {
    let timer1 = setTimeout(() => {
      if (adsList2.length > 1) {
        if (currentIndex2 + 1 >= adsList2.length) {
          setCurrentindex2(0);
        } else {
          setCurrentindex2(currentIndex2 + 1);
        }
      }
    }, 5 * 1000);
    return () => {
      clearTimeout(timer1);
    };
  }, [adsList2, currentIndex2]);

  return (
    <section className="text-white rounded-md mx-10 md:mx-20 my-10 grid grid-cols-1 md:grid-cols-2 gap-5 place-items-center">
      {adsList1.length > 0 ? (
        <div
          className={`px-4 py-10 mx-auto w-full lg:items-center lg:flex overflow-hidden`}
        >
          {adsList1[currentIndex1] && adsList1[currentIndex1].url ? (
            <a
              target="_blank"
              href={adsList1[currentIndex1].url}
              onClick={(e) => {
                try {
                  fetch("https://api.ipify.org/?format=json")
                    .then((data) => data.json())
                    .then((json) => {
                      fetch(
                        "/api/ads/clickCount?adsId=" +
                          adsList1[currentIndex1]._id.toString() +
                          "&adsLocation=" +
                          encodeURIComponent(adsLocations[0]) +
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
                      adsList1[currentIndex1]._id.toString() +
                      "&adsLocation=" +
                      encodeURIComponent(adsLocations[0]),
                    {
                      method: "POST",
                    }
                  );
                  return true;
                }
              }}
            >
              <img
                src={
                  "/api/files/" +
                  encodeURIComponent(adsList1[currentIndex1].filename)
                }
                className="w-[700px] h-[300px] object-contain animate-fade"
                key={currentIndex1}
              />
            </a>
          ) : (
            <img
              src={
                "/api/files/" +
                encodeURIComponent(adsList1[currentIndex1].filename)
              }
              className="w-[700px] h-[300px] object-contain animate-fade"
              key={currentIndex1}
            />
          )}
        </div>
      ) : (
        <AdsHere width={700} height={300} src="/assets/images/Ads700x300.png" />
      )}
      {adsList2.length > 0 ? (
        <div
          className={`px-4 py-10 mx-auto w-full lg:items-center lg:flex overflow-hidden`}
        >
          {adsList2[currentIndex2] && adsList2[currentIndex2].url ? (
            <a
              target="_blank"
              href={adsList2[currentIndex2].url}
              onClick={(e) => {
                try {
                  fetch("https://api.ipify.org/?format=json")
                    .then((data) => data.json())
                    .then((json) => {
                      fetch(
                        "/api/ads/clickCount?adsId=" +
                          adsList2[currentIndex2]._id.toString() +
                          "&adsLocation=" +
                          encodeURIComponent(adsLocations[1]) +
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
                      adsList2[currentIndex2]._id.toString() +
                      "&adsLocation=" +
                      encodeURIComponent(adsLocations[1]),
                    {
                      method: "POST",
                    }
                  );
                  return true;
                }
              }}
            >
              <img
                src={
                  "/api/files/" +
                  encodeURIComponent(adsList2[currentIndex2].filename)
                }
                className="w-[700px] h-[300px] object-contain animate-fade"
                key={currentIndex2}
              />
            </a>
          ) : (
            <img
              src={
                "/api/files/" +
                encodeURIComponent(adsList2[currentIndex2].filename)
              }
              className="w-[700px] h-[300px] object-contain animate-fade"
              key={currentIndex2}
            />
          )}
        </div>
      ) : (
        <AdsHere width={700} height={300} src="/assets/images/Ads700x300.png" />
      )}
    </section>
  );
}

export default TwoColsAds;
