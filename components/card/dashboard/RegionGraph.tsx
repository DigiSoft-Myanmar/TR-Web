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
    name: "Kachin",
    uv: 590,
    pv: 800,
    amt: 1400,
  },
  {
    name: "Kayah",
    uv: 868,
    pv: 967,
    amt: 1506,
  },
  {
    name: "Kayin",
    uv: 1397,
    pv: 1098,
    amt: 989,
  },
  {
    name: "Chin",
    uv: 1480,
    pv: 1200,
    amt: 1228,
  },
  {
    name: "Mon",
    uv: 1520,
    pv: 1108,
    amt: 1100,
  },
  {
    name: "Rakhine",
    uv: 1400,
    pv: 680,
    amt: 1700,
  },
  {
    name: "Shan",
    uv: 1400,
    pv: 680,
    amt: 1700,
  },
  {
    name: "Yangon",
    uv: 1400,
    pv: 680,
    amt: 1700,
  },
  {
    name: "Mandalay",
    uv: 1400,
    pv: 680,
    amt: 1700,
  },
  {
    name: "Bago",
    uv: 1400,
    pv: 680,
    amt: 1700,
  },
  {
    name: "Ayeyawaddy",
    uv: 1400,
    pv: 680,
    amt: 1700,
  },
  {
    name: "Sagaing",
    uv: 1400,
    pv: 680,
    amt: 1700,
  },
  {
    name: "Magway",
    uv: 1400,
    pv: 680,
    amt: 1700,
  },
  {
    name: "Tanintharyi",
    uv: 1400,
    pv: 680,
    amt: 1700,
  },
];

export default function RegionGraph() {
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
        {/* <Area dataKey="amt" fill="#8884d8" stroke="#8884d8" /> */}
        <Bar dataKey="pv" barSize={20} fill="#413ea0" />
        {/* <Line dataKey="uv" stroke="#ff7300" /> */}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
