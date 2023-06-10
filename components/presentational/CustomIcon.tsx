// ** Icon Imports
import { Icon, IconProps } from "@iconify/react";

const CustomIcon = ({ icon, ...rest }: IconProps) => {
  return <Icon icon={icon} fontSize="1.5rem" {...rest} />;
};

export default CustomIcon;
