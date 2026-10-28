"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Bell,
  Box,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CircleHelp,
  CircleDollarSign,
  ClipboardList,
  ClipboardCheck,
  CreditCard,
  Download,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Moon,
  MoreHorizontal,
  Package,
  Phone,
  Plus,
  RotateCcw,
  Search,
  ScanBarcode,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingDown,
  TrendingUp,
  Truck,
  UserRound,
  UsersRound,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Role = "admin" | "employee";
type Page = "dashboard" | "products" | "inventory" | "defective-products" | "movements" | "reports" | "suppliers" | "settings" | "subscription";
type PlanId = "essencial" | "profissional" | "empresa";
type SubscriptionStatus = "teste" | "ativa" | "pagamento_atrasado" | "cancelada" | "pendente";
type Invoice = { id: string; createdAt: number; amount: number; status: "Paga" | "Pendente" | "Falhou"; receipt?: string };
type BillingEvent = { id: string; accountId: string; companyName: string; event: string; status: "Recebido" | "Processado" | "Falha"; createdAt: number; detail: string };
type SaasAccount = {
  id: string;
  ownerName: string;
  companyName: string;
  email: string;
  password: string;
  cnpj?: string;
  address?: string;
  companyLogo?: string;
  profilePhoto?: string;
  plan: PlanId;
  subscriptionStatus: SubscriptionStatus;
  createdAt: number;
  renewalAt: number;
  trialEndsAt?: number;
  lastAccessAt?: number;
  usersUsed?: number;
  paymentMethod?: string;
  cancellationReason?: string;
  invoices: Invoice[];
};
type PortalSession = { role: Role; account: SaasAccount } | { internal: true };
type TenantData = {
  products: Product[];
  movements: Movement[];
  defectiveProducts: DefectiveProduct[];
  physicalCounts: Record<number, number | "">;
  inventoryHistory: InventoryRecord[];
  inventoryReminder: string;
};
type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minimum: number;
  price: number;
  unit: string;
  brand?: string;
  notes?: string;
};
type Movement = {
  id: number;
  type: "Entrada" | "Saída";
  product: string;
  quantity: number;
  date: string;
  user: string;
};
type DefectiveProduct = {
  id: number;
  name: string;
  code: string;
  description: string;
  reportedAt: number;
  reportedBy: string;
};
type InventoryAdjustment = {
  productId: number;
  productName: string;
  systemQuantity: number;
  physicalQuantity: number;
  adjustment: number;
  unitPrice: number;
  financialDifference: number;
};
type InventoryRecord = {
  id: number;
  countedAt: number;
  countedBy: string;
  items: InventoryAdjustment[];
};

const initialProducts: Product[] = [
  { id: 1, name: "Papel sulfite A4", sku: "ESC-001", category: "Escritório", stock: 84, minimum: 20, price: 29.9, unit: "resma", brand: "Report" },
  { id: 2, name: "Café torrado e moído", sku: "ALI-014", category: "Alimentos e bebidas", stock: 12, minimum: 15, price: 18.5, unit: "pacote", brand: "Serra Alta" },
  { id: 3, name: "Detergente neutro", sku: "LIM-008", category: "Limpeza", stock: 36, minimum: 10, price: 4.5, unit: "L", brand: "Brilho" },
  { id: 4, name: "Cabo USB-C", sku: "ELE-022", category: "Eletrônicos", stock: 7, minimum: 10, price: 24.9, unit: "un", brand: "Conecta" },
  { id: 5, name: "Parafuso sextavado", sku: "FER-012", category: "Ferramentas e materiais", stock: 28, minimum: 8, price: 0.8, unit: "un", brand: "FixPro" },
  { id: 6, name: "Álcool 70%", sku: "HIG-002", category: "Higiene e saúde", stock: 3, minimum: 12, price: 9.9, unit: "mL", brand: "Bem-estar" },
];

const initialMovements: Movement[] = [
  { id: 1, type: "Entrada", product: "Papel sulfite A4", quantity: 24, date: "Hoje, 10:42", user: "Marcos Silva" },
  { id: 2, type: "Saída", product: "Café torrado e moído", quantity: 4, date: "Hoje, 09:18", user: "Ana Costa" },
  { id: 3, type: "Entrada", product: "Detergente neutro", quantity: 12, date: "Hoje, 08:56", user: "Marcos Silva" },
  { id: 4, type: "Saída", product: "Cabo USB-C", quantity: 2, date: "Ontem, 16:32", user: "João Pedro" },
];

const chartData = [
  { day: "Seg", entries: 58, exits: 42 },
  { day: "Ter", entries: 72, exits: 49 },
  { day: "Qua", entries: 48, exits: 65 },
  { day: "Qui", entries: 86, exits: 55 },
  { day: "Sex", entries: 64, exits: 72 },
  { day: "Sáb", entries: 92, exits: 58 },
  { day: "Dom", entries: 68, exits: 45 },
];

const plans: { id: PlanId; name: string; price: number; description: string; features: string[]; highlighted?: boolean }[] = [
  { id: "essencial", name: "Essencial", price: 49, description: "Para organizar a rotina de pequenos negócios.", features: ["Até 200 produtos", "2 usuários", "Dashboard e relatórios", "Controle de entradas e saídas"] },
  { id: "profissional", name: "Profissional", price: 99, description: "Mais controle para equipes em crescimento.", features: ["Até 2.000 produtos", "5 usuários", "Inventário e acurácia", "Relatórios e histórico"], highlighted: true },
  { id: "empresa", name: "Empresa", price: 199, description: "Gestão completa para operações maiores.", features: ["Produtos ilimitados", "15 usuários", "Todos os recursos", "Suporte prioritário"] },
];

const planLimits: Record<PlanId, { products: number; users: number }> = {
  essencial: { products: 200, users: 2 },
  profissional: { products: 2000, users: 5 },
  empresa: { products: Infinity, users: 15 },
};

const statusLabels: Record<SubscriptionStatus, string> = {
  teste: "Teste grátis",
  ativa: "Ativa",
  pagamento_atrasado: "Pagamento atrasado",
  cancelada: "Cancelada",
  pendente: "Pagamento pendente",
};

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Produtos", icon: Package },
  { id: "defective-products", label: "Produtos com defeito", icon: AlertTriangle },
  { id: "inventory", label: "Inventário", icon: ClipboardCheck },
  { id: "movements", label: "Movimentações", icon: Activity },
  { id: "reports", label: "Relatórios", icon: ClipboardList },
  { id: "suppliers", label: "Fornecedores", icon: Truck },
  { id: "settings", label: "Configurações", icon: Settings },
  { id: "subscription", label: "Assinatura", icon: CreditCard },
];

const employeePages: Page[] = ["dashboard", "products", "inventory", "defective-products", "movements", "suppliers"];

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [accounts, setAccounts] = useState<SaasAccount[]>([]);
  const [billingEvents, setBillingEvents] = useState<BillingEvent[]>([]);
  const [activeAccount, setActiveAccount] = useState<SaasAccount | null>(null);
  const [internalAdmin, setInternalAdmin] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [subscriptionClock, setSubscriptionClock] = useState(Date.now());
  const [page, setPage] = useState<Page>("dashboard");
  const [dark, setDark] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [productCategory, setProductCategory] = useState("Todas as categorias");
  const [physicalCounts, setPhysicalCounts] = useState<Record<number, number | "">>(() =>
    initialProducts.reduce<Record<number, number | "">>((counts, product) => {
      counts[product.id] = "";
      return counts;
    }, {}),
  );
  const [inventoryHistory, setInventoryHistory] = useState<InventoryRecord[]>([]);
  const [inventoryReminder, setInventoryReminder] = useState("");
  const [inventoryReminderDue, setInventoryReminderDue] = useState(false);
  const [productCode, setProductCode] = useState("");
  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [movements, setMovements] = useState(initialMovements);
  const [defectiveProducts, setDefectiveProducts] = useState<DefectiveProduct[]>([]);
  const [modal, setModal] = useState<"product" | "movement" | null>(null);
  const [upgradePlan, setUpgradePlan] = useState<PlanId | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("stockly-theme");
    if (savedTheme === "dark") setDark(true);
    const savedAccounts = localStorage.getItem("stockly-saas-accounts");
    if (savedAccounts) {
      try {
        const parsed = JSON.parse(savedAccounts) as SaasAccount[];
        if (Array.isArray(parsed)) setAccounts(parsed);
      } catch {
        setNotice("Não foi possível carregar as contas de demonstração salvas neste navegador.");
      }
    }
    const savedBillingEvents = localStorage.getItem("stockly-billing-events");
    if (savedBillingEvents) {
      try {
        const parsedEvents = JSON.parse(savedBillingEvents) as BillingEvent[];
        if (Array.isArray(parsedEvents)) setBillingEvents(parsedEvents);
      } catch {
        setNotice("O histórico demonstrativo de pagamentos não pôde ser carregado.");
      }
    }
    const savedSession = localStorage.getItem("stockly-session");
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession) as { role?: Role; accountId?: string; internal?: boolean };
        if (session.internal) setInternalAdmin(true);
        else if (session.role && session.accountId) {
          const accountList = savedAccounts ? JSON.parse(savedAccounts) as SaasAccount[] : [];
          const account = accountList.find((item) => item.id === session.accountId);
          if (account) {
            setActiveAccount(account);
            setRole(session.role);
          }
        }
      } catch {
        localStorage.removeItem("stockly-session");
        setNotice("Sua sessão de demonstração não pôde ser recuperada. Entre novamente.");
      }
    }
  }, []);

  useEffect(() => {
    if (!activeAccount) return;
    setDataReady(false);
    const savedTenant = localStorage.getItem(`stockly-tenant-data:${activeAccount.id}`);
    if (savedTenant) {
      try {
        const tenant = JSON.parse(savedTenant) as TenantData;
        if (Array.isArray(tenant.products) && Array.isArray(tenant.movements)) {
          setProducts(tenant.products);
          setMovements(tenant.movements);
          setDefectiveProducts(Array.isArray(tenant.defectiveProducts) ? tenant.defectiveProducts : []);
          setPhysicalCounts(tenant.physicalCounts ?? {});
          setInventoryHistory(Array.isArray(tenant.inventoryHistory) ? tenant.inventoryHistory : []);
          setInventoryReminder(tenant.inventoryReminder ?? "");
          setDataReady(true);
          return;
        }
        setNotice(`Os dados locais da empresa ${activeAccount.companyName} estão incompletos; uma área de demonstração vazia foi iniciada.`);
      } catch {
        setNotice(`Não foi possível ler os dados locais da empresa ${activeAccount.companyName}. Uma área de demonstração vazia foi iniciada.`);
      }
    }
    setProducts(initialProducts.map((product) => ({ ...product })));
    setMovements(initialMovements.map((movement) => ({ ...movement })));
    setDefectiveProducts([]);
    setPhysicalCounts(initialProducts.reduce<Record<number, number | "">>((counts, product) => {
      counts[product.id] = "";
      return counts;
    }, {}));
    setInventoryHistory([]);
    setInventoryReminder("");
    setDataReady(true);
  }, [activeAccount?.id]);

  useEffect(() => {
    if (!activeAccount || !dataReady) return;
    const tenant: TenantData = { products, movements, defectiveProducts, physicalCounts, inventoryHistory, inventoryReminder };
    localStorage.setItem(`stockly-tenant-data:${activeAccount.id}`, JSON.stringify(tenant));
  }, [activeAccount, dataReady, defectiveProducts, inventoryHistory, inventoryReminder, movements, physicalCounts, products]);

  useEffect(() => {
    if (!activeAccount) return;
    const timer = window.setInterval(() => setSubscriptionClock(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, [activeAccount?.id]);

  useEffect(() => {
    if (accounts.length) localStorage.setItem("stockly-saas-accounts", JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem("stockly-billing-events", JSON.stringify(billingEvents.slice(0, 100)));
  }, [billingEvents]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("stockly-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    setPhysicalCounts((current) => products.reduce<Record<number, number | "">>((counts, product) => {
      counts[product.id] = current[product.id] ?? "";
      return counts;
    }, { ...current }));
  }, [products]);

  useEffect(() => {
    if (!inventoryReminder) return;
    const checkReminder = () => {
      if (new Date(inventoryReminder).getTime() > Date.now()) return;
      localStorage.removeItem("stockly-inventory-reminder");
      setInventoryReminder("");
      setInventoryReminderDue(true);
      setNotice("Lembrete: está na hora de realizar a contagem do inventário.");
      window.setTimeout(() => setNotice(""), 5000);
    };
    checkReminder();
    const timer = window.setInterval(checkReminder, 30000);
    return () => window.clearInterval(timer);
  }, [inventoryReminder]);

  const lowStock = products.filter((product) => product.stock <= product.minimum);
  const availableNavItems = navItems.filter(
    ({ id }) => role === "admin" || employeePages.includes(id),
  );
  const filteredProducts = useMemo(
    () => {
      const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
      return products.filter((product) => {
        const matchesSearch = !normalizedSearch || Object.values(product)
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch);
        const matchesCategory =
          productCategory === "Todas as categorias" || product.category === productCategory;
        return matchesSearch && matchesCategory;
      });
    },
    [products, productCategory, search],
  );

  function signIn(email: string, password: string): PortalSession | null {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === "root@estoque3irmaos.com.br" && password === "root123") {
      localStorage.setItem("stockly-session", JSON.stringify({ internal: true }));
      setDataReady(false);
      setInternalAdmin(true);
      setRole(null);
      setActiveAccount(null);
      return { internal: true };
    }
    const legacyRole: Role | null =
      normalizedEmail === "admin@estoque3irmaos.com.br" && password === "admin123"
        ? "admin"
        : normalizedEmail === "funcionario@estoque3irmaos.com.br" && password === "func123"
          ? "employee"
          : null;
    if (legacyRole) {
      const demoAccount: SaasAccount = {
        id: "estoque3-demo",
        ownerName: legacyRole === "admin" ? "Marcos Silva" : "Ana Costa",
        companyName: "Estoque Aqui",
        email: normalizedEmail,
        password,
        plan: "profissional",
        subscriptionStatus: "ativa",
        createdAt: Date.now(),
        renewalAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        usersUsed: 3,
        invoices: [],
      };
      setDataReady(false);
      setActiveAccount(demoAccount);
      setSubscriptionClock(Date.now());
      setRole(legacyRole);
      setInternalAdmin(false);
      setPage("dashboard");
      localStorage.setItem("stockly-session", JSON.stringify({ role: legacyRole, accountId: demoAccount.id }));
      return { role: legacyRole, account: demoAccount };
    }
    const savedAccount = accounts.find((item) => item.email.toLowerCase() === normalizedEmail && item.password === password);
    const account = savedAccount ? { ...savedAccount, lastAccessAt: Date.now() } : null;
    if (!account) return null;
    setAccounts((current) => current.map((item) => item.id === account.id ? account : item));
    setDataReady(false);
    setActiveAccount(account);
    setSubscriptionClock(Date.now());
    setRole("admin");
    setInternalAdmin(false);
    setPage("dashboard");
    localStorage.setItem("stockly-session", JSON.stringify({ role: "admin", accountId: account.id }));
    return { role: "admin", account };
  }

  function createAccount(account: SaasAccount) {
    setAccounts((current) => [...current, account]);
    setActiveAccount(account);
    setSubscriptionClock(Date.now());
    setRole("admin");
    setInternalAdmin(false);
    setPage("dashboard");
    localStorage.setItem("stockly-session", JSON.stringify({ role: "admin", accountId: account.id }));
    setDataReady(false);
    addBillingEvent({
      id: `evt-${Date.now()}`,
      accountId: account.id,
      companyName: account.companyName,
      event: "subscription.trial_started",
      status: "Processado",
      createdAt: Date.now(),
      detail: `Período de teste iniciado para o plano ${plans.find((item) => item.id === account.plan)?.name}. Nenhuma cobrança realizada.`,
    });
    flash("Empresa criada. Sua área de estoque está pronta para começar.");
  }

  function updateAccount(updated: SaasAccount) {
    setAccounts((current) => current.some((account) => account.id === updated.id)
      ? current.map((account) => account.id === updated.id ? updated : account)
      : [...current, updated]);
    if (activeAccount?.id === updated.id) setActiveAccount(updated);
  }

  function addBillingEvent(event: BillingEvent) {
    setBillingEvents((current) => [event, ...current].slice(0, 100));
  }

  function regularizeSubscription(account: SaasAccount) {
    const now = Date.now();
    const plan = plans.find((item) => item.id === account.plan);
    const invoice: Invoice = {
      id: `TEST-${now}`,
      createdAt: now,
      amount: plan?.price ?? 0,
      status: "Paga",
      receipt: `RECIBO-DEMO-${now}`,
    };
    const updated: SaasAccount = {
      ...account,
      subscriptionStatus: "ativa",
      paymentMethod: account.paymentMethod === "Nenhuma cadastrada" ? "Visa final 4242 (simulação)" : account.paymentMethod,
      renewalAt: now + 30 * 24 * 60 * 60 * 1000,
      invoices: [invoice, ...account.invoices],
    };
    updateAccount(updated);
    addBillingEvent({
      id: `evt-${now}`,
      accountId: updated.id,
      companyName: updated.companyName,
      event: "invoice.payment_succeeded",
      status: "Processado",
      createdAt: now,
      detail: `Pagamento de teste no valor de ${money(invoice.amount)} simulado com sucesso.`,
    });
    flash("Assinatura regularizada no modo de demonstração. Nenhum pagamento foi processado.");
  }

  function cancelSubscription(account: SaasAccount, reason: string) {
    updateAccount({ ...account, subscriptionStatus: "cancelada", cancellationReason: reason });
    addBillingEvent({
      id: `evt-${Date.now()}`,
      accountId: account.id,
      companyName: account.companyName,
      event: "customer.subscription.cancelled",
      status: "Processado",
      createdAt: Date.now(),
      detail: `Cancelamento solicitado. Motivo informado: ${reason}. Acesso mantido até a renovação.`,
    });
  }

  function simulatePaymentFailure(account: SaasAccount) {
    const now = Date.now();
    const plan = plans.find((item) => item.id === account.plan);
    const failedInvoice: Invoice = {
      id: `TEST-${now}`,
      createdAt: now,
      amount: plan?.price ?? 0,
      status: "Falhou",
    };
    updateAccount({ ...account, subscriptionStatus: "pagamento_atrasado", invoices: [failedInvoice, ...account.invoices] });
    addBillingEvent({
      id: `evt-${now}`,
      accountId: account.id,
      companyName: account.companyName,
      event: "invoice.payment_failed",
      status: "Falha",
      createdAt: now,
      detail: "Evento demonstrativo de falha de pagamento. Nenhum gateway foi acionado.",
    });
  }

  function changeSubscriptionPlan(account: SaasAccount, planId: PlanId) {
    const now = Date.now();
    const plan = plans.find((item) => item.id === planId);
    if (!plan) return;
    const updated = {
      ...account,
      plan: planId,
      subscriptionStatus: "ativa" as const,
      paymentMethod: account.paymentMethod === "Nenhuma cadastrada" ? "Visa final 4242 (simulação)" : account.paymentMethod,
      renewalAt: now + 30 * 24 * 60 * 60 * 1000,
      invoices: [{
        id: `TEST-${now}`,
        createdAt: now,
        amount: plan.price,
        status: "Paga" as const,
        receipt: `RECIBO-DEMO-${now}`,
      }, ...account.invoices],
    };
    updateAccount(updated);
    addBillingEvent({
      id: `evt-${now}`,
      accountId: account.id,
      companyName: account.companyName,
      event: "subscription.updated",
      status: "Processado",
      createdAt: now,
      detail: `Plano alterado para ${plan.name}. Alteração demonstrativa sem cobrança.`,
    });
    flash(`Plano ${plan.name} aplicado no modo de demonstração.`);
  }

  function updateEmployeeUsage(account: SaasAccount) {
    const currentUsers = account.usersUsed ?? 1;
    const limit = planLimits[account.plan].users;
    if (currentUsers >= limit) {
      if (account.plan === "empresa") {
        flash("O plano Empresa já atingiu o limite demonstrativo de usuários.");
        return;
      }
      const nextPlan = account.plan === "essencial" ? "profissional" : "empresa";
      setUpgradePlan(nextPlan);
      return;
    }
    updateAccount({ ...account, usersUsed: currentUsers + 1 });
    flash("Usuário de demonstração adicionado ao uso do plano.");
  }

  function signOut() {
    localStorage.removeItem("stockly-session");
    setRole(null);
    setActiveAccount(null);
    setInternalAdmin(false);
    setDataReady(false);
    setPage("dashboard");
  }

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  function navigateTo(target: Page) {
    if (role === "employee" && !employeePages.includes(target)) {
      flash("Essa opção está disponível apenas para administradores.");
      return;
    }
    setPage(target);
    setMobileMenu(false);
  }

  function toggleSidebar() {
    if (window.matchMedia("(max-width: 640px)").matches) {
      setMobileMenu(false);
      return;
    }
    setSidebarCollapsed((collapsed) => !collapsed);
  }

  function applyInventoryCounts() {
    const uncountedProducts = products.filter((product) => typeof physicalCounts[product.id] !== "number");
    if (uncountedProducts.length) {
      flash(`Informe a contagem física de todos os produtos. Faltam ${uncountedProducts.length}.`);
      return;
    }
    const countedAt = Date.now();
    const items = products.map((product) => {
      const physicalQuantity = physicalCounts[product.id] as number;
      const adjustment = physicalQuantity - product.stock;
      return {
        productId: product.id,
        productName: product.name,
        systemQuantity: product.stock,
        physicalQuantity,
        adjustment,
        unitPrice: product.price,
        financialDifference: adjustment * product.price,
      };
    });
    const changedItems = items.filter((item) => item.adjustment !== 0);
    const record: InventoryRecord = {
      id: countedAt,
      countedAt,
      countedBy: role === "admin" ? "Marcos Silva" : "Ana Costa",
      items,
    };

    setInventoryHistory((current) => [record, ...current]);
    setProducts((current) => current.map((product) => ({
      ...product,
      stock: physicalCounts[product.id] as number,
    })));
    if (changedItems.length) {
      setMovements((current) => [
        ...changedItems.map((item, index) => ({
          id: countedAt + index + 1,
          type: item.adjustment > 0 ? "Entrada" as const : "Saída" as const,
          product: item.productName,
          quantity: Math.abs(item.adjustment),
          date: "Agora",
          user: role === "admin" ? "Marcos Silva" : "Ana Costa",
        })),
        ...current,
      ]);
    }
    setInventoryReminderDue(false);
    flash(changedItems.length
      ? `Inventário concluído. ${changedItems.length} produto(s) ajustado(s).`
      : "Inventário concluído. Todos os produtos conferem com o sistema.");
  }

  function saveInventoryReminder(dateTime: string) {
    if (!dateTime || new Date(dateTime).getTime() <= Date.now()) {
      flash("Escolha uma data e horário futuros para o lembrete.");
      return;
    }
    localStorage.setItem("stockly-inventory-reminder", dateTime);
    setInventoryReminder(dateTime);
    setInventoryReminderDue(false);
    flash("Lembrete de contagem agendado.");
  }

  function clearInventoryReminder() {
    localStorage.removeItem("stockly-inventory-reminder");
    setInventoryReminder("");
    setInventoryReminderDue(false);
    flash("Lembrete de inventário removido.");
  }

  function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const product: Product = {
      id: Date.now(),
      name: String(data.get("name")).trim(),
      sku: String(data.get("sku")).trim().toUpperCase(),
      category: String(data.get("category")),
      brand: String(data.get("brand")).trim(),
      notes: String(data.get("notes")).trim(),
      stock: Number(data.get("stock")),
      minimum: Number(data.get("minimum")),
      price: Number(data.get("price")),
      unit: String(data.get("unit")),
    };
    setPhysicalCounts((current) => ({ ...current, [product.id]: product.stock }));
    setProducts((current) => [product, ...current]);
    setModal(null);
    setProductCode("");
    setBarcodeScannerOpen(false);
    flash("Produto cadastrado com sucesso.");
  }

  function openProductModal() {
    const limit = planLimits[activeAccount?.plan ?? "essencial"].products;
    if (products.length >= limit) {
      setUpgradePlan(activeAccount?.plan === "essencial" ? "profissional" : "empresa");
      return;
    }
    setProductCode("");
    setBarcodeScannerOpen(false);
    setModal("product");
  }

  function addMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const productId = Number(data.get("product"));
    const quantity = Number(data.get("quantity"));
    const type = String(data.get("type")) as Movement["type"];
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    if (type === "Saída" && quantity > product.stock) {
      flash("Quantidade de saída maior que o estoque disponível.");
      return;
    }
    setProducts((current) =>
      current.map((item) =>
        item.id === productId
          ? { ...item, stock: item.stock + (type === "Entrada" ? quantity : -quantity) }
          : item,
      ),
    );
    setMovements((current) => [
      {
        id: Date.now(),
        type,
        product: product.name,
        quantity,
        date: "Agora",
        user: role === "admin" ? "Administrador" : "Funcionário",
      },
      ...current,
    ]);
    setModal(null);
    flash(`${type} registrada com sucesso.`);
  }

  function addDefectiveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    const description = String(data.get("description")).trim();
    if (!name || !description) return;
    setDefectiveProducts((current) => [{
      id: Date.now(),
      name,
      code: String(data.get("code")).trim(),
      description,
      reportedAt: Date.now(),
      reportedBy: role === "admin" ? "Marcos Silva" : "Ana Costa",
    }, ...current]);
    event.currentTarget.reset();
    flash("Produto com defeito registrado.");
  }

  if (internalAdmin) {
    return <InternalAdminPanel accounts={accounts} billingEvents={billingEvents} onUpdate={updateAccount} onRegularize={regularizeSubscription} onSimulatePaymentFailure={simulatePaymentFailure} onSignOut={signOut} dark={dark} setDark={setDark} />;
  }

  if (!role || !activeAccount) {
    return <SaasPublicPortal accounts={accounts} onLogin={signIn} onCreateAccount={createAccount} dark={dark} setDark={setDark} notice={notice} />;
  }

  const trialDaysRemaining = activeAccount.trialEndsAt
    ? Math.max(0, Math.ceil((activeAccount.trialEndsAt - subscriptionClock) / (24 * 60 * 60 * 1000)))
    : 0;
  const subscriptionSuspended = activeAccount.subscriptionStatus === "pagamento_atrasado"
    || activeAccount.subscriptionStatus === "pendente"
    || (activeAccount.subscriptionStatus === "teste" && trialDaysRemaining === 0)
    || (activeAccount.subscriptionStatus === "cancelada" && subscriptionClock > activeAccount.renewalAt);
  if (subscriptionSuspended && role === "admin") {
    return <SuspendedAccountPage account={activeAccount} onRegularize={() => regularizeSubscription(activeAccount)} onSignOut={signOut} dark={dark} notice={notice} />;
  }

  const pageTitle = availableNavItems.find((item) => item.id === page)?.label ?? "Dashboard";

  return (
    <main className={`app-shell ${dark ? "theme-dark" : ""} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {mobileMenu && <button aria-label="Fechar menu" className="mobile-backdrop" onClick={() => setMobileMenu(false)} />}
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="sidebar-header"><div className="brand-lockup sidebar-brand"><span className="brand-icon"><Box size={21} /></span><span>Estoque <span className="brand-dot">Aqui</span></span></div><button className="sidebar-toggle" onClick={toggleSidebar} aria-label={mobileMenu ? "Fechar menu lateral" : sidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"} title={mobileMenu ? "Fechar menu" : sidebarCollapsed ? "Expandir menu" : "Recolher menu"}>{sidebarCollapsed && !mobileMenu ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</button></div>
        <div className="workspace-switch"><span className="workspace-logo">{activeAccount.companyLogo ? <img src={activeAccount.companyLogo} alt="" /> : <Wrench size={17} />}</span><span><strong>{activeAccount.companyName}</strong><small>Gestão de estoque</small></span><ChevronDown size={15} /></div>
        <div className="nav-caption">MENU PRINCIPAL</div>
        <nav className="main-nav" aria-label="Navegação principal">
          {availableNavItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-link ${page === id ? "active" : ""}`} aria-current={page === id ? "page" : undefined} onClick={() => navigateTo(id)}>
              <Icon size={18} /><span>{label}</span>{id === "products" && lowStock.length > 0 && <span className="nav-badge">{lowStock.length}</span>}{id === "inventory" && inventoryReminderDue && <span className="nav-badge">!</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="help-card"><div className="help-card-icon"><CircleHelp size={18} /></div><strong>Precisa de ajuda?</strong><p>Nosso time está pronto para ajudar você.</p><button onClick={() => flash("Nosso time entrará em contato em breve.")}>Falar com suporte <ArrowRight size={14} /></button></div>
        <div className="profile-row"><div className="avatar">{activeAccount.profilePhoto ? <img src={activeAccount.profilePhoto} alt="" /> : role === "admin" ? activeAccount.ownerName.slice(0, 2).toUpperCase() : "AC"}</div><div className="profile-info"><strong>{role === "admin" ? activeAccount.ownerName : "Ana Costa"}</strong><small>{role === "admin" ? "Administrador" : "Funcionário"}</small></div><button className="profile-logout" title="Sair" aria-label="Sair da conta" onClick={signOut}><LogOut size={17} /></button></div>
      </aside>
      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><button className="mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu size={20} /></button><span>Estoque Aqui</span><ChevronRight size={14} /><strong>{pageTitle}</strong></div>
          <div className="topbar-actions">
            <div className="date-pill"><span className="online-dot" />Estoque atualizado</div>
            <button className="icon-button notification-button" aria-label="Notificações" onClick={() => navigateTo(inventoryReminderDue ? "inventory" : "products")}><Bell size={18} />{(lowStock.length > 0 || inventoryReminderDue) && <i />}</button>
            <button className="icon-button" onClick={() => setDark(!dark)} aria-label="Alternar tema">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <div className="topbar-user"><div className="topbar-avatar">{activeAccount.profilePhoto ? <img src={activeAccount.profilePhoto} alt="" /> : role === "admin" ? activeAccount.ownerName.slice(0, 2).toUpperCase() : "AC"}</div><span><strong>{role === "admin" ? activeAccount.ownerName : "Ana Costa"}</strong><small>{role === "admin" ? "Administrador" : "Funcionário"}</small></span></div>
            <button className="icon-button" title="Sair da conta" aria-label="Sair da conta" onClick={signOut}><LogOut size={17} /></button>
          </div>
        </header>

        <div className="content">
          <SubscriptionNotice account={activeAccount} daysRemaining={trialDaysRemaining} onManage={() => navigateTo("subscription")} />
          {page === "dashboard" && <Dashboard products={products} movements={movements} lowStock={lowStock} onNavigate={navigateTo} onModal={setModal} />}
          {page === "products" && <ProductsPage products={filteredProducts} allProducts={products} search={search} setSearch={setSearch} category={productCategory} setCategory={setProductCategory} onModal={openProductModal} isAdmin={role === "admin"} onDelete={(id) => { setProducts((current) => current.filter((item) => item.id !== id)); flash("Produto removido."); }} />}
          {page === "inventory" && <InventoryPage products={products} physicalCounts={physicalCounts} onCountChange={(productId, quantity) => setPhysicalCounts((current) => ({ ...current, [productId]: quantity }))} onApply={applyInventoryCounts} history={inventoryHistory} reminder={inventoryReminder} reminderDue={inventoryReminderDue} onSaveReminder={saveInventoryReminder} onClearReminder={clearInventoryReminder} />}
          {page === "defective-products" && <DefectiveProductsPage defectiveProducts={defectiveProducts} onSubmit={addDefectiveProduct} />}
          {page === "movements" && <MovementsPage movements={movements} onModal={() => setModal("movement")} />}
          {page === "reports" && role === "admin" && <ReportsPage products={products} movements={movements} inventoryHistory={inventoryHistory} />}
          {page === "suppliers" && <SuppliersPage onNotice={flash} />}
          {page === "settings" && role === "admin" && <SettingsPage role={role} account={activeAccount} dark={dark} setDark={setDark} onUpdate={updateAccount} onNotice={flash} onAddUser={() => updateEmployeeUsage(activeAccount)} onUpgrade={() => setUpgradePlan(activeAccount.plan === "essencial" ? "profissional" : "empresa")} />}
          {page === "subscription" && role === "admin" && <SubscriptionPage account={activeAccount} productCount={products.length} onUpdate={updateAccount} onCancel={(reason) => cancelSubscription(activeAccount, reason)} onChangePlan={(planId) => changeSubscriptionPlan(activeAccount, planId)} onNotice={flash} />}
        </div>
      </section>

      {upgradePlan && <UpgradePrompt currentPlan={activeAccount.plan} targetPlan={upgradePlan} onClose={() => setUpgradePlan(null)} onUpgrade={() => { changeSubscriptionPlan(activeAccount, upgradePlan); setUpgradePlan(null); }} onViewSubscription={() => { setUpgradePlan(null); navigateTo("subscription"); }} />}
      {modal && <Modal title={modal === "product" ? "Cadastrar novo produto" : "Nova movimentação"} onClose={() => { setModal(null); setBarcodeScannerOpen(false); }}>
        {modal === "product" ? <form className="modal-form" onSubmit={addProduct}>
          <label>Nome do produto<input name="name" placeholder="Ex.: Papel, alimento, peça ou material" required /></label>
          <div className="form-grid barcode-form-row"><label>Código ou SKU<input name="sku" value={productCode} onChange={(event) => setProductCode(event.target.value)} placeholder="Leia ou digite o código" required /></label><button type="button" className="secondary-button barcode-trigger" onClick={() => setBarcodeScannerOpen((open) => !open)}><ScanBarcode size={16} />{barcodeScannerOpen ? "Fechar leitor" : "Ler código"}</button></div>
          {barcodeScannerOpen && <BarcodeScanner onDetected={(code) => { setProductCode(code); setBarcodeScannerOpen(false); flash("Código de barras lido."); }} />}
          <div className="form-grid"><label>Categoria<input name="category" list="product-categories" placeholder="Ex.: Alimentos, limpeza, peças..." required /><datalist id="product-categories"><option value="Alimentos e bebidas" /><option value="Eletrônicos" /><option value="Escritório" /><option value="Ferramentas e materiais" /><option value="Higiene e saúde" /><option value="Limpeza" /><option value="Matéria-prima" /><option value="Roupas e acessórios" /><option value="Outros" /></datalist></label><label>Marca (opcional)<input name="brand" placeholder="Ex.: fabricante ou marca" maxLength={60} /></label></div>
          <div className="form-grid"><label>Unidade de medida<select name="unit" defaultValue="un"><option value="un">Unidade (un)</option><option value="kg">Quilograma (kg)</option><option value="g">Grama (g)</option><option value="L">Litro (L)</option><option value="mL">Mililitro (mL)</option><option value="m">Metro (m)</option><option value="cm">Centímetro (cm)</option><option value="caixa">Caixa</option><option value="pacote">Pacote</option><option value="par">Par</option><option value="dúzia">Dúzia</option><option value="rolo">Rolo</option><option value="resma">Resma</option><option value="galão">Galão</option></select></label><label>Estoque inicial<input name="stock" type="number" min="0" defaultValue="0" required /></label></div>
          <div className="form-grid"><label>Estoque mínimo<input name="minimum" type="number" min="0" defaultValue="5" required /></label><label>Preço por unidade<input name="price" type="number" min="0" step="0.01" placeholder="0,00" required /></label></div>
          <label className="product-notes-field">Observações (opcional)<textarea name="notes" rows={2} maxLength={240} placeholder="Detalhes importantes, validade, tamanho, cor ou localização..." /></label>
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancelar</button><button className="primary-button" type="submit"><Plus size={16} />Cadastrar produto</button></div>
        </form> : <form className="modal-form" onSubmit={addMovement}>
          <label>Tipo de movimentação<select name="type"><option>Entrada</option><option>Saída</option></select></label>
          <label>Produto<select name="product" required>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.stock} {product.unit}</option>)}</select></label>
          <label>Quantidade<input name="quantity" type="number" min="1" defaultValue="1" required /></label>
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancelar</button><button className="primary-button" type="submit"><Check size={16} />Registrar movimentação</button></div>
        </form>}
      </Modal>}
      {notice && <div className="toast"><Check size={16} />{notice}</div>}
    </main>
  );
}

function SaasPublicPortal({
  accounts,
  onLogin,
  onCreateAccount,
  dark,
  setDark,
  notice,
}: {
  accounts: SaasAccount[];
  onLogin: (email: string, password: string) => PortalSession | null;
  onCreateAccount: (account: SaasAccount) => void;
  dark: boolean;
  setDark: (value: boolean) => void;
  notice: string;
}) {
  const [view, setView] = useState<"landing" | "login" | "register" | "checkout">("landing");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("profissional");
  const [draft, setDraft] = useState<{ ownerName: string; companyName: string; email: string; password: string } | null>(null);
  const [error, setError] = useState("");
  const [legalDialog, setLegalDialog] = useState<"terms" | "privacy" | null>(null);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    let previousScroll = window.scrollY;
    let animationFrame = 0;
    const updateScroll = () => {
      animationFrame = 0;
      const currentScroll = Math.max(0, window.scrollY);
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? Math.round((currentScroll / scrollableHeight) * 100) : 0;
      setScrollProgress(progress);
      setShowScrollTop(currentScroll > 420);
      if (Math.abs(currentScroll - previousScroll) > 3) {
        setScrollDirection(currentScroll > previousScroll ? "down" : "up");
        previousScroll = currentScroll;
      }
    };
    const handleScroll = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateScroll);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    if (view !== "landing") return;
    const targets = document.querySelectorAll<HTMLElement>("[data-scroll-reveal]");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [view]);

  function choosePlan(plan: PlanId) {
    setSelectedPlan(plan);
    setView("register");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const formDraft = {
      ownerName: String(data.get("ownerName")).trim(),
      companyName: String(data.get("companyName")).trim(),
      email: String(data.get("email")).trim().toLowerCase(),
      password: String(data.get("password")),
    };
    if (accounts.some((account) => account.email.toLowerCase() === formDraft.email)
      || ["admin@estoque3irmaos.com.br", "funcionario@estoque3irmaos.com.br", "root@estoque3irmaos.com.br"].includes(formDraft.email)) {
      setError("Já existe uma conta de demonstração com este e-mail.");
      return;
    }
    setDraft(formDraft);
    setError("");
    setView("checkout");
  }

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const session = onLogin(String(data.get("email")), String(data.get("password")));
    if (!session) {
      setError("E-mail ou senha incorretos, ou assinatura inativa.");
      return;
    }
    setError("");
  }

  function approveTestSubscription() {
    if (!draft) {
      setError("O cadastro da empresa não foi encontrado. Inicie o cadastro novamente.");
      setView("register");
      return;
    }
    const now = Date.now();
    const plan = plans.find((item) => item.id === selectedPlan);
    if (!plan) {
      setError("Plano inválido. Escolha um plano para continuar.");
      return;
    }
    const account: SaasAccount = {
      ...draft,
      id: `tenant-${now}-${Math.random().toString(36).slice(2, 8)}`,
      plan: selectedPlan,
      subscriptionStatus: "teste",
      createdAt: now,
      renewalAt: now + 14 * 24 * 60 * 60 * 1000,
      trialEndsAt: now + 14 * 24 * 60 * 60 * 1000,
      lastAccessAt: now,
      usersUsed: 1,
      paymentMethod: "Nenhuma cadastrada",
      invoices: [],
    };
    onCreateAccount(account);
  }

  return (
    <main className={`saas-portal ${dark ? "theme-dark" : ""}`}>
      <div className="scroll-progress" aria-hidden="true"><span style={{ width: `${scrollProgress}%` }} /></div>
      <header className={`saas-nav ${scrollDirection === "down" && scrollProgress > 2 ? "saas-nav-hidden" : ""}`}>
        <a className="saas-brand" href="#inicio" onClick={(event) => { event.preventDefault(); setView("landing"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <span className="brand-icon"><Box size={20} /></span><span>Estoque <b>Aqui</b></span>
        </a>
        <nav aria-label="Navegação do site">
          <a href="#recursos" onClick={() => setView("landing")}>Recursos</a>
          <a href="#planos" onClick={() => setView("landing")}>Planos</a>
        </nav>
        <div className="saas-nav-actions">
          <button className="icon-button" onClick={() => setDark(!dark)} aria-label="Alternar tema">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button className="saas-login-link" onClick={() => { setError(""); setView("login"); }}>Entrar</button>
          <button className="primary-button saas-nav-cta" onClick={() => choosePlan("profissional")}>Criar conta <ArrowRight size={16} /></button>
        </div>
      </header>

      {view === "landing" && <>
        <section className="saas-hero" id="inicio">
          <div className="saas-hero-copy">
            <span className="saas-pill"><Sparkles size={14} /> GESTÃO INTELIGENTE PARA O SEU NEGÓCIO</span>
            <h1>Estoque organizado.<br /><span>Negócio no controle.</span></h1>
            <p>Uma plataforma simples para controlar produtos, movimentações e inventários de qualquer tipo de negócio, com tudo organizado em um só lugar.</p>
            <div className="saas-hero-actions"><button className="primary-button" onClick={() => choosePlan("profissional")}>Começar agora <ArrowRight size={17} /></button><a href="#recursos">Conhecer recursos <ArrowDownRight size={17} /></a></div>
            <div className="saas-proof"><div className="saas-proof-avatars"><span>3I</span><span>AP</span><span>LJ</span></div><p><strong>Feito para quem faz acontecer</strong><small>Controle em um só lugar, no computador ou celular.</small></p></div>
          </div>
          <div className="saas-hero-visual" aria-label="Prévia do painel de estoque">
            <div className="saas-visual-glow" />
            <div className="saas-preview-window">
              <div className="saas-preview-top"><span><i /><i /><i /></span><small>Visão geral do estoque</small><span className="saas-preview-live">AO VIVO</span></div>
              <div className="saas-preview-welcome"><div><small>TERÇA-FEIRA, 18 DE JUNHO</small><h3>Bom dia, Marcos 👋</h3></div><span className="saas-preview-avatar">MS</span></div>
              <div className="saas-preview-metrics"><div><small>Produtos ativos</small><strong>1.284</strong><em>+12 esta semana</em></div><div><small>Valor em estoque</small><strong>R$ 48.650</strong><em>↗ 8,2% este mês</em></div></div>
              <div className="saas-preview-chart"><div><span>Movimentações da semana</span><small>Entradas&nbsp;&nbsp; Saídas</small></div><div className="saas-chart-bars">{[42, 63, 49, 78, 56, 90, 68, 51, 74, 46, 83, 60, 94, 72].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="saas-chart-days"><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span><span>DOM</span></div></div>
              <div className="saas-preview-alert"><span><AlertTriangle size={15} /></span><div><strong>Estoque baixo</strong><small>3 produtos precisam de reposição</small></div><ArrowRight size={15} /></div>
            </div>
            <div className="saas-float-card"><span><CheckCircle2 size={17} /></span><div><strong>Inventário atualizado</strong><small>Acurácia de 98,6%</small></div></div>
          </div>
          <div className="saas-hero-foot"><span><ShieldCheck size={15} /> Acesso por empresa</span><span><CreditCard size={15} /> Assinatura flexível</span><span><LockKeyhole size={15} /> Protótipo sem cobrança real</span></div>
        </section>

        <section className="saas-features" id="recursos" data-scroll-reveal>
          <div className="saas-section-heading"><span className="eyebrow">TUDO EM UM SÓ LUGAR</span><h2>Mais clareza para cuidar<br />de cada detalhe.</h2><p>Ferramentas para acompanhar sua operação do recebimento à contagem.</p></div>
          <div className="saas-feature-grid">
            <article data-scroll-reveal><span className="saas-feature-icon green"><Package size={21} /></span><h3>Produtos organizados</h3><p>Cadastre itens, categorias, preços e níveis mínimos com pesquisa e filtros rápidos.</p></article>
            <article data-scroll-reveal><span className="saas-feature-icon gold"><Activity size={21} /></span><h3>Movimentações claras</h3><p>Acompanhe entradas, saídas e ajustes com histórico e identificação do responsável.</p></article>
            <article data-scroll-reveal><span className="saas-feature-icon red"><ClipboardCheck size={21} /></span><h3>Inventário preciso</h3><p>Compare o físico com o sistema, visualize diferenças e mantenha o estoque alinhado.</p></article>
            <article data-scroll-reveal><span className="saas-feature-icon gold"><TrendingUp size={21} /></span><h3>Indicadores em tempo real</h3><p>Veja o valor do estoque, itens para repor e movimentações da operação.</p></article>
            <article data-scroll-reveal><span className="saas-feature-icon green"><AlertTriangle size={21} /></span><h3>Produtos com defeito</h3><p>Registre avarias e mantenha o histórico de qualidade sempre acessível.</p></article>
            <article data-scroll-reveal><span className="saas-feature-icon red"><UsersRound size={21} /></span><h3>Equipe e empresas</h3><p>Organize acessos e dados da empresa em uma área de demonstração dedicada.</p></article>
          </div>
        </section>

        <section className="saas-how-section" data-scroll-reveal>
          <div className="saas-section-heading"><span className="eyebrow">COMO FUNCIONA</span><h2>Do cadastro ao controle,<br />em três passos.</h2><p>Comece de forma simples e acompanhe a rotina do estoque em um só lugar.</p></div>
          <div className="saas-steps-grid">
            <article data-scroll-reveal><span className="saas-step-number">01</span><span className="saas-feature-icon green"><Building2 size={21} /></span><h3>Cadastre sua empresa</h3><p>Crie o perfil da empresa e a conta do administrador em uma única etapa.</p></article>
            <article data-scroll-reveal><span className="saas-step-number">02</span><span className="saas-feature-icon gold"><Package size={21} /></span><h3>Organize os produtos</h3><p>Cadastre itens, níveis mínimos e fornecedores para montar seu catálogo.</p></article>
            <article data-scroll-reveal><span className="saas-step-number">03</span><span className="saas-feature-icon red"><Zap size={21} /></span><h3>Acompanhe e decida</h3><p>Registre movimentos, confira inventários e use os indicadores para agir.</p></article>
          </div>
        </section>

        <section className="saas-pricing-section" id="planos" data-scroll-reveal>
          <div className="saas-section-heading"><span className="eyebrow">PLANOS</span><h2>Comece no seu ritmo.</h2><p>Valores ilustrativos para o protótipo. Nenhuma cobrança será realizada.</p></div>
          <PlanCards onChoose={choosePlan} />
        </section>

        <section className="saas-final-cta" data-scroll-reveal><div><span className="eyebrow">PRONTO PARA ORGANIZAR?</span><h2>Seu estoque merece<br />um controle melhor.</h2><p>Crie sua conta de demonstração e conheça o fluxo completo.</p></div><button className="primary-button" onClick={() => choosePlan("profissional")}>Criar conta da empresa <ArrowRight size={17} /></button></section>
        <section className="saas-faq-section" id="faq" data-scroll-reveal>
          <div className="saas-section-heading"><span className="eyebrow">DÚVIDAS FREQUENTES</span><h2>Vamos esclarecer.</h2><p>Informações importantes sobre o uso deste protótipo.</p></div>
          <div className="saas-faq-list">
            <details><summary>O Estoque Aqui já processa pagamentos reais?</summary><p>Não. Planos, valores, cobranças e formas de pagamento são simulações locais. Nenhum dado bancário é solicitado ou enviado.</p></details>
            <details><summary>Os dados da empresa ficam disponíveis em outros aparelhos?</summary><p>Não neste protótipo. Os dados ficam no armazenamento local do navegador e não são sincronizados entre dispositivos.</p></details>
            <details><summary>Como funciona o período de teste?</summary><p>A criação da conta inicia um período ilustrativo de 14 dias. O teste termina sem cobrança automática; para continuar, você pode regularizar a assinatura no painel.</p></details>
            <details><summary>Posso usar informações reais da empresa?</summary><p>Recomendamos usar somente dados fictícios. Este frontend não oferece autenticação segura, armazenamento protegido nem isolamento real entre clientes.</p></details>
          </div>
        </section>
        <footer className="saas-footer"><a className="saas-brand" href="#inicio"><span className="brand-icon"><Box size={18} /></span><span>Estoque <b>Aqui</b></span></a><span>© 2026 Estoque Aqui · Protótipo frontend</span><div className="saas-footer-links"><a href="mailto:suporte@estoqueaqui.example"><Mail size={14} />Contato</a><button onClick={() => setLegalDialog("terms")}>Termos</button><button onClick={() => setLegalDialog("privacy")}>Privacidade</button><button onClick={() => { setError(""); setView("login"); }}>Entrar</button></div></footer>
      </>}

      {showScrollTop && <button className="scroll-top-button" aria-label="Voltar ao topo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><ArrowUp size={18} /></button>}
      {legalDialog && <LegalDialog type={legalDialog} onClose={() => setLegalDialog(null)} />}
      {view === "login" && <section className="portal-form-stage">
        <div className="portal-form-card"><button className="saas-back-link" onClick={() => setView("landing")}><ArrowLeft size={16} />Voltar ao site</button><span className="saas-form-icon"><LockKeyhole size={22} /></span><span className="eyebrow">BEM-VINDO DE VOLTA</span><h1>Acesse sua conta</h1><p>Entre para continuar gerenciando sua empresa.</p>
          <form className="portal-form" onSubmit={submitLogin}><label htmlFor="portal-email">E-mail</label><input id="portal-email" name="email" type="email" autoComplete="email" placeholder="voce@empresa.com.br" required /><label htmlFor="portal-password">Senha</label><input id="portal-password" name="password" type="password" autoComplete="current-password" placeholder="Sua senha" required />{error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit">Entrar na plataforma <ArrowRight size={16} /></button></form>
          <div className="portal-demo-box"><strong><ShieldCheck size={16} /> Acessos de demonstração</strong><p>Administrador: admin@estoque3irmaos.com.br / admin123</p><p>Funcionário: funcionario@estoque3irmaos.com.br / func123</p><p>Equipe interna: root@estoque3irmaos.com.br / root123</p></div>
          <p className="portal-form-switch">Ainda não tem uma conta? <button onClick={() => choosePlan("profissional")}>Criar empresa</button></p>
        </div>
      </section>}

      {view === "register" && <section className="portal-form-stage">
        <div className="portal-form-card portal-register-card"><button className="saas-back-link" onClick={() => setView("landing")}><ArrowLeft size={16} />Voltar ao site</button><span className="saas-form-icon"><Building2 size={22} /></span><span className="eyebrow">COMECE SUA JORNADA</span><h1>Crie sua empresa</h1><p>Empresa e conta de administrador serão criadas juntas.</p>
          <div className="portal-selected-plan"><span>Plano escolhido</span><strong>{plans.find((item) => item.id === selectedPlan)?.name}</strong><button onClick={() => setView("landing")}>Trocar</button></div>
          <form className="portal-form" onSubmit={submitRegistration}><label htmlFor="ownerName">Seu nome</label><input id="ownerName" name="ownerName" autoComplete="name" placeholder="Nome completo" required /><label htmlFor="companyName">Nome da empresa</label><input id="companyName" name="companyName" autoComplete="organization" placeholder="Ex.: Auto Peças do Bairro" required /><label htmlFor="registerEmail">E-mail de acesso</label><input id="registerEmail" name="email" type="email" autoComplete="email" placeholder="voce@empresa.com.br" required /><label htmlFor="registerPassword">Crie uma senha</label><input id="registerPassword" name="password" type="password" autoComplete="new-password" minLength={8} placeholder="Mínimo de 8 caracteres" required />{error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit">Continuar para teste <ArrowRight size={16} /></button></form>
          <p className="portal-disclaimer">Protótipo frontend: os dados deste cadastro ficam somente no armazenamento local deste navegador.</p>
        </div>
      </section>}

      {view === "checkout" && draft && <section className="portal-form-stage">
        <div className="portal-form-card portal-checkout-card"><button className="saas-back-link" onClick={() => setView("register")}><ArrowLeft size={16} />Voltar ao cadastro</button><span className="portal-test-badge"><CreditCard size={15} /> MODO DE TESTE</span><span className="eyebrow">ASSINATURA DE DEMONSTRAÇÃO</span><h1>Confira seu plano</h1><p>Conta para <strong>{draft.companyName}</strong>, administrada por {draft.ownerName}.</p>
          <div className="portal-checkout-summary"><div><span>{plans.find((item) => item.id === selectedPlan)?.name}</span><small>Plano mensal · valor ilustrativo</small></div><strong>{money(plans.find((item) => item.id === selectedPlan)?.price ?? 0)}<small>/mês</small></strong></div>
          <div className="portal-trial-note"><Clock3 size={16} /><span><strong>14 dias de teste grátis</strong><small>O período termina sem cobrança automática.</small></span></div>
          <div className="portal-test-explainer"><ShieldCheck size={19} /><p><strong>Checkout simulado</strong><br />Nenhum cartão ou dado bancário será solicitado. Confirmar abaixo apenas cria uma assinatura de teste local.</p></div>
          {error && <p className="form-error">{error}</p>}<button className="primary-button portal-confirm-button" onClick={approveTestSubscription}>Ativar assinatura de teste <CheckCircle2 size={17} /></button>
          <button className="portal-cancel-link" onClick={() => setView("landing")}>Cancelar cadastro</button>
        </div>
      </section>}
      {notice && <div className="toast"><Check size={16} />{notice}</div>}
    </main>
  );
}

function PlanCards({ onChoose }: { onChoose: (plan: PlanId) => void }) {
  return <div className="saas-plan-grid">{plans.map((plan) => <article key={plan.id} className={`saas-plan-card ${plan.highlighted ? "plan-highlighted" : ""}`}>{plan.highlighted && <span className="saas-plan-ribbon">MAIS ESCOLHIDO</span>}<h3>{plan.name}</h3><p>{plan.description}</p><div className="saas-plan-price">{money(plan.price)}<small>/mês</small></div><button className={plan.highlighted ? "primary-button" : "secondary-button"} onClick={() => onChoose(plan.id)}>Escolher plano <ArrowRight size={15} /></button><div className="saas-plan-features">{plan.features.map((feature) => <span key={feature}><Check size={15} />{feature}</span>)}</div><small className="saas-plan-note">Preço de demonstração · sem cobrança real</small></article>)}</div>;
}

function SubscriptionNotice({ account, daysRemaining, onManage }: { account: SaasAccount; daysRemaining: number; onManage: () => void }) {
  if (account.subscriptionStatus === "teste") {
    return <div className="subscription-banner trial-banner"><Clock3 size={17} /><span>Seu teste grátis {daysRemaining === 1 ? "termina em 1 dia" : `termina em ${daysRemaining} dias`}.</span><button onClick={onManage}>Ver assinatura <ArrowRight size={14} /></button></div>;
  }
  if (account.subscriptionStatus === "pagamento_atrasado" || account.subscriptionStatus === "pendente") {
    return <div className="subscription-banner overdue-banner"><AlertTriangle size={17} /><span>O pagamento falhou. Atualize sua forma de pagamento para manter o acesso.</span><button onClick={onManage}>Regularizar <ArrowRight size={14} /></button></div>;
  }
  if (account.subscriptionStatus === "cancelada") {
    return <div className="subscription-banner cancel-banner"><CalendarDays size={17} /><span>Assinatura cancelada. O acesso continua até {new Date(account.renewalAt).toLocaleDateString("pt-BR")}.</span><button onClick={onManage}>Reativar <ArrowRight size={14} /></button></div>;
  }
  return null;
}

function SuspendedAccountPage({ account, onRegularize, onSignOut, dark, notice }: { account: SaasAccount; onRegularize: () => void; onSignOut: () => void; dark: boolean; notice: string }) {
  const reason = account.subscriptionStatus === "pagamento_atrasado"
    ? "Há um pagamento pendente na sua assinatura."
    : account.subscriptionStatus === "teste"
      ? "O período de teste gratuito chegou ao fim."
      : "O período de acesso após o cancelamento terminou.";

  return <main className={`suspended-shell ${dark ? "theme-dark" : ""}`}><header className="internal-header"><a className="saas-brand"><span className="brand-icon"><Box size={20} /></span><span>Estoque <b>Aqui</b></span></a><button className="secondary-button" onClick={onSignOut}><LogOut size={15} />Sair</button></header><section className="suspended-card"><span className="suspended-icon"><LockKeyhole size={26} /></span><span className="eyebrow">ACESSO PAUSADO</span><h1>Regularize sua assinatura</h1><p>{reason} Seus dados de estoque continuam salvos neste navegador e serão mantidos durante a regularização.</p><div className="suspended-plan-row"><span><Building2 size={16} />{account.companyName}</span><span className={`subscription-status ${account.subscriptionStatus === "ativa" ? "subscription-active" : "subscription-inactive"}`}><i />{statusLabels[account.subscriptionStatus]}</span></div><button className="primary-button" onClick={onRegularize}>Regularizar assinatura <CreditCard size={16} /></button><small>Simulação de frontend: nenhuma cobrança será realizada.</small></section>{notice && <div className="toast"><Check size={16} />{notice}</div>}</main>;
}

function UpgradePrompt({ currentPlan, targetPlan, onClose, onUpgrade, onViewSubscription }: { currentPlan: PlanId; targetPlan: PlanId; onClose: () => void; onUpgrade: () => void; onViewSubscription: () => void }) {
  const plan = plans.find((item) => item.id === targetPlan)!;
  const current = plans.find((item) => item.id === currentPlan)!;
  return <Modal title="Limite do plano atingido" onClose={onClose}><div className="upgrade-prompt"><span className="saas-feature-icon gold"><Zap size={21} /></span><p>Você atingiu o limite do plano <strong>{current.name}</strong>. No <strong>{plan.name}</strong>, você terá:</p><ul>{plan.features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul><p className="upgrade-disclaimer">Valor ilustrativo de {money(plan.price)}/mês. A troca é apenas uma simulação local.</p><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Agora não</button><button className="secondary-button" onClick={onViewSubscription}>Ver planos</button><button className="primary-button" onClick={onUpgrade}>Trocar de plano <ArrowRight size={15} /></button></div></div></Modal>;
}

function SubscriptionPage({ account, productCount, onUpdate, onCancel, onChangePlan, onNotice }: { account: SaasAccount; productCount: number; onUpdate: (account: SaasAccount) => void; onCancel: (reason: string) => void; onChangePlan: (planId: PlanId) => void; onNotice: (message: string) => void }) {
  const [selectedPlan, setSelectedPlan] = useState(account.plan);
  const [cancellationOpen, setCancellationOpen] = useState(false);
  const plan = plans.find((item) => item.id === account.plan)!;
  const limit = planLimits[account.plan];
  const daysRemaining = account.trialEndsAt ? Math.max(0, Math.ceil((account.trialEndsAt - Date.now()) / 86400000)) : 0;
  const usersUsed = account.usersUsed ?? 1;
  const productPercent = Number.isFinite(limit.products) ? Math.min(100, Math.round(productCount / limit.products * 100)) : 0;
  const userPercent = Math.min(100, Math.round(usersUsed / limit.users * 100));

  function saveCancellation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const reason = String(data.get("reason")).trim();
    if (!reason) {
      onNotice("Informe o motivo do cancelamento para continuar.");
      return;
    }
    onCancel(reason);
    setCancellationOpen(false);
    onNotice(`Cancelamento registrado. O acesso continua até ${new Date(account.renewalAt).toLocaleDateString("pt-BR")}.`);
  }

  function saveDemoPaymentMethod() {
    onUpdate({ ...account, paymentMethod: "Visa final 4242 (simulação)" });
    onNotice("Forma de pagamento demonstrativa atualizada. Nenhum cartão real foi solicitado.");
  }

  function downloadReceipt(invoice: Invoice) {
    const receipt = [
      "RECIBO DE DEMONSTRAÇÃO — ESTOQUE AQUI",
      `Empresa: ${account.companyName}`,
      `Identificador: ${invoice.receipt ?? invoice.id}`,
      `Data: ${new Date(invoice.createdAt).toLocaleDateString("pt-BR")}`,
      `Valor ilustrativo: ${money(invoice.amount)}`,
      `Status: ${invoice.status}`,
      "Documento fictício; não representa uma transação financeira.",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([receipt], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.receipt ?? invoice.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <div className="page-content"><PageHeading eyebrow="CONTA DA EMPRESA" title="Assinatura e cobrança" description="Acompanhe o plano, limites e histórico financeiro demonstrativo." /><div className="subscription-notice"><ShieldCheck size={18} /><span><strong>Ambiente de demonstração:</strong> status, faturas e pagamento são simulados no navegador; nenhum cartão é cobrado.</span></div><div className="subscription-layout"><section className="panel subscription-current"><div className="subscription-current-top"><span className="saas-feature-icon green"><CreditCard size={20} /></span><span className={`subscription-status ${account.subscriptionStatus === "ativa" || account.subscriptionStatus === "teste" ? "subscription-active" : "subscription-inactive"}`}><i />{statusLabels[account.subscriptionStatus]}</span></div><span className="eyebrow">PLANO ATUAL</span><h2>{plan.name}</h2><div className="subscription-price">{money(plan.price)}<small>/mês ilustrativo</small></div><p>{account.subscriptionStatus === "teste" ? `Teste grátis: ${daysRemaining} dias restantes.` : `Próxima cobrança: ${new Date(account.renewalAt).toLocaleDateString("pt-BR")}`}</p><div className="subscription-company"><Building2 size={16} />{account.companyName}</div><div className="usage-meters"><UsageMeter label="Produtos" used={productCount} limit={limit.products} percent={productPercent} /><UsageMeter label="Usuários" used={usersUsed} limit={limit.users} percent={userPercent} /></div><div className="payment-method-card"><span className="invoice-icon"><CreditCard size={16} /></span><div><strong>Forma de pagamento</strong><small>{account.paymentMethod ?? "Nenhuma cadastrada"}</small></div><button className="secondary-button" onClick={saveDemoPaymentMethod}>{account.paymentMethod?.startsWith("Visa") ? "Atualizar (demo)" : "Adicionar (demo)"}</button></div>{account.subscriptionStatus !== "cancelada" && <button className="text-button subscription-cancel" onClick={() => setCancellationOpen(true)}>Cancelar assinatura</button>}{account.subscriptionStatus === "cancelada" && <p className="cancelled-access-note">Acesso mantido até {new Date(account.renewalAt).toLocaleDateString("pt-BR")}.</p>}</section><section className="panel subscription-change"><div className="panel-heading"><div><h2>Trocar de plano</h2><p>Escolha um plano. A alteração é simulada.</p></div></div><label htmlFor="subscription-plan">Plano disponível</label><select id="subscription-plan" value={selectedPlan} onChange={(event) => setSelectedPlan(event.target.value as PlanId)}>{plans.map((item) => <option value={item.id} key={item.id}>{item.name} — {money(item.price)}/mês (demo)</option>)}</select><button className="primary-button" onClick={() => selectedPlan === account.plan ? onNotice("Este já é o plano atual da empresa.") : onChangePlan(selectedPlan)}>Confirmar troca de plano <ArrowRight size={15} /></button><div className="subscription-plan-comparison"><strong>Incluído no {plans.find((item) => item.id === selectedPlan)?.name}</strong>{plans.find((item) => item.id === selectedPlan)?.features.map((feature) => <span key={feature}><Check size={14} />{feature}</span>)}</div></section></div><section className="panel subscription-invoices"><div className="panel-heading"><div><h2>Histórico de faturas</h2><p>Registros demonstrativos com data, valor e status.</p></div><span className="portal-test-badge"><CreditCard size={14} /> TESTE</span></div>{account.invoices.length ? <div className="invoice-list">{account.invoices.map((invoice) => <div className="invoice-row" key={invoice.id}><span className="invoice-icon"><FileText size={16} /></span><div><strong>Assinatura {plan.name}</strong><small>{new Date(invoice.createdAt).toLocaleDateString("pt-BR")} · {invoice.id}</small></div><strong>{money(invoice.amount)}</strong><span className={`invoice-status ${invoice.status === "Paga" ? "invoice-paid" : "invoice-failed"}`}><i />{invoice.status}</span><button className="secondary-button receipt-button" onClick={() => downloadReceipt(invoice)}>Recibo <Download size={13} /></button></div>)}</div> : <div className="subscription-empty"><CreditCard size={21} /><p>Nenhuma fatura. Durante o teste grátis não há cobranças.</p></div>}</section>{cancellationOpen && <Modal title="Cancelar assinatura" onClose={() => setCancellationOpen(false)}><form className="modal-form" onSubmit={saveCancellation}><p className="cancel-explanation">O acesso da empresa e os dados de estoque continuarão disponíveis até <strong>{new Date(account.renewalAt).toLocaleDateString("pt-BR")}</strong>. Nenhuma cobrança real será feita.</p><label>Qual o motivo do cancelamento?<select name="reason" defaultValue="" required><option value="" disabled>Selecione um motivo</option><option>Não preciso mais do serviço</option><option>O plano não atende às necessidades</option><option>Preço ou orçamento</option><option>Estou apenas testando</option><option>Outro motivo</option></select></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setCancellationOpen(false)}>Manter assinatura</button><button className="primary-button cancel-confirm-button" type="submit">Confirmar cancelamento</button></div></form></Modal>}</div>;
}

function UsageMeter({ label, used, limit, percent }: { label: string; used: number; limit: number; percent: number }) {
  return <div className="usage-meter"><div><strong>{label}</strong><span>{used} de {Number.isFinite(limit) ? limit : "∞"}</span></div><div className="usage-meter-track" role="progressbar" aria-label={`Uso de ${label.toLocaleLowerCase()}`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div></div>;
}

function LegalDialog({ type, onClose }: { type: "terms" | "privacy"; onClose: () => void }) {
  const isTerms = type === "terms";
  return <Modal title={isTerms ? "Termos de uso do protótipo" : "Privacidade e dados"} onClose={onClose}><div className="legal-dialog-copy"><p><strong>{isTerms ? "Demonstração de interface." : "Dados locais e fictícios."}</strong> Este projeto é uma demonstração de frontend, não um serviço de produção.</p><p>{isTerms ? "Os planos, limites, pagamentos, usuários e métricas exibidos são exemplos de navegação. Nenhum pagamento ou serviço operacional é contratado por meio desta interface." : "As informações preenchidas ficam no armazenamento local do navegador usado para a demonstração. Elas não são enviadas a um servidor, sincronizadas com outros dispositivos nem protegidas por autenticação real."}</p><p>Não informe senhas reutilizadas, dados reais de cartão, documentos pessoais ou informações confidenciais. Para uso real, será necessário implementar infraestrutura segura, políticas de privacidade e termos adequados.</p><button className="primary-button" onClick={onClose}>Entendi</button></div></Modal>;
}

function InternalAdminPanel({ accounts, billingEvents, onUpdate, onRegularize, onSimulatePaymentFailure, onSignOut, dark, setDark }: { accounts: SaasAccount[]; billingEvents: BillingEvent[]; onUpdate: (account: SaasAccount) => void; onRegularize: (account: SaasAccount) => void; onSimulatePaymentFailure: (account: SaasAccount) => void; onSignOut: () => void; dark: boolean; setDark: (value: boolean) => void }) {
  const [search, setSearch] = useState("");
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [usageWarning, setUsageWarning] = useState("");
  const active = accounts.filter((account) => account.subscriptionStatus === "ativa").length;
  const newAccounts = accounts.filter((account) => account.createdAt >= Date.now() - 30 * 86400000).length;
  const convertedTrials = accounts.filter((account) => account.subscriptionStatus === "ativa" && account.invoices.length > 0).length;
  const cancellations = accounts.filter((account) => account.subscriptionStatus === "cancelada").length;
  const monthlyRevenue = accounts.reduce((sum, account) => account.subscriptionStatus === "ativa" ? sum + (plans.find((plan) => plan.id === account.plan)?.price ?? 0) : sum, 0);
  const filtered = accounts.filter((account) => `${account.companyName} ${account.ownerName} ${account.email}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")));

  useEffect(() => {
    const counts: Record<string, number> = {};
    for (const account of accounts) {
      const saved = localStorage.getItem(`stockly-tenant-data:${account.id}`);
      if (!saved) {
        counts[account.id] = 0;
        continue;
      }
      try {
        const tenant = JSON.parse(saved) as TenantData;
        counts[account.id] = Array.isArray(tenant.products) ? tenant.products.length : 0;
      } catch {
        setUsageWarning(`Não foi possível ler o uso local da empresa ${account.companyName}.`);
        counts[account.id] = 0;
      }
    }
    setUsage(counts);
  }, [accounts]);

  function simulateStatusChange(account: SaasAccount) {
    const now = Date.now();
    const failed = account.subscriptionStatus !== "pagamento_atrasado";
    if (failed) {
      onSimulatePaymentFailure(account);
      return;
    }
    onRegularize(account);
  }

  return <main className={`internal-shell ${dark ? "theme-dark" : ""}`}><header className="internal-header"><a className="saas-brand"><span className="brand-icon"><Box size={20} /></span><span>Estoque <b>Aqui</b></span><i>PLATAFORMA</i></a><div><span className="internal-mode"><LockKeyhole size={14} /> Painel interno · demonstração</span><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Alternar tema">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button className="secondary-button" onClick={onSignOut}><LogOut size={15} />Sair</button></div></header><section className="internal-content"><div className="internal-heading"><div><span className="eyebrow">OPERAÇÃO DA PLATAFORMA</span><h1>Painel interno</h1><p>Métricas, clientes e eventos de cobrança do protótipo local.</p></div><span className="portal-test-badge"><ShieldCheck size={14} /> MODO DE TESTE</span></div><div className="internal-metrics"><article><span><Building2 size={18} /></span><small>Novos cadastros · 30 dias</small><strong>{newAccounts}</strong></article><article><span><CheckCircle2 size={18} /></span><small>Testes convertidos</small><strong>{convertedTrials}</strong></article><article><span><CircleDollarSign size={18} /></span><small>MRR simulado</small><strong>{money(monthlyRevenue)}</strong></article><article><span><RotateCcw size={18} /></span><small>Cancelamentos</small><strong>{cancellations}</strong></article></div><section className="panel internal-table-panel"><div className="panel-heading"><div><h2>Clientes</h2><p>{accounts.length} empresas cadastradas · {active} assinaturas ativas</p></div><div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar empresa..." /></div></div>{usageWarning && <p className="internal-warning">{usageWarning}</p>}{filtered.length ? <div className="internal-table-wrap"><table className="internal-table"><thead><tr><th>EMPRESA</th><th>PLANO</th><th>STATUS</th><th>CADASTRO</th><th>ÚLTIMO ACESSO</th><th>USO</th><th>AÇÃO</th></tr></thead><tbody>{filtered.map((account) => { const accountLimit = planLimits[account.plan]; return <tr key={account.id}><td><strong>{account.companyName}</strong><small>{account.email}</small></td><td>{plans.find((item) => item.id === account.plan)?.name}</td><td><span className={`subscription-status ${account.subscriptionStatus === "ativa" || account.subscriptionStatus === "teste" ? "subscription-active" : "subscription-inactive"}`}><i />{statusLabels[account.subscriptionStatus]}</span></td><td>{new Date(account.createdAt).toLocaleDateString("pt-BR")}</td><td>{account.lastAccessAt ? new Date(account.lastAccessAt).toLocaleDateString("pt-BR") : "Ainda não acessou"}</td><td>{usage[account.id] ?? 0}/{Number.isFinite(accountLimit.products) ? accountLimit.products : "∞"} produtos · {account.usersUsed ?? 1}/{accountLimit.users} usuários</td><td><div className="internal-actions"><button className="secondary-button" onClick={() => simulateStatusChange(account)}>{account.subscriptionStatus === "pagamento_atrasado" ? "Regularizar" : "Simular falha"}</button><button className="secondary-button" onClick={() => onUpdate({ ...account, subscriptionStatus: "cancelada" })}>Cancelar</button></div></td></tr>; })}</tbody></table></div> : <div className="subscription-empty"><Building2 size={22} /><p>Nenhuma empresa encontrada.</p></div>}</section><section className="panel internal-events-panel"><div className="panel-heading"><div><h2>Pagamentos e eventos de webhook</h2><p>Log local de eventos simulados para investigar o fluxo de cobrança.</p></div><span className="portal-test-badge"><Zap size={13} /> DEMO</span></div>{billingEvents.length ? <div className="billing-event-list">{billingEvents.map((event) => <article className="billing-event-row" key={event.id}><span className={`billing-event-icon billing-${event.status.toLowerCase()}`}><Zap size={15} /></span><div className="billing-event-main"><strong>{event.event}</strong><span>{event.companyName} · {event.detail}</span></div><div className="billing-event-meta"><strong>{event.status}</strong><small>{new Date(event.createdAt).toLocaleString("pt-BR")}</small></div></article>)}</div> : <div className="subscription-empty"><Zap size={21} /><p>Nenhum evento de pagamento simulado.</p></div>}</section><p className="internal-footnote"><LockKeyhole size={14} /> Painel demonstrativo: não existe servidor, gateway ou webhook real conectado. Os dados ficam somente neste navegador.</p></section></main>;
}

function Dashboard({ products, movements, lowStock, onNavigate, onModal }: { products: Product[]; movements: Movement[]; lowStock: Product[]; onNavigate: (page: Page) => void; onModal: (modal: "product" | "movement") => void }) {
  const totalValue = products.reduce((total, product) => total + product.stock * product.price, 0);
  return <div className="page-content">
    <div className="welcome-row"><div><span className="eyebrow">SÁBADO, 24 DE OUTUBRO DE 2026</span><h1>Bom dia, Marcos <span className="wave">✦</span></h1><p>Aqui está o resumo do seu estoque hoje.</p></div><div className="welcome-actions"><button className="secondary-button" onClick={() => onModal("product")}><Plus size={16} /> Novo produto</button><button className="primary-button" onClick={() => onModal("movement")}><ArrowDownLeft size={17} /> Registrar movimentação</button></div></div>
    <div className="metric-grid">
      <MetricCard title="Produtos cadastrados" value={products.length.toLocaleString("pt-BR")} change="+12,5%" positive icon={<Package size={18} />} caption="em relação ao mês passado" />
      <MetricCard title="Valor em estoque" value={money(totalValue)} change="+8,2%" positive icon={<TrendingUp size={18} />} caption="em relação ao mês passado" />
      <MetricCard title="Estoque baixo" value={String(lowStock.length).padStart(2, "0")} change={lowStock.length ? "Atenção" : "Tudo certo"} positive={!lowStock.length} icon={<TrendingDown size={18} />} caption="produtos precisam de reposição" alert={lowStock.length > 0} />
      <MetricCard title="Movimentações" value="148" change="+4,3%" positive icon={<Activity size={18} />} caption="nesta semana" />
    </div>
    <div className="dashboard-grid">
      <section className="panel chart-panel">
        <div className="panel-heading"><div><h2>Movimentação de estoque</h2><p>Entradas e saídas ao longo da semana</p></div><button className="select-pill">Esta semana <ChevronDown size={14} /></button></div>
        <div className="chart-legend"><span><i className="legend-entry" />Entradas</span><span><i className="legend-exit" />Saídas</span></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}><defs><linearGradient id="entryGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#174b3a" stopOpacity={0.16} /><stop offset="95%" stopColor="#174b3a" stopOpacity={0} /></linearGradient><linearGradient id="exitGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c9a44c" stopOpacity={0.14} /><stop offset="95%" stopColor="#c9a44c" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} dy={10} /><Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 12 }} /><Area type="monotone" dataKey="entries" name="Entradas" stroke="#174b3a" strokeWidth={2.5} fill="url(#entryGradient)" /><Area type="monotone" dataKey="exits" name="Saídas" stroke="#c9a44c" strokeWidth={2.5} fill="url(#exitGradient)" /></AreaChart></ResponsiveContainer></div>
      </section>
      <section className="panel category-panel">
        <div className="panel-heading"><div><h2>Estoque por categoria</h2><p>Distribuição dos produtos</p></div><button className="more-button" aria-label="Mais opções"><MoreHorizontal size={20} /></button></div>
        <div className="category-list">
          <CategoryLine icon={<Package size={16} />} label="Alimentos e bebidas" count={42} percent={68} color="green" />
          <CategoryLine icon={<Building2 size={16} />} label="Escritório" count={28} percent={46} color="gold" />
          <CategoryLine icon={<Wrench size={16} />} label="Ferramentas e materiais" count={19} percent={31} color="red" />
          <CategoryLine icon={<Box size={16} />} label="Outros produtos" count={11} percent={18} color="slate" />
        </div>
        <button className="panel-link" onClick={() => onNavigate("products")}>Ver todos os produtos <ArrowRight size={15} /></button>
      </section>
    </div>
    <div className="lower-grid">
      <section className="panel table-panel"><div className="panel-heading"><div><h2>Movimentações recentes</h2><p>Acompanhe as últimas atualizações do estoque</p></div><button className="panel-link" onClick={() => onNavigate("movements")}>Ver todas <ArrowRight size={15} /></button></div><MovementTable movements={movements.slice(0, 4)} /></section>
      <section className="panel low-stock-panel"><div className="panel-heading"><div><h2>Estoque baixo <span className="count-badge">{lowStock.length}</span></h2><p>Produtos que precisam de atenção</p></div><button className="more-button" aria-label="Mais opções"><MoreHorizontal size={20} /></button></div>{lowStock.length ? <div className="low-stock-list">{lowStock.slice(0, 3).map((product) => <div className="low-stock-item" key={product.id}><div className="product-mini-icon"><Package size={17} /></div><div className="low-stock-name"><strong>{product.name}</strong><small>{product.sku}</small></div><div className="stock-level"><strong>{product.stock} <span>{product.unit}</span></strong><small>Mín. {product.minimum}</small></div></div>)}</div> : <div className="empty-inline"><Check size={16} /> Todos os níveis estão em dia.</div>}<button className="restock-button" onClick={() => onModal("movement")}>Registrar entrada <ArrowRight size={15} /></button></section>
    </div>
  </div>;
}

function MetricCard({ title, value, change, positive, icon, caption, alert = false }: { title: string; value: string; change: string; positive: boolean; icon: React.ReactNode; caption: string; alert?: boolean }) {
  return <div className="metric-card"><div className="metric-top"><span>{title}</span><span className={`metric-icon ${alert ? "metric-alert" : ""}`}>{icon}</span></div><div className="metric-value">{value}</div><div className="metric-bottom"><span className={`metric-change ${positive ? "change-positive" : "change-negative"}`}>{positive ? <TrendingUp size={13} /> : <ArrowDownRight size={13} />}{change}</span><span>{caption}</span></div></div>;
}

function CategoryLine({ icon, label, count, percent, color }: { icon: React.ReactNode; label: string; count: number; percent: number; color: string }) {
  return <div className="category-line"><span className={`category-icon ${color}`}>{icon}</span><div className="category-detail"><div><strong>{label}</strong><span>{count} itens</span></div><div className="progress-track"><span className={`progress-fill ${color}`} style={{ width: `${percent}%` }} /></div></div></div>;
}

function MovementTable({ movements }: { movements: Movement[] }) {
  return <div className="table-scroll"><table><thead><tr><th>PRODUTO</th><th>TIPO</th><th>QUANTIDADE</th><th>DATA / HORA</th></tr></thead><tbody>{movements.map((movement) => <tr key={movement.id}><td><div className="table-product"><span className="table-product-icon"><Package size={16} /></span><span><strong>{movement.product}</strong><small>por {movement.user}</small></span></div></td><td><span className={`movement-tag ${movement.type === "Entrada" ? "tag-entry" : "tag-exit"}`}>{movement.type === "Entrada" ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}{movement.type}</span></td><td><strong className={movement.type === "Entrada" ? "quantity-entry" : "quantity-exit"}>{movement.type === "Entrada" ? "+" : "−"}{movement.quantity}</strong></td><td className="date-cell">{movement.date}</td></tr>)}</tbody></table></div>;
}

function ProductsPage({ products, allProducts, search, setSearch, category, setCategory, onModal, isAdmin, onDelete }: { products: Product[]; allProducts: Product[]; search: string; setSearch: (value: string) => void; category: string; setCategory: (value: string) => void; onModal: () => void; isAdmin: boolean; onDelete: (id: number) => void }) {
  const categories = Array.from(new Set(allProducts.map((product) => product.category))).sort((first, second) => first.localeCompare(second, "pt-BR"));

  return <div className="page-content">
    <PageHeading eyebrow="CATÁLOGO" title="Produtos" description="Gerencie seus produtos, acompanhe os níveis de estoque e mantenha tudo organizado." action={<button className="primary-button" onClick={onModal}><Plus size={16} />Cadastrar novo produto</button>} />
    <section className="panel products-panel">
      <div className="products-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Buscar qualquer produto" placeholder="Buscar qualquer produto por nome, código, categoria..." /></div><label className="category-filter"><span>Categoria</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option>Todas as categorias</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><button className="secondary-button filter-button" onClick={() => window.print()}><Download size={15} /> Exportar</button></div>
      <ProductTable products={products} isAdmin={isAdmin} onDelete={onDelete} />
      {products.length === 0 && (allProducts.length === 0
        ? <div className="empty-state"><Package size={24} /><strong>Seu catálogo ainda está vazio</strong><span>Cadastre seu primeiro produto para começar a controlar o estoque.</span><button className="primary-button" onClick={onModal}><Plus size={15} />Cadastrar primeiro produto</button></div>
        : <div className="empty-state"><Search size={24} /><strong>Nenhum produto encontrado</strong><span>Tente outro termo ou altere o filtro de categoria.</span></div>)}
      <div className="table-footer"><span>Mostrando <strong>{products.length}</strong> produtos</span><div className="pagination"><button aria-label="Página anterior"><ChevronLeft size={16} /></button><button className="current-page">1</button><button aria-label="Próxima página"><ChevronRight size={16} /></button></div></div>
    </section>
  </div>;
}

function DefectiveProductsPage({ defectiveProducts, onSubmit }: { defectiveProducts: DefectiveProduct[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="page-content">
    <PageHeading eyebrow="CONTROLE DE QUALIDADE" title="Produtos com defeito" description="Registre produtos danificados e documente o defeito identificado." />
    <section className="panel defect-form-panel">
      <div className="panel-heading"><div><h2>Registrar produto com defeito</h2><p>Descreva o produto e o problema encontrado.</p></div><span className="defect-heading-icon"><AlertTriangle size={18} /></span></div>
      <form className="defect-form" onSubmit={onSubmit}>
        <div className="form-grid"><label>Nome do produto<input name="name" placeholder="Ex.: produto ou material" required /></label><label>Código de barras ou identificação <span className="optional-label">(opcional)</span><input name="code" placeholder="Código do produto" /></label></div>
        <label>Descrição do defeito<textarea name="description" rows={4} placeholder="Descreva o defeito encontrado, as condições do produto e outras informações relevantes..." required /></label>
        <div className="defect-form-footer"><span><AlertTriangle size={14} />O registro ficará disponível no histórico desta página.</span><button className="primary-button" type="submit"><Plus size={16} />Registrar defeito</button></div>
      </form>
    </section>
    <section className="panel defective-list-panel">
      <div className="panel-heading"><div><h2>Registros de defeito</h2><p>{defectiveProducts.length} {defectiveProducts.length === 1 ? "produto registrado" : "produtos registrados"}</p></div><span className="defect-count">{defectiveProducts.length}</span></div>
      {defectiveProducts.length ? <div className="defect-list">{defectiveProducts.map((product) => <article className="defect-item" key={product.id}><span className="defect-product-icon"><Package size={18} /></span><div className="defect-item-content"><div className="defect-item-heading"><h3>{product.name}</h3><span className="status-tag status-low"><i />Com defeito</span></div>{product.code && <span className="defect-code">Código: {product.code}</span>}<p>{product.description}</p><small>Registrado por {product.reportedBy} · {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(product.reportedAt)}</small></div></article>)}</div> : <div className="empty-state defect-empty"><AlertTriangle size={24} /><strong>Nenhum produto com defeito registrado</strong><span>Use o formulário acima para adicionar o primeiro registro.</span></div>}
    </section>
  </div>;
}

function ProductTable({ products, isAdmin, onDelete }: { products: Product[]; isAdmin: boolean; onDelete: (id: number) => void }) {
  return <div className="table-scroll"><table className="products-table"><thead><tr><th>PRODUTO</th><th>CATEGORIA</th><th>CÓDIGO</th><th>ESTOQUE</th><th>PREÇO UNIT.</th><th>STATUS</th><th></th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="table-product"><span className="table-product-icon"><Package size={16} /></span><span><strong>{product.name}</strong><small>{product.brand ? `Marca: ${product.brand} · ` : ""}Unidade: {product.unit}</small>{product.notes && <small className="product-notes" title={product.notes}>Obs.: {product.notes}</small>}</span></div></td><td>{product.category}</td><td className="sku-cell">{product.sku}</td><td><strong>{product.stock}</strong> <span className="muted-cell">{product.unit}</span></td><td>{money(product.price)}</td><td><span className={`status-tag ${product.stock <= product.minimum ? "status-low" : "status-ok"}`}><i />{product.stock <= product.minimum ? "Estoque baixo" : "Disponível"}</span></td><td>{isAdmin && <button className="more-button" title="Remover produto" onClick={() => onDelete(product.id)}><MoreHorizontal size={18} /></button>}</td></tr>)}</tbody></table></div>;
}

function InventoryPage({ products, physicalCounts, onCountChange, onApply, history, reminder, reminderDue, onSaveReminder, onClearReminder }: { products: Product[]; physicalCounts: Record<number, number | "">; onCountChange: (productId: number, quantity: number | "") => void; onApply: () => void; history: InventoryRecord[]; reminder: string; reminderDue: boolean; onSaveReminder: (dateTime: string) => void; onClearReminder: () => void }) {
  const [reminderDraft, setReminderDraft] = useState(reminder);
  const accuracyFor = (system: number, physical: number) => system === physical ? 100 : system === 0 ? 0 : Math.max(0, (1 - Math.abs(physical - system) / system) * 100);
  const countedProducts = products.filter((product) => typeof physicalCounts[product.id] === "number");
  const countedItems = countedProducts.length;
  const accuracy = countedItems
    ? countedProducts.reduce((total, product) => total + accuracyFor(product.stock, physicalCounts[product.id] as number), 0) / countedItems
    : 100;
  const financialDifference = countedProducts.reduce((total, product) => total + ((physicalCounts[product.id] as number) - product.stock) * product.price, 0);
  const allProductsCounted = countedItems === products.length;
  const hasChanges = countedProducts.some((product) => physicalCounts[product.id] !== product.stock);
  const localDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return <div className="page-content">
    <PageHeading eyebrow="CONTROLE DE ESTOQUE" title="Inventário" description="Compare as quantidades do sistema com a contagem física e aplique os ajustes necessários." />
    {reminderDue && <div className="inventory-reminder-alert"><Bell size={18} /><div><strong>Lembrete de contagem</strong><span>Está na hora de realizar a contagem do inventário.</span></div><button className="icon-button" onClick={onClearReminder} aria-label="Dispensar lembrete"><X size={17} /></button></div>}
    <div className="metric-grid inventory-metrics">
      <MetricCard title="Itens contados" value={`${countedItems} / ${products.length}`} change={allProductsCounted ? "Tudo contado" : "Contagem pendente"} positive={allProductsCounted} icon={<ClipboardCheck size={18} />} caption="produtos com quantidade física informada" />
      <MetricCard title="Acurácia média" value={countedItems ? `${accuracy.toFixed(1).replace(".", ",")}%` : "—"} change={allProductsCounted ? "Conferido" : "Em conferência"} positive={allProductsCounted} icon={<TrendingUp size={18} />} caption="correspondência físico x sistema" />
      <MetricCard title="Diferença financeira" value={money(Math.abs(financialDifference))} change={financialDifference === 0 ? "Sem diferença" : financialDifference < 0 ? "Faltando" : "Sobrando"} positive={financialDifference === 0} icon={<Activity size={18} />} caption="valor estimado das divergências" alert={financialDifference !== 0} />
    </div>
    <section className="panel inventory-panel">
      <div className="panel-heading inventory-heading"><div><h2>Indicador de acurácia</h2><p>Informe a contagem física para comparar com o saldo do sistema.</p></div><button className="primary-button" onClick={onApply} disabled={!products.length || !allProductsCounted}><ClipboardCheck size={16} />Aplicar ajustes</button></div>
      <div className="inventory-table-wrap"><table className="inventory-table"><thead><tr><th>ITEM</th><th>SISTEMA</th><th>FÍSICO</th><th>FINANCEIRO</th><th>ACURÁCIA</th><th>AJUSTE</th></tr></thead><tbody>
        {products.map((product) => {
          const physicalCount = physicalCounts[product.id];
          const isCounted = typeof physicalCount === "number";
          const physical = isCounted ? physicalCount : product.stock;
          const difference = physical - product.stock;
          const accuracyPercent = accuracyFor(product.stock, physical);
          return <tr key={product.id}>
            <td><div className="inventory-product"><span className="table-product-icon"><Package size={16} /></span><span><strong>{product.name}</strong><small>{product.category} · {product.sku}</small></span></div></td>
            <td><strong>{product.stock}</strong><small className="inventory-unit">{product.unit}</small></td>
            <td><input aria-label={`Contagem física de ${product.name}`} className="physical-count-input" type="number" min="0" step="1" placeholder="Contar" value={isCounted ? physicalCount : ""} onChange={(event) => onCountChange(product.id, event.target.value === "" ? "" : Math.max(0, Number(event.target.value)))} /></td>
            <td><div className="financial-result"><span className={`variance-tag ${!isCounted ? "variance-pending" : difference < 0 ? "variance-shortage" : difference > 0 ? "variance-surplus" : "variance-balanced"}`}>{!isCounted ? "Pendente" : difference < 0 ? "Falta" : difference > 0 ? "Sobra" : "Em conformidade"}</span>{isCounted && <strong className={difference < 0 ? "variance-negative" : difference > 0 ? "variance-positive" : ""}>{difference > 0 ? "+" : difference < 0 ? "−" : ""}{money(Math.abs(difference * product.price))}</strong>}</div></td>
            <td><span className={`accuracy-value ${!isCounted ? "accuracy-pending" : accuracyPercent === 100 ? "accuracy-perfect" : "accuracy-pending"}`}>{isCounted ? `${accuracyPercent.toFixed(1).replace(".", ",")}%` : "—"}</span></td>
            <td><span className={`adjustment-value ${difference === 0 ? "adjustment-none" : difference > 0 ? "adjustment-positive" : "adjustment-negative"}`}>{difference > 0 ? `+${difference}` : difference < 0 ? difference : "—"}{difference !== 0 && <small> {product.unit}</small>}</span></td>
          </tr>;
        })}
      </tbody></table>{!products.length && <div className="empty-state"><Package size={24} /><strong>Nenhum produto cadastrado</strong><span>Cadastre produtos para iniciar o inventário.</span></div>}</div>
      <div className="inventory-footer"><span>{allProductsCounted ? "Os ajustes serão aplicados ao estoque ao confirmar." : `Informe a contagem de ${products.length - countedItems} produto(s) restante(s).`}</span><button className="primary-button" onClick={onApply} disabled={!products.length || !allProductsCounted}><ClipboardCheck size={16} />Confirmar contagem e ajustar estoque</button></div>
    </section>
    <section className="panel reminder-panel">
      <div className="reminder-copy"><span className="reminder-icon"><Clock3 size={19} /></span><div><h2>Lembrete de contagem</h2><p>Agende um aviso para lembrar de fazer o próximo inventário.</p>{reminder && <small>Agendado para {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(reminder))}</small>}</div></div>
      <form className="reminder-form" onSubmit={(event) => { event.preventDefault(); onSaveReminder(reminderDraft); }}>
        <input aria-label="Data e hora do lembrete de inventário" type="datetime-local" min={localDateTime} value={reminderDraft} onChange={(event) => setReminderDraft(event.target.value)} required />
        <button className="secondary-button" type="submit"><Bell size={15} />Agendar</button>
        {reminder && <button className="reminder-clear" type="button" onClick={() => { setReminderDraft(""); onClearReminder(); }}>Remover</button>}
      </form>
    </section>
    <InventoryHistory history={history} />
  </div>;
}

function InventoryHistory({ history }: { history: InventoryRecord[] }) {
  return <section className="panel inventory-history-panel">
    <div className="panel-heading"><div><h2>Histórico de inventários</h2><p>Contagens e ajustes aplicados</p></div><span className="recent-count">{history.length} registros</span></div>
    {history.length ? <div className="inventory-history-list">{history.map((record) => {
      const adjusted = record.items.filter((item) => item.adjustment !== 0);
      const totalUnits = adjusted.reduce((sum, item) => sum + Math.abs(item.adjustment), 0);
      const totalFinancial = adjusted.reduce((sum, item) => sum + item.financialDifference, 0);
      return <article className="inventory-history-item" key={record.id}>
        <div className="history-date"><strong>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(record.countedAt)}</strong><small>{new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(record.countedAt)}</small></div>
        <div className="history-summary"><strong>{adjusted.length ? `${adjusted.length} produto(s) ajustado(s)` : "Contagem sem divergências"}</strong><small>Contagem realizada por {record.countedBy} · {record.items.length} itens conferidos</small>{adjusted.length > 0 && <div className="history-adjustments">{adjusted.map((item) => <span key={item.productId}>{item.productName}: {item.systemQuantity} → {item.physicalQuantity} ({item.adjustment > 0 ? "+" : ""}{item.adjustment})</span>)}</div>}</div>
        <div className="history-total"><strong>{totalUnits} <small>unid.</small></strong><span className={totalFinancial < 0 ? "variance-negative" : totalFinancial > 0 ? "variance-positive" : ""}>{totalFinancial > 0 ? "+" : totalFinancial < 0 ? "−" : ""}{money(Math.abs(totalFinancial))}</span></div>
      </article>;
    })}</div> : <div className="empty-state inventory-history-empty"><Clock3 size={23} /><strong>Nenhum inventário realizado</strong><span>O histórico será exibido aqui após confirmar a primeira contagem.</span></div>}
  </section>;
}

function BarcodeScanner({ onDetected }: { onDetected: (code: string) => void }) {
  type DetectedBarcode = { rawValue: string };
  type BrowserBarcodeDetector = new (options: { formats: string[] }) => {
    detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]>;
  };
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let stopped = false;
    let stream: MediaStream | undefined;
    let scanTimer: number | undefined;
    const video = videoRef.current;
    const Detector = (window as Window & { BarcodeDetector?: BrowserBarcodeDetector }).BarcodeDetector;

    if (!Detector) {
      setError("Leitura por câmera não é compatível com este navegador. Digite o código ou use um leitor USB.");
      setStarting(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("A câmera precisa de uma conexão segura (HTTPS) para funcionar. Digite o código manualmente.");
      setStarting(false);
      return;
    }

    async function startScanner() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (stopped || !video) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();
        setStarting(false);
        const detector = new Detector!({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "itf"] });

        const scanFrame = async () => {
          if (stopped || !video) return;
          try {
            if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              const results = await detector.detect(video);
              const code = results.find((result) => result.rawValue.trim())?.rawValue.trim();
              if (code) {
                onDetected(code);
                return;
              };
            }
          } catch {
            if (!stopped) setError("Não foi possível ler o código. Ajuste a posição do produto e tente novamente.");
          }
          if (!stopped) scanTimer = window.setTimeout(scanFrame, 250);
        }

        void scanFrame();
      } catch (caughtError) {
        if (stopped) return;
        setStarting(false);
        setError(caughtError instanceof Error && caughtError.name === "NotAllowedError"
          ? "Permita o acesso à câmera no navegador ou digite o código manualmente."
          : "Não foi possível iniciar a câmera. Confira as permissões do dispositivo.");
      }
    }

    void startScanner();
    return () => {
      stopped = true;
      if (scanTimer !== undefined) window.clearTimeout(scanTimer);
      stream?.getTracks().forEach((track) => track.stop());
      if (video) video.srcObject = null;
    };
  }, [onDetected]);

  return <div className="barcode-scanner">
    <div className="scanner-video-wrap"><video ref={videoRef} playsInline muted aria-label="Visualização da câmera para leitura do código de barras" /><span className="scanner-frame" />{starting && !error && <span className="scanner-loading"><Camera size={18} />Iniciando câmera...</span>}</div>
    <p className={error ? "scanner-message scanner-error" : "scanner-message"}>{error || "Aponte a câmera para o código de barras."}</p>
  </div>;
}

function MovementsPage({ movements, onModal }: { movements: Movement[]; onModal: () => void }) {
  return <div className="page-content"><PageHeading eyebrow="ACOMPANHAMENTO" title="Movimentações" description="Histórico completo de entradas, saídas e ajustes do seu estoque." action={<button className="primary-button" onClick={onModal}><Plus size={16} />Nova movimentação</button>} /><div className="movement-summary"><div className="panel summary-tile"><span className="summary-icon summary-green"><ArrowDownLeft size={18} /></span><div><small>Entradas no mês</small><strong>326 <span>itens</span></strong><em>+12,8% este mês</em></div></div><div className="panel summary-tile"><span className="summary-icon summary-red"><ArrowUpRight size={18} /></span><div><small>Saídas no mês</small><strong>248 <span>itens</span></strong><em>+6,4% este mês</em></div></div><div className="panel summary-tile"><span className="summary-icon summary-gold"><Activity size={18} /></span><div><small>Total de operações</small><strong>{movements.length + 144} <span>registros</span></strong><em>Últimos 30 dias</em></div></div></div><section className="panel table-panel movement-history"><div className="panel-heading"><div><h2>Histórico de operações</h2><p>Todos os registros de movimentação</p></div><button className="secondary-button"><Download size={15} />Exportar</button></div><MovementTable movements={movements} /></section></div>;
}

function ReportsPage({ products, movements, inventoryHistory }: { products: Product[]; movements: Movement[]; inventoryHistory: InventoryRecord[] }) {
  const totalValue = products.reduce((total, product) => total + product.stock * product.price, 0);
  return <div className="page-content"><PageHeading eyebrow="INTELIGÊNCIA DE ESTOQUE" title="Relatórios" description="Informações para entender e otimizar a operação do seu estoque." action={<button className="secondary-button"><Download size={16} />Exportar relatório</button>} /><div className="metric-grid report-metrics"><MetricCard title="Valor total em estoque" value={money(totalValue)} change="+8,2%" positive icon={<TrendingUp size={18} />} caption="versus mês anterior" /><MetricCard title="Itens cadastrados" value={String(products.length)} change="+2 novos" positive icon={<Package size={18} />} caption="neste mês" /><MetricCard title="Movimentações" value={String(movements.length + 144)} change="+4,3%" positive icon={<Activity size={18} />} caption="nos últimos 30 dias" /><MetricCard title="Itens para repor" value={String(products.filter((item) => item.stock <= item.minimum).length)} change="Atenção" positive={false} icon={<TrendingDown size={18} />} caption="abaixo do estoque mínimo" alert /></div><div className="report-grid"><div className="panel report-callout"><span className="report-icon"><ClipboardList size={21} /></span><h2>Relatório de estoque</h2><p>Veja todos os produtos, quantidades disponíveis, valores e alertas de reposição em um só lugar.</p><button className="secondary-button" onClick={() => window.print()}><Download size={15} />Gerar relatório</button></div><div className="panel report-callout"><span className="report-icon report-icon-gold"><Activity size={21} /></span><h2>Relatório de movimentações</h2><p>Analise o histórico de entradas e saídas por período, produto ou responsável.</p><button className="secondary-button" onClick={() => window.print()}><Download size={15} />Gerar relatório</button></div></div><InventoryHistory history={inventoryHistory} /></div>;
}

function SuppliersPage({ onNotice }: { onNotice: (message: string) => void }) {
  const suppliers = [{ name: "Distribuidora Central", category: "Alimentos e bebidas", contact: "contato@distribuidoracentral.example", status: "Ativo", initials: "DC" }, { name: "Suprimentos Gerais", category: "Escritório e materiais", contact: "vendas@suprimentosgerais.example", status: "Ativo", initials: "SG" }, { name: "Comercial Ponto Certo", category: "Limpeza e higiene", contact: "pedidos@comercialpontocerto.example", status: "Ativo", initials: "PC" }];
  return <div className="page-content"><PageHeading eyebrow="REDE DE PARCEIROS" title="Fornecedores" description="Organize seus parceiros e tenha os contatos sempre à mão." action={<button className="primary-button" onClick={() => onNotice("Cadastro de fornecedor disponível em breve.")}><Plus size={16} />Novo fornecedor</button>} /><section className="panel supplier-panel"><div className="panel-heading"><div><h2>Seus fornecedores</h2><p>{suppliers.length} parceiros cadastrados</p></div><div className="search-box supplier-search"><Search size={17} /><input placeholder="Buscar fornecedor..." /></div></div><div className="supplier-list">{suppliers.map((supplier) => <div className="supplier-row" key={supplier.name}><span className="supplier-avatar">{supplier.initials}</span><div className="supplier-main"><strong>{supplier.name}</strong><small>{supplier.contact}</small></div><span className="supplier-category">{supplier.category}</span><span className="status-tag status-ok"><i />{supplier.status}</span><button className="more-button" aria-label={`Opções para ${supplier.name}`}><MoreHorizontal size={18} /></button></div>)}</div></section></div>;
}

function SettingsPage({ role, account, dark, setDark, onUpdate, onNotice, onAddUser, onUpgrade }: { role: Role; account: SaasAccount; dark: boolean; setDark: (value: boolean) => void; onUpdate: (account: SaasAccount) => void; onNotice: (message: string) => void; onAddUser: () => void; onUpgrade: () => void }) {
  const [companyLogo, setCompanyLogo] = useState(account.companyLogo ?? "");
  const [profilePhoto, setProfilePhoto] = useState(account.profilePhoto ?? "");
  const userLimit = planLimits[account.plan].users;
  const usersUsed = account.usersUsed ?? 1;

  function readImage(file: File, updateImage: (image: string) => void) {
    if (!file.type.startsWith("image/")) {
      onNotice("Escolha um arquivo de imagem.");
      return;
    }
    if (file.size > 1024 * 1024) {
      onNotice("A imagem deve ter no máximo 1 MB para ser salva neste navegador.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") updateImage(reader.result);
      else onNotice("Não foi possível carregar a imagem selecionada.");
    };
    reader.onerror = () => onNotice("Falha ao ler a imagem. Tente outro arquivo.");
    reader.readAsDataURL(file);
  }

  function saveCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onUpdate({
      ...account,
      companyName: String(data.get("companyName")).trim(),
      cnpj: String(data.get("cnpj")).trim(),
      address: String(data.get("address")).trim(),
      ownerName: String(data.get("ownerName")).trim(),
      companyLogo,
      profilePhoto,
    });
    onNotice("Dados da empresa e do perfil atualizados neste navegador.");
  }

  return <div className="page-content"><PageHeading eyebrow="EMPRESA E PREFERÊNCIAS" title="Configurações da empresa" description="Atualize a identidade da empresa, seus dados e preferências da conta." /><form className="panel company-settings-form" onSubmit={saveCompany}><section className="settings-section"><div className="settings-heading"><span className="settings-icon"><Building2 size={18} /></span><div><h2>Dados da empresa</h2><p>Informações básicas exibidas na sua área de estoque.</p></div></div><div className="brand-upload-grid"><label className="image-upload-card"><span className="settings-logo-preview">{companyLogo ? <img src={companyLogo} alt="Logo da empresa" /> : <Building2 size={23} />}</span><strong>Logo da empresa</strong><small>PNG, JPG ou WEBP · até 1 MB</small><span className="secondary-button">Escolher imagem</span><input type="file" accept="image/*" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) readImage(file, setCompanyLogo); }} /></label><label className="image-upload-card"><span className="settings-avatar-preview">{profilePhoto ? <img src={profilePhoto} alt="Foto do perfil" /> : <UserRound size={23} />}</span><strong>Foto do perfil</strong><small>Altere a imagem e o nome do administrador.</small><span className="secondary-button">Escolher foto</span><input type="file" accept="image/*" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) readImage(file, setProfilePhoto); }} /></label></div><div className="company-fields-grid"><label>Nome da empresa<input name="companyName" defaultValue={account.companyName} required maxLength={100} /></label><label>CNPJ<input name="cnpj" defaultValue={account.cnpj ?? ""} placeholder="00.000.000/0000-00" inputMode="numeric" maxLength={18} /></label><label className="company-address-field">Endereço<input name="address" defaultValue={account.address ?? ""} placeholder="Rua, número, bairro, cidade e CEP" maxLength={200} /></label><label>Nome do administrador<input name="ownerName" defaultValue={account.ownerName} required maxLength={100} /></label><label>E-mail da conta<input value={account.email} readOnly /></label></div><div className="settings-form-footer"><span>As imagens são armazenadas somente neste navegador neste protótipo.</span><button className="primary-button" type="submit"><Check size={15} />Salvar dados</button></div></section></form><section className="panel settings-panel company-settings-lower"><div className="settings-section"><div className="settings-heading"><span className="settings-icon"><UsersRound size={18} /></span><div><h2>Usuários do plano</h2><p>{usersUsed} de {userLimit} usuários utilizados no plano {plans.find((item) => item.id === account.plan)?.name}.</p></div></div><div className="settings-user-meter"><UsageMeter label="Acessos" used={usersUsed} limit={userLimit} percent={Math.min(100, Math.round(usersUsed / userLimit * 100))} /><button className="secondary-button" onClick={() => usersUsed >= userLimit ? onUpgrade() : onAddUser()}><Plus size={15} />Adicionar usuário de demonstração</button></div></div><div className="settings-section"><div className="settings-heading"><span className="settings-icon"><Sun size={18} /></span><div><h2>Aparência</h2><p>Escolha como o Estoque Aqui aparece para você.</p></div></div><div className="settings-row"><div><strong>Tema da interface</strong><small>Alterne entre tema claro e escuro</small></div><button className={`theme-toggle ${dark ? "toggle-on" : ""}`} onClick={() => setDark(!dark)} aria-label="Alternar tema"><span /></button></div></div><div className="settings-section"><div className="settings-heading"><span className="settings-icon"><Bell size={18} /></span><div><h2>Notificações</h2><p>Receba alertas importantes sobre seu estoque.</p></div></div><div className="settings-row"><div><strong>Alertas de estoque baixo</strong><small>Notificar quando produtos atingirem o mínimo</small></div><button className="theme-toggle toggle-on" onClick={() => onNotice("Preferência de alertas atualizada.")} aria-label="Alternar notificações"><span /></button></div></div><div className="settings-section"><div className="settings-heading"><span className="settings-icon"><ShieldCheck size={18} /></span><div><h2>Acesso</h2><p>Perfil usado neste espaço de trabalho.</p></div></div><div className="settings-row"><div><strong>Tipo de conta</strong><small>Nível de acesso atual</small></div><span className="role-pill">{role === "admin" ? <><ShieldCheck size={14} />Administrador</> : <><UsersRound size={14} />Funcionário</>}</span></div></div></section></div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading-row"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="eyebrow">GESTÃO DE ESTOQUE</span><h2 id="modal-title">{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={19} /></button></div>{children}</section></div>;
}
