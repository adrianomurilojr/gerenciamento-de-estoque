"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Box,
  CarFront,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Download,
  Droplets,
  Home as HomeIcon,
  LayoutDashboard,
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
type Page = "home" | "dashboard" | "products" | "defective-products" | "movements" | "reports" | "suppliers" | "settings";
type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minimum: number;
  price: number;
  unit: string;
  createdAt: number;
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

const initialProducts: Product[] = [
  { id: 1, name: "Óleo sintético 5W30", sku: "LUB-005", category: "Lubrificantes", stock: 84, minimum: 20, price: 42.9, unit: "un", createdAt: Date.now() - 2 * 86400000 },
  { id: 2, name: "Filtro de óleo Tecfil", sku: "FIL-021", category: "Peças automotivas", stock: 12, minimum: 15, price: 28.5, unit: "un", createdAt: Date.now() - 86400000 },
  { id: 3, name: "Shampoo automotivo 5L", sku: "LAV-008", category: "Lava a jato", stock: 36, minimum: 10, price: 65, unit: "galão", createdAt: Date.now() - 3 * 86400000 },
  { id: 4, name: "Pastilha de freio dianteira", sku: "FRE-014", category: "Peças automotivas", stock: 7, minimum: 10, price: 119.9, unit: "par", createdAt: Date.now() - 5 * 86400000 },
  { id: 5, name: "Cera líquida premium", sku: "LAV-012", category: "Lava a jato", stock: 28, minimum: 8, price: 34.9, unit: "un", createdAt: Date.now() - 7 * 86400000 },
  { id: 6, name: "Fluido de freio DOT 4", sku: "FLU-002", category: "Lubrificantes", stock: 3, minimum: 12, price: 31.9, unit: "un", createdAt: Date.now() - 10 * 86400000 },
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

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Produtos", icon: Package },
  { id: "defective-products", label: "Produtos com defeito", icon: AlertTriangle },
  { id: "movements", label: "Movimentações", icon: Activity },
  { id: "reports", label: "Relatórios", icon: ClipboardList },
  { id: "suppliers", label: "Fornecedores", icon: Truck },
  { id: "settings", label: "Configurações", icon: Settings },
];

const employeePages: Page[] = ["dashboard", "products", "defective-products", "movements", "suppliers"];

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [page, setPage] = useState<Page>("home");
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [productCategory, setProductCategory] = useState("Todas as categorias");
  const [productCode, setProductCode] = useState("");
  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [movements, setMovements] = useState(initialMovements);
  const [defectiveProducts, setDefectiveProducts] = useState<DefectiveProduct[]>([]);
  const [modal, setModal] = useState<"product" | "movement" | null>(null);
  const [notice, setNotice] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("stockly-theme");
    const savedRole = localStorage.getItem("stockly-role") as Role | null;
    if (savedTheme === "dark") setDark(true);
    if (savedRole === "admin" || savedRole === "employee") setRole(savedRole);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("stockly-theme", dark ? "dark" : "light");
  }, [dark]);

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

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim().toLowerCase();
    const password = String(data.get("password"));
    const matchedRole =
      email === "admin@estoque3irmaos.com.br" && password === "admin123"
        ? "admin"
        : email === "funcionario@estoque3irmaos.com.br" && password === "func123"
          ? "employee"
          : null;
    if (!matchedRole) {
      setLoginError("E-mail ou senha incorretos. Confira os acessos de demonstração.");
      return;
    }
    localStorage.setItem("stockly-role", matchedRole);
    setRole(matchedRole);
    setPage("home");
    setLoginError("");
  }

  function signOut() {
    localStorage.removeItem("stockly-role");
    setRole(null);
    setPage("home");
  }

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  function navigateTo(target: Page) {
    if (role === "employee" && target !== "home" && !employeePages.includes(target)) {
      flash("Essa opção está disponível apenas para administradores.");
      return;
    }
    setPage(target);
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
      createdAt: Date.now(),
    };
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

  if (!role) {
    return (
      <main className="login-shell">
        <section className="login-brand">
          <div className="brand-lockup"><span className="brand-icon"><Box size={22} /></span><span>Estoque 3 <span className="brand-dot">Irmãos</span></span></div>
          <div className="login-pitch">
            <span className="eyebrow">GESTÃO INTELIGENTE</span>
            <h1>Seu estoque,<br />sob controle.</h1>
            <p>Uma visão completa do seu negócio, das peças automotivas aos produtos do seu lava a jato.</p>
            <div className="login-feature-list">
              <div><span className="feature-check"><Check size={14} /></span> Acompanhe entradas e saídas em tempo real</div>
              <div><span className="feature-check"><Check size={14} /></span> Nunca mais fique sem um produto importante</div>
              <div><span className="feature-check"><Check size={14} /></span> Relatórios claros para decisões melhores</div>
            </div>
          </div>
          <div className="login-brand-footer">© 2026 Estoque 3 Irmãos · Feito para quem faz acontecer</div>
        </section>
        <section className="login-panel">
          <div className="login-theme"><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Alternar tema">{dark ? <Sun size={18} /> : <Moon size={18} />}</button></div>
          <div className="login-form-wrap">
            <div className="mobile-brand brand-lockup"><span className="brand-icon"><Box size={22} /></span><span>Estoque 3 <span className="brand-dot">Irmãos</span></span></div>
            <span className="eyebrow">BEM-VINDO DE VOLTA</span>
            <h2>Acesse sua conta</h2>
            <p className="login-subtitle">Entre com seus dados para continuar.</p>
            <form className="login-form" onSubmit={signIn}>
              <label htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" placeholder="voce@empresa.com.br" required />
              <div className="password-label"><label htmlFor="password">Senha</label><button type="button" className="text-button" onClick={() => flash("Entre em contato com o administrador para redefinir sua senha.")}>Esqueceu a senha?</button></div>
              <input id="password" name="password" type="password" placeholder="Digite sua senha" required />
              {loginError && <p className="form-error">{loginError}</p>}
              <button className="primary-button login-submit" type="submit">Entrar na plataforma <ArrowRight size={17} /></button>
            </form>
            <div className="demo-access">
              <div className="demo-heading"><span>Acessos para demonstração</span><ShieldCheck size={16} /></div>
              <div><span>Administrador</span><button type="button" onClick={() => { (document.getElementById("email") as HTMLInputElement).value = "admin@estoque3irmaos.com.br"; (document.getElementById("password") as HTMLInputElement).value = "admin123"; }}>admin@estoque3irmaos.com.br <ArrowUpRight size={13} /></button></div>
              <div><span>Funcionário</span><button type="button" onClick={() => { (document.getElementById("email") as HTMLInputElement).value = "funcionario@estoque3irmaos.com.br"; (document.getElementById("password") as HTMLInputElement).value = "func123"; }}>funcionario@estoque3irmaos.com.br <ArrowUpRight size={13} /></button></div>
            </div>
            <p className="login-legal">Ao entrar, você concorda com nossos <button type="button" className="text-button">Termos de uso</button> e <button type="button" className="text-button">Política de privacidade</button>.</p>
          </div>
        </section>
        {notice && <div className="toast"><Check size={16} />{notice}</div>}
      </main>
    );
  }

  const pageTitle = page === "home" ? "Início" : availableNavItems.find((item) => item.id === page)?.label ?? "Início";

  return (
    <main className={`app-shell ${dark ? "theme-dark" : ""}`}>
      <section className="main-area">
        <header className="topbar">
          <div className="topbar-brand"><button className="topbar-logo brand-lockup" onClick={() => navigateTo("home")} aria-label="Ir para o início"><span className="brand-icon"><Box size={20} /></span><span>Estoque 3 <span className="brand-dot">Irmãos</span></span></button><span className="topbar-divider" /><strong>{pageTitle}</strong></div>
          <div className="topbar-actions">
            <div className="date-pill"><span className="online-dot" />Estoque atualizado</div>
            <button className="icon-button notification-button" aria-label="Notificações" onClick={() => navigateTo("products")}><Bell size={18} />{lowStock.length > 0 && <i />}</button>
            <button className="icon-button" onClick={() => setDark(!dark)} aria-label="Alternar tema">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <div className="topbar-user"><div className="topbar-avatar">{role === "admin" ? "MS" : "AC"}</div><span><strong>{role === "admin" ? "Marcos Silva" : "Ana Costa"}</strong><small>{role === "admin" ? "Administrador" : "Funcionário"}</small></span></div>
            <button className="icon-button" title="Sair da conta" aria-label="Sair da conta" onClick={signOut}><LogOut size={17} /></button>
          </div>
        </header>

        {page !== "home" && <nav className="top-nav" aria-label="Navegação principal">
          <button className="top-nav-link" onClick={() => navigateTo("home")}><HomeIcon size={16} /><span>Home</span></button>
          {availableNavItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`top-nav-link ${page === id ? "active" : ""}`} aria-current={page === id ? "page" : undefined} onClick={() => navigateTo(id)}>
              <Icon size={16} /><span>{label}</span>{id === "products" && lowStock.length > 0 && <i className="top-nav-badge">{lowStock.length}</i>}
            </button>
          ))}
        </nav>}

        <div className="content">
          {page === "home" && <HomeMenu role={role} products={products} lowStock={lowStock} onNavigate={navigateTo} />}
          {page === "dashboard" && <Dashboard products={products} movements={movements} lowStock={lowStock} onNavigate={navigateTo} onModal={setModal} />}
          {page === "products" && <ProductsPage products={filteredProducts} allProducts={products} search={search} setSearch={setSearch} category={productCategory} setCategory={setProductCategory} onModal={openProductModal} isAdmin={role === "admin"} onDelete={(id) => { setProducts((current) => current.filter((item) => item.id !== id)); flash("Produto removido."); }} />}
          {page === "defective-products" && <DefectiveProductsPage defectiveProducts={defectiveProducts} onSubmit={addDefectiveProduct} />}
          {page === "movements" && <MovementsPage movements={movements} onModal={() => setModal("movement")} />}
          {page === "reports" && role === "admin" && <ReportsPage products={products} movements={movements} />}
          {page === "suppliers" && <SuppliersPage onNotice={flash} />}
          {page === "settings" && role === "admin" && <SettingsPage role={role} dark={dark} setDark={setDark} onNotice={flash} />}
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

function HomeMenu({ role, products, lowStock, onNavigate }: { role: Role; products: Product[]; lowStock: Product[]; onNavigate: (page: Page) => void }) {
  const cards = navItems.filter(({ id }) => role === "admin" || employeePages.includes(id)).map((item) => ({
    ...item,
    description: {
      home: "Acesse todos os módulos",
      dashboard: "Resumo e indicadores da operação",
      products: "Catálogo e níveis de estoque",
      "defective-products": "Registro e histórico de produtos danificados",
      movements: "Entradas, saídas e ajustes",
      reports: "Análises e relatórios do estoque",
      suppliers: "Parceiros e contatos comerciais",
      settings: "Conta, tema e preferências",
    }[item.id],
    count: item.id === "products" ? `${products.length} produtos` : item.id === "movements" ? "Registrar e acompanhar" : undefined,
    badge: item.id === "products" && lowStock.length > 0 ? `${lowStock.length} para repor` : undefined,
  }));

  function followPointer(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const rotateY = ((x / bounds.width) - 0.5) * 8;
    const rotateX = (0.5 - y / bounds.height) * 8;
    event.currentTarget.style.setProperty("--pointer-x", `${x}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${y}px`);
    event.currentTarget.style.setProperty("--rotate-x", `${rotateX}deg`);
    event.currentTarget.style.setProperty("--rotate-y", `${rotateY}deg`);
  }

  return <div className="home-menu-page">
    <div className="home-menu-heading"><span className="eyebrow">ESTOQUE 3 IRMÃOS · CENTRAL DE OPERAÇÕES</span><h1>Olá, {role === "admin" ? "Marcos" : "Ana"} <span className="wave">✦</span></h1><p>O que você gostaria de fazer hoje?</p></div>
    <div className="home-tiles">
      {cards.map(({ id, label, icon: Icon, description, count, badge }, index) => <button
        key={id}
        className="home-tile"
        style={{ "--tile-index": index } as React.CSSProperties}
        onClick={() => onNavigate(id)}
        onPointerMove={followPointer}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty("--rotate-x", "0deg");
          event.currentTarget.style.setProperty("--rotate-y", "0deg");
        }}
      >
        <span className="tile-icon-wrap"><Icon size={25} strokeWidth={1.8} /></span>
        {badge && <span className="tile-badge">{badge}</span>}
        <span className="tile-label">{label}</span>
        <span className="tile-description">{description}</span>
        <span className="tile-footer">{count ?? "Acessar módulo"}<ArrowRight size={15} /></span>
      </button>)}
    </div>
    <div className="home-menu-footer"><span><i className="online-dot" />{products.length} produtos cadastrados</span><span>{lowStock.length ? `${lowStock.length} produtos precisam de reposição` : "Todos os níveis de estoque estão em dia"}</span></div>
  </div>;
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
  const recentProducts = [...products].sort((first, second) => second.createdAt - first.createdAt).slice(0, 4);
  const groupedProducts = products.reduce<Record<string, Product[]>>((groups, product) => {
    (groups[product.category] ??= []).push(product);
    return groups;
  }, {});
  const categories = Array.from(new Set(allProducts.map((product) => product.category))).sort((first, second) => first.localeCompare(second, "pt-BR"));

  return <div className="page-content">
    <PageHeading eyebrow="CATÁLOGO" title="Produtos" description="Gerencie seus produtos, acompanhe os níveis de estoque e mantenha tudo organizado." action={<button className="primary-button" onClick={onModal}><Plus size={16} />Cadastrar novo produto</button>} />
    <section className="panel recent-products-panel">
      <div className="panel-heading"><div><h2>Cadastrados recentemente</h2><p>Produtos adicionados ao catálogo</p></div><span className="recent-count">{products.length} encontrados</span></div>
      {recentProducts.length ? <div className="recent-product-list">{recentProducts.map((product) => <div className="recent-product-card" key={product.id}><span className="recent-product-icon"><Package size={17} /></span><div className="recent-product-info"><strong>{product.name}</strong><small>{product.category} · {product.sku}</small></div><span className="recent-product-date">{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(product.createdAt)}</span></div>)}</div> : <div className="empty-state recent-empty"><Package size={22} /><strong>Nenhum produto encontrado</strong><span>Altere a busca ou o filtro para ver produtos cadastrados.</span></div>}
    </section>
    <section className="panel products-panel">
      <div className="products-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Buscar qualquer produto" placeholder="Buscar qualquer produto por nome, código, categoria..." /></div><label className="category-filter"><span>Categoria</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option>Todas as categorias</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><button className="secondary-button filter-button" onClick={() => window.print()}><Download size={15} /> Exportar</button></div>
      <div className="grouped-products">
        {Object.entries(groupedProducts).sort(([first], [second]) => first.localeCompare(second, "pt-BR")).map(([group, groupProducts]) => <section className="product-category-group" key={group}>
          <div className="category-group-heading"><span className="category-group-icon"><Package size={16} /></span><h2>{group}</h2><span className="category-group-count">{groupProducts.length} {groupProducts.length === 1 ? "produto" : "produtos"}</span></div>
          <ProductTable products={groupProducts} isAdmin={isAdmin} onDelete={onDelete} />
        </section>)}
        {products.length === 0 && <div className="empty-state"><Package size={24} /><strong>Nenhum produto encontrado</strong><span>Tente outro termo ou altere o filtro de categoria.</span></div>}
      </div>
      <div className="table-footer"><span>Mostrando <strong>{products.length}</strong> produtos em <strong>{Object.keys(groupedProducts).length}</strong> categorias</span></div>
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
  return <div className="table-scroll"><table className="products-table"><thead><tr><th>PRODUTO</th><th>SKU / CÓDIGO</th><th>ESTOQUE</th><th>PREÇO UNIT.</th><th>STATUS</th><th></th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="table-product"><span className="table-product-icon"><Package size={16} /></span><span><strong>{product.name}</strong><small>Unidade: {product.unit}</small></span></div></td><td className="sku-cell">{product.sku}</td><td><strong>{product.stock}</strong> <span className="muted-cell">{product.unit}</span></td><td>{money(product.price)}</td><td><span className={`status-tag ${product.stock <= product.minimum ? "status-low" : "status-ok"}`}><i />{product.stock <= product.minimum ? "Estoque baixo" : "Disponível"}</span></td><td>{isAdmin && <button className="more-button" title="Remover produto" onClick={() => onDelete(product.id)}><MoreHorizontal size={18} /></button>}</td></tr>)}</tbody></table></div>;
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

function ReportsPage({ products, movements }: { products: Product[]; movements: Movement[] }) {
  const totalValue = products.reduce((total, product) => total + product.stock * product.price, 0);
  return <div className="page-content"><PageHeading eyebrow="INTELIGÊNCIA DE ESTOQUE" title="Relatórios" description="Informações para entender e otimizar a operação do seu estoque." action={<button className="secondary-button"><Download size={16} />Exportar relatório</button>} /><div className="metric-grid report-metrics"><MetricCard title="Valor total em estoque" value={money(totalValue)} change="+8,2%" positive icon={<TrendingUp size={18} />} caption="versus mês anterior" /><MetricCard title="Itens cadastrados" value={String(products.length)} change="+2 novos" positive icon={<Package size={18} />} caption="neste mês" /><MetricCard title="Movimentações" value={String(movements.length + 144)} change="+4,3%" positive icon={<Activity size={18} />} caption="nos últimos 30 dias" /><MetricCard title="Itens para repor" value={String(products.filter((item) => item.stock <= item.minimum).length)} change="Atenção" positive={false} icon={<TrendingDown size={18} />} caption="abaixo do estoque mínimo" alert /></div><div className="report-grid"><div className="panel report-callout"><span className="report-icon"><ClipboardList size={21} /></span><h2>Relatório de estoque</h2><p>Veja todos os produtos, quantidades disponíveis, valores e alertas de reposição em um só lugar.</p><button className="secondary-button" onClick={() => window.print()}><Download size={15} />Gerar relatório</button></div><div className="panel report-callout"><span className="report-icon report-icon-gold"><Activity size={21} /></span><h2>Relatório de movimentações</h2><p>Analise o histórico de entradas e saídas por período, produto ou responsável.</p><button className="secondary-button" onClick={() => window.print()}><Download size={15} />Gerar relatório</button></div></div></div>;
}

function SuppliersPage({ onNotice }: { onNotice: (message: string) => void }) {
  const suppliers = [{ name: "Auto Peças Brasil", category: "Peças automotivas", contact: "contato@autopecasbrasil.com.br", status: "Ativo", initials: "AB" }, { name: "Química Premium", category: "Produtos para lava a jato", contact: "vendas@quimicapremium.com.br", status: "Ativo", initials: "QP" }, { name: "LubriCenter Distribuidora", category: "Lubrificantes", contact: "pedidos@lubricenter.com.br", status: "Ativo", initials: "LC" }];
  return <div className="page-content"><PageHeading eyebrow="REDE DE PARCEIROS" title="Fornecedores" description="Organize seus parceiros e tenha os contatos sempre à mão." action={<button className="primary-button" onClick={() => onNotice("Cadastro de fornecedor disponível em breve.")}><Plus size={16} />Novo fornecedor</button>} /><section className="panel supplier-panel"><div className="panel-heading"><div><h2>Seus fornecedores</h2><p>{suppliers.length} parceiros cadastrados</p></div><div className="search-box supplier-search"><Search size={17} /><input placeholder="Buscar fornecedor..." /></div></div><div className="supplier-list">{suppliers.map((supplier) => <div className="supplier-row" key={supplier.name}><span className="supplier-avatar">{supplier.initials}</span><div className="supplier-main"><strong>{supplier.name}</strong><small>{supplier.contact}</small></div><span className="supplier-category">{supplier.category}</span><span className="status-tag status-ok"><i />{supplier.status}</span><button className="more-button" aria-label={`Opções para ${supplier.name}`}><MoreHorizontal size={18} /></button></div>)}</div></section></div>;
}

function SettingsPage({ role, dark, setDark, onNotice }: { role: Role; dark: boolean; setDark: (value: boolean) => void; onNotice: (message: string) => void }) {
  return <div className="page-content"><PageHeading eyebrow="PREFERÊNCIAS" title="Configurações" description="Personalize sua experiência e gerencie as preferências da conta." /><section className="panel settings-panel"><div className="settings-section"><div className="settings-heading"><span className="settings-icon"><UserRound size={18} /></span><div><h2>Minha conta</h2><p>Informações do perfil e nível de acesso</p></div></div><div className="settings-row"><div><strong>Tipo de conta</strong><small>Seu perfil de acesso atual</small></div><span className="role-pill">{role === "admin" ? <><ShieldCheck size={14} />Administrador</> : <><UsersRound size={14} />Funcionário</>}</span></div><div className="settings-row"><div><strong>Nome do workspace</strong><small>Identificação da sua empresa</small></div><span>Estoque 3 Irmãos</span></div></div><div className="settings-section"><div className="settings-heading"><span className="settings-icon"><Sun size={18} /></span><div><h2>Aparência</h2><p>Escolha como o Estoque 3 Irmãos aparece para você</p></div></div><div className="settings-row"><div><strong>Tema da interface</strong><small>Alterne entre tema claro e escuro</small></div><button className={`theme-toggle ${dark ? "toggle-on" : ""}`} onClick={() => setDark(!dark)} aria-label="Alternar tema"><span /></button></div></div><div className="settings-section"><div className="settings-heading"><span className="settings-icon"><Bell size={18} /></span><div><h2>Notificações</h2><p>Receba alertas importantes sobre seu estoque</p></div></div><div className="settings-row"><div><strong>Alertas de estoque baixo</strong><small>Notificar quando produtos atingirem o mínimo</small></div><button className="theme-toggle toggle-on" onClick={() => onNotice("Preferência de alertas atualizada.")} aria-label="Alternar notificações"><span /></button></div></div></section></div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading-row"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="eyebrow">GESTÃO DE ESTOQUE</span><h2 id="modal-title">{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={19} /></button></div>{children}</section></div>;
}
