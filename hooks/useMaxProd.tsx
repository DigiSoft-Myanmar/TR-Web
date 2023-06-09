import isMobile from "is-mobile";
import { useEffect, useState } from "react";

export default function useMaxProd(
  width: number,
  defaultMax: number,
  screenWidthLimit?: number,
) {
  const [maxProd, setMaxProd] = useState(defaultMax);

  useEffect(() => {
    function handleResize() {
      if (isMobile()) {
        setMaxProd(1);
      } else {
        if (screenWidthLimit) {
          if (window.innerWidth >= screenWidthLimit) {
            setMaxProd(defaultMax);
          } else {
            setMaxProd(Math.floor(window.innerWidth / width) - 1);
          }
        } else {
          setMaxProd(Math.floor(window.innerWidth / width) - 1);
        }
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return maxProd;
}
