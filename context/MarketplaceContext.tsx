import { CartItem, ShippingFee } from "@/prisma/models/cartItems";
import { OutOfStockError } from "@/types/ApiResponseTypes";
import { DeliveryType } from "@/types/orderTypes";
import { getHeaders } from "@/util/authHelper";
import { fetcher } from "@/util/fetcher";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import { formatAmount } from "@/util/textHelper";
import {
  Brand,
  Prisma,
  Product,
  PromoCode,
  StockType,
  Term,
  User,
  WishedItems,
} from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { createContext, useMemo } from "react";
import { useQuery } from "react-query";

type ProductWithSeller = Product & { seller: User };

type MarketplaceType = {
  cartItems: CartItem[];
  subTotal: number;
  totalPrice: number;
  productDetails: ProductWithSeller[];
  wishedItems: WishedItems | undefined;
  promoCode: PromoCode | undefined;
  shippingFee: ShippingFee[];
  promoTotal: number;
  billingAddress?: BillingAddress;
  shippingAddress?: ShippingAddress;
  isAddressDiff: boolean;
  isPromoLoading: boolean;
  addPromotion: Function;
  removePromotion: Function;
  setWishedItems: Function;
  modifyCount: Function;
  addCart: (
    sellerId: string,
    normalPrice: number,
    salePrice: number,
    productId: string,
    quantity: number,
    stockType: StockType,
    stockLevel: number,
    variation?: any
  ) => void;
  modifyAddress: Function;
  shippingLocation: any;
  setShippingLocation: Function;
};

export type BillingAddress = {
  name: string;
  phoneNum: string;
  email: string;
  stateId: string;
  districtId: string;
  townshipId: string;
  houseNo: string;
  street: string;
};

export type ShippingAddress = {
  name: string;
  phoneNum: string;
  stateId: string;
  districtId: string;
  townshipId: string;
  houseNo: string;
  street: string;
};

const MarketplaceContext = createContext<MarketplaceType>({
  cartItems: [],
  subTotal: 0,
  totalPrice: 0,
  productDetails: [],
  wishedItems: undefined,
  shippingFee: [],
  promoCode: undefined,
  promoTotal: 0,
  billingAddress: undefined,
  shippingAddress: undefined,
  isAddressDiff: false,
  isPromoLoading: false,
  addPromotion: () => {},
  removePromotion: () => {},
  setWishedItems: (data: WishedItems[]) => {},
  modifyCount: () => {},
  addCart: () => {},
  modifyAddress: () => {},
  shippingLocation: null,
  setShippingLocation: () => {},
});

export const useMarketplace = () => React.useContext(MarketplaceContext);

export const MarketplaceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { data: session }: any = useSession();
  const { locale } = useRouter();
  const [isPromoLoading, setPromoLoading] = React.useState(false);
  const [promoCode, setPromoCode] = React.useState<PromoCode | undefined>(
    undefined
  );
  const [shippingLocation, setShippingLocation] = React.useState({
    stateId: "",
    districtId: "",
    townshipId: "",
  });

  const { data: cartData, refetch: refetchCart } = useQuery("cartData", () =>
    fetch("/api/cart").then((res) => {
      let json = res.json();
      return json;
    })
  );

  const { data: wishedItems } = useQuery("cartData", () =>
    fetch("/api/wished").then((res) => {
      let json = res.json();
      return json;
    })
  );

  const screenshot: string[] = useMemo(() => {
    if (cartData?.screenshot) {
      return cartData.screenshot;
    } else {
      return [];
    }
  }, [cartData?.screenshot]);

  const billingAddress: BillingAddress = useMemo(() => {
    if (cartData?.billingAddress) {
      return cartData.billingAddress;
    } else {
      return {};
    }
  }, [cartData?.billingAddress]);

  const shippingAddress: BillingAddress = useMemo(() => {
    if (cartData?.shippingAddress) {
      return cartData.shippingAddress;
    } else {
      return {};
    }
  }, [cartData?.shippingAddress]);

  const isAddressDiff: boolean = useMemo(() => {
    if (cartData?.isAddressDiff === true) {
      return true;
    } else {
      return false;
    }
  }, [cartData?.isAddressDiff]);

  const shippingFee: ShippingFee[] = useMemo(() => {
    if (cartData?.shippingFee) {
      return cartData.shippingFee;
    } else {
      return [];
    }
  }, [cartData?.shippingFee]);

  const cartItems: CartItem[] = useMemo(() => {
    if (cartData?.cartItems) {
      return cartData.cartItems;
    } else {
      return [];
    }
  }, [cartData?.cartItems]);

  const productDetails: ProductWithSeller[] = useMemo(() => {
    if (cartData?.prodDetails) {
      return cartData.prodDetails;
    } else {
      return [];
    }
  }, [cartData?.prodDetails]);
  /* 
  const brandDetails: User[] = useMemo(() => {
    let brandList = productDetails.map((e: any) => e.brand);
    let brand = brandList.filter(
      (a, i) => brandList.findIndex((s) => a.id === s.id) === i
    );

    return brand;
  }, [productDetails]);
 */
  const subTotal = useMemo(() => {
    return cartItems
      .map((e) =>
        e.salePrice ? e.salePrice * e.quantity : e.normalPrice * e.quantity
      )
      .reduce((a, b) => a + b, 0);
  }, [cartItems]);

  const promoTotal = useMemo(() => {
    let totalDiscount = 0;
    if (promoCode) {
      let brandList = promoCode?.sellerId;
      let subTotal = cartItems
        .filter((e) => brandList === e.brandId)
        .map((e) => e.quantity * e.salePrice)
        .reduce((a, b) => a + b, 0);
      if (subTotal >= promoCode.minimumPurchasePrice) {
        if (promoCode.isShippingFree) {
          if (shippingFee.find((e) => e.brandId === brandList)) {
            changeDeliveryType(
              brandList,
              shippingFee.find((e) => e.brandId === brandList)!.deliveryType,
              0
            );
          }
        }
        if (promoCode.isPercent) {
          totalDiscount = subTotal - (promoCode.discount * subTotal) / 100;
        } else {
          totalDiscount = subTotal - promoCode.discount;
        }
      }
    }
    return totalDiscount;
  }, [promoCode, cartItems, shippingFee]);

  const totalPrice = useMemo(() => {
    return (
      subTotal -
      promoTotal +
      shippingFee
        .map((e) => (e.shippingFee ? e.shippingFee : 0))
        .reduce((a, b) => a + b, 0)
    );
  }, [subTotal, shippingFee, promoTotal]);

  function setWishedItems(data: WishedItems) {
    fetch("/api/wished", {
      method: "POST",
      body: JSON.stringify(data),
      headers: getHeaders(session),
    });
  }

  function changeDeliveryType(
    brandId: string,
    type: DeliveryType,
    fee?: number
  ) {
    let c = [...shippingFee];
    let update = c.findIndex((e) => e.brandId === brandId);
    if (update >= 0) {
      c[update].deliveryType = type;
      c[update].shippingFee = fee;
    }
    updateCartItem(
      cartItems,
      c,
      billingAddress,
      isAddressDiff,
      false,
      shippingAddress
    );
  }

  function updateCartItem(
    cartItems: CartItem[],
    shippingFee: ShippingFee[],
    billingAddress: BillingAddress,
    isAddressDiff: boolean,
    showDialog: boolean,

    shippingAddress?: ShippingAddress
  ) {
    fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({
        cartItems: cartItems,
        shippingFee: shippingFee,
        billingAddress: billingAddress,
        shippingAddress: shippingAddress,
        isAddressDiff: isAddressDiff,
      }),
      headers: getHeaders(session),
    }).then((data) => {
      if (data.status === 200) {
        if (showDialog === true) {
          showSuccessDialog(
            "Add to cart successfully.",
            "စျေး၀ယ်ခြင်းထဲသို့ထည့်ပြီးပါပြီ",
            locale
          );
        }
        refetchCart();
      }
    });
  }

  function modifyCount(productId: string, qty: number) {
    let prod = cartItems.find((e) => e.productId === productId);
    if (prod) {
      if (qty <= 0) {
        let c = cartItems.filter((e) => e.productId !== productId);
        let prodCount = cartItems.filter(
          (e) => e.brandId === prod!.brandId
        ).length;
        let s = [...shippingFee];
        if (prodCount === 1) {
          s = s.filter((e) => e.brandId !== prod!.brandId);
        }
        updateCartItem(
          c,
          s,
          billingAddress,
          isAddressDiff,
          false,

          shippingAddress
        );
      } else {
        let c = [...cartItems];
        let p = cartItems.findIndex((e) => e.productId === productId);
        c[p].quantity = qty;
        updateCartItem(
          c,
          [...shippingFee],
          billingAddress,
          isAddressDiff,
          false,

          shippingAddress
        );
      }
    }
  }

  function addCart(
    brandId: string,
    normalPrice: number,
    salePrice: number,
    productId: string,
    quantity: number,
    stockType: StockType,
    stockLevel: number,
    variation?: any
  ) {
    if (session) {
      let c = [...cartItems];
      let index = c.findIndex((z) =>
        variation
          ? z.productId === productId &&
            variation.attributes?.every((ea: any) =>
              z.variation!.attributes?.find(
                (at: Term) =>
                  at.name === ea.name &&
                  at.attributeId === ea.attributeId &&
                  at.value === ea.value
              )
            )
          : z.productId === productId
      );
      if (index >= 0) {
        if (
          stockType === StockType.InStock ||
          (stockType === StockType.StockLevel &&
            stockLevel >= quantity + c[index].quantity)
        ) {
          c[index].quantity += quantity;
        } else {
          let error = OutOfStockError;
          showErrorDialog(error.error, error.errorMM, locale);
          return;
        }
      } else {
        if (
          stockType === StockType.InStock ||
          (stockType === StockType.StockLevel && stockLevel >= quantity)
        ) {
          if (variation) {
            c.push({
              brandId: brandId,
              normalPrice: normalPrice,
              salePrice: salePrice,
              productId: productId,
              quantity: quantity,
              variation: variation,
            });
          } else {
            c.push({
              brandId: brandId,
              normalPrice: normalPrice,
              salePrice: salePrice,
              productId: productId,
              quantity: quantity,
            });
          }
        } else {
          let error = OutOfStockError;
          showErrorDialog(error.error, error.errorMM, locale);
          return;
        }
      }
      updateCartItem(
        c,
        shippingFee,
        billingAddress,
        isAddressDiff,
        true,
        shippingAddress
      );
    } else {
      showErrorDialog(
        "Please login to continue.",
        "ရှေ့ဆက်ရန် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ။",
        locale,
        () => {
          router.push("/login");
        }
      );
    }
  }

  function modifyAddress(
    billingAddress: BillingAddress,
    isAddressDiff: boolean,
    shippingAddress?: ShippingAddress
  ) {
    updateCartItem(
      cartItems,
      shippingFee,
      billingAddress,
      isAddressDiff,
      false,
      shippingAddress
    );
  }

  function removePromotion() {
    setPromoCode(undefined);
  }

  function addPromotion(promoCode: string, isChange?: boolean) {
    if (session) {
      setPromoLoading(true);
      fetch(
        "/api/promotions/checkPromo?promoCode=" + encodeURIComponent(promoCode)
      )
        .then(async (data) => {
          setPromoLoading(false);
          if (data.status === 200) {
            return data.json();
          } else {
            let error = await data.json();
            showErrorDialog(error.error, error.errorMM, locale);
          }
        })
        .then((json) => {
          if (json) {
          }
        });
    }
  }

  return (
    <MarketplaceContext.Provider
      value={{
        cartItems,
        subTotal,
        productDetails,
        wishedItems,
        shippingFee,
        totalPrice,
        promoCode,
        promoTotal,
        billingAddress,
        shippingAddress,
        isAddressDiff,
        isPromoLoading,

        addPromotion,
        removePromotion,
        setWishedItems,
        modifyCount,
        modifyAddress,
        addCart,

        shippingLocation,
        setShippingLocation,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};
