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
  const infoValid = React.useMemo(
    () =>
      membership &&
      membership.name &&
      membership.nameMM &&
      membership.price >= 0 &&
      membership.validity > 0 &&
      membership.onBoardingLimit >= 0
        ? true
        : false,
    [membership]
  );
  const adsValid = React.useMemo(
    () =>
      membership &&
      membership.freeAdsLimit >= 0 &&
      membership.adsValidity >= 0 &&
      membership.adsLifeTime >= 0 &&
      membership.extraAdsPricing > 0
        ? true
        : false,
    [membership]
  );
  const reportValid = React.useMemo(
    () => (membership && membership.subCategoryReport >= 0 ? true : false),
    [membership]
  );
  const SKUValid = React.useMemo(
    () =>
      membership && membership.SKUListing > 0 && membership.extraSKUPricing >= 0
        ? true
        : false,
    [membership]
  );
  const topSearchValid = React.useMemo(
    () =>
      membership &&
      membership.topSearchStart >= 0 &&
      membership.topSearchEnd >= 0
        ? true
        : false,
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
