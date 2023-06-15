export enum AdsLocation {
  HomeAds1 = "Home Ad 1",
  HomeAds21 = "Home Ad 2-1",
  HomeAds22 = "Home Ad 2-2",
  HomeAds31 = "Home Ad 3-1",
  HomeAds32 = "Home Ad 3-2",
  HomeAds33 = "Home Ad 3-3",
  HomeAds34 = "Home Ad 3-4",
  HomeAds41 = "Home Ad 4-1",
  HomeAds42 = "Home Ad 4-2",
  HomeAds43 = "Home Ad 4-3",
  HomeAds44 = "Home Ad 4-4",

  ProductAds11 = "Product Ad 1-1",
  ProductAds12 = "Product Ad 1-2",
  ProductAds21 = "Product Ad 2-1",
  ProductAds22 = "Product Ad 2-2",
  ProductAds23 = "Product Ad 2-3",
  ProductAds24 = "Product Ad 2-4",

  Marketplace1 = "Marketplace Ad 1",
  Marketplace21 = "Marketplace Ad 2-1",
  Marketplace22 = "Marketplace Ad 2-2",
  Marketplace23 = "Marketplace Ad 2-3",
  Marketplace24 = "Marketplace Ad 2-4",

  Memberships1 = "Membership Ad 1",
}

export enum AdsPage {
  Home = "Home Page",
  Product = "Product Page",
  Marketplace = "Marketplace Page",
  Membership = "Membership Page",
}

export function getImageResolution(imageUrl: string) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = function () {
      const resolution = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      resolve(resolution);
    };

    img.onerror = function () {
      reject(new Error("Failed to load image."));
    };

    img.src = imageUrl;
  });
}

export function getImageResolutionFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();

      img.onload = function () {
        const resolution = {
          width: img.naturalWidth,
          height: img.naturalHeight,
        };

        resolve(resolution);
      };

      img.onerror = function () {
        reject(new Error("Failed to load image."));
      };

      //img.src = e.target.result;
    };

    reader.onerror = function () {
      reject(new Error("Failed to read file."));
    };

    reader.readAsDataURL(file);
  });
}

export function getImageSizeFromFileInput(fileInput) {
  return new Promise((resolve, reject) => {
    const file = fileInput.files[0];

    if (!file) {
      reject(new Error("No file selected."));
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    const img = new Image();

    img.onload = function () {
      const size = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      URL.revokeObjectURL(imageUrl);

      resolve(size);
    };

    img.onerror = function () {
      URL.revokeObjectURL(imageUrl);

      reject(new Error("Failed to load image."));
    };

    img.src = imageUrl;
  });
}
