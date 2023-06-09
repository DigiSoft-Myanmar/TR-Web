import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      phoneNum?: string | undefined;
      uid?: string | undefined;
      role: Role;
    } & DefaultSession["user"];
  }
}
