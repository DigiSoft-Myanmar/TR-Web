import { firebaseAuth } from "@/lib/firebase";
import { RegisterType } from "@/pages/register";

import { authErrors } from "@/types/authErrors";
import { Role } from "@prisma/client";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

const generateReCaptcha = (captchaContainer: any) => {
  try {
    window.recaptchaVerifier = new RecaptchaVerifier(
      captchaContainer.current!,
      {
        size: "invisible",
        callback: (response: any) => {},
      },
      getAuth()
    );
  } catch (err: any) {}
};

export async function sendOTP(
  phoneNum: string,
  captchaContainer: any,
  isLogin: boolean
) {
  try {
    return fetch(
      "/api/user?isLogin=" + isLogin + "&phone=" + encodeURIComponent(phoneNum)
    ).then(async (res) => {
      if (isLogin === true) {
        if (res.status !== 200) {
          if (res.status === 403) {
            let json = await res.json();
            return {
              isSuccess: false,
              error: "This account is blocked. " + json.error,
              errorMM: "အကောင့်အပိတ်ခံထားရပါသည်။ " + json.error,
            };
          }
          return {
            isSuccess: false,
            error: "User not exists.",
            errorMM: "ဤဖုန်းတွင် အသုံးပြုသူမရှိပါ။",
          };
        }
      } else {
        if (res.status === 200) {
          return {
            isSuccess: false,
            error: "User exists.",
            errorMM: "ဤဖုန်းတွင် အသုံးပြုသူရှိပါသည်။",
          };
        }
      }
      generateReCaptcha(captchaContainer);
      let appVerifier = window.recaptchaVerifier;
      let phoneResponse = signInWithPhoneNumber(
        firebaseAuth,
        phoneNum,
        appVerifier
      )
        .then((confirmationResult: any) => {
          window.confirmationResult = confirmationResult;
          return { isSuccess: true, error: "", errorMM: "" };
        })
        .catch((err: any) => {
          console.log(err);
          if (err.code) {
            let errCode = err.code.replace("auth/", "");
            if (errCode in authErrors) {
              return { isSuccess: false, error: authErrors[errCode] };
            } else {
              return {
                isSuccess: false,
                error: "Something went wrong. Please try again.",
                errorMM:
                  "တစ်ခုခုမှားယွင်းနေပါသည်။ နောက်တစ်ကြိမ် ထပ်စမ်းကြည့်ပါ။",
              };
            }
          } else {
            return {
              isSuccess: false,
              error: "Something went wrong. Please try again.",
              errorMM: "တစ်ခုခုမှားယွင်းနေပါသည်။ နောက်တစ်ကြိမ် ထပ်စမ်းကြည့်ပါ။",
            };
          }
        });
      return phoneResponse;
    });
  } catch (err) {
    return {
      error: "Something went wrong. Please try again.",
      errorMM: "တစ်ခုခုမှားယွင်းနေပါသည်။ နောက်တစ်ကြိမ် ထပ်စမ်းကြည့်ပါ။",
      isSuccess: false,
    };
  }
}

export async function registerWithOTP(regData: any | RegisterType) {
  return await window.confirmationResult
    .confirm(regData.otp)
    .then(async (credential: any) => credential.user.getIdToken(true))
    .then((idToken: any) => {
      let result = fetch("/api/user", {
        method: "POST",
        body: JSON.stringify(regData),
      }).then((data) => {
        if (data.status === 200) {
          return { isSuccess: true, idToken };
        } else {
          return {
            isSuccess: false,
            error: "User already exists.",
            errorMM: "ဤဖုန်းတွင် အသုံးပြုသူရှိနှင့်ပြီးဖြစ်သည်။",
          };
        }
      });
      return result;
    })
    .catch((err: any) => {
      let errText = "";
      if (err.code) {
        let errCode = err.code.replace("auth/", "");
        if (errCode in authErrors) {
          errText = authErrors[errCode];
        } else {
          errText = "Something went wrong. Please try again.";
        }
      } else {
        errText = "Something went wrong. Please try again.";
      }
      return { isSuccess: false, error: errText };
    });
}

export async function loginWithOTP(data: any) {
  return await window.confirmationResult
    .confirm(data.otp)
    .then(async (credential: any) => credential.user.getIdToken(true))
    .then((idToken: any) => {
      return { isSuccess: true, idToken };
    })
    .catch((err: any) => {
      let errText = "";
      if (err.code) {
        let errCode = err.code.replace("auth/", "");
        if (errCode in authErrors) {
          errText = authErrors[errCode];
        } else {
          errText = "Something went wrong. Please try again.";
        }
      } else {
        errText = "Something went wrong. Please try again.";
      }
      return { isSuccess: false, error: errText };
    });
}

export async function verifyEmailLogin(email: string) {
  try {
    return fetch(
      "/api/user?isLogin=true&email=" + encodeURIComponent(email)
    ).then(async (res) => {
      if (res.status !== 200) {
        if (res.status === 403) {
          let json = await res.json();
          return {
            isSuccess: false,
            error: "This account is blocked. " + json.error,
            errorMM: "အကောင့်အပိတ်ခံထားရပါသည်။ " + json.error,
          };
        }
        if (res.status === 405) {
          let json = await res.json();
          return {
            isSuccess: false,
            error: json.error,
            errorMM: json.errorMM,
          };
        }
        return {
          isSuccess: false,
          error: "User not exists.",
          errorMM: "ဤဖုန်းတွင် အသုံးပြုသူမရှိပါ။",
        };
      }

      return {
        isSuccess: true,
      };
    });
  } catch (err) {
    return {
      error: "Something went wrong. Please try again.",
      errorMM: "တစ်ခုခုမှားယွင်းနေပါသည်။ နောက်တစ်ကြိမ် ထပ်စမ်းကြည့်ပါ။",
      isSuccess: false,
    };
  }
}
