"use client"

import { useState } from "react"
import { agents } from "@/lib/data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  MessageSquare,
  Clock,
  ThumbsUp,
  CheckCircle2,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"

type ViewTab = "equipo" | "rendimiento" | "disponibilidad"

const statusConfig: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  online: {
    label: "En linea",
    className: "bg-primary/10 text-primary border-primary/20",
    dot: "bg-primary",
  },
  busy: {
    label: "Ocupado",
    className: "bg-warning/10 text-warning border-warning/20",
    dot: "bg-warning",
  },
  offline: {
    label: "Desconectado",
    className: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
}



export function AgentsView() {
  const [activeTab, setActiveTab] = useState<ViewTab>("equipo")
  const [search, setSearch] = useState("")

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase()),
  )

  const tabs: { id: ViewTab; label: string }[] = [
    { id: "equipo", label: "Equipo" },
    { id: "rendimiento", label: "Rendimiento" },
    { id: "disponibilidad", label: "Disponibilidad" },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Agentes</h1>
        <p className="text-muted-foreground">
          Administra tu equipo y revisa su desempeno.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center rounded-full border border-border bg-card p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar agente..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Team Grid View */}
      {activeTab === "equipo" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAgents.map((agent) => {
            const status = statusConfig[agent.status]
            return (
              <div
                key={agent.id}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Avatar with status dot */}
                <div className="relative">
                  <Avatar className="h-20 w-20 border-2 border-border">
                    <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                      {agent.avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-card",
                      status.dot,
                    )}
                  />
                </div>

                {/* Name and role */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold text-card-foreground">
                    {agent.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {agent.role}
                  </span>
                </div>

                {/* Quick stats */}
                <div className="mt-1 flex w-full items-center justify-center gap-4 border-t border-border pt-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{agent.activeChats}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>{agent.stats.satisfaction}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Performance View */}
      {activeTab === "rendimiento" && (
        <div className="flex flex-col gap-4">
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Total conversaciones
                </span>
                <span className="text-xl font-bold text-card-foreground">
                  {agents
                    .reduce(
                      (sum, a) => sum + a.stats.conversationsHandled,
                      0,
                    )
                    .toLocaleString("es-CO")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Tiempo resp. prom.
                </span>
                <span className="text-xl font-bold text-card-foreground">
                  2.9 min
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                <ThumbsUp className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Satisfaccion prom.
                </span>
                <span className="text-xl font-bold text-card-foreground">
                  {Math.round(
                    agents.reduce(
                      (sum, a) => sum + a.stats.satisfaction,
                      0,
                    ) / agents.length,
                  )}
                  %
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Tasa resolucion prom.
                </span>
                <span className="text-xl font-bold text-card-foreground">
                  {Math.round(
                    agents.reduce(
                      (sum, a) => sum + a.stats.resolvedRate,
                      0,
                    ) / agents.length,
                  )}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Agent performance table */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="p-5">
              <h3 className="text-base font-semibold text-card-foreground">
                Rendimiento por agente
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-border text-left">
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Agente
                    </th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Conversaciones
                    </th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Tiempo resp.
                    </th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Satisfaccion
                    </th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Resolucion
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents
                    .sort(
                      (a, b) =>
                        b.stats.conversationsHandled -
                        a.stats.conversationsHandled,
                    )
                    .map((agent) => (
                      <tr
                        key={agent.id}
                        className="border-t border-border transition-colors hover:bg-muted/30"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                {agent.avatarInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-card-foreground">
                                {agent.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {agent.role}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-card-foreground">
                          {agent.stats.conversationsHandled}
                        </td>
                        <td className="px-5 py-3 text-sm text-card-foreground">
                          {agent.stats.avgResponseTime}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{
                                  width: `${agent.stats.satisfaction}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-card-foreground">
                              {agent.stats.satisfaction}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-blue-500 transition-all"
                                style={{
                                  width: `${agent.stats.resolvedRate}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-card-foreground">
                              {agent.stats.resolvedRate}%
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
      )}

      {/* Availability View */}
      {activeTab === "disponibilidad" && (
        <div className="flex flex-col gap-5">
          {/* Status summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(["online", "busy", "offline"] as const).map((s) => {
              const count = agents.filter((a) => a.status === s).length
              const config = statusConfig[s]
              return (
                <div
                  key={s}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <span
                    className={cn("h-3 w-3 rounded-full", config.dot)}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      {config.label}
                    </span>
                    <span className="text-2xl font-bold text-card-foreground">
                      {count}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Agent availability list */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAgents.map((agent) => {
              const status = statusConfig[agent.status]
              return (
                <div
                  key={agent.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {agent.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card",
                        status.dot,
                      )}
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-semibold text-card-foreground">
                      {agent.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {agent.role}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", status.className)}
                    >
                      {status.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {agent.activeChats} chats activos
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
