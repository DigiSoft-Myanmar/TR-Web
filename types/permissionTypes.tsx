export enum BuyerPermission {
  buyerCreateAllow = "buyerCreateAllow",
  buyerUpdateAllow = "buyerUpdateAllow",
  buyerDeleteAllow = "buyerDeleteAllow",
  buyerViewAllow = "buyerViewAllow",
  buyerExportAllow = "buyerExportAllow",
}

export enum SellerPermission {
  sellerCreateAllow = "sellerCreateAllow",
  sellerUpdateAllow = "sellerUpdateAllow",
  sellerDeleteAllow = "sellerDeleteAllow",
  sellerViewAllow = "sellerViewAllow",
  sellerExportAllow = "sellerExportAllow",
  sellerNotiAllow = "sellerNotiAllow",
}

export enum TraderPermission {
  traderCreateAllow = "traderCreateAllow",
  traderUpdateAllow = "traderUpdateAllow",
  traderDeleteAllow = "traderDeleteAllow",
  traderViewAllow = "traderViewAllow",
  traderExportAllow = "traderExportAllow",
  traderNotiAllow = "traderNotiAllow",
}

export enum AdminPermission {
  adminCreateAllow = "adminCreateAllow",
  adminUpdateAllow = "adminUpdateAllow",
  adminDeleteAllow = "adminDeleteAllow",
  adminViewAllow = "adminViewAllow",
  adminExportAllow = "adminExportAllow",
}

export enum StaffPermission {
  staffUpdateAllow = "staffUpdateAllow",
  staffDeleteAllow = "staffDeleteAllow",
  staffViewAllow = "staffViewAllow",
  staffExportAllow = "staffExportAllow",
}

export enum SubscribePermission {
  subscribeDeleteAllow = "subscribeDeleteAllow",
  subscribeViewAllow = "subscribeViewAllow",
  subscribeExportAllow = "subscribeExportAllow",
  subscribeNotiAllow = "subscribeNotiAllow",
}

export enum ProductPermission {
  productCreateAllow = "productCreateAllow",
  productUpdateAllow = "productUpdateAllow",
  productDeleteAllow = "productDeleteAllow",
  productViewAllow = "productViewAllow",
  productExportAllow = "productExportAllow",
  productEmailAllow = "productEmailAllow",
  productNotiAllow = "productNotiAllow",
}

export enum BrandPermission {
  brandCreateAllow = "brandCreateAllow",
  brandUpdateAllow = "brandUpdateAllow",
  brandDeleteAllow = "brandDeleteAllow",
  brandViewAllow = "brandViewAllow",
  brandExportAllow = "brandExportAllow",
}

export enum ConditionPermission {
  conditionCreateAllow = "conditionCreateAllow",
  conditionUpdateAllow = "conditionUpdateAllow",
  conditionDeleteAllow = "conditionDeleteAllow",
  conditionViewAllow = "conditionViewAllow",
}

export enum OrderPermission {
  orderUpdateAllow = "orderUpdateAllow",
  orderDeleteAllow = "orderDeleteAllow",
  orderViewAllow = "orderViewAllow",
  orderExportAllow = "orderExportAllow",
  orderEmailAllow = "orderEmailAllow",
  orderNotiAllow = "orderNotiAllow",
}

export enum ReportPermission {
  reportBuyerViewAllow = "reportBuyerViewAllow",
  reportBuyerExportAllow = "reportBuyerExportAllow",
  reportCategoryViewAllow = "reportCategoryViewAllow",
  reportCategoryExportAllow = "reportCategoryExportAllow",
  reportClickViewAllow = "reportClickViewAllow",
  reportClickExportAllow = "reportClickExportAllow",
  reportBrandViewAllow = "reportBrandViewAllow",
  reportBrandExportAllow = "reportBrandExportAllow",
}

export enum AuctionPermission {
  endedAuctionAllow = "endedAuctionAllow",
  endedAuctionReject = "endedAuctionReject",
  endedAuctionView = "endedAuctionView",
  endedAuctionExport = "endedAuctionExport",
  endedAuctionEmail = "endedAuctionEmail",
  endedAuctionNoti = "endedAuctionNoti",
  allBidAuctionView = "allBidAuctionView",
  allBidAuctionExport = "allBidAuctionExport",
  allBidAuctionEmail = "allBidAuctionEmail",
  allBidAuctionNoti = "allBidAuctionNoti",
}

export enum otherPermission {
  dashboardView = "dashboardView",

  reviewView = "reviewView",
  reviewDelete = "reviewDelete",
  reviewExport = "reviewExport",

  feedbacksView = "feedbacksView",
  feedbacksDelete = "feedbacksDelete",
  feedbacksExport = "feedbacksExport",

  helpCenterMessageUpdate = "helpCenterMessageUpdate",
  helpCenterMessageView = "helpCenterMessageView",
  helpCenterMessageDelete = "helpCenterMessageDelete",
  helpCenterMessageExport = "helpCenterMessageExport",
  helpCenterMessageNoti = "helpCenterMessageNoti",

  adsCreate = "adsCreate",
  adsUpdate = "adsUpdate",
  adsDelete = "adsDelete",
  adsView = "adsView",
  adsNoti = "adsNoti",

  promotionView = "promotionView",
  promotionCreate = "promotionCreate",
  promotionUpdate = "promotionUpdate",
  promotionDelete = "promotionDelete",

  membershipView = "membershipView",
  membershipUpdate = "membershipUpdate",
  membershipDelete = "membershipDelete",
  membershipCreate = "membershipCreate",

  categoriesView = "categoriesView",
  categoriesUpdate = "categoriesUpdate",
  categoriesDelete = "categoriesDelete",
  categoriesCreate = "categoriesCreate",

  attributeView = "attributeView",
  attributeUpdate = "attributeUpdate",
  attributeDelete = "attributeDelete",
  attributeCreate = "attributeCreate",

  faqView = "faqView",
  faqUpdate = "faqUpdate",
  faqDelete = "faqDelete",
  faqCreate = "faqCreate",

  townshipCreate = "townshipCreate",
  townshipUpdate = "townshipUpdate",
  townshipDelete = "townshipDelete",
  townshipView = "townshipView",

  configurationView = "configurationView",
  configurationUpdate = "configurationUpdate",

  contactUpdate = "contactUpdate",
  contactView = "contactView",

  aboutUpdate = "aboutUpdate",
  aboutView = "aboutView",

  privacyUpdate = "privacyUpdate",
  privacyView = "privacyView",
}
