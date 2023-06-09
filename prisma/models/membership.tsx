import { Membership, Role } from "@prisma/client";
import prisma from "../prisma";

export const getAllMemberships = async () => {
  const memberships: any = await prisma.membership.findMany({});
  for (let i = 0; i < memberships.length; i++) {
    const brandCount = await prisma.user.count({
      where: {
        membershipId: memberships[i].id,
      },
    });
    memberships[i].brandCount = brandCount;
  }
  return memberships;
};

export const getMembershipById = async (id: string) => {
  const membership = await prisma.membership.findUnique({
    where: {
      id: id,
    },
  });
  return membership;
};

export const getMembershipByName = async (name: string) => {
  const membership = await prisma.membership.findFirst({
    where: {
      name: name,
    },
  });
  return membership;
};

export const createMembership = async (membershipInfo: Membership) => {
  try {
    let newMembership = await prisma.membership.create({
      data: membershipInfo,
    });
    return newMembership;
  } catch (err: any) {
    console.log(err);
  }
};

export const updateMembership = async (
  id: string,
  membershipInfo: Membership
) => {
  const newMembership = await prisma.membership.update({
    where: {
      id: id,
    },
    data: membershipInfo,
  });
  return newMembership;
};

export const deleteMembership = async (id: string) => {
  const membership = await prisma.membership.delete({ where: { id: id } });
  return membership;
};
