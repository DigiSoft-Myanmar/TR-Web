import Swal from "sweetalert2";

export function showErrorDialog(
  error?: string,
  errorMM?: string,
  locale?: string,
  confirmFn?: Function
) {
  Swal.fire({
    icon: "error",
    text: locale === "mm" && errorMM && errorMM.length > 0 ? errorMM : error,
    background: "#fff",
    color: "#262630",
    confirmButtonColor: "#DE711B",
  }).then((result) => {
    if (confirmFn) {
      confirmFn();
    }
  });
}

export function showUnauthorizedDialog(locale?: string, confirmFn?: Function) {
  Swal.fire({
    icon: "error",
    text: locale === "mm" ? "လော့အင်မ၀င်ရသေးပါ။" : "Please login and continue",
    background: "#fff",
    color: "#262630",
    confirmButtonColor: "#DE711B",
  }).then((result) => {
    if (confirmFn) {
      confirmFn();
    }
  });
}

export function showInfoDialog(
  text?: string,
  textMM?: string,
  locale?: string,
  confirmFn?: Function
) {
  Swal.fire({
    icon: "info",
    text: locale === "mm" && textMM && textMM.length > 0 ? textMM : text,
    background: "#fff",
    color: "#262630",
    confirmButtonColor: "#DE711B",
  }).then((result) => {
    if (result.isConfirmed) {
      if (confirmFn) {
        confirmFn();
      }
    }
  });
}

export function showSuccessDialog(
  text?: string,
  textMM?: string,
  locale?: string,
  confirmFn?: Function
) {
  Swal.fire({
    icon: "success",
    text: locale === "mm" && textMM && textMM.length > 0 ? textMM : text,
    background: "#fff",
    color: "#262630",
    confirmButtonColor: "#DE711B",
  }).then((result) => {
    if (result.isConfirmed) {
      if (confirmFn) {
        confirmFn();
      }
    }
  });
}

export function showSuccessHTMLDialog(html?: string, confirmFn?: Function) {
  Swal.fire({
    icon: "success",
    html: html,
    background: "#fff",
    color: "#262630",
    confirmButtonColor: "#DE711B",
  }).then((result) => {
    if (result.isConfirmed) {
      if (confirmFn) {
        confirmFn();
      }
    }
  });
}

export function showErrorHTMLDialog(html?: string, confirmFn?: Function) {
  Swal.fire({
    icon: "error",
    html: html,
    background: "#fff",
    color: "#262630",
    confirmButtonColor: "#DE711B",
  }).then((result) => {
    if (result.isConfirmed) {
      if (confirmFn) {
        confirmFn();
      }
    }
  });
}

export function showWarningDialog(
  text?: string,
  textMM?: string,
  locale?: string,
  confirmFn?: Function
) {
  Swal.fire({
    icon: "warning",
    text:
      locale && locale === "mm" && textMM && textMM.length > 0 ? textMM : text,
    background: "#fff",
    color: "#262630",
    confirmButtonColor: "#DE711B",
  }).then((result) => {
    if (result.isConfirmed) {
      if (confirmFn) {
        confirmFn();
      }
    }
  });
}

export function showConfirmationDialog(
  text?: string,
  textMM?: string,
  locale?: string,
  confirmFn?: Function
) {
  Swal.fire({
    icon: "question",
    text:
      locale && locale === "mm" && textMM && textMM.length > 0 ? textMM : text,
    background: "#fff",
    color: "#262630",
    reverseButtons: true,
    confirmButtonColor: "#DE711B",
    confirmButtonText: "Ok",
    showCancelButton: true,
  }).then((result) => {
    if (result.isConfirmed) {
      if (confirmFn) {
        confirmFn();
      }
    }
  });
}

export async function showInputDialog(
  text?: string,
  textMM?: string,
  locale?: string
) {
  const { value } = await Swal.fire({
    text:
      locale && locale === "mm" && textMM && textMM.length > 0 ? textMM : text,
    input: "text",
    background: "#fff",
    color: "#262630",
    reverseButtons: true,
    confirmButtonColor: "#DE711B",
    confirmButtonText: locale === "mm" ? "ရှေ့ဆက်ရန်" : "Continue",
    showCancelButton: true,
  });
  return value;
}
