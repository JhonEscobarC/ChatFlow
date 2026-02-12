"use client"

import { Users, UserCheck, UserPlus, MessageSquare } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import {
  statsData,
  weeklyConversations,
  chatStatusDistribution,
  monthlyData,
  contacts,
} from "@/lib/data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const statusColorMap: Record<string, string> = {
  activo: "bg-primary/10 text-primary border-primary/20",
  inactivo: "bg-destructive/10 text-destructive border-destructive/20",
  cerrado: "bg-muted text-muted-foreground border-border",
  seguimiento: "bg-amber-50 text-amber-600 border-amber-200",
  asesorando: "bg-blue-50 text-blue-600 border-blue-200",
}

export function DashboardView() {
  const recentContacts = contacts
    .sort(
      (a, b) =>
        new Date(b.lastMessageDate).getTime() -
        new Date(a.lastMessageDate).getTime(),
    )
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Hola, Carlos
        </h1>
        <p className="text-muted-foreground">
          Aqui tienes un resumen de tu CRM hoy.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Contactos"
          value={statsData.totalContacts}
          trend={statsData.contactsTrend}
          icon={Users}
        />
        <StatCard
          title="Contactos Activos"
          value={statsData.activeContacts}
          trend={statsData.activeTrend}
          icon={UserCheck}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
        <StatCard
          title="Nuevos Prospectos"
          value={statsData.newProspects}
          trend={statsData.prospectsTrend}
          icon={UserPlus}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
        />
        <StatCard
          title="Chats Abiertos"
          value={statsData.openConversations}
          icon={MessageSquare}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly conversations bar chart */}
        <div className="col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">
            Conversaciones de la semana
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyConversations} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 18% 91%)" />
              <XAxis
                dataKey="day"
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
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
              <Bar
                dataKey="conversations"
                fill="hsl(152 60% 42%)"
                radius={[6, 6, 0, 0]}
                name="Recibidas"
              />
              <Bar
                dataKey="resolved"
                fill="hsl(200 70% 50%)"
                radius={[6, 6, 0, 0]}
                name="Resueltas"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chat status distribution pie chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-1 text-base font-semibold text-card-foreground">
            Estado de chats
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Chats actuales por estado
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chatStatusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chatStatusDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(214 18% 91%)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-col gap-2">
            {chatStatusDistribution.map((ch) => (
              <div key={ch.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: ch.fill }}
                  />
                  <span className="text-muted-foreground">{ch.name}</span>
                </div>
                <span className="font-medium text-card-foreground">{ch.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly trend + Recent contacts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly trend */}
        <div className="col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">
            Tendencia mensual
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 18% 91%)" />
              <XAxis
                dataKey="month"
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
              <Legend />
              <Line
                type="monotone"
                dataKey="contacts"
                stroke="hsl(152 60% 42%)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "hsl(152 60% 42%)" }}
                name="Contactos"
              />
              <Line
                type="monotone"
                dataKey="conversations"
                stroke="hsl(200 70% 50%)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "hsl(200 70% 50%)" }}
                name="Conversaciones"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent contacts */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">
            Actividad reciente
          </h3>
          <div className="flex flex-col gap-3">
            {recentContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {contact.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-card-foreground">
                    {contact.name}
                  </span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {contact.lastMessage}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={statusColorMap[contact.status]}
                >
                  {contact.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
