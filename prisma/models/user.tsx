import { firebaseAdmin } from "@/lib/firebaseAdmin";
import { Exists, NotAvailable } from "@/types/ApiResponseTypes";
import { RoleNav } from "@/types/role";
import { Brand, Gender, Role } from "@prisma/client";
import { User } from "@prisma/client";
import prisma from "../prisma";

export const getAllUser = async (type?: any) => {
  let include: any = {
    state: true,
    district: true,
    township: true,
    userDefinedRole: true,
  };
  if (type === Role.Buyer) {
    include = { ...include, Order: true };
  }
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
        include,
      });
      return users;
    }
    const users = await prisma.user.findMany({
      where: {
        role: type,
      },
      include,
    });
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
  });
  return user;
};

export const getUserByPhone = async (phone: string) => {
  const user = await prisma.user.findUnique({
    where: {
      phoneNum: phone,
    },
  });
  return user;
};

export const createUser = async (email: string, username: string) => {
  const user = await prisma.user.create({
    data: {
      email: email,
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
      email: data.email!.toString(),
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
  if (d.password && d.password.length > 0) {
    let body = {
      password: d.password,
      providerToLink: {
        email: updateData.email,
        uid: updateData.email,
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

  delete updateData?.password;
  delete updateData?.confirmPassword;
  delete updateData?.note;
  delete updateData?.state;
  delete updateData?.district;
  delete updateData?.township;
  delete updateData?.RoyalPointHistory;
  if (firebaseRes.isSuccess === true) {
    const user = await prisma.user.update({
      where: {
        id: id,
      },
      data: { ...updateData },
    });
    return { isSuccess: true, error: "", data: user };
  } else {
    return { isSuccess: false, error: firebaseRes.error };
  }
};

async function deleteUserFirebase(phoneNum: string, id: string) {
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
    if (result.isSuccess) {
      const deleteUser = await prisma.user.delete({ where: { id: id } });
      return deleteUser;
    }
  }
}

export const deleteUser = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: { id: id },
  });
  if (user) {
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
  }
};
