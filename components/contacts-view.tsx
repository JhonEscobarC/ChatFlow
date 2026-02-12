"use client"

import { useState, useMemo, useCallback } from "react"
import { contacts as initialContacts, agents, type Contact, type ContactStatus } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, ChevronLeft, ChevronRight, Eye, AlertCircle } from "lucide-react"

const statusColorMap: Record<ContactStatus, string> = {
  activo: "bg-primary/10 text-primary border-primary/20",
  inactivo: "bg-destructive/10 text-destructive border-destructive/20",
  cerrado: "bg-muted text-muted-foreground border-border",
  seguimiento: "bg-amber-50 text-amber-600 border-amber-200",
  asesorando: "bg-blue-50 text-blue-600 border-blue-200",
}

const statusLabels: Record<ContactStatus, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  cerrado: "Cerrado",
  seguimiento: "Seguimiento",
  asesorando: "Asesorando",
}

const ITEMS_PER_PAGE = 8

export function ContactsView() {
  const [contactsList, setContactsList] = useState<Contact[]>(() => [...initialContacts])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const handleAssignAgent = useCallback((contactId: string, agentId: string) => {
    const agent = agents.find((a) => a.id === agentId)
    if (!agent) return
    setContactsList((prev) =>
      prev.map((c) =>
        c.id === contactId ? { ...c, agent: agent.name } : c,
      ),
    )
    setSelectedContact((prev) =>
      prev && prev.id === contactId ? { ...prev, agent: agent.name } : prev,
    )
  }, [])

  const handleChangeStatus = useCallback((contactId: string, newStatus: ContactStatus) => {
    setContactsList((prev) =>
      prev.map((c) => {
        if (c.id !== contactId) return c
        // If changing to "asesorando" and no agent is assigned, don't allow
        if (newStatus === "asesorando" && !c.agent) return c
        return { ...c, status: newStatus }
      }),
    )
    setSelectedContact((prev) => {
      if (!prev || prev.id !== contactId) return prev
      if (newStatus === "asesorando" && !prev.agent) return prev
      return { ...prev, status: newStatus }
    })
  }, [])

  const handleRemoveAgent = useCallback((contactId: string) => {
    setContactsList((prev) =>
      prev.map((c) => {
        if (c.id !== contactId) return c
        // Cannot remove agent if status is "asesorando"
        if (c.status === "asesorando") return c
        return { ...c, agent: null }
      }),
    )
    setSelectedContact((prev) => {
      if (!prev || prev.id !== contactId) return prev
      if (prev.status === "asesorando") return prev
      return { ...prev, agent: null }
    })
  }, [])

  const filtered = useMemo(() => {
    return contactsList.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      const matchesStatus = statusFilter === "all" || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter, contactsList])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: contactsList.length }
    for (const c of contactsList) {
      counts[c.status] = (counts[c.status] || 0) + 1
    }
    return counts
  }, [contactsList])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona todos tus contactos y prospectos de WhatsApp
          </p>
        </div>

      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "activo", "asesorando", "seguimiento", "cerrado", "inactivo"] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status)
                setCurrentPage(1)
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {status === "all" ? "Todos" : statusLabels[status as ContactStatus]}{" "}
              <span className="ml-1 opacity-70">{statusCounts[status] || 0}</span>
            </button>
          ),
        )}
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, empresa, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>
        <Select defaultValue="newest">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mas recientes</SelectItem>
            <SelectItem value="oldest">Mas antiguos</SelectItem>
            <SelectItem value="name">Nombre A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[250px]">Contacto</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead className="hidden md:table-cell">Telefono</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead className="hidden xl:table-cell">Pais</TableHead>
              <TableHead>Agente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {contact.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-card-foreground">
                        {contact.name}
                      </span>
                      {contact.unreadCount > 0 && (
                        <span className="text-xs text-primary">
                          {contact.unreadCount} mensaje(s) sin leer
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {contact.company}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                  {contact.phone}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                  {contact.email}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                  {contact.country}
                </TableCell>
                <TableCell>
                  {contact.agent ? (
                    <span className="text-sm text-card-foreground">
                      {contact.agent}
                    </span>
                  ) : (
                    <span className="text-sm italic text-muted-foreground">
                      Sin asignar
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusColorMap[contact.status]}
                  >
                    {statusLabels[contact.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setSelectedContact(contact)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalles</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Detalle del contacto</DialogTitle>
                        <DialogDescription className="sr-only">
                          Informacion detallada del contacto seleccionado
                        </DialogDescription>
                      </DialogHeader>
                      {selectedContact && selectedContact.id === contact.id && (
                        <ContactDetailContent
                          contact={contactsList.find((c) => c.id === selectedContact.id) || selectedContact}
                          onAssignAgent={handleAssignAgent}
                          onChangeStatus={handleChangeStatus}
                          onRemoveAgent={handleRemoveAgent}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de{" "}
            {filtered.length} contactos
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === currentPage ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactDetailContent({
  contact,
  onAssignAgent,
  onChangeStatus,
  onRemoveAgent,
}: {
  contact: Contact
  onAssignAgent: (contactId: string, agentId: string) => void
  onChangeStatus: (contactId: string, newStatus: ContactStatus) => void
  onRemoveAgent: (contactId: string) => void
}) {
  const isAsesorando = contact.status === "asesorando"
  const hasAgent = !!contact.agent

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
            {contact.avatarInitials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {contact.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {contact.company}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Telefono</span>
          <p className="font-medium text-foreground">{contact.phone}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Email</span>
          <p className="font-medium text-foreground">{contact.email}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Pais</span>
          <p className="font-medium text-foreground">{contact.country}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Estado</span>
          <div>
            <Badge variant="outline" className={statusColorMap[contact.status]}>
              {statusLabels[contact.status]}
            </Badge>
          </div>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">Agente asignado</span>
          <p className="font-medium text-foreground">
            {contact.agent || "Sin asignar"}
          </p>
        </div>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">Ultimo mensaje</span>
        <p className="mt-1 rounded-lg bg-muted p-3 text-sm text-foreground">
          {contact.lastMessage}
        </p>
      </div>

      {/* Agent assignment */}
      <div>
        <span className="mb-2 block text-sm font-medium text-foreground">
          {contact.agent ? "Reasignar agente" : "Asignar agente"}
        </span>
        <Select
          value=""
          onValueChange={(value) => onAssignAgent(contact.id, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={contact.agent || "Selecciona un agente"} />
          </SelectTrigger>
          <SelectContent>
            {agents.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name} - {a.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isAsesorando && (
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div className="text-xs text-blue-700">
              Los contactos en estado <strong>Asesorando</strong> deben tener siempre un agente asignado.
            </div>
          </div>
        )}
      </div>

      {/* Status change */}
      <div>
        <span className="mb-2 block text-sm font-medium text-foreground">
          Cambiar estado
        </span>
        <Select
          value={contact.status}
          onValueChange={(value) => onChangeStatus(contact.id, value as ContactStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(statusLabels) as ContactStatus[]).map((s) => (
              <SelectItem
                key={s}
                value={s}
                disabled={s === "asesorando" && !hasAgent}
              >
                {statusLabels[s]}
                {s === "asesorando" && !hasAgent ? " (requiere agente)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!hasAgent && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Asigna un agente primero para poder cambiar el estado a Asesorando.
          </p>
        )}
      </div>
    </div>
  )
}
