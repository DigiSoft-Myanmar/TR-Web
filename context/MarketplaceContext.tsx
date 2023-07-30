import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CartItem, ShippingFee } from "@/prisma/models/cartItems";
import { OutOfStockError } from "@/types/ApiResponseTypes";
import { DeliveryType } from "@/types/orderTypes";
import { getHeaders, isBuyer } from "@/util/authHelper";
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

type ProductWithSeller = Product & { seller: User; Brand: Brand };

type MarketplaceType = {
  cartItems: CartItem[];
  subTotal: number;
  totalPrice: number;
  productDetails: ProductWithSeller[];
  wishedItems: WishedItems | undefined;
  promoCode: PromoCode[];
  shippingFee: ShippingFee[];
  promoTotal: number;
  billingAddress?: BillingAddress;
  shippingAddress?: ShippingAddress;
  isAddressDiff: boolean;
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
    variation?: any,
    seller?: any
  ) => void;
  modifyAddress: Function;
  shippingLocation: any;
  setShippingLocation: Function;
  sellerDetails: User[];
  checkShip: Function;
  isShippingAddressFilled: boolean;
  attributes: any;
  canShip: Function;
  refetchCart: Function;
  clearCart: Function;
  isLoading: boolean;
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
  promoCode: [],
  promoTotal: 0,
  billingAddress: undefined,
  shippingAddress: undefined,
  isAddressDiff: false,
  addPromotion: () => {},
  removePromotion: () => {},
  setWishedItems: (data: WishedItems[]) => {},
  modifyCount: () => {},
  addCart: () => {},
  modifyAddress: () => {},
  shippingLocation: null,
  setShippingLocation: () => {},
  sellerDetails: [],
  checkShip: () => {},
  isShippingAddressFilled: false,
  attributes: [],
  canShip: () => {},
  refetchCart: () => {},
  clearCart: () => {},
  isLoading: false,
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
  const [promoCode, setPromoCode] = React.useState<PromoCode[]>([]);
  const [shippingLocation, setShippingLocation] = useLocalStorage(
    "shippingLocation",
    JSON.stringify({
      stateId: "",
      districtId: "",
      townshipId: "",
    })
  );
  const { data: attributes } = useQuery("attributesData", () =>
    fetch("/api/products/attributes").then((res) => {
      let json = res.json();
      return json;
    })
  );
  const {
    data: cartData,
    refetch: refetchCart,
    isLoading,
  } = useQuery("cartData", () =>
    fetch("/api/cart").then((res) => {
      let json = res.json();
      return json;
    })
  );

  const { data: wishedItems } = useQuery("wishedData", () =>
    fetch("/api/wished").then((res) => {
      let json = res.json();
      return json;
    })
  );

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
      return shippingLocation;
    }
  }, [cartData?.shippingAddress, shippingLocation]);

  const isAddressDiff: boolean = useMemo(() => {
    if (cartData?.isAddressDiff === true) {
      return true;
    } else if (cartData?.isAddressDiff === false) {
      return false;
    } else {
      if (
        billingAddress.stateId === shippingLocation.stateId &&
        billingAddress.districtId === shippingLocation.districtId &&
        billingAddress.townshipId === shippingLocation.townshipId
      ) {
        return false;
      } else {
        return true;
      }
    }
  }, [cartData?.isAddressDiff, shippingLocation, billingAddress]);

  const isShippingAddressFilled: boolean = useMemo(() => {
    if (isAddressDiff === true) {
      if (
        shippingLocation.townshipId &&
        shippingLocation.districtId &&
        shippingLocation.stateId
      ) {
        return true;
      } else {
        return false;
      }
    } else if (
      billingAddress.townshipId &&
      billingAddress.districtId &&
      billingAddress.stateId
    ) {
      return true;
    } else {
      return false;
    }
  }, [isAddressDiff, billingAddress, shippingLocation]);

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

  const sellerDetails: User[] = useMemo(() => {
    let sellerList = productDetails.map((e: any) => e.seller);
    let seller = sellerList.filter(
      (a, i) => sellerList.findIndex((s) => a.id === s.id) === i
    );

    return seller;
  }, [productDetails]);

  const subTotal = cartItems
    .map((e) =>
      e.salePrice ? e.salePrice * e.quantity : e.normalPrice * e.quantity
    )
    .reduce((a, b) => a + b, 0);

  const promoTotal = calculatePromo();

  const totalPrice =
    subTotal -
    promoTotal +
    shippingFee
      .map((e) => (e.shippingFee ? e.shippingFee : 0))
      .reduce((a, b) => a + b, 0);

  function calculatePromo() {
    let totalDiscount = 0;
    if (promoCode) {
      for (let i = 0; i < promoCode.length; i++) {
        let subTotal = cartItems
          .filter((e) => promoCode[i].sellerId === e.sellerId)
          .map((e) =>
            e.salePrice ? e.quantity * e.salePrice : e.quantity * e.normalPrice
          )
          .reduce((a, b) => a + b, 0);
        if (subTotal >= promoCode[i].minimumPurchasePrice) {
          if (promoCode[i].isShippingFree) {
            if (shippingFee.find((e) => e.sellerId === promoCode[i].sellerId)) {
              changeDeliveryType(
                promoCode[i].sellerId,
                shippingFee.find((e) => e.sellerId === promoCode[i].sellerId)!
                  .deliveryType,
                0
              );
            }
          }
          if (promoCode[i].isPercent) {
            totalDiscount = (promoCode[i].discount * subTotal) / 100;
          } else {
            totalDiscount = promoCode[i].discount;
          }
        }
      }
    }
    return totalDiscount;
  }

  function setWishedItems(data: WishedItems) {
    if (session) {
      fetch("/api/wished", {
        method: "POST",
        body: JSON.stringify(data),
        headers: getHeaders(session),
      });
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

  function changeDeliveryType(
    sellerId: string,
    type: DeliveryType,
    fee?: number
  ) {
    let c = [...shippingFee];
    let update = c.findIndex((e) => e.sellerId === sellerId);
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
    shippingLocation?: any
  ) {
    fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({
        cartItems: cartItems,
        shippingFee: shippingFee,
        billingAddress: billingAddress,
        shippingAddress: shippingLocation,
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
          (e) => e.sellerId === prod!.sellerId
        ).length;
        let s = [...shippingFee];
        if (prodCount === 1) {
          s = s.filter((e) => e.sellerId !== prod!.sellerId);
        }
        updateCartItem(
          c,
          s,
          billingAddress,
          isAddressDiff,
          false,
          shippingLocation
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
          shippingLocation
        );
      }
    }
  }

  async function checkShip(sellerId: string) {
    if (session) {
      if (isAddressDiff === true) {
        if (shippingLocation.townshipId) {
          let data = await fetch(
            "/api/shippingCost?sellerId=" +
              sellerId +
              "&state=" +
              shippingLocation.stateId +
              "&district=" +
              shippingLocation.districtId +
              "&township=" +
              shippingLocation.townshipId
          )
            .then((data) => data.json())
            .then((json) => {
              return json;
            });

          if (data.shippingIncluded === true) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        if (billingAddress.townshipId) {
          let data = await fetch(
            "/api/shippingCost?sellerId=" +
              sellerId +
              "&state=" +
              billingAddress.stateId +
              "&district=" +
              billingAddress.districtId +
              "&township=" +
              billingAddress.townshipId
          )
            .then((data) => data.json())
            .then((json) => {
              return json;
            });
          if (data.shippingIncluded === true) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  async function canShip(sellerId: string, seller: any) {
    let isAvailable = await checkShip(sellerId);

    if (isAvailable === false) {
      if (isAddressDiff === true) {
        showErrorDialog(
          "Sorry. " + seller.username + " cannot deliver to your area.",
          "",
          locale
        );
      } else {
        showErrorDialog(
          "Sorry. " + seller.username + " cannot deliver to your area.",
          "",
          locale
        );
      }
    }
    return isAvailable;
  }

  async function addCart(
    sellerId: string,
    normalPrice: number,
    salePrice: number,
    productId: string,
    quantity: number,
    stockType: StockType,
    stockLevel: number,
    variation?: any,
    seller?: any
  ) {
    if (session && session.id === sellerId) {
      showErrorDialog(
        "You cannot buy your own product.",
        "သင့်ကိုယ်ပိုင် ပစ္စည်းအား ၀ယ်ယူခွင့်မရှိပါ။",
        locale
      );
      return;
    }
    if (session && isBuyer(session)) {
      if (isAddressDiff === true) {
        if (
          !shippingLocation.stateId ||
          !shippingLocation.districtId ||
          !shippingLocation.townshipId
        ) {
          showErrorDialog(
            "Please provide your deliver area. We'll check if " +
              seller.username +
              " delivers to your area.",
            "",
            locale
          );
          return;
        }
      } else {
        if (
          !billingAddress.stateId ||
          !billingAddress.districtId ||
          !billingAddress.townshipId
        ) {
          showErrorDialog(
            "Please provide your deliver area. We'll check if " +
              seller.username +
              " delivers to your area.",
            "",
            locale
          );
          return;
        }
      }
      let isAvailable = await canShip(sellerId, seller);
      if (isAvailable === false) {
        return;
      }

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
          c[index].normalPrice = normalPrice;
          c[index].salePrice = salePrice;
          c[index].quantity += quantity;
        } else if (stockLevel <= 0) {
          let error = OutOfStockError;
          showErrorDialog(error.error, error.errorMM, locale);
          return;
        } else {
          showErrorDialog(
            "Only " + stockLevel + " is available.",
            "လက်ကျန်ပစ္စည်းအရေအတွက်သည် " +
              formatAmount(stockLevel, locale) +
              " သာကျန်ရှိသည့်အတွက်ပစ္စည်းမလုံလောက်ပါ။",
            locale
          );
          return;
        }
      } else {
        if (
          stockType === StockType.InStock ||
          (stockType === StockType.StockLevel && stockLevel >= quantity)
        ) {
          if (variation) {
            c.push({
              sellerId: sellerId,
              normalPrice: normalPrice,
              salePrice: salePrice,
              productId: productId,
              quantity: quantity,
              variation: variation,
            });
          } else {
            c.push({
              sellerId: sellerId,
              normalPrice: normalPrice,
              salePrice: salePrice,
              productId: productId,
              quantity: quantity,
            });
          }
        } else if (stockLevel <= 0) {
          let error = OutOfStockError;
          showErrorDialog(error.error, error.errorMM, locale);
          return;
        } else {
          showErrorDialog(
            "Only " + stockLevel + " is available.",
            "လက်ကျန်ပစ္စည်းအရေအတွက်သည် " +
              formatAmount(stockLevel, locale) +
              " သာကျန်ရှိသည့်အတွက်ပစ္စည်းမလုံလောက်ပါ။",
            locale
          );
          return;
        }
      }
      updateCartItem(
        c,
        shippingFee,
        billingAddress,
        isAddressDiff,
        true,
        shippingLocation
      );
    } else if (session && !isBuyer(session)) {
      showErrorDialog(
        "You are not allowed to perform this action",
        "ရှေ့ဆက်ရန် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ။",
        locale
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
    setPromoCode([]);
  }

  function addPromotion(promotion: PromoCode) {
    if (session) {
      setPromoCode((prevValue) => {
        if (prevValue.find((z) => z.sellerId === promotion.sellerId)) {
          return [
            ...prevValue.filter((z) => z.sellerId !== promotion.sellerId),
            promotion,
          ];
        } else {
          return [...prevValue, promotion];
        }
      });
    }
  }

  function clearCart() {
    fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({
        cartItems: [],
        shippingFee: [],
      }),
      headers: getHeaders(session),
    }).then((data) => {
      if (data.status === 200) {
        refetchCart();
      }
    });
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
        sellerDetails,
        isShippingAddressFilled,

        addPromotion,
        removePromotion,
        setWishedItems,
        modifyCount,
        modifyAddress,
        addCart,

        shippingLocation,
        setShippingLocation,
        checkShip,
        attributes,
        canShip,
        refetchCart,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};
