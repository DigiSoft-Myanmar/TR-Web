import { Brand, PromoCode, State, User } from "@prisma/client";

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getText(
  engText?: string | null | undefined,
  mmText?: string | null | undefined,
  locale?: string
) {
  if (locale === "mm" && mmText && mmText.length > 0) return mmText;
  return engText ? engText : "";
}

export function getPromoAvailCount(
  promoCode: PromoCode & {
    seller: User;
    usage: number;
    ownUsage: number;
  }
) {
  if (
    promoCode.isCouponUsagePerUserInfinity &&
    promoCode.isCouponUsageInfinity
  ) {
    console.log("1");
    return Number.POSITIVE_INFINITY;
  } else if (
    !promoCode.isCouponUsagePerUserInfinity &&
    promoCode.isCouponUsageInfinity
  ) {
    console.log("2", promoCode.couponUsagePerUser - promoCode.ownUsage);
    return promoCode.couponUsagePerUser - promoCode.ownUsage;
  } else if (
    promoCode.isCouponUsagePerUserInfinity &&
    !promoCode.isCouponUsageInfinity
  ) {
    console.log("3", promoCode.couponUsage - promoCode.usage);
    return promoCode.couponUsage - promoCode.usage;
  } else {
    var availableUsage = promoCode.couponUsage - promoCode.usage;
    if (
      promoCode.isCouponUsageInfinity === false &&
      availableUsage >= promoCode.couponUsagePerUser
    ) {
      console.log("4", promoCode.couponUsagePerUser - promoCode.ownUsage);
      return promoCode.couponUsagePerUser - promoCode.ownUsage;
    }
    if (promoCode.isCouponUsageInfinity === true) {
      console.log("5", availableUsage);
      return availableUsage;
    }
    if (
      promoCode.isCouponUsageInfinity === false &&
      availableUsage < promoCode.couponUsagePerUser
    ) {
      console.log("6", availableUsage - promoCode.ownUsage);
      return availableUsage - promoCode.ownUsage;
    }
    console.log(availableUsage);
    return availableUsage >= 0 ? availableUsage : 0;
  }
}

export function getPromoCount(
  promoCode: PromoCode & {
    seller: User;
    usage: number;
    ownUsage: number;
  }
) {
  if (
    promoCode.isCouponUsagePerUserInfinity &&
    promoCode.isCouponUsageInfinity
  ) {
    return Number.POSITIVE_INFINITY;
  } else if (
    !promoCode.isCouponUsagePerUserInfinity &&
    promoCode.isCouponUsageInfinity
  ) {
    return promoCode.couponUsagePerUser;
  } else if (
    promoCode.isCouponUsagePerUserInfinity &&
    !promoCode.isCouponUsageInfinity
  ) {
    return promoCode.couponUsage;
  } else {
    var availableUsage = promoCode.couponUsage;
    if (
      promoCode.isCouponUsageInfinity === false &&
      availableUsage >= promoCode.couponUsagePerUser
    ) {
      return promoCode.couponUsagePerUser;
    }
    if (promoCode.isCouponUsageInfinity === true) {
      return availableUsage;
    }
    if (
      promoCode.isCouponUsageInfinity === false &&
      availableUsage < promoCode.couponUsagePerUser
    ) {
      return availableUsage;
    }

    return availableUsage >= 0 ? availableUsage : 0;
  }
}

export function getUsageCount(
  promoCode: PromoCode & {
    seller: User;
    usage: number;
    ownUsage: number;
  }
) {
  if (
    promoCode.isCouponUsagePerUserInfinity &&
    promoCode.isCouponUsageInfinity
  ) {
    return Number.POSITIVE_INFINITY;
  } else if (
    !promoCode.isCouponUsagePerUserInfinity &&
    promoCode.isCouponUsageInfinity
  ) {
    return promoCode.ownUsage;
  } else if (
    promoCode.isCouponUsagePerUserInfinity &&
    !promoCode.isCouponUsageInfinity
  ) {
    return promoCode.usage;
  } else {
    var availableUsage = promoCode.usage;
    if (
      promoCode.isCouponUsageInfinity === false &&
      availableUsage >= promoCode.couponUsagePerUser
    ) {
      return promoCode.ownUsage;
    }
    if (promoCode.isCouponUsageInfinity === true) {
      return availableUsage;
    }
    if (
      promoCode.isCouponUsageInfinity === false &&
      availableUsage < promoCode.couponUsagePerUser
    ) {
      return promoCode.ownUsage;
    }

    return availableUsage >= 0 ? availableUsage : 0;
  }
}

function getCount(text: string) {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "#") {
      count++;
    }
  }
  return count;
}

export function getHighlightText(text?: string | null | undefined) {
  if (text) {
    let count = getCount(text);
    if (count > 0) {
      if (count % 2 === 0) {
        let totalCount = count / 2;
        let modifiedText = [];
        let t = text;

        for (let i = 0; i < totalCount; i++) {
          let startIndex = t.indexOf("#");
          let t2 = t.substring(startIndex + 1);
          let lastIndex = t2.indexOf("#");
          let highlightedText = t.substring(
            startIndex + 1,
            startIndex + lastIndex + 1
          );
          modifiedText.push({
            isHighlight: false,
            text: t.substring(0, startIndex),
          });
          t = t.substring(startIndex + lastIndex + 2);
          modifiedText.push({
            isHighlight: true,
            text: highlightedText,
          });
        }
        if (t) {
          modifiedText.push({
            isHighlight: false,
            text: t,
          });
        }
        return modifiedText;
      }
    } else {
      return [
        {
          isHighlight: false,
          text: text,
        },
      ];
    }
  }
  return [
    {
      isHighlight: false,
      text: text,
    },
  ];
}

export function convertMM(x: string) {
  let mmNum = "";
  for (let i = 0; i < x.length; i++) {
    switch (x[i]) {
      case "0":
        mmNum += "၀";
        break;
      case "1":
        mmNum += "၁";
        break;
      case "2":
        mmNum += "၂";
        break;
      case "3":
        mmNum += "၃";
        break;
      case "4":
        mmNum += "၄";
        break;
      case "5":
        mmNum += "၅";
        break;
      case "6":
        mmNum += "၆";
        break;
      case "7":
        mmNum += "၇";
        break;
      case "8":
        mmNum += "၈";
        break;
      case "9":
        mmNum += "၉";
        break;
      case "h":
        mmNum += " နာရီ ";
        break;
      case "d":
        mmNum += " ရက် ";
        break;
      case "m":
        mmNum += " မိနစ် ";
        break;
      case "s":
        mmNum += " စက္ကန့် ";
        break;
      case "D":
        mmNum += " ရက်";
        break;
      case "M":
        mmNum += " လ";
        break;
      case "Y":
        mmNum += " နှစ်";
        break;
      case "T":
        mmNum += " ";
        break;
      default:
        mmNum += x[i];
        break;
    }
  }
  return mmNum;
}

export function formatAmount(
  amount: number,
  locale?: string,
  isMMK?: boolean,
  isShort?: boolean
) {
  if (amount) {
    if (isShort === true) {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "MMK",
        notation: "compact",
        currencyDisplay: "code",
        // These options are needed to round to whole numbers if that's what you want.
        //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
      });
      let str = formatter.format(amount).substring(4);
      if (isMMK === true) {
        if (locale === "mm") {
          str = convertMM(str) + " " + "ကျပ်";
        } else {
          str = str + " " + "MMK";
        }
      } else if (locale === "mm") {
        str = convertMM(str);
      }
      return str;
    }
    if (locale === "mm") {
      let mmText = convertMM(
        convertMM(
          amount
            .toFixed()
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        )
      );
      if (isMMK === true) {
        return mmText + " ကျပ်";
      }
      return mmText;
    } else {
      let amt = amount
        .toFixed()
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      if (isMMK === true) {
        return amt + " MMK";
      }
      return amt;
    }
  } else {
    if (locale === "mm" && isMMK === true) {
      return "၀ ကျပ်";
    } else if (isMMK === true) {
      return "0 MMK";
    } else {
      return "0";
    }
  }
}

export function formatDate(input: string, locale?: string) {
  try {
    let dArr = input.split("-"); // ex input "2010-01-18"
    if (locale && locale === "mm") {
      return convertMM(dArr[2] + "-" + dArr[1] + "-" + dArr[0].substring(2));
    } else {
      return dArr[2] + "-" + dArr[1] + "-" + dArr[0].substring(2); //ex out: "18/01/10"
    }
  } catch (e) {
    return input;
  }
}

export function getTotalCountByBrand(brandList: User[], stateList: State[]) {
  return [
    /* Sagaing - Sagaing Region */
    {
      count: brandList.filter(
        (e) =>
          stateList.find((z) => z.name === "Sagaing Region")?.id === e.stateId
      ).length,
      id: stateList.find((z) => z.name === "Sagaing Region")?.id,
    },
    /* Kachin - Kachin State */
    {
      count: brandList.filter(
        (e) =>
          stateList.find((z) => z.name === "Kachin State")?.id === e.stateId
      ).length,
      id: stateList.find((z) => z.name === "Kachin State")?.id,
    },
    {
      count:
        /* Tanintharyi - Taninthayi Region */
        brandList.filter(
          (e) =>
            stateList.find((z) => z.name === "Taninthayi Region")?.id ===
            e.stateId
        ).length,
      id: stateList.find((z) => z.name === "Taninthayi Region")?.id,
    },
    /* Shan - Shan State */
    {
      count: brandList.filter(
        (e) => stateList.find((z) => z.name === "Shan State")?.id === e.stateId
      ).length,
      id: stateList.find((z) => z.name === "Shan State")?.id,
    },
    /* Magway - Magway Region */
    {
      count: brandList.filter(
        (e) =>
          stateList.find((z) => z.name === "Magway Region")?.id === e.stateId
      ).length,
      id: stateList.find((z) => z.name === "Magway Region")?.id,
    },
    /* Ayeyarwady - Ayeyawady Region*/
    {
      count: brandList.filter(
        (e) =>
          stateList.find((z) => z.name === "Ayeyawady Region")?.id === e.stateId
      ).length,
      id: stateList.find((z) => z.name === "Ayeyawady Region")?.id,
    },
    /* Chin - Chin State */
    {
      count: brandList.filter(
        (e) => stateList.find((z) => z.name === "Chin State")?.id === e.stateId
      ).length,
      id: stateList.find((z) => z.name === "Chin State")?.id,
    },
    /* Rakhine - Rakhine State */
    {
      count: brandList.filter(
        (e) =>
          stateList.find((z) => z.name === "Rakhine State")?.id === e.stateId
      ).length,
      id: stateList.find((z) => z.name === "Rakhine State")?.id,
    },
    /* Mon - Mon State */
    {
      count: brandList.filter(
        (e) => stateList.find((z) => z.name === "Mon State")?.id === e.stateId
      ).length,
      id: stateList.find((z) => z.name === "Mon State")?.id,
    },
    /* Yangon - Yangon Region*/
    {
      count: brandList.filter(
        (e) =>
          stateList.find((z) => z.name === "Yangon Region")?.id === e.stateId
      ).length,
      id: stateList.find((z) => z.name === "Yangon Region")?.id,
    },
    /* Bago - Bago Region */
    {
      count: brandList.filter(
        (e) => stateList.find((z) => z.name === "Bago Region")?.id === e.stateId
      ).length,
      id: stateList.find((z) => z.name === "Bago Region")?.id,
    },
    /* Mandalay - Mandalay Region */
    {
      count: brandList.filter(
        (e) =>
          stateList.find((z) => z.name === "Mandalay Region")?.id ===
            e.stateId ||
          stateList.find((z) => z.name === "Nay Pyi Taw")?.id === e.stateId
      ).length,
      id:
        stateList.find((z) => z.name === "Mandalay Region")?.id +
        "&" +
        stateList.find((z) => z.name === "Nay Pyi Taw")?.id,
    },
    /* Kayin - Kayin State */
    {
      count: brandList.filter(
        (e) => stateList.find((z) => z.name === "Kayin State")?.id === e.stateId
      ).length,
      id: stateList.find((z) => z.name === "Kayin State")?.id,
    },
    /* Kayah - Kayah State */
    {
      count: brandList.filter(
        (e) => stateList.find((z) => z.name === "Kayah State")?.id === e.stateId
      ).length,
      id: stateList.find((z) => z.name === "Kayah State")?.id,
    },
  ];
}

export function getInitials(name: string) {
  let initials = "";
  const nameArray = name?.split(" ");

  nameArray?.forEach((word) => {
    if (initials.length < 2) {
      initials += word.charAt(0).toUpperCase();
    }
  });

  if (initials.length === 2) {
    return initials;
  } else {
    return `${name?.charAt(0).toUpperCase()}${name?.charAt(1).toUpperCase()}`;
  }
}

export function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

export function toDateTimeLocal(isoString: string) {
  let date = new Date(isoString);
  return (
    date.getFullYear() +
    "-" +
    padTo2Digits(date.getMonth() + 1) +
    "-" +
    padTo2Digits(date.getDate()) +
    "T" +
    padTo2Digits(date.getHours()) +
    ":" +
    padTo2Digits(date.getMinutes())
  );
}

export function getNotiTime(
  isoString: string,
  locale?: string,
  disableFull?: boolean
) {
  let date = new Date(isoString);
  let today = new Date();

  let secondDiff = (today.getTime() - date.getTime()) / 1000;
  if (secondDiff < 60) {
    if (locale === "mm") {
      return "လွန်ခဲ့သော စက္ကန့်အနည်းငယ်က";
    } else {
      return "A few seconds ago";
    }
  } else {
    let minute = Math.floor(secondDiff / 60);
    if (minute < 60) {
      if (locale === "mm") {
        return "လွန်ခဲ့သော" + formatAmount(minute, "mm") + " မိနစ်ခန့်က";
      } else if (minute === 1) {
        return minute + " minute ago";
      } else {
        return minute + " minutes ago";
      }
    } else {
      let hour = Math.floor(minute / 60);
      if (hour < 24) {
        if (locale === "mm") {
          return "လွန်ခဲ့သော" + formatAmount(hour, "mm") + " နာရီခန့်က";
        } else if (hour === 1) {
          return hour + " hour ago";
        } else {
          return hour + " hours ago";
        }
      } else {
        let day = Math.floor(hour / 24);
        if (day === 1) {
          if (locale === "mm") {
            return "လွန်ခဲ့သော တစ်ရက်ခန့်က";
          } else {
            return "A day ago";
          }
        } else {
          if (disableFull === true) {
            return date.toLocaleDateString("en-ca", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          } else {
            return date.toLocaleDateString("en-ca", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour12: true,
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        }
      }
    }
  }
}

export function calculateRating(totalRatings: number, totalComments: number) {
  if (totalComments > 0) {
    return (totalRatings / totalComments).toFixed(1);
  } else {
    return (0).toFixed(1);
  }
}

export function calculateRatingPercentage(ratings) {
  const ratingCount = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  // Count the occurrences of each rating
  ratings?.forEach((item) => {
    const rating = item.rating;
    ratingCount[rating]++;
  });

  const totalCount = ratings?.length;
  const ratingPercentage = {};

  // Calculate the percentage for each rating
  for (let i = 1; i <= 5; i++) {
    const percentage = totalCount > 0 ? (ratingCount[i] / totalCount) * 100 : 0;
    ratingPercentage[i] = percentage.toFixed(2); // Rounding the percentage to two decimal places
  }

  return ratingPercentage;
}

export function getPageNumbers(currentPage: number, totalPages: number) {
  const displayRange = 5; // Number of page numbers to display
  const halfDisplayRange = Math.floor(displayRange / 2);

  let startPage = currentPage - halfDisplayRange;
  let endPage = currentPage + halfDisplayRange;

  if (startPage < 1) {
    startPage = 1;
    endPage = Math.min(displayRange, totalPages);
  } else if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, totalPages - displayRange + 1);
  }

  let returnVal = Array(endPage - startPage + 1)
    .fill(0)
    .map((_, index) => startPage + index);

  console.log(returnVal);

  return Array(endPage - startPage + 1)
    .fill(0)
    .map((_, index) => startPage + index);
}
