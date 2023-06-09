export type Membership = {
  _id?: string;
  name?: string;
  nameMM?: string;
  description?: string;
  descriptionMM?: string;
  price?: number;
  percentagePerTransaction?: number;
  productLimit?: number;
  isInfinity: boolean;
};
