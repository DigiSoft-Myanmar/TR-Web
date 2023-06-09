import { Configuration } from "@prisma/client";
import prisma from "../prisma";

export const getConfiguration = async () => {
  const configuration = await prisma.configuration.findFirst({});
  return configuration;
};

export const modifyConfiguration = async (data: Configuration) => {
  const d = await getConfiguration();
  if (d) {
    let update = await prisma.configuration.update({
      where: { id: d.id },
      data: data,
    });
    return update;
  } else {
    let update = await prisma.configuration.create({ data: data });
    return update;
  }
};
