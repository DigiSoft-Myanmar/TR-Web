import { Colors } from "@/types/color";
import { formatAmount } from "@/util/textHelper";
import React, { PureComponent } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "07-May-2023 (Mon)",
    Active: 300,
    Purchased: 100,
  },
  {
    name: "08-May-2023 (Tue)",
    Active: 100,
    Purchased: 50,
  },
  {
    name: "09-May-2023 (Wed)",
    Active: 300,
    Purchased: 100,
  },
  {
    name: "10-May-2023 (Thu)",
    Active: 200,
    Purchased: 100,
  },
  {
    name: "11-May-2023 (Fri)",
    Active: 100,
    Purchased: 100,
  },
  {
    name: "12-May-2023 (Sat)",
    Active: 300,
    Purchased: 50,
  },
  {
    name: "13-May-2023 (Sun)",
    Active: 200,
    Purchased: 10,
  },
];

export default function WeeklySiteVisitGraph({ data }: { data: any }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        width={500}
        height={400}
        data={data.map((z: any) => {
          return {
            name: new Date(z.date).toLocaleDateString("en-ca", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              weekday: "short",
            }),
            Active: z.activeStats,
            Purchased: z.purchasedStats,
          };
        })}
        margin={{
          top: 10,
          right: 0,
          left: 0,
          bottom: -30,
        }}
      >
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis dataKey="name" display={"none"} />
        {/* <YAxis /> */}
        <Tooltip
          formatter={(value) => {
            return formatAmount(Number(value), "en");
          }}
        />
        <Area
          type="monotone"
          dataKey="Active"
          stackId="1"
          stroke="#8884d8"
          fill="#8884d8"
        />
        <Area
          type="monotone"
          dataKey="Purchased"
          stackId="0"
          stroke={Colors.primary}
          fill={Colors.primary}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
