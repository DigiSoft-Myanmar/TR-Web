import { Role } from "@prisma/client";

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
