import { FastAverageColor } from "fast-average-color";
import React from "react";

interface Props {
  src: string;
  alt: string;
}

function ZoomImage({ src, alt }: Props) {
  const [showOverlay, setShowOverlay] = React.useState(false);
  const overlayNode = React.useRef<HTMLSpanElement | null>(null);
  const imgNode = React.useRef<HTMLImageElement | null>(null);
  const zoomInWindowNode = React.useRef<HTMLDivElement | null>(null);
  const zoomInImageNode = React.useRef<HTMLImageElement | null>(null);
  const [styleDetail, setStyleList] = React.useState({
    overlayLeft: 0,
    overlayTop: 0,
    zoomInLeft: 0,
    zoomInTop: 0,
    zoomInMaxWidth: 0,
  });
  const [bgColor, setBgColor] = React.useState("#FFFFFF");

  React.useEffect(() => {
    if (imgNode && imgNode.current) {
      const fac = new FastAverageColor();
      fac
        .getColorAsync(imgNode.current)
        .then((color) => {
          setBgColor(color.hex);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [imgNode]);

  return (
    <div className="relative">
      <div
        className="aspect-w-1 aspect-h-1"
        onMouseMove={(e) => {
          const { top, left } = e.currentTarget.getBoundingClientRect();

          const zoomInWindowWidth = zoomInWindowNode.current!.clientWidth;
          const overlayWidth = overlayNode.current!.clientWidth;
          const imageWidth = e.currentTarget.clientWidth;
          const imageHeight = e.currentTarget.clientHeight;
          const zoomInImageWidth = zoomInImageNode.current!.clientWidth;
          const zoomInImageHeight = zoomInImageNode.current!.clientHeight;
          const offsetLeft = imgNode.current!.offsetLeft;
          const offsetTop = imgNode.current!.offsetTop;
          const overlayLeft = Math.min(
            Math.max(e.clientX - left - overlayWidth / 2, offsetLeft),
            offsetLeft + imageWidth - overlayWidth,
          );
          const overlayTop = Math.min(
            Math.max(e.clientY - top - overlayWidth / 2, offsetTop),
            offsetTop + imageHeight - overlayWidth,
          );
          const zoomInLeft =
            (-(overlayLeft - offsetLeft) / imageWidth) * zoomInImageWidth;
          const zoomInTop =
            (-(overlayTop - offsetTop) / imageHeight) * zoomInImageHeight;
          const zoomInMaxWidth =
            zoomInWindowWidth / (overlayWidth / imageWidth);
          setStyleList({
            overlayLeft,
            overlayTop,
            zoomInLeft,
            zoomInTop,
            zoomInMaxWidth,
          });
        }}
        onMouseEnter={(e) => setShowOverlay(true)}
        onMouseLeave={(e) => setShowOverlay(false)}
      >
        <img
          alt={alt}
          className="rounded-none object-contain"
          src={src}
          ref={imgNode}
        />
        <span
          className={`absolute h-[100px] w-[100px]  ${
            showOverlay === false ? "hidden" : ""
          }`}
          style={{
            left: styleDetail.overlayLeft + "px",
            top: styleDetail.overlayTop + "px",
          }}
          ref={overlayNode}
        ></span>
        <div
          className={`absolute z-50 h-[200px] w-[200px] overflow-hidden rounded-md border align-top ${
            showOverlay === false ? "hidden" : ""
          }`}
          style={{
            backgroundColor: bgColor,
            left: styleDetail.overlayLeft + 70 + "px",
            top: styleDetail.overlayTop + 70 + "px",
          }}
          ref={zoomInWindowNode}
        >
          <img
            style={
              styleDetail.zoomInMaxWidth
                ? {
                    left: styleDetail.zoomInLeft + "px",
                    top: styleDetail.zoomInTop + "px",
                    maxWidth: styleDetail.zoomInMaxWidth + "px",
                  }
                : {
                    left: styleDetail.zoomInLeft + "px",
                    top: styleDetail.zoomInTop + "px",
                  }
            }
            src={src}
            className="relative z-50 w-[1000px] origin-[150px_150px] transform"
            ref={zoomInImageNode}
          />
        </div>
      </div>
    </div>
  );
}

export default ZoomImage;
