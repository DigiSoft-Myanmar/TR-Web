export const Unauthorized = {
  title: "Unauthorized",
  reason: "Only authorized users are allowed.",
  error: "You are not allowed to perform this action.",
  errorMM: "သင်သည် ဤလုပ်ဆောင်ချက်ကို လုပ်ဆောင်ရန် ခွင့်ပြုချက်မရပါ။",
};

export const BadAuction = {
  title: "BadAuction",
  reason: "Auction already started.",
  error:
    "You are not allowed to perform this action since the auction is already begun.",
  errorMM:
    "လေလံပွဲ စတင်နေပြီဖြစ်သောကြောင့် သင်သည် ဤလုပ်ဆောင်ချက်ကို လုပ်ဆောင်ရန် ခွင့်မပြုပါ။",
};

export const BadAuctionPrice = {
  title: "BadAuctionPrice",
  reason: "Auction already won.",
  error:
    "You are not allowed to perform this action since the product is already won.",
  errorMM:
    "လေလံအောင်ပြီး ၀ယ်သူမှလက်ခံရမည့်အခြေအနေဖြစ်သောကြောင့် သင်သည် ဤလုပ်ဆောင်ချက်ကို လုပ်ဆောင်ရန် ခွင့်မပြုပါ။",
};
export const BlockedUser = {
  title: "BlockedUser",
  reason: "BlockedUser",
  error:
    "You are not allowed to perform this action since the account is blocked",
  errorMM:
    "အကောင့်ပိတ်ဆို့ခြင်းခံရသောကြောင့် သင်သည် ဤလုပ်ဆောင်ချက်ကို လုပ်ဆောင်ရန် ခွင့်မပြုပါ။",
};

export const BlockedBuyer = {
  title: "BlockedUser",
  reason: "BlockedUser",
  error:
    "You are not allowed to perform this action since the buyer account is blocked",
  errorMM:
    "၀ယ်ယူသူအကောင့်ပိတ်ဆို့ခြင်းခံရသောကြောင့် သင်သည် ဤလုပ်ဆောင်ချက်ကို လုပ်ဆောင်ရန် ခွင့်မပြုပါ။",
};

export const DisabledBuyer = {
  title: "DeletedUser",
  reason: "DeletedUser",
  error:
    "You are not allowed to perform this action since the buyer account is deleted",
  errorMM:
    "၀ယ်ယူသူအကောင့် ဖျက်ထားခြင်း ခံရသောကြောင့် သင်သည် ဤလုပ်ဆောင်ချက်ကို လုပ်ဆောင်ရန် ခွင့်မပြုပါ။",
};

export const BadAuctionClose = {
  title: "BadAuctionClose",
  reason: "Bidding already closed",
  error:
    "You are not allowed to perform this action since the bidding is closed.",
  errorMM:
    "လေလံပွဲ ပြီးဆုံးသွားပြီဖြစ်သောကြောင့် သင်သည် ဤလုပ်ဆောင်ချက်ကို လုပ်ဆောင်ရန် ခွင့်မပြုပါ။",
};

export const BadAuctionNotStarted = {
  title: "BadAuctionNotStarted",
  reason: "Bidding not started",
  error:
    "You are not allowed to perform this action since the bidding is not started yet.",
  errorMM:
    "လေလံပွဲ မစတင်သေးသဖြင့် သင်သည် ဤလုပ်ဆောင်ချက်ကို လုပ်ဆောင်ရန် ခွင့်မပြုပါ။",
};

export const BadAuctionLessAmount = {
  title: "BadAuctionLessAmount",
  reason: "Less Amount",
  error: "Your bidding amount is not satisfied.",
  errorMM: "သင်၏လေလံဆွဲသည့်ပမာဏသည် နည်းနေပါသဖြင့် လုပ်ဆောင်ချက်မအောင်မြင်ပါ။",
};

export const BadAuctionSeller = {
  title: "BadAuctionSeller",
  reason: "Same seller and bidder",
  error: "You cannot bid your own product.",
  errorMM: "သင့်ကိုယ်ပိုင်ထုတ်ကုန်ကို လေလံဆွဲ၍မရပါ။",
};

export const BadAuctionBuyer = {
  title: "BadAuctionBuyer",
  reason: "No information by customer",
  error:
    "You are not allowed to perform this action since you have not provided the information required by the system.",
  errorMM:
    "သင်သည် စနစ်မှ လိုအပ်သော အချက်အလက်များကို မပေးသေးသောကြောင့် ဤလုပ်ဆောင်ချက်ကို လုပ်ဆောင်ရန် ခွင့်မပြုပါ။",
};

export const BadBuyerSeller = {
  title: "BadBuyerSeller",
  reason: "Same seller and buyer",
  error: "You cannot buy your own product.",
  errorMM: "သင့်ကိုယ်ပိုင်ထုတ်ကုန်ကို ၀ယ်ယူ၍မရပါ။",
};

export const OutOfStockError = {
  title: "OutOfStock",
  reason: "Out of stock",
  error: "The request product is currently out of stock.",
  errorMM:
    "တောင်းဆိုထားသော ထုတ်ကုန်သည် လက်ရှိတွင် ပစ္စည်းပြတ်နေပါသဖြင့် ၀ယ်ယူ၍မရနိုင်ပါ။",
};

export const BadSlug = {
  title: "BadSlug",
  reason: "Duplicate Slug.",
  error: "Duplicate slug.",
  errorMM: "Slug တူနေပါသည်။",
};

export const BadName = {
  title: "BadSlug",
  reason: "Duplicate Name.",
  error: "Duplicate name.",
  errorMM: "နာမည်တူနေပါသည်။",
};

export const BadSKU = {
  title: "BadSKU",
  reason: "Duplicate SKU.",
  error: "Duplicate SKU.",
  errorMM: "SKU တူနေပါသည်။",
};

export const BadPromoCode = {
  title: "BadPromoCode",
  reason: "Duplicate Promo Code.",
  error: "Duplicate Promo Code.",
  errorMM: "Promo Code တူနေပါသည်။",
};

export const NoPromoCode = {
  title: "NoPromoCode",
  reason: "Promo Code does not exists.",
  error: "Promo Code does not exists",
  errorMM: "Promo Code မရှိပါ။",
};

export const BadRequest = {
  title: "Bad Request",
  reason: "Invalid parameters",
  error: "Invalid parameters",
  errorMM: "မမှန်ကန်သောထည့်သွင်းမှုများပြုလုပ်ထားပါသည်။",
};

export const NotAvailable = {
  title: "Not Available",
  reason: "The request item is not available.",
  error: "The request item is not available.",
  errorMM: "တောင်းဆိုသည့်အရာ မရနိုင်ပါ။",
};

export const SameUserPromo = {
  title: "Same User",
  reason: "Same Promo User",
  errorMM:
    "ဝမ်းနည်းပါသည်၊ ဤပရိုမိုကုဒ်သည် ရွေးချယ်ထားသော ထုတ်ကုန်များနှင့် မသက်ဆိုင်ပါ။",
  error: "Sorry, this promo code is not applicable to the selected products.",
};

export const AlreadyExists = {
  title: "Already Exists",
  reason: "Account already exists.",
  error: "Item already exists.",
  errorMM: "ပစ္စည်း ရှိနှင့်ပြီးသားဖြစ်ပါသည်။",
};

export const OrderExists = {
  title: "Order Exists",
  reason: "Order exists.",
  error: "Incomplete order exists.",
  errorMM: "မပြီးဆုံးသေးသောအော်ဒါရှိနေပါသည်။",
};

export const UsersExists = {
  title: "Users Exists",
  reason: "Users exists.",
  error: "Users exists.",
  errorMM: "အသုံးပြုသူရှိနေပါသည်။",
};

export const ExpiredPromo = {
  title: "Promo Expired",
  reason: "Promo code is already expired.",
  error: "Expired promo code.",
  errorMM: "ပရိုမိုကုဒ် သက်တမ်းကုန်နေပါသည်။",
};

export const PromoUsed = {
  title: "Promo Used",
  reason: "Promo code limit reached",
  error: "Coupon usage limit has been reached.",
  errorMM: "ကူပွန်အသုံးပြုမှု ကန့်သတ်ချက် ပြည့်သွားပါပြီ။",
};

export const PromoUsedPerUser = {
  title: "Promo Used",
  reason: "Promo code limit reached",
  error: "Promo code limit reached for you.",
  errorMM: "သင့်အတွက်ပရိုမိုကုဒ် အသုံးပြုမှုပြည့်သွားပါပြီ။",
};

export const Success = {
  title: "Success",
};

export const SameAddress = {
  title: "Same address",
  reason: "same address",
  error: "Same address",
  errorMM: "လိပ်စာတူနေပါသည်",
};

export const BadOrder = {
  title: "Bad Order",
  reason: "Invalid operation",
  error: "Invalid operation",
  errorMM: "မမှန်ကန်သောလုပ်ဆောင်ချက်ဖြစ်ပါသဖြင့်လုပ်ဆောင်ခွင့်မရပါ။",
};

export const BadMembership = {
  title: "Bad Membership",
  reason: "Invalid operation",
  error: "Previous membership is still valid.",
  errorMM: "ယခင်အသင်း၀င်မှုသက်တမ်းမကုန်ဆုံးသေးပါ။",
};

export const InvalidMembership = {
  title: "Invalid Membership",
  reason: "Invalid Membership",
  error: "Cannot choose free membership.",
  errorMM: "အခမဲ့အသင်း၀င်ခြင်းလုပ်ဆောင်ခွင့်မရပါ။",
};

export const Exists = {
  title: "Actions Exists",
  reason: "",
  error: "This item cannot be deleted since it has related data!",
  errorMM: "၎င်းတွင် ဆက်စပ် data များ ပါရှိသောကြောင့် ဤအရာကို ဖျက်၍မရပါ။",
};
