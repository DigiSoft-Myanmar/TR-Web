import { useRouter } from "next/router";
import React from "react";
import { ChromePicker, SketchPicker } from "react-color";

interface Props {
  color: string;
  setColor: Function;
}

function ColorPicker({ color: parentColor, setColor: setParentColor }: Props) {
  const { locale } = useRouter();
  const [color, setColor] = React.useState({
    h: -1,
    s: -1,
    l: -1,
  });
  const [displayColorPicker, setDisplayColorPicker] = React.useState(false);

  React.useEffect(() => {
    if (parentColor) {
      let hexToHsl = require("hex-to-hsl");
      let hsl = hexToHsl(parentColor);
      setColor({
        h: hsl[0],
        s: hsl[1],
        l: hsl[2],
      });
    }
  }, [parentColor]);

  const handleChange = (color: any) => {
    setColor(color.rgb);
    setParentColor(color.hex);
  };

  return <SketchPicker color={color} onChange={handleChange} />;
}

export default ColorPicker;
