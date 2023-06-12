import { Membership, Product, ProductType, Role } from "@prisma/client";
import React, { createContext } from "react";

type IMember = {
  infoValid: boolean;
  topSearchValid: boolean;
  SKUValid: boolean;
  reportValid: boolean;
  adsValid: boolean;
  membership: Membership | undefined;
  setMembership: Function;
};

const MemberContext = createContext<IMember>({
  infoValid: false,
  adsValid: false,
  reportValid: false,
  SKUValid: false,
  topSearchValid: false,
  membership: undefined,
  setMembership: () => {},
});

export const useMembership = () => React.useContext(MemberContext);

export const MembershipProvider = ({
  memberDetail,
  children,
}: {
  memberDetail?: Membership;
  children: React.ReactNode;
}) => {
  const [membership, setMembership] = React.useState<any>(memberDetail);
  const infoValid = React.useMemo(() => verifyInfo(membership), [membership]);
  const adsValid = React.useMemo(() => verifyInfo(membership), [membership]);
  const reportValid = React.useMemo(() => verifyInfo(membership), [membership]);
  const SKUValid = React.useMemo(() => verifyInfo(membership), [membership]);
  const topSearchValid = React.useMemo(
    () => verifyInfo(membership),
    [membership]
  );

  React.useEffect(() => {
    setMembership(memberDetail);
  }, [memberDetail]);

  function verifyInfo(member: Membership) {
    return false;
  }

  return (
    <MemberContext.Provider
      value={{
        membership,
        setMembership,
        adsValid,
        infoValid,
        reportValid,
        SKUValid,
        topSearchValid,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
};
