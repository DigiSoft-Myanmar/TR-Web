const crypto = require("crypto");
const algorithm = "aes-256-cbc"; //Using AES encryption
const key = "gZ8wRTL5pxxJnTcH7yBt4qE9vXuSbF2b";
const key2 = "HZ8wXTL5pGxJnTSH7yBt4FE9vZuSbF2b";

const phoneKey = 5;

export function encryptPhone(phoneNumber: string) {
  if (phoneNumber) {
    const substitutionTable = {
      "0": "G",
      "1": "W",
      "2": "Q",
      "3": "X",
      "4": "L",
      "5": "R",
      "6": "P",
      "7": "M",
      "8": "K",
      "9": "T",
      "+": "Y",
    };

    let encryptedPhoneNumber = "";
    for (let i = 0; i < phoneNumber.length; i++) {
      const digit = phoneNumber[i];
      encryptedPhoneNumber += substitutionTable[digit];
    }
    return encryptedPhoneNumber;
  }
  return "";
}

export function decryptPhone(encryptedPhoneNumber: string) {
  const substitutionTable = {
    G: "0",
    W: "1",
    Q: "2",
    X: "3",
    L: "4",
    R: "5",
    P: "6",
    M: "7",
    K: "8",
    T: "9",
    Y: "+",
  };

  let decryptedPhoneNumber = "";
  for (let i = 0; i < encryptedPhoneNumber.length; i++) {
    const digit = encryptedPhoneNumber[i];
    decryptedPhoneNumber += substitutionTable[digit];
  }
  return decryptedPhoneNumber;
}

//Encrypting text
export function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}

// Decrypting text
export function decrypt(text: { iv: string; encryptedData: string }) {
  let iv = Buffer.from(text.iv, "hex");
  let encryptedText = Buffer.from(text.encryptedData, "hex");
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export function encryptPwd(text: string) {
  const iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key2), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}

// Decrypting text
export function decryptPwd(text: { iv: string; encryptedData: string }) {
  let iv = Buffer.from(text.iv, "hex");
  let encryptedText = Buffer.from(text.encryptedData, "hex");
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key2), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
