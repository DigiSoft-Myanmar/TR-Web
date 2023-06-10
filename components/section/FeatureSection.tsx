import { FeatureType } from "@/types/pageType";
import { getText } from "@/util/textHelper";
import { useRouter } from "next/router";
import React from "react";
import { IconPickerItem } from "react-fa-icon-picker";

function FeatureSection({
  features,
  disableMarginBottom,
}: {
  features: any;
  disableMarginBottom?: boolean;
}) {
  const { locale } = useRouter();
  return (
    <div
      className={`${
        disableMarginBottom === true ? "" : "mb-5"
      } grid w-full grid-cols-2 place-items-stretch gap-5 overflow-x-auto bg-white py-3 shadow-md lg:grid-cols-5`}
    >
      {features?.map((e: any, index: number) => (
        <div
          className="flex flex-row items-center space-x-3 rounded-md px-3 py-2"
          key={index}
        >
          <span className="rounded-full bg-primary/20 p-2">
            <IconPickerItem icon={e.icon} size={24} color={"#E71D2A"} />
          </span>
          <div className="flex flex-col space-y-1">
            <h3 className="text-primaryText whitespace-nowrap text-sm font-semibold">
              {getText(e.title, e.titleMM, locale)}
            </h3>
            <p className="text-xs text-slate-500">
              {getText(e.description, e.descriptionMM, locale)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeatureSection;
