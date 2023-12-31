export enum DeliveryType {
  CarGate = "carGate",
  DoorToDoor = "doorToDoor",
}

export enum OrderStatus {
  OrderReceived = "Order Received",
  Accepted = "Accepted",
  Rejected = "Rejected",
  Shipped = "Shipped",
  Completed = "Completed",
  AutoCancelled = "Auto Cancelled",
  Processing = "Processing",
}

export enum TransactionStatusSeller {
  Verified = "Verified",
  Accepted = "Accepted",
  Shipped = "Shipped",
  Rejected = "Rejected",
}

export enum ImgType {
  Product = "Product",
  Profile = "Profile",
  PromoCode = "PromoCode",
  Ads = "Ads",
  SiteManagement = "SiteManagement",
  Category = "Category",
  Attribute = "Attribute",
  Others = "Others",
}

export enum PaymentStatus {
  Unpaid = "Unpaid",
  Pending = "Pending",
  Verified = "Verified",
}
