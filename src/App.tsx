"use client";

import { useMemo, useState } from "react";
import financeiro from "@/data/relatorio_por_apartamento.json";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
} from "lucide-react";

type MonthData = {
  month: string;
  entry: number;
  taxes: number;
  aluguel: number;
  total: number;
};

type FinanceiroType = {
  [key: string]: MonthData[];
};

const data: FinanceiroType = financeiro;

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-white p-4 shadow-lg text-sm space-y-1">
      <p className="font-semibold text-base mb-2">{label}</p>

      <div className="flex justify-between">
        <span>Entrada:</span>
        <span className="font-medium text-emerald-600">
          {fmt(data.entry)}
        </span>
      </div>

      <div className="flex justify-between">
        <span>Taxas:</span>
        <span>{fmt(data.taxes)}</span>
      </div>

      <div className="flex justify-between">
        <span>Aluguel:</span>
        <span>{fmt(data.aluguel)}</span>
      </div>

      <div className="flex justify-between border-t pt-2 font-semibold">
        <span>Total Saídas:</span>
        <span className="text-red-600">
          {fmt(data.total)}
        </span>
      </div>
    </div>
  );
};


export default function Dashboard() {
  const [selected, setSelected] = useState<string>("all");

  const apartamentos = Object.keys(data);

  // =========================
  // RESUMO GERAL (SEMPRE TODOS)
  // =========================
  const resumo = useMemo(() => {
  let totalEntry = 0;
  let totalExpenses = 0;
  let totalMonths = 0;

  const apartamentosCalculo =
    selected === "all" ? apartamentos : [selected];

  apartamentosCalculo.forEach((apto) => {
    data[apto].forEach((m) => {
      totalEntry += m.entry;
      totalExpenses += m.total;
    });
    totalMonths += data[apto].length;
  });

  const balance = totalEntry - totalExpenses;
  const avgEntry = totalMonths > 0 ? totalEntry / totalMonths : 0;

  return { totalEntry, totalExpenses, balance, avgEntry };
}, [selected, apartamentos]);


  // =========================
  // FILTRO VISUAL
  // =========================
  const apartamentosExibir =
    selected === "all" ? apartamentos : [selected];

  return (
    <div className="min-h-screen w-screen bg-background p-4 md:p-8">
      <div className="mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard Financeiro
            </h1>
            <p className="text-muted-foreground">
              Resumo de entradas e saídas por mês
            </p>
          </div>

          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-50 bg-white">
              <SelectValue placeholder="Selecionar apartamento" className="bg-white"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="bg-white" value="all">Todos</SelectItem>
              {apartamentos.map((apto) => (
                <SelectItem className="bg-white" key={apto} value={apto}>
                  {apto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cards Resumo */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Total Entradas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {fmt(resumo.totalEntry)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Total Saídas
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {fmt(resumo.totalExpenses)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Saldo
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {fmt(resumo.balance)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Média Mensal
              </CardTitle>
              <BarChart3 className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {fmt(resumo.avgEntry)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos por apartamento */}
{apartamentosExibir.map((apto) => {
  const chartConfig: ChartConfig = {
    entry: {
      label: "Entrada",
      color: "#22c55e",
    },
    total: {
      label: "Saída",
      color: "#ef4444",
    },
  };

  return (
    <Card key={apto}>
      <CardHeader>
        <CardTitle>{apto}</CardTitle>
        <CardDescription>Comparativo mensal</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[350px] w-full"
        >
          <BarChart data={data[apto]}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

            <YAxis
              tickFormatter={(v) =>
                `R$${(v / 1000).toFixed(0)}k`
              }
            />

            <ChartTooltip
              content={<CustomTooltip />}
            />

            <Bar
              dataKey="entry"
              fill="var(--color-entry)"
              radius={6}
            />

            <Bar
              dataKey="total"
              fill="var(--color-total)"
              radius={6}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
})}

      </div>
    </div>
  );
}
