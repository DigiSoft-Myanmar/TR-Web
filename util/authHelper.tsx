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

export function isBuyer(session: any) {
  if (session) {
    if (session.role === Role.Buyer || session.role === Role.Trader) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export function isSeller(session: any) {
  if (session) {
    if (session.role === Role.Seller || session.role === Role.Trader) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
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

export function hasPermission(session: any, permission: string) {
  if (isInternal(session)) {
    if (session.role === Role.Staff) {
      if (session.userDefinedRole.permission.find((z) => z === permission)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}
