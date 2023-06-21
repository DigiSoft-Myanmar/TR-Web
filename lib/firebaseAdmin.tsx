import * as admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";

export enum NotiType {
  ContactMsg = "ContactMsg",
  Feedback = "Feedback",
  NewUser = "NewUser",
  LowStock = "LowStock",
  NewSubscriber = "NewSubscriber",
  WishlistPriceChange = "WishListPriceChange",
  WishlistStockChange = "WishlistStockChange",
  WishlistAuctionStart = "WishlistAuctionStart",
  NewUserReview = "NewUserReview",
  NewProductReview = "NewProductReview",
  UpdateUserReview = "UpdateUserReview",
  UpdateProductReview = "UpdateProductReview",
  UpdateMembership = "UpdateMembership",
  AuctionPlaceBid = "AuctionPlaceBid",
  AuctionWon = "AuctionWon",
  AuctionEnded = "AuctionEnded",
  AuctionCancel = "AuctionCancel",
  AuctionWaiting = "AuctionWaiting",
  NewOrder = "SellOrder",
  NewProduct = "NewProduct",
  UpdateProduct = "UpdateProduct",
  UpdateOrder = "UpdateOrder",
  MembershipExpired = "MembershipExpired",
  MembershipNearExpired = "MembershipNearExpired",
  RemindOrder = "RemindOrder",
  CancelOrder = "CancelOrder",
  AdsLocationChanged = "AdsLocationChanged",
}

export interface Message {
  title: string;
  body: string;
  requireInteraction?: boolean;
  link?: string;
  type: NotiType;
  sender?: string;
  image?: string;
  sendList?: any[];
  createdTime: string;
}

const cert: ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY!.replace(
    /\\n/g,
    "\n"
  ),
};

export const firebaseAdmin =
  admin.apps[0] ??
  admin.initializeApp({
    credential: admin.credential.cert(cert),
  });

export const auth = firebaseAdmin.auth();

export async function sendFCMMessage(
  msg: Message,
  token: string
): Promise<string> {
  try {
    const res = await getMessaging().send({
      webpush: {
        notification: {
          ...msg,
          icon: "favicon.ico",
          requireInteraction: msg.requireInteraction ?? false,
          action: [
            {
              title: "Open",
              action: "open",
            },
          ],
          data: {
            link: msg.link,
            type: msg.type,
            sender: msg.sender,
            image: msg.image,
            sendList: msg.sendList,
            createdTime: msg.createdTime,
          },
        },
      },
      token: token,
    });
    return res;
  } catch (e) {
    console.error("send FCM Message error", e);
    return "Error";
  }
}
