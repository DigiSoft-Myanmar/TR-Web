import React from "react";
import ProductImg from "../card/ProductImg";

interface Props {
  src: string;
  isChecked: boolean;
  setChecked: Function;
}

function SelectImage({ src, isChecked, setChecked }: Props) {
  const selectRef = React.useRef<HTMLInputElement | null>(null);
  return (
    <div
      className={
        isChecked === true
          ? "relative h-24 w-24 cursor-pointer overflow-hidden rounded-md border-2 border-primary"
          : "relative h-24 w-24 cursor-pointer overflow-hidden rounded-md border-2"
      }
      onClick={(e) => setChecked(selectRef.current!.checked)}
    >
      <input
        ref={selectRef}
        type="checkbox"
        className="checkbox-primary checkbox absolute top-2 right-2 z-20"
        checked={isChecked}
        onChange={(e) => {}}
      />
      <img
        src={src}
        alt={"icon"}
        width={96}
        className="h-[96px] w-[96px] object-contain"
      />
    </div>
  );
}

export default SelectImage;
