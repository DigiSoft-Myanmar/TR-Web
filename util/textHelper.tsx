import { Brand, State, User } from "@prisma/client";

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
  const nameArray = name.split(" ");

  nameArray.forEach((word) => {
    if (initials.length < 2) {
      initials += word.charAt(0).toUpperCase();
    }
  });

  if (initials.length === 2) {
    return initials;
  } else {
    return `${name.charAt(0).toUpperCase()}${name.charAt(1).toUpperCase()}`;
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
