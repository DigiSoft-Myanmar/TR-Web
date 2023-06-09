import { AttrType } from "@prisma/client";

export type Attribute = {
  name?: string;
  nameMM?: string;
  terms?: Term[];
  type?: AttrType;
};

export type Term = {
  name?: string;
  nameMM?: string;
  value?: string;
};

export type Category = {
  name?: string;
  nameMM?: string;
  slug?: string;
  icon?: string;
  color?: string;
};

export type Product = {
  name?: string;
  nameMM?: string;
  slug?: string;
  category?: string[];
  imgList?: string[];
  description?: string;
  descriptionMM?: string;
};
