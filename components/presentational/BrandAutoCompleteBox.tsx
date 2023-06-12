import React, { Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { fetcher } from "@/util/fetcher";
import useSWR from "swr";

interface Props {
  selected: any;
  setSelected: Function;
}

export default function BrandAutoCompleteBox({
  selected: parentSelect,
  setSelected: setParentSelect,
}: Props) {
  const [selected, setSelected] = useState(parentSelect);
  const [query, setQuery] = useState("");
  const [brandList, setBrandList] = useState<any>();
  const { data } = useSWR("/api/products/brands", fetcher);

  React.useEffect(() => {
    if (brandList && parentSelect && parentSelect.id) {
      setSelected(brandList.find((e: any) => e._id === parentSelect.id));
    }
  }, [brandList, parentSelect]);

  React.useEffect(() => {
    if (data) {
      setBrandList(data);
    }
  }, [data]);

  const filteredBrand =
    query === "" && brandList
      ? brandList
      : brandList
      ? brandList.filter((brand: any) =>
          brand.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        ).length > 0
        ? brandList.filter((brand: any) =>
            brand.name
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(query.toLowerCase().replace(/\s+/g, ""))
          )
        : [{ name: query }]
      : [{ name: query }];

  return (
    <Combobox
      value={selected}
      onChange={(e) => {
        setSelected(e);
        setParentSelect(e);
      }}
    >
      <div className="relative mt-1">
        <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white text-left sm:text-sm border border-gray-300">
          <Combobox.Input
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 bg-white dark:bg-bgDark ring-0 focus:outline-none"
            displayValue={(brand: any) => brand && brand.name}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-darkShade py-1 text-base shadow-md sm:text-sm z-30">
            {filteredBrand.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none py-2 px-4">
                Nothing found.
              </div>
            ) : (
              filteredBrand.map((brand: any, index: number) => (
                <Combobox.Option
                  key={index}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-primary text-white" : ""
                    }`
                  }
                  value={brand}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {brand.name}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? "text-white" : "text-primaryText"
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
