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
import { useMemo, useCallback, useRef, useState } from "react"
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
  const reportContentRef = useRef<HTMLDivElement>(null)
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
    if (!reportContentRef.current || isGeneratingPDF) return

    setIsGeneratingPDF(true)

    try {
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ])
      const html2canvas = html2canvasModule.default
      const { jsPDF } = jsPDFModule

      const element = reportContentRef.current

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      })

      const imgData = canvas.toDataURL("image/png")
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      const pdfWidth = 210
      const pdfImageWidth = pdfWidth - 20
      const pdfImageHeight = (imgHeight * pdfImageWidth) / imgWidth

      const pdf = new jsPDF({
        orientation: pdfImageHeight > 297 * 2 ? "portrait" : "portrait",
        unit: "mm",
        format: "a4",
      })

      const pageHeight = 297
      const margin = 10
      const usableHeight = pageHeight - margin * 2

      if (pdfImageHeight <= usableHeight) {
        pdf.addImage(imgData, "PNG", margin, margin, pdfImageWidth, pdfImageHeight)
      } else {
        let remainingHeight = pdfImageHeight
        let yOffset = 0
        let page = 0

        while (remainingHeight > 0) {
          if (page > 0) {
            pdf.addPage()
          }

          const sliceHeight = Math.min(usableHeight, remainingHeight)
          const sourceY = (yOffset / pdfImageHeight) * imgHeight
          const sourceHeight = (sliceHeight / pdfImageHeight) * imgHeight

          const sliceCanvas = document.createElement("canvas")
          sliceCanvas.width = imgWidth
          sliceCanvas.height = sourceHeight
          const ctx = sliceCanvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(
              canvas,
              0,
              sourceY,
              imgWidth,
              sourceHeight,
              0,
              0,
              imgWidth,
              sourceHeight,
            )
            const sliceData = sliceCanvas.toDataURL("image/png")
            pdf.addImage(sliceData, "PNG", margin, margin, pdfImageWidth, sliceHeight)
          }

          yOffset += sliceHeight
          remainingHeight -= sliceHeight
          page++
        }
      }

      const now = new Date()
      pdf.save(`reporte-chatflow-${now.toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }, [isGeneratingPDF])

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
      <div ref={reportContentRef} className="flex flex-col gap-6">
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
