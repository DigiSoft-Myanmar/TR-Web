import React, { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import { State } from "@prisma/client";

type Props = {
  selected?: string[];
  setSelected: Function;
  isNPTDisabled?: boolean;
};

export default function StateSelectBox({
  selected,
  setSelected,
  isNPTDisabled,
}: Props) {
  const { data } = useSWR("/api/townships", fetcher);

  React.useEffect(() => {
    if (data) {
      if (selected && selected.length > 0) {
      } else {
        setSelected(data.map((e: State) => e.id));
      }
    }
  }, [data, selected]);

  return (
    <Listbox
      value={selected}
      onChange={(e) => {
        let s = data.filter((z: State) => e.find((b) => b === z.id));
        setSelected(s);
      }}
      multiple={true}
    >
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
          <span className="block truncate">
            {data
              ?.filter((z: State) => selected?.find((b) => b === z.id))
              .map((e: State) => e.name)
              .join(", ")}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        {data && (
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {data
                .filter((e: State) =>
                  isNPTDisabled === true ? e.name !== "Nay Pyi Taw" : false,
                )
                .map((state: State, ind: number) => (
                  <Listbox.Option
                    key={ind}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active ? "bg-primary/10 text-primary" : "text-gray-900"
                      }`
                    }
                    value={state.id}
                  >
                    {({ selected }) => (
                      <div className="flex items-center gap-3">
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {state.name}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
            </Listbox.Options>
          </Transition>
        )}
      </div>
    </Listbox>
  );
}
