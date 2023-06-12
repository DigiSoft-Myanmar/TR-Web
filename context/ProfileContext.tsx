import { Brand, Role, User } from "@prisma/client";
import React, { createContext } from "react";

const ProfileContext = createContext<any>({});

export const useProfile = () => React.useContext(ProfileContext);

export const ProfileProvider = ({
  user: parentUser,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) => {
  const [user, setUser] = React.useState<User | undefined>(parentUser);

  React.useEffect(() => {
    setUser(parentUser);
  }, [parentUser]);

  return (
    <ProfileContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
