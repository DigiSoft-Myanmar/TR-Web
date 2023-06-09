import { fetcher } from "@/util/fetcher";
import { Listbox, Transition, Combobox } from "@headlessui/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { Fragment } from "react";
import useSWR from "swr";

interface Select {
  id: string;
  name: string;
  nameMM?: string;
}

interface ComponentProps {
  list: Select[];
  current?: string;
  setCurrent: Function;
}

function StateList({ list, current, setCurrent }: ComponentProps) {
  const { locale } = useRouter();

  const [showList, setShowList] = React.useState<any[]>();
  const [searchQry, setSearchQry] = React.useState<string>("");
  const [selected, setSelected] = React.useState<any>();

  React.useEffect(() => {
    setShowList(list);

    if (list && list.length > 0) {
      if (current) {
        let l = list.find((e) => e.id === current);
        setSelected(l);
      } else {
        setSelected(list[0].id);
      }
    }
  }, [list, current]);

  React.useEffect(() => {
    if (searchQry && searchQry.length > 0) {
      setShowList(
        list.filter(
          (e) =>
            e.name.toLowerCase().includes(searchQry.toLowerCase()) ||
            (e.nameMM &&
              e.nameMM.toLowerCase().includes(searchQry.toLowerCase())),
        ),
      );
    } else {
      setShowList(list);
    }
  }, [list, searchQry]);

  return (
    <Listbox
      value={current}
      onChange={(e) => {
        setCurrent(e);
      }}
    >
      <div className="relative mt-1">
        <Listbox.Button
          className={`relative w-full cursor-pointer rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-left focus:border-primary focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm`}
        >
          <span className="block truncate">
            {list.find((e) => e.id === current)
              ? locale &&
                locale === "mm" &&
                list.find((e) => e.id === current)!.nameMM &&
                list.find((e) => e.id === current)!.nameMM!.length > 0
                ? list.find((e) => e.id === current)!.nameMM
                : list.find((e) => e.id === current)!.name
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
            className={`absolute z-30 mt-1 max-h-60 min-w-max overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
          >
            <div className="m-5 flex flex-grow">
              <div className="group relative z-0 w-full px-4">
                <input
                  type="text"
                  className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 border-opacity-30 bg-transparent py-2.5 px-0 text-sm focus:border-primary focus:outline-none focus:ring-0"
                  placeholder="Search....."
                  autoComplete="false"
                  value={searchQry}
                  onChange={(e) => setSearchQry(e.currentTarget.value)}
                />
              </div>
            </div>
            {showList &&
              showList.map((data, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                      active ? "bg-primary/10 text-primary" : ""
                    }`
                  }
                  value={data.id}
                >
                  <div className="flex items-center">
                    {locale === "mm" && data.nameMM && data.nameMM.length > 0
                      ? data.nameMM
                      : data.name}

                    {selected && selected === data.name ? (
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
                  </div>
                </Listbox.Option>
              ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

interface Props {
  stateId?: string;
  districtId?: string;
  townshipId?: string;
  setLocation: Function;
  optional?: boolean;
}

function LocationPicker({
  stateId,
  districtId,
  townshipId,
  setLocation,
  optional,
}: Props) {
  const { t } = useTranslation();
  const { data } = useSWR("/api/townships?allow=true", fetcher);
  const [stateList, setStateList] = React.useState<Select[]>([]);
  const [districtList, setDistrictList] = React.useState<Select[]>([]);
  const [townshipList, setTownshipList] = React.useState<Select[]>([]);

  React.useEffect(() => {
    if (data && stateId) {
      let districtList = data.find((e: any) => e.id === stateId).districts;
      setDistrictList(
        districtList.map((e: any) => {
          return { id: e.id, name: e.name, nameMM: e.nameMM };
        }),
      );
    }

    if (data && stateId && districtId) {
      let districtList = data.find((e: any) => e.id === stateId).districts;
      let townshipList = districtList.find(
        (e: any) => e.id === districtId,
      ).townships;
      setTownshipList(
        townshipList.map((e: any) => {
          return { id: e.id, name: e.name, nameMM: e.nameMM };
        }),
      );
    }
  }, [data, stateId, districtId]);

  React.useEffect(() => {
    if (data) {
      setStateList(
        data.map((e: any) => {
          return { id: e.id, name: e.name, nameMM: e.nameMM };
        }),
      );
    }
  }, [data]);

  return (
    <div className="pb-5">
      <label
        className={`text-sm font-medium ${
          stateId && districtId && townshipId ? "text-green-600" : "text-error"
        }`}
      >
        {t("location")}{" "}
        {optional === true ? <></> : <span className="text-primary">*</span>}
      </label>

      <div className={`relative mt-1`}>
        {data && stateList.length > 0 ? (
          <div className="flex flex-col space-y-3">
            <div className="flex flex-wrap gap-3">
              <StateList
                list={stateList}
                current={stateId}
                setCurrent={(e: string) => {
                  setLocation({ state: e, district: "", township: "" });
                }}
              />
              {stateId && (
                <StateList
                  list={districtList}
                  current={districtId}
                  setCurrent={(e: string) => {
                    setLocation({ state: stateId, district: e, township: "" });
                  }}
                />
              )}
              {stateId && districtId && (
                <StateList
                  list={townshipList}
                  current={townshipId}
                  setCurrent={(e: string) => {
                    setLocation({
                      state: stateId,
                      district: districtId,
                      township: e,
                    });
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="loading-bar"></div>
        )}
      </div>
      {stateId && districtId && townshipId ? (
        <></>
      ) : (
        <span className="p-2 text-xs text-error">
          {t("inputLocationError")}
        </span>
      )}
    </div>
  );
}

export default LocationPicker;
