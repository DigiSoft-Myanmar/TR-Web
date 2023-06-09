import React from "react";
import { FastAverageColor } from "fast-average-color";
import Image from "next/image";

function CoolProduct() {
  const [containerBgColor, setContainerBgColor] = React.useState<string>();
  const [isDark, setDark] = React.useState<boolean>(true);

  return (
    <div
      className="flex flex-row items-center space-x-5 rounded-md shadow-md"
      style={containerBgColor ? { backgroundColor: containerBgColor } : {}}
    >
      <div className={`flex flex-grow flex-col space-y-5 px-10`}>
        <h1
          className={`text-lg font-bold tracking-tight ${
            isDark ? "text-white" : "text-primaryText"
          }`}
        >
          Fried Chicken
        </h1>
      </div>
      <div className="w-1/3">
        <Image
          alt={"Fried Chicken"}
          draggable={false}
          height={170}
          width={700}
          onLoadingComplete={(img) => {
            const fac = new FastAverageColor();
            fac
              .getColorAsync(img, {
                ignoredColor: [
                  [255, 255, 255, 255],
                  [0, 0, 0, 255],
                ],
              })
              .then((color) => {
                setContainerBgColor(color.hex);
                setDark(color.isDark);
              })
              .catch((err) => {
                console.log(err);
              });
          }}
          src={"/assets/dummy/fried_chicken.png"}
          className="object-cotain h-40 w-full p-5"
        />
      </div>
    </div>
  );
}

export default CoolProduct;
