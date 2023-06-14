import { Brand, Membership, Role, User } from "@prisma/client";
import React, { createContext } from "react";

type IProfile = {
  user: User | undefined;
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
});

export const useProfile = () => React.useContext(ProfileContext);

export const ProfileProvider = ({
  user: parentUser,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) => {
  const [user, setUser] = React.useState<User | undefined>(parentUser);
  const [profileImg, setProfileImg] = React.useState<any>();
  const [nrcFront, setNRCFront] = React.useState<any>();
  const [nrcBack, setNRCBack] = React.useState<any>();
  const [nrcAvailable, setNRCAvailable] = React.useState(false);
  const [membership, setMembership] = React.useState<Membership | null>(null);

  React.useEffect(() => {
    setUser(parentUser);
  }, [parentUser]);

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
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
