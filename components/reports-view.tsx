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
} from "recharts"
import { useMemo, useCallback, useState } from "react"
import { FileDown, Loader2 } from "lucide-react"

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

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

  const handleGeneratePDF = useCallback(async () => {
    if (isGeneratingPDF) return
    setIsGeneratingPDF(true)

    try {
      const jsPDFModule = await import("jspdf")
      const { jsPDF } = jsPDFModule

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pageW = 210
      const pageH = 297
      const margin = 15
      const contentW = pageW - margin * 2
      let y = margin

      const checkPage = (needed: number) => {
        if (y + needed > pageH - margin) {
          pdf.addPage()
          y = margin
        }
      }

      // --- Header ---
      pdf.setFillColor(22, 163, 74)
      pdf.rect(0, 0, pageW, 28, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(18)
      pdf.setFont("helvetica", "bold")
      pdf.text("ChatFlow - Reporte General", margin, 12)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      const now = new Date()
      pdf.text(`Generado: ${now.toLocaleDateString("es-CO")} ${now.toLocaleTimeString("es-CO")}`, margin, 20)
      y = 36

      // --- Summary cards ---
      pdf.setTextColor(60, 60, 60)
      pdf.setFontSize(13)
      pdf.setFont("helvetica", "bold")
      pdf.text("Resumen General", margin, y)
      y += 6

      const summaryItems = [
        { label: "Conversaciones resueltas", value: String(totalResolved) },
        { label: "Pendientes", value: String(totalPending) },
        { label: "Productos vendidos", value: String(totalProductsSold) },
        { label: "Ingresos totales", value: `$${totalRevenue.toLocaleString("es-CO")}` },
        { label: "Satisfaccion promedio", value: `${avgSatisfaction.toFixed(1)}%` },
        { label: "Agentes activos", value: `${agents.filter((a) => a.status === "online").length}/${agents.length}` },
      ]

      const cardW = (contentW - 6) / 3
      const cardH = 18
      summaryItems.forEach((item, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const cx = margin + col * (cardW + 3)
        const cy = y + row * (cardH + 3)

        pdf.setFillColor(245, 245, 245)
        pdf.roundedRect(cx, cy, cardW, cardH, 2, 2, "F")
        pdf.setFontSize(8)
        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(120, 120, 120)
        pdf.text(item.label, cx + 3, cy + 6)
        pdf.setFontSize(14)
        pdf.setFont("helvetica", "bold")
        pdf.setTextColor(30, 30, 30)
        pdf.text(item.value, cx + 3, cy + 14)
      })
      y += Math.ceil(summaryItems.length / 3) * (cardH + 3) + 6

      // --- Helper: draw bar chart ---
      const drawBarChart = (
        title: string,
        labels: string[],
        values: number[],
        color: [number, number, number],
        prefix = "",
        suffix = "",
      ) => {
        const chartH = 50
        checkPage(chartH + 18)

        pdf.setFontSize(11)
        pdf.setFont("helvetica", "bold")
        pdf.setTextColor(40, 40, 40)
        pdf.text(title, margin, y)
        y += 5

        const maxVal = Math.max(...values, 1)
        const barAreaW = contentW - 25
        const barH = Math.min(6, (chartH - 4) / labels.length - 1)
        const labelW = 25

        labels.forEach((label, i) => {
          const by = y + i * (barH + 2)
          pdf.setFontSize(7)
          pdf.setFont("helvetica", "normal")
          pdf.setTextColor(80, 80, 80)
          pdf.text(label, margin, by + barH - 1)

          const bw = Math.max(2, (values[i] / maxVal) * (barAreaW - 30))
          pdf.setFillColor(...color)
          pdf.roundedRect(margin + labelW, by, bw, barH, 1, 1, "F")

          pdf.setFontSize(7)
          pdf.setFont("helvetica", "bold")
          pdf.setTextColor(60, 60, 60)
          pdf.text(`${prefix}${values[i].toLocaleString("es-CO")}${suffix}`, margin + labelW + bw + 2, by + barH - 1)
        })

        y += labels.length * (barH + 2) + 6
      }

      // --- Product charts ---
      checkPage(60)
      pdf.setFontSize(13)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(60, 60, 60)
      pdf.text("Productos Vendidos", margin, y)
      y += 8

      drawBarChart(
        "Unidades vendidas por producto",
        productSalesData.map((d) => d.product),
        productSalesData.map((d) => d.vendidos),
        [34, 139, 84],
      )

      drawBarChart(
        "Ingresos por producto",
        productSalesData.map((d) => d.product),
        productSalesData.map((d) => d.ingresos),
        [59, 130, 196],
        "$",
      )

      // --- Agent charts ---
      checkPage(60)
      pdf.setFontSize(13)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(60, 60, 60)
      pdf.text("Ventas por Agente", margin, y)
      y += 8

      drawBarChart(
        "Numero de ventas por agente",
        agentSalesData.map((d) => d.agent),
        agentSalesData.map((d) => d.ventas),
        [217, 158, 28],
      )

      drawBarChart(
        "Ingresos por agente",
        agentSalesData.map((d) => d.agent),
        agentSalesData.map((d) => d.ingresos),
        [34, 139, 84],
        "$",
      )

      // --- Status distribution ---
      checkPage(50)
      pdf.setFontSize(13)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(60, 60, 60)
      pdf.text("Distribucion de Contactos por Estado", margin, y)
      y += 8

      drawBarChart(
        "",
        statusDistribution.map((d) => d.status),
        statusDistribution.map((d) => d.count),
        [59, 130, 196],
      )

      // --- Agent performance table ---
      checkPage(60)
      pdf.setFontSize(13)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(60, 60, 60)
      pdf.text("Desempeno por Agente", margin, y)
      y += 6

      const headers = ["Agente", "Resueltas", "Pendientes", "Satisfaccion", "Rendimiento"]
      const colWidths = [45, 30, 30, 35, 40]

      // Table header
      pdf.setFillColor(240, 240, 240)
      pdf.rect(margin, y, contentW, 7, "F")
      pdf.setFontSize(8)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(80, 80, 80)
      let hx = margin + 2
      headers.forEach((h, i) => {
        pdf.text(h, hx, y + 5)
        hx += colWidths[i]
      })
      y += 8

      // Table rows
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(50, 50, 50)
      agentPerformance.forEach((agent) => {
        checkPage(8)
        let rx = margin + 2
        pdf.setFontSize(8)
        pdf.text(agent.name, rx, y + 4)
        rx += colWidths[0]
        pdf.text(String(agent.resolved), rx, y + 4)
        rx += colWidths[1]
        pdf.text(String(agent.pending), rx, y + 4)
        rx += colWidths[2]
        pdf.text(`${agent.satisfaction}%`, rx, y + 4)
        rx += colWidths[3]
        pdf.text(`${((agent.resolved / 60) * 100).toFixed(0)}%`, rx, y + 4)

        pdf.setDrawColor(230, 230, 230)
        pdf.line(margin, y + 6, margin + contentW, y + 6)
        y += 7
      })

      y += 4

      // --- Response time data ---
      checkPage(50)
      pdf.setFontSize(13)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(60, 60, 60)
      pdf.text("Tiempo de Respuesta Promedio", margin, y)
      y += 8

      drawBarChart(
        "",
        responseTimeData.map((d) => d.hour),
        responseTimeData.map((d) => d.time * 10),
        [34, 139, 84],
      )
      pdf.setFontSize(7)
      pdf.setFont("helvetica", "italic")
      pdf.setTextColor(130, 130, 130)
      pdf.text("* Valores en minutos (escala x10 para visualizacion)", margin, y)
      y += 6

      // --- Footer ---
      const totalPages = pdf.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(160, 160, 160)
        pdf.text(`ChatFlow CRM - Pagina ${i} de ${totalPages}`, pageW / 2, pageH - 8, { align: "center" })
      }

      pdf.save(`reporte-chatflow-${now.toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }, [isGeneratingPDF, totalResolved, totalPending, totalProductsSold, totalRevenue, avgSatisfaction, statusDistribution])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
          <div className="text-sm text-muted-foreground">
            Analiza el desempeno de tu equipo y las metricas del CRM
          </div>
        </div>
        <Button
          onClick={handleGeneratePDF}
          disabled={isGeneratingPDF}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isGeneratingPDF ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {isGeneratingPDF ? "Generando..." : "Generar reporte"}
        </Button>
      </div>

      {/* Report content area - captured for PDF */}
      <div className="flex flex-col gap-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <span className="text-sm text-muted-foreground">
              Conversaciones resueltas
            </span>
            <div className="mt-1 text-3xl font-bold text-card-foreground">
              {totalResolved}
            </div>
            <div className="mt-1 text-xs text-primary">Esta semana</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <span className="text-sm text-muted-foreground">Pendientes</span>
            <div className="mt-1 text-3xl font-bold text-card-foreground">
              {totalPending}
            </div>
            <div className="mt-1 text-xs text-amber-500">Requieren atencion</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <span className="text-sm text-muted-foreground">
              Productos vendidos
            </span>
            <div className="mt-1 text-3xl font-bold text-card-foreground">
              {totalProductsSold}
            </div>
            <div className="mt-1 text-xs text-primary">Total unidades</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <span className="text-sm text-muted-foreground">Agentes activos</span>
            <div className="mt-1 text-3xl font-bold text-card-foreground">
              {agents.filter((a) => a.status === "online").length}/
              {agents.length}
            </div>
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

        {/* Product sales charts - Units and Revenue */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Product units sold */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-1 text-base font-semibold text-card-foreground">
              Unidades vendidas por producto
            </h3>
            <div className="mb-4 text-xs text-muted-foreground">
              Numero de unidades vendidas por categoria
            </div>
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
                <Bar
                  dataKey="vendidos"
                  fill="hsl(152 60% 42%)"
                  radius={[6, 6, 0, 0]}
                  name="Unidades vendidas"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Product revenue */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-1 text-base font-semibold text-card-foreground">
              Ingresos por producto
            </h3>
            <div className="mb-4 text-xs text-muted-foreground">
              Ingresos generados por categoria de ropa
            </div>
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
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(214 18% 91%)",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Ingresos"]}
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
        </div>

        {/* Agent sales charts - Sales count and Revenue */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Agent sales count */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-1 text-base font-semibold text-card-foreground">
              Ventas por agente
            </h3>
            <div className="mb-4 text-xs text-muted-foreground">
              Numero de ventas realizadas por cada agente
            </div>
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
                <Bar
                  dataKey="ventas"
                  fill="hsl(38 92% 50%)"
                  radius={[6, 6, 0, 0]}
                  name="Ventas"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Agent revenue */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-1 text-base font-semibold text-card-foreground">
              Ingresos por agente
            </h3>
            <div className="mb-4 text-xs text-muted-foreground">
              Ingresos generados por cada agente
            </div>
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
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(214 18% 91%)",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Ingresos"]}
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
    </div>
  )
}
