import React, { PureComponent } from "react";
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Prod001",
    Wastage: 590,
    Quantity: 800,
    Weight: 1400,
  },
  {
    name: "Prod002",
    Wastage: 868,
    Quantity: 967,
    Weight: 1506,
  },
  {
    name: "Prod003",
    Wastage: 1397,
    Quantity: 1098,
    Weight: 989,
  },
  {
    name: "Prod004",
    Wastage: 1480,
    Quantity: 1200,
    Weight: 1228,
  },
  {
    name: "Prod005",
    Wastage: 1520,
    Quantity: 1108,
    Weight: 1100,
  },
  {
    name: "Prod006",
    Wastage: 1400,
    Quantity: 680,
    Weight: 1700,
  },
  {
    name: "Prod007",
    Wastage: 1400,
    Quantity: 680,
    Weight: 1700,
  },
  {
    name: "Prod008",
    Wastage: 1400,
    Quantity: 680,
    Weight: 1700,
  },
  {
    name: "Prod009",
    Wastage: 1400,
    Quantity: 680,
    Weight: 1700,
  },
  {
    name: "Prod010",
    Wastage: 1400,
    Quantity: 680,
    Weight: 1700,
  },
];

export default function TopGraph() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        layout="vertical"
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" scale="band" />
        <Tooltip />
        <Legend />
        <Area dataKey="Weight" fill="#8884d8" stroke="#8884d8" />
        <Bar dataKey="Quantity" barSize={20} fill="#413ea0" />
        <Line dataKey="Wastage" stroke="#ff7300" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
