export type ContactStatus = "activo" | "inactivo" | "cerrado" | "seguimiento" | "asesorando"

export type ConversationStatus = "abierta" | "cerrada" | "pendiente" | "asignada"

export interface Contact {
  id: string
  name: string
  company: string
  phone: string
  email: string
  country: string
  status: ContactStatus
  agent: string | null
  lastMessage: string
  lastMessageDate: string
  unreadCount: number
  avatarInitials: string
}

export interface Message {
  id: string
  contactId: string
  content: string
  timestamp: string
  sender: "contact" | "agent" | "bot"
  senderName: string
}

export interface Agent {
  id: string
  name: string
  role: string
  avatarInitials: string
  activeChats: number
  status: "online" | "offline" | "busy"
}

export interface AgentStats {
  conversationsHandled: number
  avgResponseTime: string
  satisfaction: number
  resolvedRate: number
  level: "Junior" | "Mid" | "Senior" | "Lead"
}

export const agents: (Agent & { stats: AgentStats })[] = [
  { id: "a1", name: "Carlos Mendoza", role: "Soporte", avatarInitials: "CM", activeChats: 5, status: "online", stats: { conversationsHandled: 342, avgResponseTime: "2.1 min", satisfaction: 96, resolvedRate: 91, level: "Senior" } },
  { id: "a2", name: "Laura Garcia", role: "Ventas", avatarInitials: "LG", activeChats: 3, status: "online", stats: { conversationsHandled: 278, avgResponseTime: "3.0 min", satisfaction: 93, resolvedRate: 88, level: "Mid" } },
  { id: "a3", name: "Miguel Torres", role: "Soporte", avatarInitials: "MT", activeChats: 2, status: "busy", stats: { conversationsHandled: 195, avgResponseTime: "2.8 min", satisfaction: 90, resolvedRate: 85, level: "Mid" } },
  { id: "a4", name: "Ana Rivera", role: "Ventas", avatarInitials: "AR", activeChats: 4, status: "online", stats: { conversationsHandled: 310, avgResponseTime: "1.9 min", satisfaction: 97, resolvedRate: 94, level: "Senior" } },
  { id: "a5", name: "Diego Herrera", role: "Gerente", avatarInitials: "DH", activeChats: 1, status: "offline", stats: { conversationsHandled: 125, avgResponseTime: "4.2 min", satisfaction: 88, resolvedRate: 80, level: "Lead" } },
  { id: "a6", name: "Patricia Vega", role: "Soporte", avatarInitials: "PV", activeChats: 3, status: "online", stats: { conversationsHandled: 156, avgResponseTime: "3.5 min", satisfaction: 91, resolvedRate: 83, level: "Junior" } },
  { id: "a7", name: "Ricardo Blanco", role: "Ventas", avatarInitials: "RB", activeChats: 2, status: "online", stats: { conversationsHandled: 220, avgResponseTime: "2.5 min", satisfaction: 94, resolvedRate: 89, level: "Mid" } },
]

export const contacts: Contact[] = [
  { id: "c1", name: "Maria Lopez", company: "TechCorp", phone: "+52 55 1234 5678", email: "maria@techcorp.mx", country: "Mexico", status: "activo", agent: "Carlos Mendoza", lastMessage: "Gracias por la informacion, me interesa el plan premium.", lastMessageDate: "2026-02-11T10:30:00", unreadCount: 2, avatarInitials: "ML" },
  { id: "c2", name: "Juan Ramirez", company: "DataSoft", phone: "+52 33 9876 5432", email: "juan@datasoft.com", country: "Mexico", status: "asesorando", agent: "Laura Garcia", lastMessage: "Cuando podemos agendar la demo?", lastMessageDate: "2026-02-11T09:15:00", unreadCount: 0, avatarInitials: "JR" },
  { id: "c3", name: "Sofia Martinez", company: "InnovaLab", phone: "+57 1 555 0123", email: "sofia@innovalab.co", country: "Colombia", status: "seguimiento", agent: null, lastMessage: "Hola, vi su publicidad y quiero mas detalles", lastMessageDate: "2026-02-11T08:45:00", unreadCount: 1, avatarInitials: "SM" },
  { id: "c4", name: "Pedro Sanchez", company: "CloudBase", phone: "+34 91 555 0199", email: "pedro@cloudbase.es", country: "Espana", status: "inactivo", agent: "Miguel Torres", lastMessage: "Voy a evaluar la propuesta y les confirmo.", lastMessageDate: "2026-02-09T16:20:00", unreadCount: 0, avatarInitials: "PS" },
  { id: "c5", name: "Andrea Ruiz", company: "MegaTrade", phone: "+52 81 555 0177", email: "andrea@megatrade.mx", country: "Mexico", status: "activo", agent: "Ana Rivera", lastMessage: "Perfecto, ya hice el pago. Confirmame por favor.", lastMessageDate: "2026-02-11T11:00:00", unreadCount: 3, avatarInitials: "AR" },
  { id: "c6", name: "Roberto Diaz", company: "NetSolutions", phone: "+56 2 555 0133", email: "roberto@netsol.cl", country: "Chile", status: "asesorando", agent: "Patricia Vega", lastMessage: "Buenas tardes, necesito cotizar un CRM.", lastMessageDate: "2026-02-11T07:30:00", unreadCount: 1, avatarInitials: "RD" },
  { id: "c7", name: "Carolina Flores", company: "DigitalPro", phone: "+54 11 555 0188", email: "carolina@digitalpro.ar", country: "Argentina", status: "cerrado", agent: "Carlos Mendoza", lastMessage: "Me funciono perfecto, muchas gracias!", lastMessageDate: "2026-02-10T14:45:00", unreadCount: 0, avatarInitials: "CF" },
  { id: "c8", name: "Fernando Vega", company: "SmartApps", phone: "+52 55 555 0244", email: "fernando@smartapps.mx", country: "Mexico", status: "seguimiento", agent: "Laura Garcia", lastMessage: "Me gustaria conocer los planes anuales.", lastMessageDate: "2026-02-10T12:00:00", unreadCount: 0, avatarInitials: "FV" },
  { id: "c9", name: "Gabriela Moreno", company: "BioHealth", phone: "+52 33 555 0355", email: "gabriela@biohealth.mx", country: "Mexico", status: "inactivo", agent: null, lastMessage: "Por ahora no, quizas mas adelante.", lastMessageDate: "2026-02-05T09:30:00", unreadCount: 0, avatarInitials: "GM" },
  { id: "c10", name: "Luis Castillo", company: "EcoVerde", phone: "+57 4 555 0466", email: "luis@ecoverde.co", country: "Colombia", status: "asesorando", agent: "Ricardo Blanco", lastMessage: "Hola! Quiero informacion sobre automatizacion.", lastMessageDate: "2026-02-11T06:15:00", unreadCount: 1, avatarInitials: "LC" },
  { id: "c11", name: "Diana Torres", company: "FinaTech", phone: "+52 55 555 0577", email: "diana@finatech.mx", country: "Mexico", status: "activo", agent: "Miguel Torres", lastMessage: "Ya active la integracion, todo OK.", lastMessageDate: "2026-02-10T17:00:00", unreadCount: 0, avatarInitials: "DT" },
  { id: "c12", name: "Alejandro Nunez", company: "LogiTrans", phone: "+52 81 555 0688", email: "alejandro@logitrans.mx", country: "Mexico", status: "seguimiento", agent: "Ana Rivera", lastMessage: "Necesitamos una solucion para 50 usuarios.", lastMessageDate: "2026-02-11T08:00:00", unreadCount: 2, avatarInitials: "AN" },
]

export const messages: Message[] = [
  { id: "m1", contactId: "c1", content: "Hola Maria! Bienvenida a ChatFlow. En que podemos ayudarte hoy?", timestamp: "2026-02-11T10:00:00", sender: "bot", senderName: "Bot" },
  { id: "m2", contactId: "c1", content: "Hola! Me interesa conocer sus planes de software a la medida.", timestamp: "2026-02-11T10:05:00", sender: "contact", senderName: "Maria Lopez" },
  { id: "m3", contactId: "c1", content: "Con gusto! Tenemos planes Basico, Pro y Enterprise. Te conecto con un asesor para mas detalles.", timestamp: "2026-02-11T10:07:00", sender: "bot", senderName: "Bot" },
  { id: "m4", contactId: "c1", content: "Hola Maria, soy Carlos. Nuestro plan Pro incluye desarrollo personalizado, soporte 24/7 y panel de analytics.", timestamp: "2026-02-11T10:15:00", sender: "agent", senderName: "Carlos Mendoza" },
  { id: "m5", contactId: "c1", content: "Gracias por la informacion, me interesa el plan premium.", timestamp: "2026-02-11T10:30:00", sender: "contact", senderName: "Maria Lopez" },
  { id: "m6", contactId: "c5", content: "Hola Andrea! Bienvenida. Como te puedo ayudar?", timestamp: "2026-02-11T10:30:00", sender: "bot", senderName: "Bot" },
  { id: "m7", contactId: "c5", content: "Hola, necesito renovar mi plan y hacer el pago.", timestamp: "2026-02-11T10:35:00", sender: "contact", senderName: "Andrea Ruiz" },
  { id: "m8", contactId: "c5", content: "Hola Andrea, soy Ana. Te envio el link de pago ahora mismo.", timestamp: "2026-02-11T10:40:00", sender: "agent", senderName: "Ana Rivera" },
  { id: "m9", contactId: "c5", content: "Perfecto, ya hice el pago. Confirmame por favor.", timestamp: "2026-02-11T11:00:00", sender: "contact", senderName: "Andrea Ruiz" },
  { id: "m10", contactId: "c3", content: "Hola! Gracias por contactarnos. Como podemos ayudarte?", timestamp: "2026-02-11T08:30:00", sender: "bot", senderName: "Bot" },
  { id: "m11", contactId: "c3", content: "Hola, vi su publicidad y quiero mas detalles", timestamp: "2026-02-11T08:45:00", sender: "contact", senderName: "Sofia Martinez" },
  { id: "m12", contactId: "c6", content: "Buenas tardes! Bienvenido a ChatFlow.", timestamp: "2026-02-11T07:20:00", sender: "bot", senderName: "Bot" },
  { id: "m13", contactId: "c6", content: "Buenas tardes, necesito cotizar un CRM.", timestamp: "2026-02-11T07:30:00", sender: "contact", senderName: "Roberto Diaz" },
]

export const statsData = {
  totalContacts: 5423,
  activeContacts: 1893,
  newProspects: 189,
  openConversations: 47,
  avgResponseTime: "3.2 min",
  satisfactionRate: 94,
  contactsTrend: 18,
  activeTrend: 7,
  prospectsTrend: 24,
}

export const weeklyConversations = [
  { day: "Lun", conversations: 32, resolved: 28 },
  { day: "Mar", conversations: 45, resolved: 40 },
  { day: "Mie", conversations: 38, resolved: 35 },
  { day: "Jue", conversations: 52, resolved: 48 },
  { day: "Vie", conversations: 61, resolved: 55 },
  { day: "Sab", conversations: 22, resolved: 20 },
  { day: "Dom", conversations: 15, resolved: 13 },
]

export const chatStatusDistribution = [
  { name: "Activo", value: 35, fill: "hsl(152 60% 42%)" },
  { name: "Asesorando", value: 25, fill: "hsl(200 70% 50%)" },
  { name: "Seguimiento", value: 18, fill: "hsl(38 92% 50%)" },
  { name: "Cerrado", value: 15, fill: "hsl(220 15% 65%)" },
  { name: "Inactivo", value: 7, fill: "hsl(0 72% 56%)" },
]

export const productSalesData = [
  { product: "Camisetas", vendidos: 145, ingresos: 4350 },
  { product: "Pantalones", vendidos: 98, ingresos: 5880 },
  { product: "Zapatos", vendidos: 76, ingresos: 6080 },
  { product: "Chaquetas", vendidos: 64, ingresos: 5760 },
  { product: "Accesorios", vendidos: 182, ingresos: 2730 },
  { product: "Vestidos", vendidos: 53, ingresos: 3710 },
]

export const agentSalesData = [
  { agent: "Carlos M.", ventas: 48, ingresos: 12400 },
  { agent: "Laura G.", ventas: 62, ingresos: 15800 },
  { agent: "Miguel T.", ventas: 35, ingresos: 8750 },
  { agent: "Ana R.", ventas: 71, ingresos: 18200 },
  { agent: "Diego H.", ventas: 22, ingresos: 5500 },
  { agent: "Patricia V.", ventas: 41, ingresos: 10250 },
  { agent: "Ricardo B.", ventas: 55, ingresos: 13750 },
]

export const monthlyData = [
  { month: "Sep", contacts: 320, conversations: 580 },
  { month: "Oct", contacts: 410, conversations: 720 },
  { month: "Nov", contacts: 380, conversations: 650 },
  { month: "Dic", contacts: 520, conversations: 890 },
  { month: "Ene", contacts: 480, conversations: 820 },
  { month: "Feb", contacts: 560, conversations: 940 },
]
