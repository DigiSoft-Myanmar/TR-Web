import { fetcher } from "@/util/fetcher";
import { getText } from "@/util/textHelper";
import { Listbox, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

interface Props {
  selected?: any;
  setSelected: Function;
  disableLabel?: boolean;
}

function LocationPickerFull({ selected, setSelected, disableLabel }: Props) {
  const { data } = useSWR("/api/townships?allow=true", fetcher);
  const router = useRouter();
  const { locale } = router;
  const [locationList, setLocationList] = React.useState([]);
  const [showList, setShowList] = React.useState([]);
  const [qry, setQry] = React.useState("");
  const { t } = useTranslation("common");

  const generateLocationStrings = (data) => {
    const result = [];

    for (const city of data) {
      const cityName = city.name;

      for (const district of city.districts) {
        const districtName = district.name;

        for (const township of district.townships) {
          const townshipName = township.name;

          const locationString = `${cityName} / ${districtName} / ${townshipName}`;
          result.push({
            locationString: locationString,
            locationStringMM: `${city.nameMM} / ${district.nameMM} / ${township.nameMM}`,
            stateId: city.id,
            districtId: district.id,
            townshipId: township.id,
          });
        }
      }
    }

    return result;
  };

  React.useEffect(() => {
    if (data) {
      setLocationList(generateLocationStrings(data));
    }
  }, [data]);

  React.useEffect(() => {
    if (qry) {
      setShowList(
        locationList.filter(
          (z) =>
            z.locationString.toLowerCase().includes(qry) ||
            z.locationStringMM.toLowerCase().includes(qry)
        )
      );
    } else {
      setShowList(locationList);
    }
  }, [qry, locationList]);

  return (
    <Listbox value={selected} onChange={(e) => setSelected(e)}>
      {disableLabel === true ? (
        <></>
      ) : (
        <label
          className={`text-sm font-medium ${
            selected &&
            selected.stateId &&
            selected.districtId &&
            selected.townshipId
              ? "text-green-600"
              : "text-error"
          }`}
        >
          {t("location")} <span className="text-primary">*</span>
        </label>
      )}

      <div className={`relative mt-1`}>
        <Listbox.Button
          className={`relative w-full cursor-pointer rounded-lg
      py-2 pl-3 pr-10 text-left text-primaryText border border-gray-300 focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm ${
        selected &&
        selected.stateId &&
        selected.districtId &&
        selected.townshipId
          ? "border-green-600"
          : ""
      }`}
        >
          <span className="block truncate">
            {locationList.find(
              (z) =>
                z.stateId === selected.stateId &&
                z.districtId === selected.districtId &&
                z.townshipId === selected.townshipId
            )
              ? locationList.find(
                  (z) =>
                    z.stateId === selected.stateId &&
                    z.districtId === selected.districtId &&
                    z.townshipId === selected.townshipId
                )?.locationString
              : "-"}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={`absolute right-0 z-20 mt-1 max-h-60 min-w-max overflow-auto rounded-md pb-1 text-base text-primaryText shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm bg-white`}
          >
            <div className="p-5 flex flex-grow sticky top-0 bg-white z-10">
              <div className="group z-0 w-full px-4">
                <input
                  type="text"
                  className="peer block w-full appearance-none border-0 border-b-2 border-opacity-30 bg-transparent py-2.5 px-0 text-sm focus:border-primary focus:outline-none focus:ring-0"
                  placeholder="Search....."
                  autoComplete="false"
                  value={qry}
                  onChange={(e) => setQry(e.currentTarget.value)}
                />
              </div>
            </div>
            {showList.map((data, index) => (
              <Listbox.Option
                key={index}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? "bg-primary/10 text-primary" : ""
                  }`
                }
                value={data}
              >
                <>
                  <span
                    className={`block whitespace-nowrap ${
                      selected ? "font-medium" : "font-normal"
                    }`}
                  >
                    {getText(
                      data.locationString,
                      data.locationStringMM,
                      locale
                    )}
                  </span>
                  {data.stateId === selected.stateId &&
                  data.districtId === selected.districtId &&
                  data.townshipId === selected.townshipId ? (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  ) : null}
                </>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

export default LocationPickerFull;
