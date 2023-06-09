export enum PageType {
  Featured = "Featured",
}

export enum LogType {
  Products = "Products",
  Seller = "Sellers",
  Order = "Orders",
  Payment = "Payment",
}

export type FeatureType = {
  icon: string;
  title: string;
  titleMM: string;
  description: string;
  descriptionMM: string;
};

export enum PrivacyType {
  accessibility = "Accessibility",
  cookie = "Cookie",
  privacy = "Privacy Policy",
  return = "Return & Refund Policy",
  termsNConditions = "Terms & Conditions",
}

/*
The product is counterfeit or fake.
The product description is inaccurate or misleading.
The product is damaged or defective.
The product was not received or is missing from the order.
The product violates the website's terms of service or community guidelines.
The product is inappropriate or offensive.
The seller is engaging in fraudulent or unethical practices.
The product pricing is unfair or deceptive.
The product is prohibited or illegal.
Other reasons as specified by the e-commerce website.

Counterfeit
Misleading
Defective
Missing
Violation
Inappropriate
Fraudulent
Unfair
Prohibited
Other
*/
