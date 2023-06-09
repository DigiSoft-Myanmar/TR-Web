import { RemainingTime } from "@/types/productTypes";
import { formatAmount } from "./textHelper";

export function convertMsToTime(milliseconds: number) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  const days = Math.floor(hours / 24);

  seconds = seconds % 60;
  minutes = minutes % 60;
  hours = hours % 24;

  // 👇️ If you want to roll hours over, e.g. 00 to 24
  // 👇️ uncomment the line below
  // uncommenting next line gets you `00:00:00` instead of `24:00:00`
  // or `12:15:31` instead of `36:15:31`, etc.
  // 👇️ (roll hours over)
  // hours = hours % 24;

  return {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
}

export function convertStr(time: RemainingTime, locale?: string) {
  let zero = locale === "mm" ? "၀" : "0";
  let str = "";
  if (time.days > 0) {
    if (locale === "mm") {
      str += formatAmount(time.days, locale) + " ရက် ";
    } else {
      str += time.days + " Days ";
    }
  }
  str +=
    (time.hours >= 10
      ? formatAmount(time.hours, locale)
      : zero + formatAmount(time.hours, locale)) + ":";
  str +=
    (time.minutes >= 10
      ? formatAmount(time.minutes, locale)
      : zero + formatAmount(time.minutes, locale)) + ":";
  str +=
    time.seconds >= 10
      ? formatAmount(time.seconds, locale)
      : zero + formatAmount(time.seconds, locale);
  return str;
}

export function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

export const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, "0");
