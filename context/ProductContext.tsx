import { fetcher } from "@/util/fetcher";
import { Product, ProductType, Role } from "@prisma/client";
import React, { createContext } from "react";
import useSWR from "swr";

const ProductContext = createContext<any>({});

export const useProduct = () => React.useContext(ProductContext);

export const ProductProvider = ({
  productDetail,
  attributes,
  children,
}: {
  productDetail?: any;
  attributes;
  children: React.ReactNode;
}) => {
  const { data: settingsData } = useSWR("/api/configurations", fetcher);
  const [maxAuctionPeriod, setMaxAuctionPeriod] = React.useState(14);
  const [product, setProduct] = React.useState<any>(productDetail);

  const infoValid = React.useMemo(() => verifyInfo(product), [product]);
  const pricingValid = React.useMemo(() => verifyPricing(product), [product]);
  const attributeValid = React.useMemo(
    () =>
      product.type === ProductType.Variable ? verifyAttribute(product) : true,
    [product]
  );

  function verifyInfo(data: Product) {
    if (!data.name) {
      return false;
    }
    if (data.type === ProductType.Fixed && !data.SKU) {
      return false;
    }
    if (!data.categoryIds || data.categoryIds.length === 0) {
      return false;
    }
    if (!data.imgList || data.imgList.length === 0) {
      return false;
    }
    if (!data.conditionId) {
      return false;
    }
    if (!data.brandId) {
      return false;
    }
    if (!data.sellerId) {
      return false;
    }
    return true;
  }

  function verifyPricing(data: Product) {
    if (data.type === ProductType.Fixed) {
      if (!data.regularPrice) {
        return false;
      }
      if (!data.stockType) {
        return false;
      }
      if (data.salePrice && data.regularPrice && data.isPercent === false) {
        if (data.salePrice > data.regularPrice) {
          return false;
        }
      }
      if (data.stockType === "StockLevel" && !data.stockLevel) {
        return false;
      }
    } else if (data.type === ProductType.Variable) {
      if (
        data.variations.length > 0 &&
        data.variations.every((z: any) => z.regularPrice)
      ) {
        return true;
      } else {
        return false;
      }
    } else if (data.type === ProductType.Auction) {
      if (
        data.openingBid &&
        data.estimatedPrice &&
        data.startTime &&
        data.endTime
      ) {
        if (data.startTime < data.endTime) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  }

  function verifyAttribute(data: Product) {
    if (data.attributes.length > 0) {
      return true;
    }
    return false;
  }

  React.useEffect(() => {
    if (settingsData && settingsData.maxAuctionPeriod) {
      setMaxAuctionPeriod(parseInt(settingsData.maxAuctionPeriod));
    }
  }, [settingsData]);

  return (
    <ProductContext.Provider
      value={{
        product,
        setProduct,
        infoValid,
        pricingValid,
        attributeValid,
        maxAuctionPeriod,
        attributes,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
