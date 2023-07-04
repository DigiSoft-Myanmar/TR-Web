import AddressCard from "@/components/card/AddressCard";
import AdsCard from "@/components/card/AdsCard";
import AdsDetailDialog from "@/components/modal/dialog/AdsDetailDialog";
import AddressModal from "@/components/modal/sideModal/AddressModal";
import AdsModal from "@/components/modal/sideModal/AdsModal";
import { isInternal } from "@/util/authHelper";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import { Ads, User, UserAddress } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

function UserAdsSection({ user }: { user: User }) {
  const { data: session }: any = useSession();
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [adsDetailOpen, setAdsDetailOpen] = React.useState(false);
  const [ads, setAds] = React.useState<any>(undefined);
  const { data: adsData, refetch } = useQuery("adsData", () =>
    fetch("/api/user/" + encodeURIComponent(user.phoneNum) + "/ads").then(
      (res) => {
        let json = res.json();
        return json;
      }
    )
  );

  return (
    <>
      <div
        className={`${
          isInternal(session)
            ? "py-5 flex flex-col gap-5"
            : "mx-6 px-4 py-5 flex flex-col gap-5"
        }`}
      >
        {adsData?.filter((z: Ads) => z.adsLocations.length > 0).length > 0 ? (
          <>
            <div className="flex flex-row items-center gap-3 mt-3">
              <h3 className="text-lg ml-3">{t("placeAds")}</h3>
              <button
                className="bg-primary text-white p-1 rounded-md hover:bg-primary-focus"
                type="button"
                onClick={() => {
                  setModalOpen(true);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
                </svg>
              </button>
            </div>
            <div className="bg-white p-3 rounded-md border flex flex-col gap-3 w-fit">
              {adsData?.map((z: Ads, index) => (
                <div
                  key={index}
                  className="border p-2 hover:border-primary cursor-pointer rounded-md"
                  onClick={() => {
                    setAds(z);
                    setAdsDetailOpen(true);
                  }}
                >
                  <AdsCard key={index} ads={z} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <></>
        )}
        {adsData?.filter((z: Ads) => z.adsLocations.length === 0).length > 0 ? (
          <>
            <div className="flex flex-row items-center gap-3 mt-3">
              <h3 className="text-lg ml-3">{t("notPlacedAds")}</h3>
              <button
                className="bg-primary text-white p-1 rounded-md hover:bg-primary-focus"
                type="button"
                onClick={() => {
                  setModalOpen(true);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
                </svg>
              </button>
            </div>
            <div className="bg-white p-3 rounded-md border flex flex-col gap-3 w-fit">
              {adsData
                ?.filter((z: Ads) => z.adsLocations.length === 0)
                .map((z: Ads, index) => (
                  <div
                    key={index}
                    className="border p-2 hover:border-primary cursor-pointer rounded-md"
                    onClick={() => {
                      setAds(z);
                      setAdsDetailOpen(true);
                    }}
                  >
                    <AdsCard key={index} ads={z} />
                  </div>
                ))}
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
      <AdsDetailDialog
        isModalOpen={adsDetailOpen}
        setModalOpen={setAdsDetailOpen}
        ads={ads}
        refetch={() => {
          refetch();
        }}
      />
      <AdsModal
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        refetch={() => {
          refetch();
        }}
        title={"Create Ads"}
      />
    </>
  );
}

export default UserAdsSection;
