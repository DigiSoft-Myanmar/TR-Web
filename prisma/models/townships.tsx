import prisma from "../prisma";

export const getAllTownships = async () => {
  const states = await prisma.state.findMany({
    include: {
      districts: {
        include: {
          townships: true,
        },
      },
    },
  });
  return states;
};
