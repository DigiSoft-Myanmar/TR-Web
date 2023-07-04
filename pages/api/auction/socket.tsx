import { Server } from "socket.io";
import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import useAuth from "@/hooks/useAuth";
import prisma from "@/prisma/prisma";
import { isInternal } from "@/util/authHelper";
import { addNotification } from "@/util/notiHelper";

export default async function SocketHandler(req: NextApiRequest, res: any) {
  try {
    if (res.socket.server.io) {
      console.log("Server already started.");
      res.end();
      return;
    }
    const io = new Server(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
    });
    res.socket.server.io = io;
    let url: any = process.env.NEXT_PUBLIC_MONGODB_URI;
    const client = await MongoClient.connect(url);
    const collection = client.db().collection("Auctions");

    const stream = collection.watch();

    io.on("connection", async (socket) => {
      const connectedClients = io.sockets.sockets;
      console.log("Connected clients:", connectedClients.size);

      stream.on("change", async (change: any) => {
        let id: any = change.fullDocument._id.toString();

        let d = await prisma.auctions.findFirst({
          where: {
            id: id,
          },
          include: {
            product: true,
            createdBy: {
              include: {
                NotiToken: true,
              },
            },
          },
        });

        if (d && d.createdBy && d.createdBy.NotiToken) {
          let token = d.createdBy.NotiToken;
          await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            body: JSON.stringify({
              to: token,
              title: "Treasure Rush",
              body: "",
            }),
          });
        }
        socket.emit("newBid", d);
      });

      socket.on("disconnect", () => {
        // Handle client disconnection logic here
        console.log("A client has disconnected");

        // Get the updated count of connected clients after disconnection
        const connectedClients = io.sockets.sockets.size;
        console.log("Connected clients:", connectedClients);
      });
    });

    console.log("Setting Socket");
    res.end();
  } catch (err) {
    console.log(err);
    res.end();
  }
}
