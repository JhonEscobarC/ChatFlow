"use client"

import { agents, contacts, productSalesData, agentSalesData } from "@/lib/data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts"
import { useMemo, useCallback } from "react"
import { FileDown } from "lucide-react"

const agentPerformance = [
  { name: "Carlos M.", resolved: 45, pending: 5, satisfaction: 96 },
  { name: "Laura G.", resolved: 38, pending: 3, satisfaction: 94 },
  { name: "Miguel T.", resolved: 28, pending: 2, satisfaction: 91 },
  { name: "Ana R.", resolved: 52, pending: 4, satisfaction: 97 },
  { name: "Diego H.", resolved: 15, pending: 1, satisfaction: 89 },
]

const responseTimeData = [
  { hour: "8am", time: 2.1 },
  { hour: "9am", time: 3.5 },
  { hour: "10am", time: 4.2 },
  { hour: "11am", time: 3.8 },
  { hour: "12pm", time: 5.1 },
  { hour: "1pm", time: 4.6 },
  { hour: "2pm", time: 3.2 },
  { hour: "3pm", time: 2.8 },
  { hour: "4pm", time: 3.9 },
  { hour: "5pm", time: 2.5 },
]

const statusLabelMap: Record<string, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  cerrado: "Cerrado",
  seguimiento: "Seguimiento",
  asesorando: "Asesorando",
}

const statusBarColorMap: Record<string, string> = {
  Activo: "hsl(152 60% 42%)",
  Inactivo: "hsl(0 72% 56%)",
  Cerrado: "hsl(220 15% 65%)",
  Seguimiento: "hsl(38 92% 50%)",
  Asesorando: "hsl(200 70% 50%)",
}

export function ReportsView() {
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of contacts) {
      const label = statusLabelMap[c.status] || c.status
      counts[label] = (counts[label] || 0) + 1
    }
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      fill: statusBarColorMap[status] || "hsl(152 60% 42%)",
    }))
  }, [])

  const totalResolved = agentPerformance.reduce((a, b) => a + b.resolved, 0)
  const totalPending = agentPerformance.reduce((a, b) => a + b.pending, 0)
  const avgSatisfaction =
    agentPerformance.reduce((a, b) => a + b.satisfaction, 0) /
    agentPerformance.length

  const totalProductsSold = productSalesData.reduce((a, b) => a + b.vendidos, 0)
  const totalRevenue = agentSalesData.reduce((a, b) => a + b.ingresos, 0)

  const handleGeneratePDF = useCallback(() => {
    const now = new Date()
    const dateStr = now.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const timeStr = now.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const statusCounts: Record<string, number> = {}
    for (const c of contacts) {
      const label = statusLabelMap[c.status] || c.status
      statusCounts[label] = (statusCounts[label] || 0) + 1
    }

    let content = ""
    content += "=".repeat(60) + "\n"
    content += "           REPORTE GENERAL - ChatFlow CRM\n"
    content += "=".repeat(60) + "\n\n"
    content += `Fecha: ${dateStr}\n`
    content += `Hora: ${timeStr}\n\n`

    content += "-".repeat(40) + "\n"
    content += "RESUMEN GENERAL\n"
    content += "-".repeat(40) + "\n"
    content += `Conversaciones resueltas: ${totalResolved}\n`
    content += `Pendientes: ${totalPending}\n`
    content += `Satisfaccion promedio: ${avgSatisfaction.toFixed(1)}%\n`
    content += `Agentes activos: ${agents.filter((a) => a.status === "online").length}/${agents.length}\n`
    content += `Total productos vendidos: ${totalProductsSold}\n`
    content += `Ingresos totales agentes: $${totalRevenue.toLocaleString()}\n\n`

    content += "-".repeat(40) + "\n"
    content += "DISTRIBUCION POR ESTADO\n"
    content += "-".repeat(40) + "\n"
    for (const [status, count] of Object.entries(statusCounts)) {
      content += `  ${status}: ${count} contactos\n`
    }
    content += "\n"

    content += "-".repeat(40) + "\n"
    content += "PRODUCTOS VENDIDOS (Ropa)\n"
    content += "-".repeat(40) + "\n"
    for (const p of productSalesData) {
      content += `  ${p.product.padEnd(15)} ${String(p.vendidos).padStart(5)} uds   $${p.ingresos.toLocaleString()}\n`
    }
    content += "\n"

    content += "-".repeat(40) + "\n"
    content += "VENTAS POR AGENTE\n"
    content += "-".repeat(40) + "\n"
    for (const a of agentSalesData) {
      content += `  ${a.agent.padEnd(15)} ${String(a.ventas).padStart(5)} ventas   $${a.ingresos.toLocaleString()}\n`
    }
    content += "\n"

    content += "-".repeat(40) + "\n"
    content += "DESEMPENO POR AGENTE\n"
    content += "-".repeat(40) + "\n"
    for (const a of agentPerformance) {
      content += `  ${a.name.padEnd(15)} Resueltas: ${String(a.resolved).padStart(3)}  Pendientes: ${a.pending}  Satisfaccion: ${a.satisfaction}%\n`
    }
    content += "\n"
    content += "=".repeat(60) + "\n"
    content += "           Generado por ChatFlow CRM\n"
    content += "=".repeat(60) + "\n"

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `reporte-chatflow-${now.toISOString().split("T")[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [totalResolved, totalPending, avgSatisfaction, totalProductsSold, totalRevenue])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
          <p className="text-sm text-muted-foreground">
            Analiza el desempeno de tu equipo y las metricas del CRM
          </p>
        </div>
        <Button
          onClick={handleGeneratePDF}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <FileDown className="h-4 w-4" />
          Generar reporte
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-sm text-muted-foreground">
            Conversaciones resueltas
          </span>
          <p className="mt-1 text-3xl font-bold text-card-foreground">
            {totalResolved}
          </p>
          <p className="mt-1 text-xs text-primary">Esta semana</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-sm text-muted-foreground">Pendientes</span>
          <p className="mt-1 text-3xl font-bold text-card-foreground">
            {totalPending}
          </p>
          <p className="mt-1 text-xs text-amber-500">Requieren atencion</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-sm text-muted-foreground">
            Productos vendidos
          </span>
          <p className="mt-1 text-3xl font-bold text-card-foreground">
            {totalProductsSold}
          </p>
          <p className="mt-1 text-xs text-primary">Total unidades</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-sm text-muted-foreground">Agentes activos</span>
          <p className="mt-1 text-3xl font-bold text-card-foreground">
            {agents.filter((a) => a.status === "online").length}/
            {agents.length}
          </p>
          <div className="mt-2 flex -space-x-2">
            {agents
              .filter((a) => a.status === "online")
              .map((a) => (
                <Avatar key={a.id} className="h-7 w-7 border-2 border-card">
                  <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                    {a.avatarInitials}
                  </AvatarFallback>
                </Avatar>
              ))}
          </div>
        </div>
      </div>

      {/* Product sales and Agent sales charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Product sales bar chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-1 text-base font-semibold text-card-foreground">
            Productos vendidos
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Ventas por categoria de ropa
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={productSalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 18% 91%)" />
              <XAxis
                dataKey="product"
                tick={{ fontSize: 11, fill: "hsl(220 10% 46%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(214 18% 91%)",
                  fontSize: "13px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar
                dataKey="vendidos"
                fill="hsl(152 60% 42%)"
                radius={[6, 6, 0, 0]}
                name="Unidades vendidas"
              />
              <Bar
                dataKey="ingresos"
                fill="hsl(200 70% 50%)"
                radius={[6, 6, 0, 0]}
                name="Ingresos ($)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Agent sales bar chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-1 text-base font-semibold text-card-foreground">
            Ventas por agente
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Desempeno comercial de cada agente
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={agentSalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 18% 91%)" />
              <XAxis
                dataKey="agent"
                tick={{ fontSize: 11, fill: "hsl(220 10% 46%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(214 18% 91%)",
                  fontSize: "13px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar
                dataKey="ventas"
                fill="hsl(38 92% 50%)"
                radius={[6, 6, 0, 0]}
                name="Ventas"
              />
              <Bar
                dataKey="ingresos"
                fill="hsl(152 60% 42%)"
                radius={[6, 6, 0, 0]}
                name="Ingresos ($)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Response time and status distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Response time chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">
            Tiempo de respuesta promedio (min)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 18% 91%)" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(214 18% 91%)",
                }}
              />
              <defs>
                <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(152 60% 42%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(152 60% 42%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="time"
                stroke="hsl(152 60% 42%)"
                strokeWidth={2.5}
                fill="url(#colorTime)"
                name="Tiempo (min)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">
            Distribucion de contactos por estado
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 18% 91%)" />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="status"
                tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(214 18% 91%)",
                }}
              />
              <Bar
                dataKey="count"
                fill="hsl(152 60% 42%)"
                radius={[0, 6, 6, 0]}
                name="Contactos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent performance table */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-card-foreground">
          Desempeno por agente
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-medium text-muted-foreground">
                  Agente
                </th>
                <th className="pb-3 text-left font-medium text-muted-foreground">
                  Resueltas
                </th>
                <th className="pb-3 text-left font-medium text-muted-foreground">
                  Pendientes
                </th>
                <th className="pb-3 text-left font-medium text-muted-foreground">
                  Satisfaccion
                </th>
                <th className="pb-3 text-left font-medium text-muted-foreground">
                  Rendimiento
                </th>
              </tr>
            </thead>
            <tbody>
              {agentPerformance.map((agent) => (
                <tr
                  key={agent.name}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {agent.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-card-foreground">
                        {agent.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 font-medium text-card-foreground">
                    {agent.resolved}
                  </td>
                  <td className="py-3">
                    <Badge
                      variant="outline"
                      className={
                        agent.pending > 3
                          ? "border-amber-200 bg-amber-50 text-amber-600"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {agent.pending}
                    </Badge>
                  </td>
                  <td className="py-3 font-medium text-card-foreground">
                    {agent.satisfaction}%
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(agent.resolved / 60) * 100}
                        className="h-2 w-24"
                      />
                      <span className="text-xs text-muted-foreground">
                        {((agent.resolved / 60) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
