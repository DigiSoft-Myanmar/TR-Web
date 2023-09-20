import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { Exists, NotAvailable, Unauthorized } from "@/types/ApiResponseTypes";
import { RoleNav } from "@/types/role";
import { Brand, Gender, Role } from "@prisma/client";
import { User } from "@prisma/client";
import prisma from "../prisma";
import { hasPermission } from "@/util/authHelper";
import {
  BuyerPermission,
  SellerPermission,
  StaffPermission,
  TraderPermission,
} from "@/types/permissionTypes";

export const getAllUser = async (type?: any) => {
  let include: any = {
    state: true,
    district: true,
    township: true,
    userDefinedRole: true,
  };
  include = { ...include, Order: true, currentMembership: true };

  if (type) {
    if (type === RoleNav.Subscribe) {
      const users = await prisma.subscribe.findMany({});
      return users;
    }
    if (type === RoleNav.Banned) {
      const users = await prisma.user.findMany({
        where: {
          isBlocked: true,
        },
        include: include,
      });
      return users;
    }
    if (type === RoleNav.Deleted) {
      const users = await prisma.user.findMany({
        where: {
          isDeleted: true,
        },
        include: include,
      });
      return users;
    }
    if (type === RoleNav.Inactive) {
      let date = new Date();
      date.setMonth(date.getMonth() - 2);
      const users = await prisma.user.findMany({
        where: {
          lastLogin: date,
        },
        include: include,
      });
      return users;
    }
    if (type === RoleNav.Staff) {
      const users = await prisma.user.findMany({
        where: {
          role: Role.Staff,
        },
        include: include,
      });
      return users;
    }
    const users: any = await prisma.user.findMany({
      where: {
        role: type,
      },
      include: include,
    });
    if (type === Role.Seller || type === Role.Trader) {
      for (let i = 0; i < users.length; i++) {
        let prodCount = await prisma.product.count({
          where: { sellerId: users[i].id },
        });
        users[i].prodCount = prodCount;
      }
    }
    return users;
  } else {
    const users = await prisma.user.findMany({
      include: include,
    });
    return users;
  }
};

export const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return user;
};

export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      userDefinedRole: true,
      currentMembership: true,
    },
  });

  return user;
};

export const getUserByPhone = async (phone: string) => {
  const user = await prisma.user.findUnique({
    where: {
      phoneNum: phone,
    },
    include: {
      userDefinedRole: true,
      currentMembership: true,
    },
  });
  return user;
};

export const createUser = async (email: string, username: string) => {
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      username: username,
      role: Role.Admin,
      gender: Gender.Male,
    },
  });
  return user;
};

export const createSeller = async (data: any) => {
  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email!.toString().toLowerCase(),
      phoneNum: data.phoneNum!.toString(),
      ...data,
    },
  });

  return user;
};

export const createBuyer = async (data: any) => {
  const user = await prisma.user.create({
    data: {
      username: data.username,
      role: Role.Buyer,
      phoneNum: data.phoneNum!.toString(),
      ...data,
    },
  });
  return user;
};

export const updateUser = async (id: string, updateData: any) => {
  let d = { ...updateData };
  let firebaseRes = { isSuccess: true, error: "" };
  if (d.email) {
    d.email = d.email.toLowerCase();
  }

  if (updateData && updateData.newPhoneNum === d.phoneNum) {
    if (d.password && d.password.length > 0) {
      let body = {
        password: d.password,
        providerToLink: {
          email: d.email,
          uid: d.email,
          providerId: "email",
        },
      };

      let user = await firebaseAdmin.auth().getUserByPhoneNumber(d.phoneNum);
      firebaseRes = await firebaseAdmin
        .auth()
        .updateUser(user.uid, body)
        .then((data) => {
          console.log("Successfully updated user", data.toJSON());

          return { isSuccess: true, error: "" };
        })
        .catch((err) => {
          console.log("Error updating user:", err);
          return { isSuccess: false, error: err };
        });
    }
  } else {
    let deleteUser = await deleteUserFirebase(d.phoneNum);
    if (deleteUser.isSuccess === true) {
      try {
        let body = {
          email: d.email,
          emailVerified: false,
          phoneNumber: d.newPhoneNum,
          password: d.password,
          disabled: false,
        };
        let result = await firebaseAdmin.auth().createUser(body);
        d.phoneNum = d.newPhoneNum;
        console.log(result);
      } catch (err) {
        console.log(err);
      }
    }
  }

  delete d?.newPhoneNum;
  delete d?.password;
  delete d?.confirmPassword;
  delete d?.note;
  delete d?.state;
  delete d?.district;
  delete d?.township;
  delete d?.currentMembership;
  delete d?.userDefinedRole;
  if (firebaseRes.isSuccess === true) {
    const user = await prisma.user.update({
      where: {
        id: id,
      },
      data: { ...d },
    });
    return { isSuccess: true, error: "", data: user };
  } else {
    return { isSuccess: false, error: firebaseRes.error };
  }
};

async function deleteUserFirebase(phoneNum: string) {
  try {
    let u = await firebaseAdmin.auth().getUserByPhoneNumber(phoneNum);
    if (u) {
      let result = await firebaseAdmin
        .auth()
        .deleteUser(u.uid)
        .then((data) => {
          console.log("Successfully deleted user");
          return { isSuccess: true, error: "" };
        })
        .catch((err) => {
          console.log("Error updating user:", err);
          return { isSuccess: false, error: err };
        });
      return result;
    } else {
      return { isSuccess: true, error: "" };
    }
  } catch (e) {
    return { isSuccess: true, error: "" };
  }
}

export const deleteUser = async (id: string, session: any) => {
  const user = await prisma.user.findFirst({
    where: { id: id },
  });
  if (user) {
    if (
      session.role === Role.Staff &&
      user.role === Role.Buyer &&
      !hasPermission(session, BuyerPermission.buyerDeleteAllow)
    ) {
      return { success: false, data: Unauthorized, status: 401 };
    }

    if (
      session.role === Role.Staff &&
      user.role === Role.Seller &&
      !hasPermission(session, SellerPermission.sellerDeleteAllow)
    ) {
      return { success: false, data: Unauthorized, status: 401 };
    }

    if (
      session.role === Role.Staff &&
      user.role === Role.Trader &&
      !hasPermission(session, TraderPermission.traderDeleteAllow)
    ) {
      return { success: false, data: Unauthorized, status: 401 };
    }

    if (
      session.role === Role.Staff &&
      user.role === Role.Staff &&
      !hasPermission(session, StaffPermission.staffDeleteAllow)
    ) {
      return { success: false, data: Unauthorized, status: 401 };
    }

    await prisma.user.update({
      where: { id: id },
      data: {
        isDeleted: true,
      },
    });
    return { success: true };
  } else {
    return { success: false, data: NotAvailable };
  }
  /* if (user) {
    if (user.role === Role.Buyer) {
      const orders = await prisma.order.count({
        where: {
          orderByUserId: id,
        },
      });
      if (orders > 0) {
        return { success: false, data: Exists };
      } else {
        await deleteUserFirebase(user.phoneNum!, id);
        return { success: true, data: user };
      }
    } else if (user.role === Role.Seller || user.role === Role.Trader) {
      const prodCount = await prisma.product.count({
        where: {
          sellerId: user.id,
        },
      });
      if (prodCount > 0) {
        return { success: false, data: Exists };
      } else {
        await deleteUserFirebase(user.phoneNum!, id);
        return { success: true, data: user };
      }
    } else {
      await deleteUserFirebase(user.phoneNum!, id);
      return { success: true, data: user };
    }
  } else {
    return { success: false, data: NotAvailable };
  } */
};
