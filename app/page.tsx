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
  CarFront,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CircleHelp,
  ClipboardList,
  ClipboardCheck,
  CreditCard,
  Download,
  Droplets,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Moon,
  MoreHorizontal,
  Package,
  Plus,
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
type SubscriptionStatus = "ativa" | "cancelada" | "pendente";
type Invoice = { id: string; createdAt: number; amount: number; status: "Paga" | "Pendente" };
type SaasAccount = {
  id: string;
  ownerName: string;
  companyName: string;
  email: string;
  password: string;
  plan: PlanId;
  subscriptionStatus: SubscriptionStatus;
  createdAt: number;
  renewalAt: number;
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
  { id: 1, name: "Óleo sintético 5W30", sku: "LUB-005", category: "Lubrificantes", stock: 84, minimum: 20, price: 42.9, unit: "un" },
  { id: 2, name: "Filtro de óleo Tecfil", sku: "FIL-021", category: "Peças automotivas", stock: 12, minimum: 15, price: 28.5, unit: "un" },
  { id: 3, name: "Shampoo automotivo 5L", sku: "LAV-008", category: "Lava a jato", stock: 36, minimum: 10, price: 65, unit: "galão" },
  { id: 4, name: "Pastilha de freio dianteira", sku: "FRE-014", category: "Peças automotivas", stock: 7, minimum: 10, price: 119.9, unit: "par" },
  { id: 5, name: "Cera líquida premium", sku: "LAV-012", category: "Lava a jato", stock: 28, minimum: 8, price: 34.9, unit: "un" },
  { id: 6, name: "Fluido de freio DOT 4", sku: "FLU-002", category: "Lubrificantes", stock: 3, minimum: 12, price: 31.9, unit: "un" },
];

const initialMovements: Movement[] = [
  { id: 1, type: "Entrada", product: "Óleo sintético 5W30", quantity: 24, date: "Hoje, 10:42", user: "Marcos Silva" },
  { id: 2, type: "Saída", product: "Filtro de óleo Tecfil", quantity: 4, date: "Hoje, 09:18", user: "Ana Costa" },
  { id: 3, type: "Entrada", product: "Shampoo automotivo 5L", quantity: 12, date: "Hoje, 08:56", user: "Marcos Silva" },
  { id: 4, type: "Saída", product: "Pastilha de freio dianteira", quantity: 2, date: "Ontem, 16:32", user: "João Pedro" },
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
  { id: "essencial", name: "Essencial", price: 49, description: "Para organizar a rotina de pequenos negócios.", features: ["Até 500 produtos", "2 usuários", "Dashboard e relatórios", "Controle de entradas e saídas"] },
  { id: "profissional", name: "Profissional", price: 99, description: "Mais controle para equipes em crescimento.", features: ["Produtos ilimitados", "5 usuários", "Inventário e acurácia", "Relatórios e histórico"], highlighted: true },
  { id: "empresa", name: "Empresa", price: 199, description: "Gestão completa para operações maiores.", features: ["Produtos ilimitados", "15 usuários", "Todos os recursos", "Suporte prioritário"] },
];

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
  const [activeAccount, setActiveAccount] = useState<SaasAccount | null>(null);
  const [internalAdmin, setInternalAdmin] = useState(false);
  const [dataReady, setDataReady] = useState(false);
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
    if (accounts.length) localStorage.setItem("stockly-saas-accounts", JSON.stringify(accounts));
  }, [accounts]);

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
        invoices: [],
      };
      setDataReady(false);
      setActiveAccount(demoAccount);
      setRole(legacyRole);
      setInternalAdmin(false);
      setPage("dashboard");
      localStorage.setItem("stockly-session", JSON.stringify({ role: legacyRole, accountId: demoAccount.id }));
      return { role: legacyRole, account: demoAccount };
    }
    const account = accounts.find((item) => item.email.toLowerCase() === normalizedEmail && item.password === password);
    if (!account) return null;
    if (account.subscriptionStatus !== "ativa") return null;
    setDataReady(false);
    setActiveAccount(account);
    setRole("admin");
    setInternalAdmin(false);
    setPage("dashboard");
    localStorage.setItem("stockly-session", JSON.stringify({ role: "admin", accountId: account.id }));
    return { role: "admin", account };
  }

  function createAccount(account: SaasAccount) {
    setAccounts((current) => [...current, account]);
    setActiveAccount(account);
    setRole("admin");
    setInternalAdmin(false);
    setPage("dashboard");
    localStorage.setItem("stockly-session", JSON.stringify({ role: "admin", accountId: account.id }));
    setDataReady(false);
    flash("Empresa criada. Sua área de estoque está pronta para começar.");
  }

  function updateAccount(updated: SaasAccount) {
    setAccounts((current) => current.map((account) => account.id === updated.id ? updated : account));
    if (activeAccount?.id === updated.id) setActiveAccount(updated);
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
    return <InternalAdminPanel accounts={accounts} onUpdate={updateAccount} onSignOut={signOut} dark={dark} setDark={setDark} />;
  }

  if (!role || !activeAccount) {
    return <SaasPublicPortal accounts={accounts} onLogin={signIn} onCreateAccount={createAccount} dark={dark} setDark={setDark} notice={notice} />;
  }

  const pageTitle = availableNavItems.find((item) => item.id === page)?.label ?? "Dashboard";

  return (
    <main className={`app-shell ${dark ? "theme-dark" : ""} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {mobileMenu && <button aria-label="Fechar menu" className="mobile-backdrop" onClick={() => setMobileMenu(false)} />}
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="sidebar-header"><div className="brand-lockup sidebar-brand"><span className="brand-icon"><Box size={21} /></span><span>Estoque <span className="brand-dot">Aqui</span></span></div><button className="sidebar-toggle" onClick={toggleSidebar} aria-label={mobileMenu ? "Fechar menu lateral" : sidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"} title={mobileMenu ? "Fechar menu" : sidebarCollapsed ? "Expandir menu" : "Recolher menu"}>{sidebarCollapsed && !mobileMenu ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</button></div>
        <div className="workspace-switch"><span className="workspace-logo"><Wrench size={17} /></span><span><strong>{activeAccount.companyName}</strong><small>Gestão de estoque</small></span><ChevronDown size={15} /></div>
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
        <div className="profile-row"><div className="avatar">{role === "admin" ? activeAccount.ownerName.slice(0, 2).toUpperCase() : "AC"}</div><div className="profile-info"><strong>{role === "admin" ? activeAccount.ownerName : "Ana Costa"}</strong><small>{role === "admin" ? "Administrador" : "Funcionário"}</small></div><button className="profile-logout" title="Sair" aria-label="Sair da conta" onClick={signOut}><LogOut size={17} /></button></div>
      </aside>
      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><button className="mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu size={20} /></button><span>Estoque Aqui</span><ChevronRight size={14} /><strong>{pageTitle}</strong></div>
          <div className="topbar-actions">
            <div className="date-pill"><span className="online-dot" />Estoque atualizado</div>
            <button className="icon-button notification-button" aria-label="Notificações" onClick={() => navigateTo(inventoryReminderDue ? "inventory" : "products")}><Bell size={18} />{(lowStock.length > 0 || inventoryReminderDue) && <i />}</button>
            <button className="icon-button" onClick={() => setDark(!dark)} aria-label="Alternar tema">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <div className="topbar-user"><div className="topbar-avatar">{role === "admin" ? activeAccount.ownerName.slice(0, 2).toUpperCase() : "AC"}</div><span><strong>{role === "admin" ? activeAccount.ownerName : "Ana Costa"}</strong><small>{role === "admin" ? "Administrador" : "Funcionário"}</small></span></div>
            <button className="icon-button" title="Sair da conta" aria-label="Sair da conta" onClick={signOut}><LogOut size={17} /></button>
          </div>
        </header>

        <div className="content">
          {page === "dashboard" && <Dashboard products={products} movements={movements} lowStock={lowStock} onNavigate={navigateTo} onModal={setModal} />}
          {page === "products" && <ProductsPage products={filteredProducts} allProducts={products} search={search} setSearch={setSearch} category={productCategory} setCategory={setProductCategory} onModal={openProductModal} isAdmin={role === "admin"} onDelete={(id) => { setProducts((current) => current.filter((item) => item.id !== id)); flash("Produto removido."); }} />}
          {page === "inventory" && <InventoryPage products={products} physicalCounts={physicalCounts} onCountChange={(productId, quantity) => setPhysicalCounts((current) => ({ ...current, [productId]: quantity }))} onApply={applyInventoryCounts} history={inventoryHistory} reminder={inventoryReminder} reminderDue={inventoryReminderDue} onSaveReminder={saveInventoryReminder} onClearReminder={clearInventoryReminder} />}
          {page === "defective-products" && <DefectiveProductsPage defectiveProducts={defectiveProducts} onSubmit={addDefectiveProduct} />}
          {page === "movements" && <MovementsPage movements={movements} onModal={() => setModal("movement")} />}
          {page === "reports" && role === "admin" && <ReportsPage products={products} movements={movements} inventoryHistory={inventoryHistory} />}
          {page === "suppliers" && <SuppliersPage onNotice={flash} />}
          {page === "settings" && role === "admin" && <SettingsPage role={role} dark={dark} setDark={setDark} onNotice={flash} />}
          {page === "subscription" && role === "admin" && <SubscriptionPage account={activeAccount} onUpdate={updateAccount} onNotice={flash} />}
        </div>
      </section>

      {modal && <Modal title={modal === "product" ? "Cadastrar novo produto" : "Nova movimentação"} onClose={() => { setModal(null); setBarcodeScannerOpen(false); }}>
        {modal === "product" ? <form className="modal-form" onSubmit={addProduct}>
          <label>Nome do produto<input name="name" placeholder="Ex.: Óleo sintético 5W30" required /></label>
          <div className="form-grid barcode-form-row"><label>Código de barras<input name="sku" value={productCode} onChange={(event) => setProductCode(event.target.value)} placeholder="Leia ou digite o código" required /></label><button type="button" className="secondary-button barcode-trigger" onClick={() => setBarcodeScannerOpen((open) => !open)}><ScanBarcode size={16} />{barcodeScannerOpen ? "Fechar leitor" : "Ler código"}</button></div>
          {barcodeScannerOpen && <BarcodeScanner onDetected={(code) => { setProductCode(code); setBarcodeScannerOpen(false); flash("Código de barras lido."); }} />}
          <div className="form-grid"><label>Categoria<select name="category" defaultValue="Peças automotivas"><option>Peças automotivas</option><option>Lava a jato</option><option>Lubrificantes</option><option>Ferramentas</option><option>Outros</option></select></label><label>Unidade<select name="unit"><option>un</option><option>par</option><option>caixa</option><option>galão</option><option>litro</option></select></label></div>
          <div className="form-grid"><label>Estoque inicial<input name="stock" type="number" min="0" defaultValue="0" required /></label><label>Estoque mínimo<input name="minimum" type="number" min="0" defaultValue="5" required /></label></div>
          <label>Preço unitário<input name="price" type="number" min="0" step="0.01" placeholder="0,00" required /></label>
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
      subscriptionStatus: "ativa",
      createdAt: now,
      renewalAt: now + 30 * 24 * 60 * 60 * 1000,
      invoices: [{ id: `TEST-${now}`, createdAt: now, amount: plan.price, status: "Paga" }],
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
            <p>Uma plataforma simples para controlar produtos, movimentações e inventários — de autopeças aos produtos para lava a jato.</p>
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
          </div>
        </section>

        <section className="saas-pricing-section" id="planos" data-scroll-reveal>
          <div className="saas-section-heading"><span className="eyebrow">PLANOS</span><h2>Comece no seu ritmo.</h2><p>Valores ilustrativos para o protótipo. Nenhuma cobrança será realizada.</p></div>
          <PlanCards onChoose={choosePlan} />
        </section>

        <section className="saas-final-cta" data-scroll-reveal><div><span className="eyebrow">PRONTO PARA ORGANIZAR?</span><h2>Seu estoque merece<br />um controle melhor.</h2><p>Crie sua conta de demonstração e conheça o fluxo completo.</p></div><button className="primary-button" onClick={() => choosePlan("profissional")}>Criar conta da empresa <ArrowRight size={17} /></button></section>
        <footer className="saas-footer"><a className="saas-brand" href="#inicio"><span className="brand-icon"><Box size={18} /></span><span>Estoque <b>Aqui</b></span></a><span>© 2026 Estoque Aqui · Protótipo frontend</span><button onClick={() => { setError(""); setView("login"); }}>Acesso da equipe interna</button></footer>
      </>}

      {showScrollTop && <button className="scroll-top-button" aria-label="Voltar ao topo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><ArrowUp size={18} /></button>}
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
          <div className="portal-test-explainer"><ShieldCheck size={19} /><p><strong>Checkout simulado</strong><br />Nenhum cartão ou dado bancário será solicitado. Confirmar abaixo apenas ativa uma assinatura fictícia neste navegador.</p></div>
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

function SubscriptionPage({ account, onUpdate, onNotice }: { account: SaasAccount; onUpdate: (account: SaasAccount) => void; onNotice: (message: string) => void }) {
  const [selectedPlan, setSelectedPlan] = useState(account.plan);
  const plan = plans.find((item) => item.id === account.plan)!;
  const nextPlan = plans.find((item) => item.id === selectedPlan)!;

  function changePlan() {
    if (selectedPlan === account.plan) {
      onNotice("Este já é o plano atual da empresa.");
      return;
    }
    const updated = { ...account, plan: selectedPlan, renewalAt: Date.now() + 30 * 24 * 60 * 60 * 1000, invoices: [{ id: `TEST-${Date.now()}`, createdAt: Date.now(), amount: nextPlan.price, status: "Paga" as const }, ...account.invoices] };
    onUpdate(updated);
    onNotice("Plano alterado no ambiente de demonstração. Nenhuma cobrança foi processada.");
  }

  function toggleSubscription() {
    const isActive = account.subscriptionStatus === "ativa";
    onUpdate({ ...account, subscriptionStatus: isActive ? "cancelada" : "ativa" });
    onNotice(isActive ? "Cancelamento simulado. O acesso atual permanece disponível neste protótipo." : "Assinatura reativada no ambiente de demonstração.");
  }

  return <div className="page-content"><PageHeading eyebrow="CONTA DA EMPRESA" title="Assinatura" description="Consulte seu plano e gerencie a assinatura de demonstração." /><div className="subscription-notice"><ShieldCheck size={18} /><span><strong>Modo de teste:</strong> este painel não processa pagamentos. Alterações são salvas apenas neste navegador.</span></div><div className="subscription-layout"><section className="panel subscription-current"><div className="subscription-current-top"><span className="saas-feature-icon green"><CreditCard size={20} /></span><span className={`subscription-status ${account.subscriptionStatus === "ativa" ? "subscription-active" : "subscription-inactive"}`}><i />{account.subscriptionStatus}</span></div><span className="eyebrow">PLANO ATUAL</span><h2>{plan.name}</h2><div className="subscription-price">{money(plan.price)}<small>/mês</small></div><p>Próxima renovação: {new Date(account.renewalAt).toLocaleDateString("pt-BR")}</p><div className="subscription-company"><Building2 size={16} />{account.companyName}</div><button className="text-button subscription-cancel" onClick={toggleSubscription}>{account.subscriptionStatus === "ativa" ? "Cancelar assinatura de teste" : "Reativar assinatura"}</button></section><section className="panel subscription-change"><div className="panel-heading"><div><h2>Alterar plano</h2><p>Escolha uma opção. A mudança é simulada.</p></div></div><label htmlFor="subscription-plan">Plano</label><select id="subscription-plan" value={selectedPlan} onChange={(event) => setSelectedPlan(event.target.value as PlanId)}>{plans.map((item) => <option value={item.id} key={item.id}>{item.name} — {money(item.price)}/mês (demo)</option>)}</select><button className="primary-button" onClick={changePlan}>Confirmar alteração de teste <ArrowRight size={15} /></button></section></div><section className="panel subscription-invoices"><div className="panel-heading"><div><h2>Histórico de cobranças de teste</h2><p>Registros fictícios criados neste navegador.</p></div><span className="portal-test-badge"><CreditCard size={14} /> TESTE</span></div>{account.invoices.length ? <div className="invoice-list">{account.invoices.map((invoice) => <div className="invoice-row" key={invoice.id}><span className="invoice-icon"><CreditCard size={16} /></span><div><strong>Assinatura {plan.name}</strong><small>{new Date(invoice.createdAt).toLocaleDateString("pt-BR")} · {invoice.id}</small></div><strong>{money(invoice.amount)}</strong><span className="invoice-paid"><CheckCircle2 size={14} />{invoice.status}</span></div>)}</div> : <div className="subscription-empty"><CreditCard size={21} /><p>Nenhuma cobrança de demonstração registrada ainda.</p></div>}</section></div>;
}

function InternalAdminPanel({ accounts, onUpdate, onSignOut, dark, setDark }: { accounts: SaasAccount[]; onUpdate: (account: SaasAccount) => void; onSignOut: () => void; dark: boolean; setDark: (value: boolean) => void }) {
  const [search, setSearch] = useState("");
  const active = accounts.filter((account) => account.subscriptionStatus === "ativa").length;
  const totalRevenue = accounts.reduce((sum, account) => account.subscriptionStatus === "ativa" ? sum + (plans.find((plan) => plan.id === account.plan)?.price ?? 0) : sum, 0);
  const filtered = accounts.filter((account) => `${account.companyName} ${account.ownerName} ${account.email}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")));

  return <main className={`internal-shell ${dark ? "theme-dark" : ""}`}><header className="internal-header"><a className="saas-brand"><span className="brand-icon"><Box size={20} /></span><span>Estoque <b>Aqui</b></span><i>PLATAFORMA</i></a><div><span className="internal-mode"><LockKeyhole size={14} /> Painel interno · demonstração</span><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Alternar tema">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button className="secondary-button" onClick={onSignOut}><LogOut size={15} />Sair</button></div></header><section className="internal-content"><div className="internal-heading"><div><span className="eyebrow">OPERAÇÃO DA PLATAFORMA</span><h1>Painel interno</h1><p>Visão demonstrativa das empresas e assinaturas cadastradas neste navegador.</p></div><span className="portal-test-badge"><ShieldCheck size={14} /> MODO DE TESTE</span></div><div className="internal-metrics"><article><span><Building2 size={18} /></span><small>Empresas cadastradas</small><strong>{accounts.length}</strong></article><article><span><CheckCircle2 size={18} /></span><small>Assinaturas ativas</small><strong>{active}</strong></article><article><span><CreditCard size={18} /></span><small>Receita mensal simulada</small><strong>{money(totalRevenue)}</strong></article><article><span><Clock3 size={18} /></span><small>Em teste ou canceladas</small><strong>{accounts.length - active}</strong></article></div><section className="panel internal-table-panel"><div className="panel-heading"><div><h2>Empresas e assinaturas</h2><p>Controle local de cadastros realizados neste navegador.</p></div><div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar empresa..." /></div></div>{filtered.length ? <div className="internal-table-wrap"><table className="internal-table"><thead><tr><th>EMPRESA</th><th>ADMINISTRADOR</th><th>PLANO</th><th>STATUS</th><th>CADASTRO</th><th>AÇÃO</th></tr></thead><tbody>{filtered.map((account) => <tr key={account.id}><td><strong>{account.companyName}</strong><small>{account.email}</small></td><td>{account.ownerName}</td><td>{plans.find((item) => item.id === account.plan)?.name}</td><td><span className={`subscription-status ${account.subscriptionStatus === "ativa" ? "subscription-active" : "subscription-inactive"}`}><i />{account.subscriptionStatus}</span></td><td>{new Date(account.createdAt).toLocaleDateString("pt-BR")}</td><td><button className="secondary-button" onClick={() => onUpdate({ ...account, subscriptionStatus: account.subscriptionStatus === "ativa" ? "cancelada" : "ativa" })}>{account.subscriptionStatus === "ativa" ? "Suspender" : "Reativar"}</button></td></tr>)}</tbody></table></div> : <div className="subscription-empty"><Building2 size={22} /><p>Nenhuma empresa encontrada.</p></div>}</section><p className="internal-footnote"><LockKeyhole size={14} /> Painel apenas visual. Não há servidor, isolamento de dados, gateway ou cobrança conectados neste protótipo.</p></section></main>;
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
          <CategoryLine icon={<Wrench size={16} />} label="Peças automotivas" count={42} percent={68} color="green" />
          <CategoryLine icon={<Droplets size={16} />} label="Lava a jato" count={28} percent={46} color="gold" />
          <CategoryLine icon={<CarFront size={16} />} label="Lubrificantes" count={19} percent={31} color="red" />
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
      {products.length === 0 && <div className="empty-state"><Package size={24} /><strong>Nenhum produto encontrado</strong><span>Tente outro termo ou altere o filtro de categoria.</span></div>}
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
        <div className="form-grid"><label>Nome do produto<input name="name" placeholder="Ex.: Filtro de óleo Tecfil" required /></label><label>Código de barras ou identificação <span className="optional-label">(opcional)</span><input name="code" placeholder="Código do produto" /></label></div>
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
  return <div className="table-scroll"><table className="products-table"><thead><tr><th>PRODUTO</th><th>CATEGORIA</th><th>CÓDIGO</th><th>ESTOQUE</th><th>PREÇO UNIT.</th><th>STATUS</th><th></th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="table-product"><span className="table-product-icon"><Package size={16} /></span><span><strong>{product.name}</strong><small>Unidade: {product.unit}</small></span></div></td><td>{product.category}</td><td className="sku-cell">{product.sku}</td><td><strong>{product.stock}</strong> <span className="muted-cell">{product.unit}</span></td><td>{money(product.price)}</td><td><span className={`status-tag ${product.stock <= product.minimum ? "status-low" : "status-ok"}`}><i />{product.stock <= product.minimum ? "Estoque baixo" : "Disponível"}</span></td><td>{isAdmin && <button className="more-button" title="Remover produto" onClick={() => onDelete(product.id)}><MoreHorizontal size={18} /></button>}</td></tr>)}</tbody></table></div>;
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
  const suppliers = [{ name: "Auto Peças Brasil", category: "Peças automotivas", contact: "contato@autopecasbrasil.com.br", status: "Ativo", initials: "AB" }, { name: "Química Premium", category: "Produtos para lava a jato", contact: "vendas@quimicapremium.com.br", status: "Ativo", initials: "QP" }, { name: "LubriCenter Distribuidora", category: "Lubrificantes", contact: "pedidos@lubricenter.com.br", status: "Ativo", initials: "LC" }];
  return <div className="page-content"><PageHeading eyebrow="REDE DE PARCEIROS" title="Fornecedores" description="Organize seus parceiros e tenha os contatos sempre à mão." action={<button className="primary-button" onClick={() => onNotice("Cadastro de fornecedor disponível em breve.")}><Plus size={16} />Novo fornecedor</button>} /><section className="panel supplier-panel"><div className="panel-heading"><div><h2>Seus fornecedores</h2><p>{suppliers.length} parceiros cadastrados</p></div><div className="search-box supplier-search"><Search size={17} /><input placeholder="Buscar fornecedor..." /></div></div><div className="supplier-list">{suppliers.map((supplier) => <div className="supplier-row" key={supplier.name}><span className="supplier-avatar">{supplier.initials}</span><div className="supplier-main"><strong>{supplier.name}</strong><small>{supplier.contact}</small></div><span className="supplier-category">{supplier.category}</span><span className="status-tag status-ok"><i />{supplier.status}</span><button className="more-button" aria-label={`Opções para ${supplier.name}`}><MoreHorizontal size={18} /></button></div>)}</div></section></div>;
}

function SettingsPage({ role, dark, setDark, onNotice }: { role: Role; dark: boolean; setDark: (value: boolean) => void; onNotice: (message: string) => void }) {
  return <div className="page-content"><PageHeading eyebrow="PREFERÊNCIAS" title="Configurações" description="Personalize sua experiência e gerencie as preferências da conta." /><section className="panel settings-panel"><div className="settings-section"><div className="settings-heading"><span className="settings-icon"><UserRound size={18} /></span><div><h2>Minha conta</h2><p>Informações do perfil e nível de acesso</p></div></div><div className="settings-row"><div><strong>Tipo de conta</strong><small>Seu perfil de acesso atual</small></div><span className="role-pill">{role === "admin" ? <><ShieldCheck size={14} />Administrador</> : <><UsersRound size={14} />Funcionário</>}</span></div><div className="settings-row"><div><strong>Nome do workspace</strong><small>Identificação da sua empresa</small></div><span>Estoque Aqui</span></div></div><div className="settings-section"><div className="settings-heading"><span className="settings-icon"><Sun size={18} /></span><div><h2>Aparência</h2><p>Escolha como o Estoque Aqui aparece para você</p></div></div><div className="settings-row"><div><strong>Tema da interface</strong><small>Alterne entre tema claro e escuro</small></div><button className={`theme-toggle ${dark ? "toggle-on" : ""}`} onClick={() => setDark(!dark)} aria-label="Alternar tema"><span /></button></div></div><div className="settings-section"><div className="settings-heading"><span className="settings-icon"><Bell size={18} /></span><div><h2>Notificações</h2><p>Receba alertas importantes sobre seu estoque</p></div></div><div className="settings-row"><div><strong>Alertas de estoque baixo</strong><small>Notificar quando produtos atingirem o mínimo</small></div><button className="theme-toggle toggle-on" onClick={() => onNotice("Preferência de alertas atualizada.")} aria-label="Alternar notificações"><span /></button></div></div></section></div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading-row"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="eyebrow">GESTÃO DE ESTOQUE</span><h2 id="modal-title">{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={19} /></button></div>{children}</section></div>;
}
