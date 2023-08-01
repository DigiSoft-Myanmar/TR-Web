import { NextApiRequest } from "next";

const util = require("util");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

interface NextConnectApiRequest extends NextApiRequest {
  files: Express.Multer.File[];
}

var storage = new GridFsStorage({
  url: process.env.NEXT_PUBLIC_MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req: NextConnectApiRequest, file: any) => {
    const match = [
      "image/png",
      "image/jpeg",
      "image/apng",
      "image/avif",
      "image/gif",
      "image/svg+xml",
      "image/webp",
      "image/bmp",
      "image/x-icon",
      "image/tiff",
    ];

    return {
      bucketName: process.env.NEXT_PUBLIC_IMG_BUCKET,
      filename: `${Date.now()}-${encodeURIComponent(file.originalname)}`,
    };
  },
});

// export var uploadFiles = multer({ storage: storage }).array("theFiles", 10);
export var uploadFiles = multer({ storage: storage });
// var uploadFiles = multer({ storage: storage }).single("file");
export var uploadFilesMiddleware = util.promisify(
  uploadFiles.array("theFiles", 10)
);
