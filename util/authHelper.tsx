import { Role, User } from "@prisma/client";

export function isInternal(session: any, isDisableStaff?: boolean) {
  if (session) {
    if (
      session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin
    ) {
      if (isDisableStaff === true && session.role === Role.Staff) {
        return false;
      }
      return true;
    }
    return false;
  }
  return false;
}

export function getHeaders(session: User) {
  if (session) {
    if (session.email) {
      return {
        appid: session.email,
        appsecret: session.id,
        apptype: "email",
      };
    }
    if (session.phoneNum) {
      return {
        appid: session.phoneNum,
        appsecret: session.id,
        apptype: "phone",
      };
    }
  } else {
    return null;
  }
}
