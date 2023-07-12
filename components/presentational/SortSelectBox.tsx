import React, { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import { State } from "@prisma/client";
import { getText } from "@/util/textHelper";
import { useRouter } from "next/router";

export enum SortByType {
  SortByDefault = "SortByDefault",
  SortByNameAsc = "SortByNameAsc",
  SortByNameDesc = "SortByNameDesc",
  SortByPriceAsc = "SortByPriceAsc",
  SortByPriceDesc = "SortByPriceDesc",
  SortByNewest = "SortByNewest",
  SortByOldest = "SortByOldest",
  SortByRatingAsc = "SortByRatingAsc",
  SortByRatingDesc = "SortByRatingDesc",
}

export type SortType = {
  name: string;
  nameMM: string;
  value: SortByType;
};

type Props = {
  selected?: SortType;
  setSelected: Function;
  isBottom?: boolean;
};

export function ProductSortSelectBox({
  selected,
  setSelected,
  isBottom,
}: Props) {
  const { locale } = useRouter();
  const SortList: SortType[] = [
    {
      name: "Sort By Newest",
      nameMM: "အသစ်ဆုံးဖြင့် စီရန်",
      value: SortByType.SortByNewest,
    },
    {
      name: "Sort By Oldest",
      nameMM: "အဟောင်းဆုံးဖြင့် စီရန်",
      value: SortByType.SortByOldest,
    },
  ];

  React.useEffect(() => {
    if (!selected) {
      setSelected(SortList[0]);
    }
  }, [selected]);

  return (
    <Listbox
      value={selected}
      onChange={(e) => {
        setSelected(e);
      }}
    >
      <div className="relative">
        <Listbox.Button
          className={`relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm`}
        >
          <span className="block truncate py-0.5">
            {getText(selected?.name, selected?.nameMM, locale)}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={`absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${
              isBottom === true ? "bottom-full" : "top-0"
            }`}
          >
            {SortList.map((state: SortType, ind: number) => (
              <Listbox.Option
                key={ind}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? "bg-primary/10 text-primary" : "text-gray-900"
                  }`
                }
                value={state}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`block truncate ${
                      selected?.value === state.value
                        ? "font-medium"
                        : "font-normal"
                    }`}
                  >
                    {getText(state.name, state.nameMM, locale)}
                  </span>
                  {selected?.value === state.value ? (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
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

export function BrandSortSelectBox({ selected, setSelected, isBottom }: Props) {
  const { locale } = useRouter();
  const SortList: SortType[] = [
    {
      name: "Sort By Name Ascending",
      nameMM: "နာမည်အလိုက် ငယ်စဥ်ကြီးလိုက် စီပါ။",
      value: SortByType.SortByNameAsc,
    },
    {
      name: "Sort By Name Descending",
      nameMM: "နာမည်အလိုက် ကြီးစဥ်ငယ်လိုက် စီပါ။",
      value: SortByType.SortByNameDesc,
    },
    {
      name: "Sort By Oldest",
      nameMM: "အဟောင်းဆုံးဖြင့် စီရန်",
      value: SortByType.SortByOldest,
    },
    {
      name: "Sort By Newest",
      nameMM: "အသစ်ဆုံးဖြင့် စီရန်",
      value: SortByType.SortByNewest,
    },
  ];

  React.useEffect(() => {
    if (!selected) {
      setSelected(SortList[0]);
    }
  }, [selected]);

  return (
    <Listbox
      value={selected}
      onChange={(e) => {
        setSelected(e);
      }}
    >
      <div className="relative min-w-[250px]">
        <Listbox.Button
          className={`relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm`}
        >
          <span className="block truncate py-0.5">
            {getText(selected?.name, selected?.nameMM, locale)}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={`absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${
              isBottom === true ? "bottom-full" : "top-0"
            }`}
          >
            {SortList.map((state: SortType, ind: number) => (
              <Listbox.Option
                key={ind}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? "bg-primary/10 text-primary" : "text-gray-900"
                  }`
                }
                value={state}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`block truncate ${
                      selected?.value === state.value
                        ? "font-medium"
                        : "font-normal"
                    }`}
                  >
                    {getText(state.name, state.nameMM, locale)}
                  </span>
                  {selected?.value === state.value ? (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
