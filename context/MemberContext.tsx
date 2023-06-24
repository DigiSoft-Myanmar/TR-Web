import {
  Content,
  Membership,
  Product,
  ProductType,
  Role,
} from "@prisma/client";
import React, { createContext } from "react";

type IMember = {
  infoValid: boolean;
  topSearchValid: boolean;
  SKUValid: boolean;
  reportValid: boolean;
  adsValid: boolean;
  membership: Membership | undefined;
  setMembership: Function;
  content: Content | undefined;
};

const MemberContext = createContext<IMember>({
  infoValid: false,
  adsValid: false,
  reportValid: false,
  SKUValid: false,
  topSearchValid: false,
  membership: undefined,
  content: undefined,
  setMembership: () => {},
});

export const useMembership = () => React.useContext(MemberContext);

export const MembershipProvider = ({
  memberDetail,
  content,
  children,
}: {
  memberDetail?: Membership;
  content?: Content;
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
    if (memberDetail?.id) {
      setMembership(memberDetail);
    } else {
      setMembership({
        adsDetails: content.adsDetails,
        adsDetailsMM: content.adsDetailsMM,
        topSearchDetails: content.topSearchDetails,
        topSearchDetailsMM: content.topSearchDetailsMM,
        saleReportDetails: content.saleReportDetails,
        saleReportDetailsMM: content.saleReportDetailsMM,
        SKUDetails: content.SKUDetails,
        SKUDetailsMM: content.SKUDetailsMM,
      });
    }
  }, [memberDetail, content]);

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
        content,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
};
