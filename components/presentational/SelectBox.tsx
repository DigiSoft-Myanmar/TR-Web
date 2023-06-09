import React, { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useRouter } from "next/router";

export interface SelectType {
  name: string;
  nameMM?: string;
  value: string;
}

interface Props {
  list: SelectType[];
  selected?: SelectType;
  setSelected: Function;
  isSearch: boolean;
  disabled?: boolean;
}

export default function SelectBox({
  list,
  selected,
  setSelected,
  isSearch,
  disabled,
}: Props) {
  const { locale } = useRouter();
  const [showList, setShowList] = React.useState<SelectType[]>(list);
  const [searchQry, setSearchQry] = React.useState<string>("");

  React.useEffect(() => {
    if (!selected) {
      setSelected(list[0]);
    }
  }, [selected]);

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
      value={selected}
      onChange={(e) => setSelected(e)}
      disabled={disabled === true ? true : false}
    >
      <div className="relative mt-1">
        <Listbox.Button
          className={`relative w-full cursor-pointer rounded-lg bg-primary
          py-2 pl-3 pr-10 text-left text-white shadow-md focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm`}
        >
          <span className="block truncate">
            {selected
              ? locale &&
                locale === "mm" &&
                selected.nameMM &&
                selected.nameMM.length > 0
                ? selected.nameMM
                : selected.name
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
            className={`absolute z-20 mt-1 max-h-60 min-w-max overflow-auto rounded-md bg-slate-800 py-1 text-base text-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
          >
            {isSearch && (
              <div className="m-5 flex flex-grow">
                <div className="group relative z-0 w-full px-4">
                  <input
                    type="text"
                    className="peer block w-full appearance-none border-0 border-b-2 border-opacity-30 bg-transparent py-2.5 px-0 text-sm focus:border-primary focus:outline-none focus:ring-0"
                    placeholder="Search....."
                    autoComplete="false"
                    value={searchQry}
                    onChange={(e) => setSearchQry(e.currentTarget.value)}
                  />
                </div>
              </div>
            )}
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
                    {locale &&
                    locale === "mm" &&
                    data.nameMM &&
                    data.nameMM.length > 0
                      ? data.nameMM
                      : data.name}
                  </span>
                  {selected && selected.value === data.value ? (
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
