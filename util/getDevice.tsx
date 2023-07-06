export function getDevice() {
  let databrowser = [
    { name: "Chrome", value: "Chrome", version: "Chrome" },
    { name: "Firefox", value: "Firefox", version: "Firefox" },
    { name: "Safari", value: "Safari", version: "Version" },
    { name: "Internet Explorer", value: "MSIE", version: "MSIE" },
    { name: "Opera", value: "Opera", version: "Opera" },
    { name: "BlackBerry", value: "CLDC", version: "CLDC" },
    { name: "Mozilla", value: "Mozilla", version: "Mozilla" },
  ];

  let dataos = [
    {
      name: "Windows Phone",
      value: "Windows Phone",
      version: "OS",
      isMobile: true,
    },
    { name: "Windows", value: "Win", version: "NT", isMobile: false },
    { name: "iPhone", value: "iPhone", version: "OS", isMobile: true },
    { name: "iPad", value: "iPad", version: "OS", isMobile: true },
    { name: "Kindle", value: "Silk", version: "Silk", isMobile: true },
    { name: "Android", value: "Android", version: "Android", isMobile: true },
    { name: "PlayBook", value: "PlayBook", version: "OS", isMobile: true },
    { name: "BlackBerry", value: "BlackBerry", version: "/", isMobile: true },
    { name: "Macintosh", value: "Mac", version: "OS X", isMobile: false },
    { name: "Linux", value: "Linux", version: "rv", isMobile: false },
    { name: "Palm", value: "Palm", version: "PalmOS", isMobile: true },
  ];

  let header = [
    navigator.platform,
    navigator.userAgent,
    navigator.appVersion,
    navigator.vendor,
  ];

  var agent = header.join(" "),
    os = matchItem(agent, dataos),
    browser = matchItem(agent, databrowser);

  return {
    os: os,
    browser: browser,
    isMobile: dataos.find((e) => e.name === os.name)
      ? dataos.find((e) => e.name === os.name)!.isMobile
      : false,
  };
}

export function getMobileOperatingSystem(device: any) {
  if (device?.isMobile === true) {
    const userAgent = navigator.userAgent || navigator.vendor;

    if (/android/i.test(userAgent)) {
      // User is on Android
      return "android";
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      // User is on iOS
      return "ios";
    }
  } else {
    return "unknown";
  }
}

function matchItem(string: string, data: any) {
  var i = 0,
    j = 0,
    html = "",
    regex,
    regexv,
    match,
    matches: any,
    version;

  for (i = 0; i < data.length; i += 1) {
    regex = new RegExp(data[i].value, "i");
    match = regex.test(string);
    if (match) {
      regexv = new RegExp(data[i].version + "[- /:;]([\\d._]+)", "i");
      matches = string.match(regexv);
      version = "";
      if (matches) {
        if (matches[1]) {
          matches = matches[1];
        }
      }
      if (matches) {
        matches = matches.split(/[._]+/);
        for (j = 0; j < matches.length; j += 1) {
          if (j === 0) {
            version += matches[j] + ".";
          } else {
            version += matches[j];
          }
        }
      } else {
        version = "0";
      }
      return {
        name: data[i].name,
        version: parseFloat(version),
      };
    }
  }
  return {
    name: "unknown",
    version: 0,
  };
}
