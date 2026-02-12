"use client"

import React from "react"

import { useState, useMemo, useRef, useEffect } from "react"
import { contacts, messages, agents, type Contact } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Send,
  Phone,
  MoreVertical,
  Bot,
  User,
  Headphones,
  ArrowLeft,
  FileDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

const statusColorMap: Record<string, string> = {
  activo: "bg-primary",
  inactivo: "bg-muted-foreground",
  prospecto: "bg-amber-500",
  nuevo: "bg-blue-500",
}

export function ConversationsView() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [search, setSearch] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const contactsWithMessages = useMemo(() => {
    return contacts
      .filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.company.toLowerCase().includes(search.toLowerCase()),
      )
      .sort(
        (a, b) =>
          new Date(b.lastMessageDate).getTime() -
          new Date(a.lastMessageDate).getTime(),
      )
  }, [search])

  const contactMessages = useMemo(() => {
    if (!selectedContact) return []
    return messages
      .filter((m) => m.contactId === selectedContact.id)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )
  }, [selectedContact])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [contactMessages])

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const today = new Date()
    const isToday = d.toDateString() === today.toDateString()
    if (isToday) return formatTime(dateStr)
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
  }

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case "bot":
        return <Bot className="h-3.5 w-3.5" />
      case "agent":
        return <Headphones className="h-3.5 w-3.5" />
      default:
        return <User className="h-3.5 w-3.5" />
    }
  }

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact)
    setShowMobileChat(true)
  }

  const handleExportConversationPDF = async (contact: Contact) => {
    if (isExportingPDF) return
    setIsExportingPDF(true)

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
      pdf.rect(0, 0, pageW, 32, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(18)
      pdf.setFont("helvetica", "bold")
      pdf.text("ChatFlow - Informe de Conversacion", margin, 14)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      const now = new Date()
      pdf.text(
        `Generado: ${now.toLocaleDateString("es-CO")} ${now.toLocaleTimeString("es-CO")}`,
        margin,
        22,
      )
      y = 40

      // --- Client info card ---
      pdf.setFillColor(245, 245, 245)
      pdf.roundedRect(margin, y, contentW, 42, 3, 3, "F")

      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(22, 163, 74)
      pdf.text("Datos del Cliente", margin + 5, y + 8)

      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(60, 60, 60)

      const statusLabels: Record<string, string> = {
        activo: "Activo",
        inactivo: "Inactivo",
        prospecto: "Prospecto",
        nuevo: "Nuevo",
        cerrado: "Cerrado",
        seguimiento: "Seguimiento",
        asesorando: "Asesorando",
      }

      const fields = [
        { label: "Nombre", value: contact.name },
        { label: "Empresa", value: contact.company },
        { label: "Telefono", value: contact.phone },
        { label: "Email", value: contact.email },
        { label: "Pais", value: contact.country },
        { label: "Estado", value: statusLabels[contact.status] || contact.status },
        { label: "Agente asignado", value: contact.agent || "Sin asignar" },
      ]

      const col1X = margin + 5
      const col2X = margin + contentW / 2 + 5
      fields.forEach((field, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const fx = col === 0 ? col1X : col2X
        const fy = y + 14 + row * 7

        pdf.setFont("helvetica", "bold")
        pdf.setTextColor(100, 100, 100)
        pdf.text(`${field.label}:`, fx, fy)
        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(40, 40, 40)
        pdf.text(field.value, fx + pdf.getTextWidth(`${field.label}: `) + 1, fy)
      })

      y += 50

      // --- Conversation content ---
      const convMessages = messages
        .filter((m) => m.contactId === contact.id)
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )

      checkPage(12)
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(22, 163, 74)
      pdf.text(`Conversacion (${convMessages.length} mensajes)`, margin, y)
      y += 7

      convMessages.forEach((msg) => {
        const senderLabel =
          msg.sender === "contact"
            ? "Cliente"
            : msg.sender === "bot"
              ? "Bot"
              : "Agente"
        const timeStr = new Date(msg.timestamp).toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        })

        // Calculate needed height
        pdf.setFontSize(8)
        const wrappedLines = pdf.splitTextToSize(msg.content, contentW - 10)
        const msgHeight = 10 + wrappedLines.length * 4
        checkPage(msgHeight)

        // Sender colors
        let bgR = 240, bgG = 240, bgB = 240
        let labelR = 80, labelG = 80, labelB = 80
        if (msg.sender === "bot") {
          bgR = 239; bgG = 246; bgB = 255
          labelR = 37; labelG = 99; labelB = 235
        } else if (msg.sender === "agent") {
          bgR = 240; bgG = 253; bgB = 244
          labelR = 22; labelG = 163; labelB = 74
        }

        pdf.setFillColor(bgR, bgG, bgB)
        pdf.roundedRect(margin, y, contentW, msgHeight, 2, 2, "F")

        pdf.setFontSize(8)
        pdf.setFont("helvetica", "bold")
        pdf.setTextColor(labelR, labelG, labelB)
        pdf.text(`${senderLabel} - ${msg.senderName}`, margin + 4, y + 5)

        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(140, 140, 140)
        pdf.text(timeStr, margin + contentW - 20, y + 5)

        pdf.setTextColor(40, 40, 40)
        pdf.setFontSize(9)
        pdf.text(wrappedLines, margin + 4, y + 10)

        y += msgHeight + 3
      })

      // --- Footer ---
      const totalPages = pdf.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(160, 160, 160)
        pdf.text(
          `ChatFlow CRM - Conversacion con ${contact.name} - Pagina ${i} de ${totalPages}`,
          pageW / 2,
          pageH - 8,
          { align: "center" },
        )
      }

      pdf.save(`conversacion-${contact.name.toLowerCase().replace(/\s+/g, "-")}-${now.toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating conversation PDF:", error)
    } finally {
      setIsExportingPDF(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Conversaciones</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona los chats de WhatsApp con tus contactos
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Contact list */}
        <div
          className={cn(
            "flex w-full flex-col border-r border-border md:w-[340px]",
            showMobileChat && "hidden md:flex",
          )}
        >
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar conversacion..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {contactsWithMessages.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className={cn(
                    "flex items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50",
                    selectedContact?.id === contact.id && "bg-accent",
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {contact.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                        statusColorMap[contact.status],
                      )}
                    />
                  </div>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground">
                        {contact.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(contact.lastMessageDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {contact.lastMessage}
                      </span>
                      {contact.unreadCount > 0 && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div
          className={cn(
            "hidden flex-1 flex-col md:flex",
            showMobileChat && "flex",
          )}
        >
          {selectedContact ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <button
                  className="mr-1 md:hidden"
                  onClick={() => setShowMobileChat(false)}
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {selectedContact.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold text-card-foreground">
                    {selectedContact.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedContact.company} - {selectedContact.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Agent assignment */}
                  <Select defaultValue={selectedContact.agent ? undefined : ""}>
                    <SelectTrigger className="h-8 w-[160px] text-xs">
                      <SelectValue
                        placeholder={
                          selectedContact.agent
                            ? selectedContact.agent
                            : "Asignar agente"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full",
                                a.status === "online"
                                  ? "bg-primary"
                                  : a.status === "busy"
                                    ? "bg-amber-500"
                                    : "bg-muted-foreground",
                              )}
                            />
                            {a.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Exportar conversacion a PDF"
                    disabled={isExportingPDF}
                    onClick={() => handleExportConversationPDF(selectedContact)}
                  >
                    <FileDown className={cn("h-4 w-4", isExportingPDF && "animate-pulse")} />
                    <span className="sr-only">Exportar conversacion a PDF</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-3">
                  {contactMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex max-w-[75%] flex-col gap-1",
                        msg.sender === "contact"
                          ? "self-start"
                          : "self-end",
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {getSenderIcon(msg.sender)}
                        <span className="text-xs font-medium text-muted-foreground">
                          {msg.senderName}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm",
                          msg.sender === "contact"
                            ? "rounded-tl-sm bg-muted text-foreground"
                            : msg.sender === "bot"
                              ? "rounded-tr-sm bg-blue-50 text-blue-900"
                              : "rounded-tr-sm bg-primary text-primary-foreground",
                        )}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t border-border p-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && messageInput.trim()) {
                        setMessageInput("")
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      if (messageInput.trim()) {
                        setMessageInput("")
                      }
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <MessageCircleIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Selecciona una conversacion
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Elige un contacto de la lista para ver su historial de
                conversaciones y enviar mensajes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  )
}
