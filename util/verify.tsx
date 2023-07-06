import { formatAmount } from "./textHelper";

export function verifyEmail(emailInput: string | undefined) {
  if (emailInput) {
    if (
      emailInput.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      return { isSuccess: true };
    } else {
      return {
        error: "Please input valid email address",
        errorMM: "ကျေးဇူးပြု၍ မှန်ကန်သော အီးမေးလ်လိပ်စာကို ထည့်သွင်းပါ။",
        isSuccess: false,
      };
    }
  } else {
    return {
      error: "Please input email address",
      errorMM: "ကျေးဇူးပြု၍ အီးမေးလ်လိပ်စာထည့်သွင်းပါ။",
      isSuccess: false,
    };
  }
}

export function verifyPhone(phoneNumber: string | undefined) {
  if (phoneNumber) {
    if (phoneNumber.match(/^\+\d{10,12}$/)) {
      return { isSuccess: true };
    } else {
      return {
        error: "Please input valid phone number in format eg. +959312512345",
        errorMM:
          "ကျေးဇူးပြု၍ မြန်မာနိုင်ငံရှိ တရားဝင်ဖုန်းနံပါတ်ထည့်ပါ။ ဥပမာ +959312512345",
        isSuccess: false,
      };
    }
  } else {
    return {
      error: "Please input phone number",
      errorMM: "ကျေးဇူးပြု၍ ဖုန်းနံပါတ် ထည့်သွင်းပါ။",
      isSuccess: false,
    };
  }
}

export function verifyPassword(password: string | undefined) {
  if (password) {
    if (password.length >= 6) {
      return { isSuccess: true };
    } else {
      return {
        error: "Password must not be less than 6 characters.",
        errorMM: "စကားဝှက်သည် စာလုံး 6 ထပ်မနည်းရပါ။",
        isSuccess: false,
      };
    }
  } else {
    return {
      error: "Please input password",
      errorMM: "ကျေးဇူးပြု၍ စကားဝှက် ထည့်သွင်းပါ။",
      isSuccess: false,
    };
  }
}

export function verifyNumber(inputStr: string | undefined) {
  let invalidChars = ["-", "+", "e", "N", "a"];
  if (inputStr) {
    let valid = true;
    for (let i = 0; i < inputStr.length && valid === true; i++) {
      if (invalidChars.includes(inputStr[i])) {
        valid = false;
      }
    }
    let verify = /^[0-9]+$/.test(inputStr);

    if (verify) {
      if (valid === true) {
        return { isSuccess: true };
      } else {
        return {
          error: "Please input valid value in english",
          errorMM:
            "ကျေးဇူးပြု၍ တန်ဖိုးအား အင်္ဂလိပ်ဘာသာဖြင့် မှန်မှန်ကန်ကန် ထည့်သွင်းပါ။",
          isSuccess: false,
        };
      }
    } else {
      return {
        error: "Please input valid value in english",
        errorMM:
          "ကျေးဇူးပြု၍ တန်ဖိုးအား အင်္ဂလိပ်ဘာသာဖြင့် မှန်မှန်ကန်ကန် ထည့်သွင်းပါ။",
        isSuccess: false,
      };
    }
  } else {
    return {
      error: "Please input value in english",
      errorMM: "ကျေးဇူးပြု၍ တန်ဖိုးအား အင်္ဂလိပ်ဘာသာဖြင့် ထည့်သွင်းပါ။",
      isSuccess: false,
    };
  }
}

export function verifyText(inputStr: string | undefined) {
  if (inputStr) {
    return { isSuccess: true };
  } else {
    return {
      error: "Please input value",
      errorMM: "ကျေးဇူးပြု၍ တန်ဖိုး ထည့်သွင်းပါ။",
      isSuccess: false,
    };
  }
}

export function verifyNRC(inputStr: string | undefined) {
  if (inputStr) {
    if (inputStr.match(/^([0-9]{6})|([၁၂၃၄၅၆၇၈၉၀]{6})$/)) {
      return { isSuccess: true };
    } else {
      return {
        error: "Please input valid NRC.",
        errorMM: "ကျေးဇူးပြု၍ မှတ်ပုံတင်နံပါတ် မှန်မှန်ကန်ကန် ထည့်သွင်းပါ။",
        isSuccess: false,
      };
    }
  } else {
    return {
      error: "Please input valid NRC.",
      errorMM: "ကျေးဇူးပြု၍ မှတ်ပုံတင်နံပါတ် မှန်မှန်ကန်ကန် ထည့်သွင်းပါ။",
      isSuccess: false,
    };
  }
}

export function getSalePrice(regularPrice: number, salePercent: number) {
  return regularPrice - Math.ceil((regularPrice * salePercent) / 100);
}

export function verifyPrice(
  regularPrice: number | undefined,
  salePrice: number | undefined,
  isPercent: boolean
) {
  let v = verifyNumber(regularPrice?.toString());
  if (v.isSuccess === true) {
    if (salePrice && salePrice > 0) {
      if (isPercent === true) {
        if (salePrice >= 100) {
          return {
            isSuccess: false,
            error: "Please input valid sale price percentage value in english.",
            errorMM:
              "ကျေးဇူးပြု၍ အင်္ဂလိပ်ဘာသာဖြင့် ရောင်းချစျေးနှုန်းရာခိုင်နှုန်းတန်ဖိုးကို မှန်မှန်ကန်ကန် ထည့်သွင်းပါ။",
          };
        } else {
          return {
            isSuccess: true,
          };
        }
      } else if (salePrice >= regularPrice!) {
        return {
          isSuccess: false,
          error:
            "Please input valid sale price value less than regular price in english.",
          errorMM:
            "ကျေးဇူးပြု၍ အင်္ဂလိပ်ဘာသာဖြင့် ပုံမှန်စျေးနှုန်းထပ်နည်းသော ရောင်းချစျေးနှုန်းရာခိုင်နှုန်းတန်ဖိုးကို မှန်မှန်ကန်ကန် ထည့်သွင်းပါ။",
        };
      } else {
        return { isSuccess: true };
      }
    } else {
      return { isSuccess: true };
    }
  } else {
    return {
      isSuccess: false,
      error: "Please input valid regluar price value in english.",
      errorMM:
        "ကျေးဇူးပြု၍ အင်္ဂလိပ်ဘာသာဖြင့် ပုံမှန်စျေးနှုန်းတန်ဖိုးကို ထည့်သွင်းပါ။",
    };
  }
}

export function verifySalePeriod(startDate: Date | null, endDate: Date | null) {
  if (startDate && endDate) {
    if (startDate > endDate) {
      return {
        isSuccess: false,
        error: "Start date must be less than end date.",
        errorMM: "စတင်သည့်ရက်စွဲသည် ပြီးဆုံးရက်ထက် နည်းနေရပါမည်။",
      };
    } else {
      return { isSuccess: true };
    }
  } else {
    return {
      isSuccess: false,
      error: "Please input both start date and end date.",
      errorMM:
        "ကျေးဇူးပြု၍ စတင်ရက်စွဲနှင့် အဆုံးရက်စွဲ နှစ်မျိုးလုံးကို ထည့်သွင်းပါ။",
    };
  }
}

export function verifyAuctionPeriod(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  isISO: boolean,
  maxAuctionPeriod: number
) {
  if (startDate && endDate && startDate.length > 0 && endDate.length > 0) {
    if (startDate >= endDate) {
      return {
        isSuccess: false,
        error: "Start date must be less than end date.",
        errorMM: "စတင်သည့်ရက်စွဲသည် ပြီးဆုံးရက်ထက် နည်းနေရပါမည်။",
      };
    } else {
      if (isISO) {
        let sd = new Date(startDate);
        sd.setDate(sd.getDate() + maxAuctionPeriod);
        let ed = new Date(endDate);
        if (ed <= sd) {
          return { isSuccess: true };
        } else {
          return {
            isSuccess: false,
            error:
              "Start date and end date must be within " +
              maxAuctionPeriod +
              " days.",
            errorMM:
              "စတင်သည့်ရက်စွဲနှင့် ပြီးဆုံးရက်သည် " +
              formatAmount(maxAuctionPeriod, "mm") +
              " ရက်အတွင်းဖြစ်ရပါမည်။",
          };
        }
      } else {
        let sd = new Date(startDate);
        sd.setDate(sd.getDate() + maxAuctionPeriod);
        let ed = new Date(endDate);
        if (ed <= sd) {
          return { isSuccess: true };
        } else {
          return {
            isSuccess: false,
            error:
              "Start date and end date must be within " +
              maxAuctionPeriod +
              " days.",
            errorMM:
              "စတင်သည့်ရက်စွဲနှင့် ပြီးဆုံးရက်သည် " +
              formatAmount(maxAuctionPeriod, "mm") +
              " ရက်အတွင်းဖြစ်ရပါမည်။",
          };
        }
      }
    }
  } else {
    return {
      isSuccess: false,
      error: "Please input both start date and end date.",
      errorMM:
        "ကျေးဇူးပြု၍ စတင်ရက်စွဲနှင့် အဆုံးရက်စွဲ နှစ်မျိုးလုံးကို ထည့်သွင်းပါ။",
    };
  }
}

export enum PromoType {
  NotStarted,
  Active,
  Expired,
}

export function isPromoTodayBetween(startDate: Date, endDate: Date): PromoType {
  const today = new Date();
  if (today < new Date(startDate)) {
    return PromoType.NotStarted;
  } else if (today >= new Date(startDate) && today <= new Date(endDate)) {
    return PromoType.Active;
  } else {
    return PromoType.Expired;
  }
}

export function isTodayBetween(startDate: Date, endDate: Date): boolean {
  return (
    new Date(startDate).getTime() <= new Date().getTime() &&
    new Date(endDate).getTime() >= new Date().getTime()
  );
}

export function isBetween(startDate: string, endDate: string) {
  let startDateArr = startDate.split("-"); // ex input "2010-01-18"
  let endDateArr = endDate.split("-"); // ex input "2010-01-18"

  let today = new Date(new Date().toDateString());
  let start = new Date(
    parseInt(startDateArr[0]),
    parseInt(startDateArr[1]) - 1,
    parseInt(startDateArr[2])
  );
  let end = new Date(
    parseInt(endDateArr[0]),
    parseInt(endDateArr[1]) - 1,
    parseInt(endDateArr[2])
  );
  return today >= start && today <= end;
}

export function verifyPeriod(
  startDate: string | undefined,
  endDate: string | undefined
) {
  if (startDate && endDate) {
    let startDateArr = startDate.split("-"); // ex input "2010-01-18"
    let endDateArr = endDate.split("-"); // ex input "2010-01-18"
    let start = new Date(
      parseInt(startDateArr[0]),
      parseInt(startDateArr[1]) - 1,
      parseInt(startDateArr[2])
    );
    let end = new Date(
      parseInt(endDateArr[0]),
      parseInt(endDateArr[1]) - 1,
      parseInt(endDateArr[2])
    );
    if (start && end) {
      if (start > end) {
        return {
          isSuccess: false,
          error: "Start date must be less than end date.",
          errorMM: "စတင်သည့်ရက်စွဲသည် ပြီးဆုံးရက်ထက် နည်းနေရပါမည်။",
        };
      } else {
        return { isSuccess: true };
      }
    } else {
      return {
        isSuccess: false,
        error: "Please input both start date and end date.",
        errorMM:
          "ကျေးဇူးပြု၍ စတင်ရက်စွဲနှင့် အဆုံးရက်စွဲ နှစ်မျိုးလုံးကို ထည့်သွင်းပါ။",
      };
    }
  } else {
    return {
      isSuccess: false,
      error: "Please input both start date and end date.",
      errorMM:
        "ကျေးဇူးပြု၍ စတင်ရက်စွဲနှင့် အဆုံးရက်စွဲ နှစ်မျိုးလုံးကို ထည့်သွင်းပါ။",
    };
  }
}
