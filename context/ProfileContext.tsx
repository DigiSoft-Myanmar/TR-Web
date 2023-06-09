import { Brand, Role, User } from "@prisma/client";
import React, { createContext } from "react";

const ProfileContext = createContext<any>({});

export const useProfile = () => React.useContext(ProfileContext);

export const ProfileProvider = ({
  user,
  brandData,
  children,
}: {
  user: User;
  brandData?: Brand;
  children: React.ReactNode;
}) => {
  const [profile, setProfile] = React.useState<User | undefined>(user);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
