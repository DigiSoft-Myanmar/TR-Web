import { fetcher } from "@/util/fetcher";
import { Product, ProductType, Role } from "@prisma/client";
import React, { createContext } from "react";
import useSWR from "swr";

const ProductContext = createContext<any>({});

export const useProduct = () => React.useContext(ProductContext);

export const ProductProvider = ({
  productDetail,
  children,
}: {
  productDetail?: any;
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
    }
    return true;
  }

  function verifyAttribute(data: Product) {
    return true;
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
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
