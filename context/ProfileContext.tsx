import { isSeller } from "@/util/authHelper";
import { fetcher } from "@/util/fetcher";
import { getText } from "@/util/textHelper";
import { Brand, Membership, Role, User } from "@prisma/client";
import { useRouter } from "next/router";
import React, { createContext } from "react";
import useSWR from "swr";

type IProfile = {
  user: (User & { newPhoneNum?: string }) | undefined;
  setUser: Function;
  profileImg: any;
  setProfileImg: Function;
  nrcFront: any;
  setNRCFront: Function;
  nrcBack: any;
  setNRCBack: Function;
  nrcAvailable: boolean;
  setNRCAvailable: Function;
  membership?: Membership;
  setMembership: Function;
  isNRCValid: boolean;
  isProfileValid: boolean;
  isCategoriesValid: boolean;
  isSellerValid: boolean;
  locationStr: string;
  setLocationStr: Function;
};

const ProfileContext = createContext<IProfile>({
  user: undefined,
  setUser: () => {},
  profileImg: null,
  setProfileImg: () => {},
  nrcFront: null,
  setNRCFront: () => {},
  nrcBack: null,
  setNRCBack: () => {},
  nrcAvailable: false,
  setNRCAvailable: () => {},
  membership: null,
  setMembership: () => {},
  isCategoriesValid: false,
  isNRCValid: false,
  isProfileValid: false,
  isSellerValid: false,
  locationStr: "",
  setLocationStr: () => {},
});

export const useProfile = () => React.useContext(ProfileContext);

export const ProfileProvider = ({
  user: parentUser,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) => {
  const { data } = useSWR("/api/townships?allow=true", fetcher);

  const { locale } = useRouter();
  const [user, setUser] = React.useState<User | undefined>(parentUser);
  const [profileImg, setProfileImg] = React.useState<any>();
  const [nrcFront, setNRCFront] = React.useState<any>();
  const [nrcBack, setNRCBack] = React.useState<any>();
  const [nrcAvailable, setNRCAvailable] = React.useState(false);
  const [membership, setMembership] = React.useState<Membership | null>(null);
  const [locationStr, setLocationStr] = React.useState("");

  const isCategoriesValid = React.useMemo(
    () => user && user.preferCategoryIDs.length === 3,
    [user]
  );
  const isNRCValid = React.useMemo(
    () =>
      isSeller(user)
        ? user &&
          (user.nrcFront || nrcFront) &&
          (user.nrcBack || nrcBack) &&
          user.nrcType &&
          user.nrcState &&
          user.nrcTownship &&
          user.nrcNumber.length === 6
        : user &&
          user.nrcType &&
          user.nrcState &&
          user.nrcTownship &&
          user.nrcNumber.length === 6,
    [user]
  );
  const isProfileValid = React.useMemo(
    () =>
      isSeller(user)
        ? user &&
          (user.profile || profileImg) &&
          user.email &&
          user.dob &&
          user.houseNo &&
          user.street &&
          user.stateId &&
          user.districtId &&
          user.townshipId
          ? true
          : false
        : user &&
          user.email &&
          user.dob &&
          user.houseNo &&
          user.street &&
          user.stateId &&
          user.districtId &&
          user.townshipId
        ? true
        : false,
    [user]
  );

  const isSellerValid = React.useMemo(
    () =>
      user && user.role === Role.Buyer
        ? true
        : user &&
          (user.role === Role.Seller || user.role === Role.Trader) &&
          user.membershipId
        ? true
        : false,
    [user]
  );

  React.useEffect(() => {
    if (parentUser) {
      if (
        parentUser.districtId &&
        parentUser.townshipId &&
        parentUser.stateId
      ) {
        if (data) {
          let state = data.find((z) => z.id === parentUser.stateId);
          let stateStr = getText(state.name, state.nameMM, locale);
          let district = state.districts.find(
            (z) => z.id === parentUser.districtId
          );
          let districtStr = getText(district.name, district.nameMM, locale);
          let township = district.townships.find(
            (z) => z.id === parentUser.townshipId
          );
          let townshipStr = getText(township.name, township.nameMM, locale);
          setLocationStr(stateStr + "-" + districtStr + "-" + townshipStr);
        }
      }
    }
    setUser(parentUser);
  }, [parentUser, data, locale]);

  return (
    <ProfileContext.Provider
      value={{
        user,
        setUser,
        profileImg,
        setProfileImg,
        nrcFront,
        nrcBack,
        setNRCBack,
        setNRCFront,
        nrcAvailable,
        setNRCAvailable,
        membership,
        setMembership,
        isCategoriesValid,
        isNRCValid,
        isProfileValid,
        isSellerValid,
        locationStr,
        setLocationStr,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
