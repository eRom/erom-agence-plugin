import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { toast as sonnerToast } from "sonner";
import { useTheme } from "@/components/theme-provider";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuCheckboxItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarShortcut,
} from "@/components/ui/menubar";
import { Calendar } from "@/components/ui/calendar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Icons
import {
  Sun, Moon, Bell, Settings, User, LogOut, ChevronDown,
  Zap, Shield, Code2, Globe, Cpu, Layers, Plus, Trash2, Search,
  Copy, Edit, Star, Heart, Share2, Download, Upload,
  Check, X, Info, AlertTriangle, Terminal, Package,
  LayoutGrid, List, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Hash, Mail, Phone, MapPin, Calendar as CalendarIcon,
  ChevronRight, Home, Folder, File, Github, Twitter,
  PlayCircle, PauseCircle, SkipForward, Volume2,
  TrendingUp, BarChart3, Users, Activity,
  LayoutDashboard, Inbox, BarChart2, Bookmark, HelpCircle,
  ChevronUp, PanelLeft, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  FileText, FolderOpen, Tag, Lock, Unlock, Eye, EyeOff,
  LineChart as LineChartIcon, BarChart3 as BarChart3Icon, PieChart as PieChartIcon,
  CalendarDays, GalleryHorizontal, LayoutPanelLeft, KeyRound, Command as CommandIcon,
  Newspaper, Printer, Save, Scissors, Undo, Redo, ZoomIn, ZoomOut,
  Image, Video, Music, Smile, SlidersHorizontal, Wand2, Palette,
  ChevronsUpDown,
} from "lucide-react";

// ─── Logo SVG ─────────────────────────────────────────────────────────────────
function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Shadcn Demo logo"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 16 L16 8 L24 16 L16 24 Z" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
      <path d="M16 4 L16 8 M28 16 L24 16 M16 28 L16 24 M4 16 L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const USERS = [
  { id: 1, name: "Alice Martin", role: "Admin", status: "active", email: "alice@example.com", plan: "Pro" },
  { id: 2, name: "Bob Chen", role: "Developer", status: "active", email: "bob@example.com", plan: "Team" },
  { id: 3, name: "Carol Smith", role: "Designer", status: "inactive", email: "carol@example.com", plan: "Free" },
  { id: 4, name: "David López", role: "Manager", status: "active", email: "david@example.com", plan: "Pro" },
  { id: 5, name: "Emma Wilson", role: "Analyst", status: "pending", email: "emma@example.com", plan: "Team" },
];

const CHANGELOG = [
  "Fix null pointer in auth middleware",
  "Update deps to latest versions",
  "Add dark mode support",
  "Improve TypeScript types",
  "Refactor query layer",
  "Add unit tests for utils",
  "Bump shadcn components",
  "Fix responsive layout on mobile",
];

const SECTION_IDS = ["overview", "navigation", "forms", "overlays", "panels", "charts", "command", "calendar", "display", "feedback", "datatable", "settings", "data", "misc"];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const { theme, setTheme } = useTheme();
  const [progress, setProgress] = useState(68);
  const [sliderVal, setSliderVal] = useState([42]);
  const [switchOn, setSwitchOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [radioVal, setRadioVal] = useState("pro");
  const [selectVal, setSelectVal] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [textareaVal, setTextareaVal] = useState("");
  const [notifChecked, setNotifChecked] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [showSkeleton, setShowSkeleton] = useState(false);

  const handleScrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">

        {/* ── TOP NAV ──────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
            {/* Logo + brand */}
            <div className="flex items-center gap-2 mr-4">
              <Logo className="h-7 w-7 text-primary" />
              <span className="font-semibold text-sm tracking-tight">ShadcnKit</span>
              <Badge variant="outline" className="text-xs">v2.5</Badge>
            </div>

            {/* Navigation Menu */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-8 text-sm">Composants</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2">
                      {[
                        { icon: LayoutGrid, title: "Buttons & Badges", desc: "Actions et indicateurs" },
                        { icon: Layers, title: "Cards & Layout", desc: "Conteneurs et mise en page" },
                        { icon: Hash, title: "Forms & Inputs", desc: "Saisie et validation" },
                        { icon: Bell, title: "Overlays", desc: "Dialogs, drawers, popovers" },
                      ].map(({ icon: Icon, title, desc }) => (
                        <li key={title}>
                          <NavigationMenuLink asChild>
                            <button
                              onClick={() => handleScrollTo("overview")}
                              className="flex items-start gap-3 rounded-md p-3 text-left hover:bg-accent w-full"
                            >
                              <Icon className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                              <div>
                                <div className="font-medium text-sm">{title}</div>
                                <div className="text-xs text-muted-foreground">{desc}</div>
                              </div>
                            </button>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-8 text-sm">Ressources</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 p-4 w-[280px]">
                      {[
                        { icon: Github, label: "GitHub", href: "https://github.com/shadcn-ui/ui" },
                        { icon: Globe, label: "Documentation", href: "https://ui.shadcn.com" },
                        { icon: Code2, label: "Storybook", href: "#" },
                      ].map(({ icon: Icon, label, href }) => (
                        <li key={label}>
                          <NavigationMenuLink asChild>
                            <a href={href} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-3 rounded-md p-2 hover:bg-accent">
                              <Icon className="h-4 w-4 text-primary" />
                              <span className="text-sm">{label}</span>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex-1" />

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    data-testid="button-theme-toggle"
                    variant="ghost" size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Basculer le thème</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button data-testid="button-notif" variant="ghost" size="icon">
                    <Bell className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button data-testid="button-user-menu" variant="ghost" className="gap-2 h-8 px-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">RC</AvatarFallback>
                    </Avatar>
                    <span className="text-sm hidden md:block">Romain</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem><User className="h-4 w-4 mr-2" />Profil</DropdownMenuItem>
                  <DropdownMenuItem><Settings className="h-4 w-4 mr-2" />Paramètres</DropdownMenuItem>
                  <DropdownMenuCheckboxItem checked={notifChecked} onCheckedChange={setNotifChecked}>
                    Notifications
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* ── BREADCRUMB + HERO ─────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#" className="flex items-center gap-1">
                  <Home className="h-3 w-3" />Accueil
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="#">Composants</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Démo interactive</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-6 mb-8 flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="gap-1"><Zap className="h-3 w-3" />Nouveau</Badge>
                <Badge variant="secondary">v2.5.0</Badge>
                <Badge variant="outline">Open Source</Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Shadcn UI — Démo Interactive</h1>
              <p className="text-muted-foreground mt-1 text-sm max-w-xl">
                Plus de 20 composants Shadcn réunis dans une seule page. Thème gold,
                dark/light mode, accessibilité WCAG AA.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button data-testid="button-docs" variant="outline" size="sm" asChild>
                <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer">
                  <Globe className="h-3 w-3 mr-1" />Docs
                </a>
              </Button>
              <Button data-testid="button-github" size="sm" asChild>
                <a href="https://github.com/shadcn-ui/ui" target="_blank" rel="noopener noreferrer">
                  <Github className="h-3 w-3 mr-1" />GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* ── SECTION NAV ──────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 flex-wrap mb-8 border-b border-border pb-3">
            {[
              { id: "overview", label: "Aperçu" },
              { id: "navigation", label: "Navigation" },
              { id: "forms", label: "Formulaires" },
              { id: "overlays", label: "Overlays" },
              { id: "panels", label: "Panneaux" },
              { id: "charts", label: "Charts" },
              { id: "command", label: "Commande" },
              { id: "calendar", label: "Calendrier" },
              { id: "display", label: "Affichage" },
              { id: "feedback", label: "Feedback" },
              { id: "datatable", label: "DataTable" },
              { id: "settings", label: "Settings" },
              { id: "data", label: "Données" },
              { id: "misc", label: "Divers" },
            ].map(({ id, label }) => (
              <Button
                key={id}
                data-testid={`button-nav-${id}`}
                variant={activeSection === id ? "default" : "ghost"}
                size="sm"
                className="text-xs h-7"
                onClick={() => handleScrollTo(id)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 pb-24 space-y-16">

          {/* ════════════════════════════════════════════
              SECTION 1 — OVERVIEW (Stats + Tabs + Alerts)
          ════════════════════════════════════════════ */}
          <section id="overview">
            <SectionHeader icon={BarChart3} title="Aperçu" desc="Statistiques, onglets et alertes" />

            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Users, label: "Utilisateurs", value: "12 847", delta: "+12%", color: "text-primary" },
                { icon: TrendingUp, label: "Revenus", value: "€48 290", delta: "+8.2%", color: "text-emerald-500" },
                { icon: Activity, label: "Requêtes/s", value: "2 341", delta: "+3.1%", color: "text-blue-500" },
                { icon: Cpu, label: "CPU moyen", value: "38%", delta: "-5%", color: "text-orange-500" },
              ].map(({ icon: Icon, label, value, delta, color }) => (
                <Card key={label} data-testid={`card-kpi-${label}`} className="hover-elevate">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="font-bold text-xl">{value}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className={delta.startsWith("+") ? "text-emerald-500" : "text-red-500"}>{delta}</span>
                      {" "}vs mois dernier
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="analytics" className="mb-6">
              <TabsList>
                <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
                <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
                <TabsTrigger value="security" data-testid="tab-security">Sécurité</TabsTrigger>
                <TabsTrigger value="logs" data-testid="tab-logs">Logs</TabsTrigger>
              </TabsList>
              <TabsContent value="analytics" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Métriques d'utilisation</CardTitle>
                    <CardDescription>Données des 30 derniers jours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: "Taux de rétention", val: 87, color: "bg-primary" },
                        { label: "Satisfaction client", val: 94, color: "bg-emerald-500" },
                        { label: "Temps de réponse", val: 62, color: "bg-blue-500" },
                        { label: "Taux d'erreur", val: 8, color: "bg-red-500" },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="flex items-center gap-4">
                          <span className="text-sm w-44 shrink-0">{label}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full`} style={{ width: `${val}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{val}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="performance" className="mt-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Chargement de page</span>
                        <span className="font-medium text-emerald-500">1.2s ✓</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time to First Byte</span>
                        <span className="font-medium text-emerald-500">180ms ✓</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Largest Contentful Paint</span>
                        <span className="font-medium text-yellow-500">2.4s ⚠</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cumulative Layout Shift</span>
                        <span className="font-medium text-emerald-500">0.02 ✓</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="security" className="mt-4">
                <Card>
                  <CardContent className="pt-4">
                    <Alert className="mb-3">
                      <Shield className="h-4 w-4" />
                      <AlertTitle>Authentification forte activée</AlertTitle>
                      <AlertDescription>2FA activé pour 89% des utilisateurs.</AlertDescription>
                    </Alert>
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Tentatives de connexion suspectes</AlertTitle>
                      <AlertDescription>3 adresses IP bloquées automatiquement.</AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="logs" className="mt-4">
                <Card>
                  <CardContent className="pt-0 pb-0">
                    <ScrollArea className="h-48">
                      <div className="font-mono text-xs py-3 space-y-1">
                        {CHANGELOG.map((log, i) => (
                          <div key={i} className="flex items-start gap-2 py-1 border-b border-border/50 last:border-0">
                            <span className="text-muted-foreground shrink-0">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="text-primary">git</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Progress interactive */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Progress interactif</CardTitle>
                <CardDescription>Ajustez la valeur avec le curseur</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Progress data-testid="progress-bar" value={progress} className="flex-1" />
                  <span className="font-mono text-sm w-10 text-right">{progress}%</span>
                </div>
                <Slider
                  data-testid="slider-progress"
                  value={[progress]}
                  onValueChange={(v) => setProgress(v[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setProgress(0)}>0%</Button>
                  <Button size="sm" variant="outline" onClick={() => setProgress(33)}>33%</Button>
                  <Button size="sm" variant="outline" onClick={() => setProgress(66)}>66%</Button>
                  <Button size="sm" variant="outline" onClick={() => setProgress(100)}>100%</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* ════════════════════════════════════════════
              SECTION 2 — NAVIGATION
          ════════════════════════════════════════════ */}
          <section id="navigation">
            <SectionHeader icon={Globe} title="Navigation" desc="Accordion, Context Menu, Dropdown, Hover Card" />

            <div className="grid md:grid-cols-2 gap-6">
              {/* Accordion */}
              <Card>
                <CardHeader><CardTitle className="text-base">Accordion</CardTitle></CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {[
                      { val: "item-1", q: "Qu'est-ce que Shadcn UI ?", a: "Une bibliothèque de composants React construite sur Radix UI et Tailwind CSS. Copiez-collez les composants dans votre projet." },
                      { val: "item-2", q: "Est-ce accessible ?", a: "Oui. Tous les composants respectent les standards ARIA et sont navigables au clavier." },
                      { val: "item-3", q: "Fonctionne avec Next.js ?", a: "Oui, compatbile Next.js, Vite, Remix, Astro et tout framework React." },
                      { val: "item-4", q: "Puis-je personnaliser le thème ?", a: "Absolument. Les variables CSS HSL permettent un theming complet light/dark." },
                    ].map(({ val, q, a }) => (
                      <AccordionItem key={val} value={val}>
                        <AccordionTrigger className="text-sm">{q}</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">{a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Context Menu + Hover Card */}
              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Context Menu</CardTitle>
                    <CardDescription>Clic-droit sur la zone ci-dessous</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ContextMenu>
                      <ContextMenuTrigger>
                        <div
                          data-testid="context-menu-zone"
                          className="h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-sm text-muted-foreground select-none cursor-context-menu"
                        >
                          Faites un clic-droit ici
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuLabel>Actions</ContextMenuLabel>
                        <ContextMenuSeparator />
                        <ContextMenuItem><Copy className="h-4 w-4 mr-2" />Copier</ContextMenuItem>
                        <ContextMenuItem><Edit className="h-4 w-4 mr-2" />Modifier</ContextMenuItem>
                        <ContextMenuSub>
                          <ContextMenuSubTrigger><Share2 className="h-4 w-4 mr-2" />Partager</ContextMenuSubTrigger>
                          <ContextMenuSubContent>
                            <ContextMenuItem><Twitter className="h-4 w-4 mr-2" />Twitter</ContextMenuItem>
                            <ContextMenuItem><Mail className="h-4 w-4 mr-2" />Email</ContextMenuItem>
                          </ContextMenuSubContent>
                        </ContextMenuSub>
                        <ContextMenuSeparator />
                        <ContextMenuCheckboxItem checked={notifChecked} onCheckedChange={setNotifChecked}>
                          Notifications
                        </ContextMenuCheckboxItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Supprimer</ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Hover Card</CardTitle>
                    <CardDescription>Survolez un lien pour le preview</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    {[
                      { handle: "@shadcn", name: "shadcn", bio: "Building shadcn/ui. Open source.", followers: "128K" },
                      { handle: "@vercel", name: "Vercel", bio: "The platform for frontend developers.", followers: "215K" },
                    ].map(({ handle, name, bio, followers }) => (
                      <HoverCard key={handle}>
                        <HoverCardTrigger asChild>
                          <Button variant="link" className="h-auto p-0 text-primary">{handle}</Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64">
                          <div className="flex gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">{name}</p>
                              <p className="text-xs text-muted-foreground">{handle}</p>
                              <p className="text-xs mt-1">{bio}</p>
                              <p className="text-xs text-muted-foreground mt-1">{followers} abonnés</p>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <Separator />

          {/* ════════════════════════════════════════════
              SECTION 3 — FORMS
          ════════════════════════════════════════════ */}
          <section id="forms">
            <SectionHeader icon={Hash} title="Formulaires" desc="Input, Select, Radio, Checkbox, Switch, Slider" />

            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Formulaire de contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="first-name">Prénom</Label>
                      <Input id="first-name" data-testid="input-first-name" placeholder="Romain" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="last-name">Nom</Label>
                      <Input id="last-name" data-testid="input-last-name" placeholder="Ecarnot" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email-input">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email-input"
                        data-testid="input-email"
                        type="email"
                        placeholder="romain@example.com"
                        className="pl-9"
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject-select">Sujet</Label>
                    <Select value={selectVal} onValueChange={setSelectVal}>
                      <SelectTrigger id="subject-select" data-testid="select-subject">
                        <SelectValue placeholder="Choisir un sujet..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support">Support technique</SelectItem>
                        <SelectItem value="billing">Facturation</SelectItem>
                        <SelectItem value="feature">Demande de fonctionnalité</SelectItem>
                        <SelectItem value="feedback">Retour d'expérience</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      data-testid="textarea-message"
                      placeholder="Votre message..."
                      className="min-h-24 resize-none"
                      value={textareaVal}
                      onChange={(e) => setTextareaVal(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="rgpd" data-testid="checkbox-rgpd" checked={checked} onCheckedChange={(v) => setChecked(!!v)} />
                    <Label htmlFor="rgpd" className="text-sm text-muted-foreground cursor-pointer">
                      J'accepte la politique de confidentialité
                    </Label>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    data-testid="button-submit-form"
                    onClick={() => {
                      if (!checked) { sonnerToast.error("Veuillez accepter la politique de confidentialité"); return; }
                      sonnerToast.success("Message envoyé !", { description: "Nous vous répondrons sous 24h." });
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />Envoyer
                  </Button>
                  <Button data-testid="button-reset-form" variant="outline" onClick={() => { setInputVal(""); setTextareaVal(""); setSelectVal(""); }}>
                    Réinitialiser
                  </Button>
                </CardFooter>
              </Card>

              {/* Preferences form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Préférences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Plan selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Plan tarifaire</Label>
                    <RadioGroup value={radioVal} onValueChange={setRadioVal} data-testid="radio-plan">
                      {[
                        { val: "free", label: "Gratuit", desc: "5 projets, 1 GB" },
                        { val: "pro", label: "Pro", desc: "Illimité, 50 GB", highlight: true },
                        { val: "team", label: "Team", desc: "Collaboration avancée" },
                      ].map(({ val, label, desc, highlight }) => (
                        <div key={val} className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${radioVal === val ? "border-primary bg-primary/5" : "border-border"}`}
                          onClick={() => setRadioVal(val)}>
                          <RadioGroupItem value={val} id={`plan-${val}`} />
                          <div className="flex-1">
                            <Label htmlFor={`plan-${val}`} className="cursor-pointer font-medium text-sm flex items-center gap-2">
                              {label}
                              {highlight && <Badge className="text-xs">Populaire</Badge>}
                            </Label>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Switches */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Notifications</Label>
                    {[
                      { id: "sw-email", label: "Emails hebdomadaires", desc: "Résumé des activités" },
                      { id: "sw-push", label: "Push notifications", desc: "Alertes en temps réel", default: true },
                      { id: "sw-marketing", label: "Communications marketing", desc: "Offres et nouveautés" },
                    ].map(({ id, label, desc, default: def }) => {
                      const [on, setOn] = useState(def ?? false);
                      return (
                        <div key={id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">{label}</p>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                          </div>
                          <Switch
                            data-testid={`switch-${id}`}
                            checked={on}
                            onCheckedChange={setOn}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* Slider */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex justify-between">
                      Résultats par page
                      <span className="font-mono text-primary">{sliderVal[0]}</span>
                    </Label>
                    <Slider
                      data-testid="slider-results"
                      value={sliderVal}
                      onValueChange={setSliderVal}
                      min={10}
                      max={100}
                      step={10}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10</span><span>50</span><span>100</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    data-testid="button-save-prefs"
                    onClick={() => sonnerToast.success("Préférences sauvegardées", { description: `Plan: ${radioVal}, résultats: ${sliderVal[0]}` })}
                  >
                    <Check className="h-4 w-4 mr-2" />Sauvegarder
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          <Separator />

          {/* ════════════════════════════════════════════
              SECTION 4 — OVERLAYS (Dialog, Drawer, Popover, AlertDialog)
          ════════════════════════════════════════════ */}
          <section id="overlays">
            <SectionHeader icon={Layers} title="Overlays" desc="Dialog, Drawer, Popover, Alert Dialog, Tooltip" />

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Modales & Fenêtres</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  {/* Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button data-testid="button-open-dialog" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />Dialog
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Créer un nouveau projet</DialogTitle>
                        <DialogDescription>
                          Configurez les paramètres de base de votre nouveau projet.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                          <Label>Nom du projet</Label>
                          <Input data-testid="input-dialog-project-name" placeholder="mon-super-projet" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Framework</Label>
                          <Select>
                            <SelectTrigger data-testid="select-dialog-framework">
                              <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vite">Vite + React</SelectItem>
                              <SelectItem value="next">Next.js</SelectItem>
                              <SelectItem value="remix">Remix</SelectItem>
                              <SelectItem value="astro">Astro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch data-testid="switch-dialog-ts" defaultChecked />
                          <Label>TypeScript</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button data-testid="button-dialog-create" onClick={() => sonnerToast.success("Projet créé !")}>
                          Créer le projet
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Alert Dialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button data-testid="button-open-alert-dialog" variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Toutes les données associées seront définitivement effacées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          data-testid="button-confirm-delete"
                          onClick={() => sonnerToast.error("Élément supprimé")}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Oui, supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Drawer */}
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button data-testid="button-open-drawer" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />Drawer
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Paramètres rapides</DrawerTitle>
                        <DrawerDescription>Modifiez vos préférences d'affichage</DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 pb-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Mode sombre</Label>
                          <Switch
                            checked={theme === "dark"}
                            onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Notifications push</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Langue</Label>
                          <Select defaultValue="fr">
                            <SelectTrigger data-testid="select-drawer-lang">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="de">Deutsch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DrawerFooter>
                        <Button data-testid="button-drawer-save" onClick={() => sonnerToast.success("Paramètres mis à jour")}>
                          Appliquer
                        </Button>
                        <DrawerClose asChild>
                          <Button variant="outline">Fermer</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Popovers & Tooltips</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-4 items-start">
                  {/* Popover */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground block">Popover</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button data-testid="button-open-popover" variant="outline">
                          <CalendarIcon className="h-4 w-4 mr-2" />Date
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="space-y-3">
                          <p className="font-medium text-sm">Sélectionner une plage</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Début</Label>
                              <Input type="date" className="text-xs" defaultValue="2026-04-01" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Fin</Label>
                              <Input type="date" className="text-xs" defaultValue="2026-04-30" />
                            </div>
                          </div>
                          <Button size="sm" className="w-full" onClick={() => sonnerToast.success("Plage de dates appliquée")}>
                            Appliquer
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Tooltips */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground block">Tooltips</Label>
                    <div className="flex gap-2">
                      {[
                        { icon: Heart, tip: "Ajouter aux favoris", variant: "ghost" as const },
                        { icon: Share2, tip: "Partager ce contenu", variant: "ghost" as const },
                        { icon: Download, tip: "Télécharger", variant: "ghost" as const },
                        { icon: Star, tip: "Mettre en avant", variant: "ghost" as const },
                      ].map(({ icon: Icon, tip, variant }) => (
                        <Tooltip key={tip}>
                          <TooltipTrigger asChild>
                            <Button data-testid={`button-tooltip-${tip}`} variant={variant} size="icon">
                              <Icon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{tip}</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  {/* Dropdown positioned here too */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground block">Dropdown avancé</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button data-testid="button-dropdown-export" variant="outline">
                          Exporter <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Format d'export</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => sonnerToast.success("Export CSV lancé")}>
                          <Download className="h-4 w-4 mr-2" />CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => sonnerToast.success("Export JSON lancé")}>
                          <Code2 className="h-4 w-4 mr-2" />JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => sonnerToast.success("Export PDF lancé")}>
                          <File className="h-4 w-4 mr-2" />PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Upload className="h-4 w-4 mr-2" />Importer...
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* ════════════════════════════════════════════
              SECTION 5 — PANELS (Sidebar + Sheet 4 sides)
          ════════════════════════════════════════════ */}
          <section id="panels">
            <SectionHeader icon={PanelLeft} title="Panneaux" desc="Sidebar complète, Sheet top / right / bottom / left" />

            <div className="grid md:grid-cols-2 gap-6">

              {/* ── SHEET 4 directions ───────────────────────────────── */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sheet — 4 directions</CardTitle>
                  <CardDescription>Panneau glissant depuis n'importe quel bord de l'écran</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { side: "top",    icon: ArrowDown,  label: "Top",    desc: "Barre de commande rapide",      color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
                      { side: "right",  icon: ArrowLeft,  label: "Right",  desc: "Panneau de détail / settings",  color: "bg-primary/10 text-primary border-primary/20" },
                      { side: "bottom", icon: ArrowUp,    label: "Bottom", desc: "Tiroir mobile-first",           color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
                      { side: "left",   icon: ArrowRight, label: "Left",   desc: "Navigation latérale",          color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
                    ] as { side: "top"|"right"|"bottom"|"left", icon: React.ElementType, label: string, desc: string, color: string }[]).map(({ side, icon: Icon, label, desc, color }) => (
                      <Sheet key={side}>
                        <SheetTrigger asChild>
                          <button
                            data-testid={`button-sheet-${side}`}
                            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover-elevate cursor-pointer ${color}`}
                          >
                            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-background/60">
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-sm">{label}</span>
                            <span className="text-[11px] text-center opacity-70 leading-snug">{desc}</span>
                          </button>
                        </SheetTrigger>
                        <SheetContent side={side}>
                          <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              Sheet — {label}
                            </SheetTitle>
                            <SheetDescription>
                              Panneau glissant depuis le bord <strong>{label.toLowerCase()}</strong>.
                              Idéal pour les formulaires, paramètres et panneaux contextuels.
                            </SheetDescription>
                          </SheetHeader>

                          <div className="py-5 space-y-4">
                            {/* Contenu de démo contextuel selon le côté */}
                            {side === "right" && (
                              <>
                                <div className="space-y-3">
                                  <p className="text-sm font-medium">Paramètres du projet</p>
                                  <div className="space-y-1.5">
                                    <Label>Nom</Label>
                                    <Input placeholder="mon-projet" />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label>Visibilité</Label>
                                    <Select>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Choisir..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="private">Privé</SelectItem>
                                        <SelectItem value="internal">Interne</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center justify-between pt-1">
                                    <div>
                                      <p className="text-sm">Notifications</p>
                                      <p className="text-xs text-muted-foreground">Alertes en temps réel</p>
                                    </div>
                                    <Switch defaultChecked />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm">Mode lecture seule</p>
                                      <p className="text-xs text-muted-foreground">Bloquer les modifications</p>
                                    </div>
                                    <Switch />
                                  </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">Danger zone</p>
                                  <Button variant="destructive" size="sm" className="w-full" onClick={() => sonnerToast.error("Projet archivé")}>
                                    <Trash2 className="h-3 w-3 mr-2" />Archiver le projet
                                  </Button>
                                </div>
                              </>
                            )}
                            {side === "left" && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Navigation</p>
                                {[
                                  { icon: LayoutDashboard, label: "Dashboard", badge: "" },
                                  { icon: FolderOpen, label: "Projets", badge: "12" },
                                  { icon: Inbox, label: "Messages", badge: "3" },
                                  { icon: BarChart2, label: "Analytics", badge: "" },
                                  { icon: Bookmark, label: "Favoris", badge: "" },
                                  { icon: Settings, label: "Paramètres", badge: "" },
                                ].map(({ icon: NavIcon, label, badge }) => (
                                  <button key={label} className="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors">
                                    <span className="flex items-center gap-2">
                                      <NavIcon className="h-4 w-4 text-muted-foreground" />{label}
                                    </span>
                                    {badge && <Badge className="text-xs h-5">{badge}</Badge>}
                                  </button>
                                ))}
                              </div>
                            )}
                            {side === "top" && (
                              <div className="space-y-3">
                                <p className="text-sm font-medium">Recherche globale</p>
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input className="pl-9" placeholder="Rechercher projets, fichiers, membres..." autoFocus />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">Récents</p>
                                  {["Dashboard Analytics", "Composants Shadcn", "Réunion design system", "API v2 spec"].map(item => (
                                    <button key={item} className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm hover:bg-accent text-left">
                                      <FileText className="h-3 w-3 text-muted-foreground shrink-0" />{item}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  {["React", "TypeScript", "Shadcn", "Vite"].map(t => (
                                    <Badge key={t} variant="outline" className="text-xs cursor-pointer">{t}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {side === "bottom" && (
                              <div className="space-y-4">
                                <p className="text-sm font-medium">Partager ce contenu</p>
                                <div className="space-y-2">
                                  <Label>Lien de partage</Label>
                                  <div className="flex gap-2">
                                    <Input defaultValue="https://shadcnkit.dev/demo/abc123" readOnly className="font-mono text-xs" />
                                    <Button size="icon" variant="outline" onClick={() => sonnerToast.success("Lien copié !") }>
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Permissions</Label>
                                  <Select defaultValue="view">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="view">Lecture seule</SelectItem>
                                      <SelectItem value="comment">Commenter</SelectItem>
                                      <SelectItem value="edit">Modifier</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex gap-2">
                                  {[{ icon: Twitter, label: "Twitter" }, { icon: Mail, label: "Email" }, { icon: Github, label: "GitHub" }].map(({ icon: SI, label }) => (
                                    <Button key={label} variant="outline" size="sm" className="flex-1" onClick={() => sonnerToast.success(`Partagé sur ${label}`)}>
                                      <SI className="h-4 w-4 mr-1" />{label}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <SheetFooter>
                            <SheetClose asChild>
                              <Button variant="outline">Fermer</Button>
                            </SheetClose>
                            <Button onClick={() => { sonnerToast.success(`Sheet ${label} — action confirmée`); }}>
                              Confirmer
                            </Button>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ── SIDEBAR complète ─────────────────────────────────── */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sidebar complète</CardTitle>
                  <CardDescription>Navigation multi-niveaux, badges, collapse, footer utilisateur</CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden rounded-b-xl">
                  <SidebarDemo />
                </CardContent>
              </Card>

            </div>
          </section>

          <Separator />

          {/* ════════════════════════════════════════════
              SECTION — CHARTS (Recharts)
          ════════════════════════════════════════════ */}
          <section id="charts">
            <SectionHeader icon={BarChart3Icon} title="Charts" desc="BarChart, LineChart, AreaChart, RadarChart, PieChart — Recharts" />
            <ChartsSection />
          </section>

          <Separator />

          {/* ════════════════════════════════════════════
              SECTION — COMMAND + MENUBAR + OTP
          ════════════════════════════════════════════ */}
          <section id="command">
            <SectionHeader icon={CommandIcon} title="Commande" desc="Command palette ⌘K, Menubar, Input OTP, Resizable" />
            <CommandSection />
          </section>

          <Separator />

          {/* ════════════════════════════════════════════
              SECTION — CALENDAR + CAROUSEL + RESIZABLE
          ════════════════════════════════════════════ */}
          <section id="calendar">
            <SectionHeader icon={CalendarDays} title="Calendrier" desc="Calendar, Carousel, Resizable panels" />
            <CalendarSection />
          </section>

          <Separator />

          {/* ════════════════════════════════════════════
              SECTION (ex-5) — DISPLAY (Table, Avatars, Badges)
          ════════════════════════════════════════════ */}
          <section id="display">
            <SectionHeader icon={LayoutGrid} title="Affichage" desc="Table, Avatars, Badges, Skeleton" />

            {/* Table */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Utilisateurs</CardTitle>
                  <CardDescription>{USERS.length} membres actifs</CardDescription>
                </div>
                <Button
                  data-testid="button-toggle-skeleton"
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowSkeleton(true); setTimeout(() => setShowSkeleton(false), 2000); }}
                >
                  Simuler chargement
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {showSkeleton ? (
                  <div className="p-4 space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20 ml-auto" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableCaption>Liste des membres de l'équipe</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead className="text-right">Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {USERS.map((u) => (
                        <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
                                  {u.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{u.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{u.role}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                          <TableCell>
                            <Badge variant={u.plan === "Pro" ? "default" : u.plan === "Team" ? "secondary" : "outline"} className="text-xs">
                              {u.plan}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                u.status === "active" ? "text-emerald-500 border-emerald-500/30" :
                                u.status === "pending" ? "text-yellow-500 border-yellow-500/30" :
                                "text-muted-foreground"
                              }`}
                            >
                              {u.status === "active" ? "● Actif" : u.status === "pending" ? "⏳ En attente" : "○ Inactif"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Avatar group + Badges showcase */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Avatars</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Tailles</p>
                    <div className="flex items-end gap-3">
                      {[6, 8, 10, 12, 16].map(size => (
                        <Avatar key={size} className={`h-${size} w-${size}`}>
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=RC&backgroundColor=ffa500`} />
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">RC</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Groupe collaboratif</p>
                    <div className="flex -space-x-2">
                      {USERS.map((u) => (
                        <Tooltip key={u.id}>
                          <TooltipTrigger asChild>
                            <Avatar className="h-9 w-9 border-2 border-background">
                              <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
                                {u.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>{u.name}</TooltipContent>
                        </Tooltip>
                      ))}
                      <div className="h-9 w-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">
                        +12
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Badges</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Variantes</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Statuts système</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/25">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />Production
                      </Badge>
                      <Badge className="gap-1 bg-yellow-500/15 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/25">
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 inline-block" />Staging
                      </Badge>
                      <Badge className="gap-1 bg-blue-500/15 text-blue-600 border-blue-500/30 hover:bg-blue-500/25">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />Dev
                      </Badge>
                      <Badge className="gap-1 bg-red-500/15 text-red-600 border-red-500/30 hover:bg-red-500/25">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse inline-block" />Incident
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Technologies</p>
                    <div className="flex flex-wrap gap-2">
                      {["React", "TypeScript", "Vite", "Tailwind", "Shadcn", "Radix UI", "Zod", "Drizzle"].map(t => (
                        <Badge key={t} variant="outline" className="text-xs font-mono">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* ════════════════════════════════════════════
              SECTION 6 — FEEDBACK (Toast, Alert, Toggle)
          ════════════════════════════════════════════ */}
          <section id="feedback">
            <SectionHeader icon={Bell} title="Feedback" desc="Sonner toasts, Alerts, Toggle, Switch" />

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Sonner Toasts</CardTitle>
                  <CardDescription>Notifications non-bloquantes avec file d'attente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Succès", fn: () => sonnerToast.success("Opération réussie !", { description: "Les données ont été sauvegardées." }), variant: "default" as const },
                    { label: "Erreur", fn: () => sonnerToast.error("Une erreur est survenue", { description: "Vérifiez votre connexion réseau." }), variant: "destructive" as const },
                    { label: "Info", fn: () => sonnerToast.info("Mise à jour disponible", { description: "Version 2.6.0 prête à l'installation." }), variant: "outline" as const },
                    { label: "Avertissement", fn: () => sonnerToast.warning("Quota approche", { description: "80% de votre limite utilisée." }), variant: "secondary" as const },
                    { label: "Action requise", fn: () => sonnerToast("Nouvelle invitation", { description: "Alice vous invite à rejoindre son équipe.", action: { label: "Accepter", onClick: () => sonnerToast.success("Invitation acceptée !") } }), variant: "outline" as const },
                    { label: "Chargement", fn: () => { const id = sonnerToast.loading("Déploiement en cours..."); setTimeout(() => sonnerToast.success("Déployé !", { id }), 2000); }, variant: "secondary" as const },
                  ].map(({ label, fn, variant }) => (
                    <Button key={label} data-testid={`button-toast-${label}`} variant={variant} className="w-full justify-start" onClick={fn}>
                      <Bell className="h-4 w-4 mr-2" />{label}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">Toggles & Groups</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Formatage texte</p>
                      <div className="flex gap-1">
                        <Toggle data-testid="toggle-bold" aria-label="Bold"><Bold className="h-4 w-4" /></Toggle>
                        <Toggle data-testid="toggle-italic" aria-label="Italic"><Italic className="h-4 w-4" /></Toggle>
                        <Toggle data-testid="toggle-underline" aria-label="Underline"><Underline className="h-4 w-4" /></Toggle>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Alignement</p>
                      <ToggleGroup type="single" defaultValue="left">
                        <ToggleGroupItem data-testid="toggle-align-left" value="left" aria-label="Gauche"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                        <ToggleGroupItem data-testid="toggle-align-center" value="center" aria-label="Centre"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                        <ToggleGroupItem data-testid="toggle-align-right" value="right" aria-label="Droite"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Vue</p>
                      <ToggleGroup type="single" defaultValue="grid">
                        <ToggleGroupItem data-testid="toggle-view-grid" value="grid"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
                        <ToggleGroupItem data-testid="toggle-view-list" value="list"><List className="h-4 w-4" /></ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Alerts</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Info système</AlertTitle>
                      <AlertDescription className="text-xs">Maintenance planifiée samedi 19h–21h CEST.</AlertDescription>
                    </Alert>
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Limite atteinte</AlertTitle>
                      <AlertDescription className="text-xs">Votre quota API mensuel est dépassé.</AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <Separator />

          {/* ════════════════════════════════════════════
              SECTION 7 — DATA (Scroll Area + Skeleton demo)
          ════════════════════════════════════════════ */}
          <section id="datatable">
            <SectionHeader icon={LayoutGrid} title="DataTable" desc="TanStack Table — tri, filtres, pagination, sélection de lignes" />
            <DataTableSection />
          </section>

          <Separator />

          {/* ════════════════════════════════════════════
              SECTION — SETTINGS
          ════════════════════════════════════════════ */}
          <section id="settings">
            <SectionHeader icon={Settings} title="Settings" desc="Layout multi-colonnes — Profil, Sécurité, Notifications, Apparence" />
            <SettingsSection />
          </section>

          <Separator />

          {/* ════════════════════════════════════════════
              SECTION — DATA (Scroll Area + Skeleton demo) — original
          ════════════════════════════════════════════ */}
                    <section id="data">
            <SectionHeader icon={Terminal} title="Données" desc="Scroll Area, listes complexes, media player" />

            <div className="grid md:grid-cols-3 gap-6">
              {/* Scroll area - packages */}
              <Card>
                <CardHeader><CardTitle className="text-base">Dépendances</CardTitle>
                  <CardDescription>package.json</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-64 px-4">
                    <div className="py-3 space-y-1">
                      {[
                        { name: "react", version: "^18.3.1", type: "dep" },
                        { name: "vite", version: "^5.4.14", type: "dev" },
                        { name: "@shadcn/ui", version: "^2.5.0", type: "dep" },
                        { name: "tailwindcss", version: "^3.4.17", type: "dev" },
                        { name: "typescript", version: "^5.6.3", type: "dev" },
                        { name: "react-hook-form", version: "^7.54.2", type: "dep" },
                        { name: "@tanstack/react-query", version: "^5.62.8", type: "dep" },
                        { name: "drizzle-orm", version: "^0.37.0", type: "dep" },
                        { name: "zod", version: "^3.23.8", type: "dep" },
                        { name: "wouter", version: "^3.3.5", type: "dep" },
                        { name: "lucide-react", version: "^0.468.0", type: "dep" },
                        { name: "framer-motion", version: "^11.15.0", type: "dep" },
                        { name: "sonner", version: "^1.7.2", type: "dep" },
                        { name: "recharts", version: "^2.14.1", type: "dep" },
                        { name: "better-sqlite3", version: "^11.7.0", type: "dep" },
                      ].map(({ name, version, type }) => (
                        <div key={name} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono text-xs">{name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">{version}</span>
                            <Badge variant={type === "dep" ? "secondary" : "outline"} className="text-xs px-1 py-0">{type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Mini media player */}
              <Card>
                <CardHeader><CardTitle className="text-base">Lecteur audio</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/20 border-2 border-primary mx-auto flex items-center justify-center">
                      <PlayCircle className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-medium text-sm mt-3">Daft Punk — Get Lucky</p>
                    <p className="text-xs text-muted-foreground">Random Access Memories · 2013</p>
                  </div>
                  <div className="space-y-2">
                    <Slider defaultValue={[35]} max={100} step={1} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1:47</span><span>4:08</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button size="icon" variant="ghost"><SkipForward className="h-4 w-4 rotate-180" /></Button>
                    <Button size="icon"><PauseCircle className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost"><SkipForward className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider defaultValue={[70]} max={100} step={1} className="flex-1" />
                  </div>
                </CardContent>
              </Card>

              {/* Skeleton states */}
              <Card>
                <CardHeader><CardTitle className="text-base">Skeleton Loader</CardTitle>
                  <CardDescription>États de chargement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-24 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-3 w-4/6" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* ════════════════════════════════════════════
              SECTION 8 — MISC (Button variants, Separator)
          ════════════════════════════════════════════ */}
          <section id="misc">
            <SectionHeader icon={Package} title="Divers" desc="Variantes de boutons, séparateurs, composants combinés" />

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Variantes de Button</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Par variante</p>
                    <div className="flex flex-wrap gap-2">
                      <Button>Default</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="link">Link</Button>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Par taille</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="lg">Large</Button>
                      <Button size="default">Default</Button>
                      <Button size="sm">Small</Button>
                      <Button size="icon"><Plus /></Button>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Avec icônes</p>
                    <div className="flex flex-wrap gap-2">
                      <Button><Zap className="h-4 w-4 mr-2" />Déployer</Button>
                      <Button variant="outline"><Github className="h-4 w-4 mr-2" />GitHub</Button>
                      <Button variant="secondary"><Terminal className="h-4 w-4 mr-2" />Console</Button>
                      <Button disabled><X className="h-4 w-4 mr-2" />Désactivé</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card with feature list */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Récapitulatif composants</CardTitle>
                  <CardDescription>20+ composants Shadcn dans cette page</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-56">
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        "Accordion", "Alert", "AlertDialog", "Avatar",
                        "Badge", "Breadcrumb", "Button", "Card",
                        "Checkbox", "ContextMenu", "Dialog", "Drawer",
                        "DropdownMenu", "HoverCard", "Input", "Label",
                        "NavigationMenu", "Popover", "Progress", "RadioGroup",
                        "ScrollArea", "Select", "Separator", "Skeleton",
                        "Slider", "Switch", "Table", "Tabs",
                        "Textarea", "Toggle", "ToggleGroup", "Tooltip",
                        "Sonner (Toast)",
                      ].map(c => (
                        <div key={c} className="flex items-center gap-1.5 py-1">
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="text-xs">{c}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Button
                    data-testid="button-copy-component-list"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => sonnerToast.success("Liste copiée dans le presse-papier !")}
                  >
                    <Copy className="h-4 w-4 mr-2" />Copier la liste
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* ── FOOTER ─────────────────────────────────────────────────────── */}
          <div className="pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Logo className="h-5 w-5 text-primary" />
                <span>ShadcnKit Demo — Vite + React + TypeScript + Shadcn UI</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-1">
                  <Globe className="h-3 w-3" />Docs
                </a>
                <a href="https://github.com/shadcn-ui/ui" target="_blank" rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-1">
                  <Github className="h-3 w-3" />GitHub
                </a>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-primary" />Open Source
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ─── Chart data ───────────────────────────────────────────────────────────────
const CHART_MONTHLY = [
  { month: "Jan", revenus: 4200, dépenses: 2800, visiteurs: 3100 },
  { month: "Fév", revenus: 5100, dépenses: 3100, visiteurs: 4200 },
  { month: "Mar", revenus: 4800, dépenses: 2900, visiteurs: 3900 },
  { month: "Avr", revenus: 6200, dépenses: 3400, visiteurs: 5100 },
  { month: "Mai", revenus: 7100, dépenses: 3800, visiteurs: 6400 },
  { month: "Jui", revenus: 6800, dépenses: 3600, visiteurs: 5900 },
];

const RADAR_DATA = [
  { subject: "Performance", A: 88, B: 70 },
  { subject: "Sécurité", A: 92, B: 75 },
  { subject: "Fiabilité", A: 78, B: 85 },
  { subject: "UX", A: 95, B: 68 },
  { subject: "API", A: 82, B: 90 },
  { subject: "Docs", A: 70, B: 88 },
];

const PIE_DATA = [
  { name: "Web", value: 42 },
  { name: "Mobile", value: 28 },
  { name: "API", value: 18 },
  { name: "CLI", value: 12 },
];

const PIE_COLORS = ["oklch(0.817 0.1705 77.689)", "oklch(0.706 0.1685 50.8)", "oklch(0.6309 0.1013 183.491)", "oklch(0.5411 0.281 293.009)"];

// ─── ChartsSection component ──────────────────────────────────────────────
function ChartsSection() {
  const [activeChart, setActiveChart] = useState<"revenus" | "dépenses" | "visiteurs">("revenus");

  return (
    <div className="space-y-6">
      {/* Row 1 : Bar + Line */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">BarChart — Revenus vs Dépenses</CardTitle>
            <CardDescription>Comparatif mensuel en €</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CHART_MONTHLY} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ background: "oklch(var(--popover))", border: "1px solid oklch(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "oklch(var(--foreground))" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "oklch(var(--muted-foreground))" }} />
                <Bar dataKey="revenus" fill="oklch(0.817 0.1705 77.689)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dépenses" fill="oklch(0.706 0.1685 50.8)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">LineChart — Interactif</CardTitle>
                <CardDescription>Cliquez sur un indicateur</CardDescription>
              </div>
              <div className="flex gap-1">
                {(["revenus", "dépenses", "visiteurs"] as const).map((k) => (
                  <Button
                    key={k}
                    size="sm"
                    variant={activeChart === k ? "default" : "ghost"}
                    className="h-7 text-xs capitalize"
                    onClick={() => setActiveChart(k)}
                  >{k}</Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={CHART_MONTHLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ background: "oklch(var(--popover))", border: "1px solid oklch(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "oklch(var(--foreground))" }}
                />
                <Line
                  type="monotone"
                  dataKey={activeChart}
                  stroke="oklch(0.817 0.1705 77.689)"
                  strokeWidth={2.5}
                  dot={{ fill: "oklch(0.817 0.1705 77.689)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 : Area + Radar + Pie */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">AreaChart</CardTitle>
            <CardDescription>Visiteurs cumulatifs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={CHART_MONTHLY}>
                <defs>
                  <linearGradient id="colorVisiteurs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.817 0.1705 77.689)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.817 0.1705 77.689)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ background: "oklch(var(--popover))", border: "1px solid oklch(var(--border))", borderRadius: 8, fontSize: 11 }}
                />
                <Area type="monotone" dataKey="visiteurs" stroke="oklch(0.817 0.1705 77.689)" strokeWidth={2} fill="url(#colorVisiteurs)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">RadarChart</CardTitle>
            <CardDescription>Scores produit vs concurrent</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="oklch(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }} />
                <Radar name="Notre produit" dataKey="A" stroke="oklch(0.817 0.1705 77.689)" fill="oklch(0.817 0.1705 77.689)" fillOpacity={0.25} strokeWidth={2} />
                <Radar name="Concurrent" dataKey="B" stroke="oklch(0.6309 0.1013 183.491)" fill="oklch(0.6309 0.1013 183.491)" fillOpacity={0.15} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 11, color: "oklch(var(--muted-foreground))" }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">PieChart</CardTitle>
            <CardDescription>Répartition par plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {PIE_DATA.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ background: "oklch(var(--popover))", border: "1px solid oklch(var(--border))", borderRadius: 8, fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "oklch(var(--muted-foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── CommandSection component ──────────────────────────────────────────────
function CommandSection() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpDone, setOtpDone] = useState(false);
  const [menubarView, setMenubarView] = useState("normal");
  const [menubarChecks, setMenubarChecks] = useState({ spellcheck: true, wordwrap: false, minimap: true });

  // ⌘K / Ctrl+K handler
  useState(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">

      {/* Command palette */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Command Palette</CardTitle>
          <CardDescription>Recherche globale — appuyez ⌘K ou cliquez sur le bouton</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Inline Command (always visible) */}
          <Command className="rounded-lg border shadow-sm">
            <CommandInput placeholder="Rechercher une commande..." />
            <CommandList>
              <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
              <CommandGroup heading="Navigation">
                <CommandItem onSelect={() => sonnerToast.success("Dashboard ouvert")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                  <CommandShortcut>⌘D</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => sonnerToast.success("Projets ouvert")}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  <span>Projets</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => sonnerToast.success("Analytics ouvert")}>
                  <BarChart2 className="mr-2 h-4 w-4" />
                  <span>Analytics</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Actions">
                <CommandItem onSelect={() => sonnerToast.success("Nouveau fichier créé")}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Nouveau fichier</span>
                  <CommandShortcut>⌘N</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => sonnerToast.success("Sauvegardé")}>
                  <Save className="mr-2 h-4 w-4" />
                  <span>Sauvegarder</span>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => sonnerToast.success("Imprimé")}>
                  <Printer className="mr-2 h-4 w-4" />
                  <span>Imprimer</span>
                  <CommandShortcut>⌘⇧P</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Thème">
                <CommandItem onSelect={() => sonnerToast.info("Mode sombre activé")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Mode sombre</span>
                </CommandItem>
                <CommandItem onSelect={() => sonnerToast.info("Mode clair activé")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Mode clair</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>

          <Button
            data-testid="button-open-cmdK"
            variant="outline"
            className="w-full justify-between text-muted-foreground"
            onClick={() => setCmdOpen(true)}
          >
            <span className="flex items-center gap-2"><Search className="h-4 w-4" />Ouvrir la palette…</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
          </Button>

          {/* CommandDialog */}
          <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
            <CommandInput placeholder="Rechercher n'importe quoi…" />
            <CommandList>
              <CommandEmpty>Aucun résultat.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                {[
                  { icon: LayoutDashboard, label: "Ouvrir le dashboard", shortcut: "⌘D" },
                  { icon: FileText,        label: "Nouveau document",    shortcut: "⌘N" },
                  { icon: Settings,        label: "Paramètres",         shortcut: "⌘," },
                  { icon: Users,           label: "Membres de l'équipe", shortcut: "" },
                  { icon: BarChart2,       label: "Voir les analytics",  shortcut: "⌘A" },
                  { icon: Globe,           label: "Prévisualiser le site", shortcut: "" },
                ].map(({ icon: Icon, label, shortcut }) => (
                  <CommandItem key={label} onSelect={() => { setCmdOpen(false); sonnerToast.success(label); }}>
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                    {shortcut && <CommandShortcut>{shortcut}</CommandShortcut>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </CardContent>
      </Card>

      {/* Menubar + InputOTP */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menubar</CardTitle>
            <CardDescription>Barre de menu style éditeur de texte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>Fichier</MenubarTrigger>
                <MenubarContent>
                  <MenubarLabel>Document</MenubarLabel>
                  <MenubarItem onClick={() => sonnerToast.success("Nouveau fichier")}>
                    <Plus className="mr-2 h-4 w-4" />Nouveau<MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => sonnerToast.success("Fichier ouvert")}>
                    <FolderOpen className="mr-2 h-4 w-4" />Ouvrir<MenubarShortcut>⌘O</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => sonnerToast.success("Fichier sauvegardé")}>
                    <Save className="mr-2 h-4 w-4" />Sauvegarder<MenubarShortcut>⌘S</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => sonnerToast.info("Imprimé")}>
                    <Printer className="mr-2 h-4 w-4" />Imprimer<MenubarShortcut>⌘⇧P</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>Modifier</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={() => sonnerToast.success("Annulé")}>
                    <Undo className="mr-2 h-4 w-4" />Annuler<MenubarShortcut>⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => sonnerToast.success("Rétabli")}>
                    <Redo className="mr-2 h-4 w-4" />Rétablir<MenubarShortcut>⌘⇧Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => sonnerToast.success("Coupé")}>
                    <Scissors className="mr-2 h-4 w-4" />Couper<MenubarShortcut>⌘X</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => sonnerToast.success("Copié")}>
                    <Copy className="mr-2 h-4 w-4" />Copier<MenubarShortcut>⌘C</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>Affichage</MenubarTrigger>
                <MenubarContent>
                  <MenubarRadioGroup value={menubarView} onValueChange={setMenubarView}>
                    <MenubarLabel>Mode d'affichage</MenubarLabel>
                    <MenubarRadioItem value="normal">Normal</MenubarRadioItem>
                    <MenubarRadioItem value="zen">Zen mode</MenubarRadioItem>
                    <MenubarRadioItem value="split">Split</MenubarRadioItem>
                  </MenubarRadioGroup>
                  <MenubarSeparator />
                  <MenubarLabel>Options</MenubarLabel>
                  <MenubarCheckboxItem checked={menubarChecks.spellcheck} onCheckedChange={(v) => setMenubarChecks(s => ({ ...s, spellcheck: !!v }))}>
                    Orthographe
                  </MenubarCheckboxItem>
                  <MenubarCheckboxItem checked={menubarChecks.wordwrap} onCheckedChange={(v) => setMenubarChecks(s => ({ ...s, wordwrap: !!v }))}>
                    Retour à la ligne
                  </MenubarCheckboxItem>
                  <MenubarCheckboxItem checked={menubarChecks.minimap} onCheckedChange={(v) => setMenubarChecks(s => ({ ...s, minimap: !!v }))}>
                    Minimap
                  </MenubarCheckboxItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => sonnerToast.info("Zoom avant")}>
                    <ZoomIn className="mr-2 h-4 w-4" />Zoom avant<MenubarShortcut>⌘+</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => sonnerToast.info("Zoom arrière")}>
                    <ZoomOut className="mr-2 h-4 w-4" />Zoom arrière<MenubarShortcut>⌘-</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>Insérer</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={() => sonnerToast.success("Image insérée")}>
                    <Image className="mr-2 h-4 w-4" />Image
                  </MenubarItem>
                  <MenubarItem onClick={() => sonnerToast.success("Vidéo insérée")}>
                    <Video className="mr-2 h-4 w-4" />Vidéo
                  </MenubarItem>
                  <MenubarItem onClick={() => sonnerToast.success("Audio inséré")}>
                    <Music className="mr-2 h-4 w-4" />Audio
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => sonnerToast.success("Émoji inséré")}>
                    <Smile className="mr-2 h-4 w-4" />Émoji
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>

            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">Vue : {menubarView}</Badge>
              {menubarChecks.spellcheck && <Badge variant="secondary">Ortho ✓</Badge>}
              {menubarChecks.wordwrap && <Badge variant="secondary">Wrap ✓</Badge>}
              {menubarChecks.minimap && <Badge variant="secondary">Minimap ✓</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Input OTP</CardTitle>
            <CardDescription>Verification à 6 chiffres</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <InputOTP
                data-testid="input-otp"
                maxLength={6}
                value={otpValue}
                onChange={(v) => {
                  setOtpValue(v);
                  setOtpDone(false);
                }}
                onComplete={() => {
                  setOtpDone(true);
                  sonnerToast.success("Code vérifié !", { description: `Code saisi : ${otpValue}` });
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {otpDone ? (
                <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                  <Check className="h-3 w-3" />Code validé
                </Badge>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {otpValue.length === 0 ? "Saisissez votre code OTP…" : `${otpValue.length}/6 chiffres`}
                </p>
              )}
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setOtpValue(""); setOtpDone(false); }}>
                <X className="h-3 w-3 mr-1" />Effacer
              </Button>
              <Button size="sm" onClick={() => { setOtpValue("123456"); setTimeout(() => { setOtpDone(true); sonnerToast.success("Démo : code 123456 validé !"); }, 100); }}>
                <Wand2 className="h-3 w-3 mr-1" />Remplir auto
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── CalendarSection component ─────────────────────────────────────────────
function CalendarSection() {
  const [calDate, setCalDate] = useState<Date | undefined>(new Date());
  const [calRange, setCalRange] = useState<{ from?: Date; to?: Date }>({});

  const CARDS = [
    {
      id: 1,
      title: "React 19 — What’s New",
      tag: "Frontend",
      desc: "Hooks Compiler, Server Components stables, meilleure gestion des formulaires.",
      color: "from-blue-500/20 to-blue-500/5",
    },
    {
      id: 2,
      title: "Shadcn UI v3 Roadmap",
      tag: "Design System",
      desc: "Nouveaux composants : Charts natifs, Timeline, Kanban, Gantt.",
      color: "from-primary/20 to-primary/5",
    },
    {
      id: 3,
      title: "Vite 7 released",
      tag: "Build",
      desc: "Rolldown remplace Rollup, builds 10× plus rapides, support ESM natif amélioré.",
      color: "from-emerald-500/20 to-emerald-500/5",
    },
    {
      id: 4,
      title: "TypeScript 5.8 Deep Dive",
      tag: "Langage",
      desc: "Inferred type predicates, isolated declarations, improved generics.",
      color: "from-purple-500/20 to-purple-500/5",
    },
    {
      id: 5,
      title: "Tailwind CSS v4 Migration",
      tag: "CSS",
      desc: "Nouvelle syntaxe @theme, variables CSS natives, performance améliorée.",
      color: "from-cyan-500/20 to-cyan-500/5",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Calendar */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calendar — Sélection simple</CardTitle>
            <CardDescription>
              Date sélectionnée : 
              <span className="font-medium text-foreground">
                {calDate ? calDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Aucune"}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={calDate}
              onSelect={setCalDate}
              className="rounded-md"
            />
          </CardContent>
        </Card>

        {/* Resizable panels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resizable Panels</CardTitle>
            <CardDescription>Glissez les séparateurs pour redimensionner</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden rounded-b-xl">
            <ResizablePanelGroup direction="horizontal" className="min-h-[200px] rounded-b-xl">
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="flex h-full flex-col p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Explorateur</p>
                  <div className="space-y-1">
                    {["src/", "components/", "pages/", "hooks/", "lib/", "index.tsx"].map((f) => (
                      <button key={f} className="flex items-center gap-1.5 w-full text-left rounded px-2 py-1 text-xs hover:bg-accent">
                        {f.endsWith("/") ? <Folder className="h-3 w-3 text-primary" /> : <File className="h-3 w-3 text-muted-foreground" />}
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={45} minSize={30}>
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={65} minSize={30}>
                    <div className="p-4 h-full">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Editeur</p>
                      <div className="font-mono text-xs space-y-1 text-muted-foreground">
                        <div><span className="text-blue-400">import</span> <span className="text-primary">{'{ useState }'}</span> <span className="text-blue-400">from</span> <span className="text-emerald-400">"react"</span></div>
                        <div className="mt-2"><span className="text-blue-400">export default function</span> <span className="text-yellow-400">App</span>()</div>
                        <div className="pl-2">{'{'}</div>
                        <div className="pl-4"><span className="text-blue-400">return</span> <span className="text-foreground">{'<div>Hello</div>'}</span></div>
                        <div className="pl-2">{'}'}</div>
                      </div>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={35} minSize={20}>
                    <div className="p-3 h-full">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Terminal</p>
                      <div className="font-mono text-xs text-emerald-500 space-y-1">
                        <p className="text-muted-foreground">$ npm run dev</p>
                        <p>✓ Ready on http://localhost:5000</p>
                        <p className="text-primary">▶ Vite HMR actif</p>
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={15}>
                <div className="p-4 h-full">
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Problèmes</p>
                  <div className="space-y-2">
                    {[
                      { type: "warning", msg: "Variable inutilisée", file: "App.tsx:12" },
                      { type: "info",    msg: "TypeScript strict",   file: "tsconfig.json" },
                    ].map(({ type, msg, file }) => (
                      <div key={file} className="flex items-start gap-2">
                        {type === "warning"
                          ? <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 shrink-0" />
                          : <Info className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />}
                        <div>
                          <p className="text-xs">{msg}</p>
                          <p className="text-[10px] text-muted-foreground">{file}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </CardContent>
        </Card>
      </div>

      {/* Carousel */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Carousel</CardTitle>
            <CardDescription>Articles et contenus en défilement</CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel className="w-full">
              <CarouselContent>
                {CARDS.map((card) => (
                  <CarouselItem key={card.id}>
                    <div className={`rounded-xl bg-gradient-to-br ${card.color} border border-border p-5 min-h-[160px] flex flex-col justify-between`}>
                      <div>
                        <Badge variant="outline" className="mb-3 text-xs">{card.tag}</Badge>
                        <h3 className="font-semibold text-sm mb-2">{card.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-4 self-start h-7 text-xs px-2"
                        onClick={() => sonnerToast.info(`Article ouvert : ${card.title}`)}
                      >
                        Lire l'article <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </CardContent>
        </Card>

        {/* Calendar range + mini infos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calendar — Plage de dates</CardTitle>
            <CardDescription>Sélection d'une période</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <Calendar
              mode="range"
              selected={calRange as any}
              onSelect={setCalRange as any}
              numberOfMonths={1}
              className="rounded-md"
            />
            {calRange.from && (
              <div className="text-xs text-muted-foreground text-center">
                Du <span className="text-foreground font-medium">{calRange.from.toLocaleDateString("fr-FR")}</span>
                {calRange.to && (
                  <> au <span className="text-foreground font-medium">{calRange.to.toLocaleDateString("fr-FR")}</span></>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCalRange({})}
              >
                Effacer
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (calRange.from)
                    sonnerToast.success("Période appliquée", { description: `${calRange.from.toLocaleDateString("fr-FR")} → ${calRange.to?.toLocaleDateString("fr-FR") ?? "..."}`});
                  else
                    sonnerToast.warning("Sélectionnez d'abord une plage");
                }}
              >
                Appliquer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Sidebar Demo component ────────────────────────────────────────────────────
function SidebarDemo() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const NAV_MAIN = [
    {
      label: "Workspace",
      items: [
        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", badge: "" },
        { id: "projects",  icon: FolderOpen,      label: "Projets",   badge: "12" },
        { id: "inbox",     icon: Inbox,           label: "Messages",  badge: "3" },
        { id: "analytics", icon: BarChart2,        label: "Analytics", badge: "" },
      ],
    },
    {
      label: "Bibliothèque",
      items: [
        { id: "bookmarks", icon: Bookmark,   label: "Favoris",   badge: "" },
        { id: "files",     icon: FileText,   label: "Fichiers",  badge: "" },
        { id: "tags",      icon: Tag,        label: "Tags",      badge: "" },
      ],
    },
  ];

  return (
    <div className="flex h-80 overflow-hidden rounded-b-xl border-t border-border">
      <SidebarProvider defaultOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
        <Sidebar collapsible="icon" className="h-80 static border-r border-border bg-sidebar">
          {/* Header */}
          <SidebarHeader className="px-3 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="group-data-[collapsible=icon]:hidden flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate">ShadcnKit</span>
                <span className="text-[10px] text-muted-foreground truncate">Pro workspace</span>
              </div>
            </div>
          </SidebarHeader>

          {/* Content */}
          <SidebarContent className="overflow-y-auto">
            {NAV_MAIN.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={activePage === item.id}
                          onClick={() => setActivePage(item.id)}
                          tooltip={item.label}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                        {item.badge && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Paramètres">
                      <Settings className="h-4 w-4" />
                      <span>Paramètres</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Aide">
                      <HelpCircle className="h-4 w-4" />
                      <span>Aide & support</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer */}
          <SidebarFooter className="border-t border-sidebar-border p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" tooltip="Romain Ecarnot">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">RC</AvatarFallback>
                  </Avatar>
                  <div className="group-data-[collapsible=icon]:hidden flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">Romain Ecarnot</span>
                    <span className="text-[10px] text-muted-foreground truncate">romain@example.com</span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Inset content */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Mini topbar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0">
            <SidebarTrigger className="h-7 w-7" />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs text-muted-foreground capitalize">{activePage}</span>
          </div>
          {/* Page content */}
          <div className="flex-1 p-4 overflow-y-auto">
            <p className="text-sm font-medium mb-3 capitalize">{activePage}</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Sessions",  val: "1 284", delta: "+6%" },
                { label: "Membres",   val: "47",    delta: "+2" },
                { label: "Tâches",    val: "132",   delta: "12 ouv." },
                { label: "Stockage",  val: "4.2 GB", delta: "/ 10 GB" },
              ].map(({ label, val, delta }) => (
                <div key={label} className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className="font-bold text-sm">{val}</p>
                  <p className="text-[10px] text-muted-foreground">{delta}</p>
                </div>
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

// ─── DataTableSection component ───────────────────────────────────────────────
type Employee = {
  id: number;
  name: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "pending";
  salary: number;
  joinedAt: string;
};

const EMPLOYEES: Employee[] = [
  { id: 1,  name: "Alice Martin",   role: "Lead Dev",    department: "Engineering",  status: "active",   salary: 95000, joinedAt: "2021-03-15" },
  { id: 2,  name: "Bob Chen",       role: "Designer",    department: "Product",      status: "active",   salary: 78000, joinedAt: "2022-07-01" },
  { id: 3,  name: "Carol Smith",    role: "PM",          department: "Product",      status: "inactive", salary: 88000, joinedAt: "2020-11-20" },
  { id: 4,  name: "David López",    role: "DevOps",      department: "Engineering",  status: "active",   salary: 92000, joinedAt: "2019-05-10" },
  { id: 5,  name: "Emma Wilson",    role: "Analyst",     department: "Data",         status: "pending",  salary: 72000, joinedAt: "2023-01-08" },
  { id: 6,  name: "Frank Dubois",   role: "QA",          department: "Engineering",  status: "active",   salary: 69000, joinedAt: "2022-03-22" },
  { id: 7,  name: "Grace Kim",      role: "Marketing",   department: "Growth",       status: "active",   salary: 74000, joinedAt: "2021-09-14" },
  { id: 8,  name: "Hugo Moreau",    role: "Backend Dev", department: "Engineering",  status: "inactive", salary: 87000, joinedAt: "2020-06-30" },
  { id: 9,  name: "Iris Nguyen",    role: "Data Sci.",   department: "Data",         status: "active",   salary: 98000, joinedAt: "2021-12-01" },
  { id: 10, name: "Jack Turner",    role: "Sales",       department: "Growth",       status: "pending",  salary: 65000, joinedAt: "2023-04-17" },
  { id: 11, name: "Kara Johansson", role: "CTO",         department: "Engineering",  status: "active",   salary: 140000, joinedAt: "2018-01-01" },
  { id: 12, name: "Liam O'Brien",  role: "Infra",       department: "Engineering",  status: "active",   salary: 83000, joinedAt: "2022-10-05" },
];

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  inactive: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  pending:  "bg-amber-500/15 text-amber-600 border-amber-500/30",
};

function DataTableSection() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = useMemo<ColumnDef<Employee>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Tout sélectionner"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={v => row.toggleSelected(!!v)}
          aria-label="Sélectionner la ligne"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nom <ChevronsUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
              {row.original.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Rôle <ChevronsUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
    },
    {
      accessorKey: "department",
      header: "Département",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">{row.original.department}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[row.original.status]}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "salary",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Salaire <ChevronsUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.salary.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
        </span>
      ),
    },
    {
      accessorKey: "joinedAt",
      header: "Arrivée",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.joinedAt).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
  ], []);

  const table = useReactTable({
    data: EMPLOYEES,
    columns,
    state: { sorting, columnFilters, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 6 } },
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
            onChange={e => table.getColumn("status")?.setFilterValue(e.target.value || undefined)}
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="pending">En attente</option>
          </select>
        </div>
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}</Badge>
            <Button size="sm" variant="destructive" onClick={() => setRowSelection({})}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />Désélectionner
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th key={header.id} className="h-10 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={`border-b transition-colors hover:bg-muted/30 ${row.getIsSelected() ? "bg-primary/5" : ""}`}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-3 py-2.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={columns.length} className="h-20 text-center text-muted-foreground">Aucun résultat</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          {table.getFilteredRowModel().rows.length} ligne{table.getFilteredRowModel().rows.length > 1 ? "s" : ""}
          {selectedCount > 0 ? ` · ${selectedCount} sélectionné${selectedCount > 1 ? "s" : ""}` : ""}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>«</Button>
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>‹</Button>
          <span className="px-3 py-1 text-sm">
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>›</Button>
          <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>»</Button>
        </div>
      </div>
    </div>
  );
}

// ─── SettingsSection component ─────────────────────────────────────────────────
function SettingsSection() {
  const [settingsTab, setSettingsTab] = React.useState("profile");
  const [notifEmail, setNotifEmail] = React.useState(true);
  const [notifPush, setNotifPush] = React.useState(false);
  const [notifMarketing, setNotifMarketing] = React.useState(true);
  const [notifSecurity, setNotifSecurity] = React.useState(true);
  const [twoFactor, setTwoFactor] = React.useState(false);
  const [sessionTimeout, setSessionTimeout] = React.useState("30");
  const [accentColor, setAccentColor] = React.useState("gold");
  const [density, setDensity] = React.useState("comfortable");

  const settingsNav = [
    { id: "profile",       label: "Profil",        icon: User },
    { id: "security",      label: "Sécurité",      icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance",    label: "Apparence",     icon: Sun },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-0 rounded-xl border overflow-hidden min-h-[520px]">
      {/* Sidebar nav */}
      <aside className="w-full md:w-52 border-b md:border-b-0 md:border-r bg-muted/20 shrink-0">
        <div className="p-4 border-b">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paramètres</p>
        </div>
        <nav className="p-2 space-y-0.5">
          {settingsNav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSettingsTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                ${settingsTab === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* PROFIL */}
        {settingsTab === "profile" && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h3 className="text-base font-semibold mb-1">Profil public</h3>
              <p className="text-sm text-muted-foreground">Ces informations sont visibles par les membres de votre équipe.</p>
            </div>
            <Separator />
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">RE</AvatarFallback>
              </Avatar>
              <div className="space-y-1.5">
                <Button variant="outline" size="sm"><Upload className="h-3.5 w-3.5 mr-1.5" />Changer la photo</Button>
                <p className="text-xs text-muted-foreground">JPG, PNG ou GIF. Max 2 MB.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Prénom</Label>
                <Input defaultValue="Romain" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Nom</Label>
                <Input defaultValue="Ecarnot" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Email</Label>
              <Input defaultValue="jane.doe@example.com" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Bio</Label>
              <Textarea defaultValue="Développeur TypeScript & React, basé à Saint-Sébastien-sur-Loire." className="resize-none h-20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Rôle</Label>
              <Input defaultValue="Lead Developer" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline">Annuler</Button>
              <Button onClick={() => sonnerToast.success("Profil mis à jour")}>Enregistrer</Button>
            </div>
          </div>
        )}

        {/* SÉCURITÉ */}
        {settingsTab === "security" && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h3 className="text-base font-semibold mb-1">Sécurité du compte</h3>
              <p className="text-sm text-muted-foreground">Gérez votre mot de passe et les accès à votre compte.</p>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Mot de passe actuel</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Nouveau mot de passe</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Confirmer</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button onClick={() => sonnerToast.success("Mot de passe mis à jour")}>Mettre à jour</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Double authentification (2FA)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Renforcez la sécurité avec une application TOTP</p>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label className="text-sm">Expiration de session (minutes)</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={sessionTimeout}
                onChange={e => setSessionTimeout(e.target.value)}
              >
                {["15", "30", "60", "120", "480"].map(v => (
                  <option key={v} value={v}>{v} min</option>
                ))}
              </select>
            </div>
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 space-y-2">
              <p className="text-sm font-medium text-rose-600">Zone de danger</p>
              <p className="text-xs text-muted-foreground">La suppression du compte est irréversible.</p>
              <Button variant="destructive" size="sm" onClick={() => sonnerToast.error("Action bloquée en démo")}>
                Supprimer le compte
              </Button>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {settingsTab === "notifications" && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h3 className="text-base font-semibold mb-1">Préférences de notifications</h3>
              <p className="text-sm text-muted-foreground">Choisissez comment et quand vous voulez être notifié.</p>
            </div>
            <Separator />
            {[
              { label: "Notifications par email", desc: "Recevez les résumés et alertes par email", state: notifEmail, setState: setNotifEmail },
              { label: "Notifications push", desc: "Alertes temps réel dans le navigateur", state: notifPush, setState: setNotifPush },
              { label: "Emails marketing", desc: "Nouveautés, mises à jour de produit", state: notifMarketing, setState: setNotifMarketing },
              { label: "Alertes de sécurité", desc: "Connexions suspectes, changements de mot de passe", state: notifSecurity, setState: setNotifSecurity },
            ].map(({ label, desc, state, setState }) => (
              <div key={label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <Switch checked={state} onCheckedChange={setState} />
              </div>
            ))}
            <Separator />
            <div className="flex justify-end">
              <Button onClick={() => sonnerToast.success("Préférences enregistrées")}>Enregistrer</Button>
            </div>
          </div>
        )}

        {/* APPARENCE */}
        {settingsTab === "appearance" && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h3 className="text-base font-semibold mb-1">Apparence</h3>
              <p className="text-sm text-muted-foreground">Personnalisez l'interface selon vos préférences.</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Thème</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "dark",   label: "Sombre", icon: Moon },
                  { id: "light",  label: "Clair",  icon: Sun },
                  { id: "system", label: "Système", icon: Globe },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-sm transition-all
                      ${id === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-medium">Couleur d'accent</Label>
              <div className="flex gap-2">
                {[
                  { id: "gold",   color: "bg-amber-500" },
                  { id: "blue",   color: "bg-blue-500" },
                  { id: "violet", color: "bg-violet-500" },
                  { id: "rose",   color: "bg-rose-500" },
                  { id: "green",  color: "bg-emerald-500" },
                ].map(({ id, color }) => (
                  <button
                    key={id}
                    onClick={() => setAccentColor(id)}
                    className={`h-7 w-7 rounded-full ${color} transition-all ${accentColor === id ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110" : "opacity-70 hover:opacity-100"}`}
                    title={id}
                  />
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Densité</Label>
              <RadioGroup value={density} onValueChange={setDensity} className="flex gap-4">
                {["compact", "comfortable", "spacious"].map(d => (
                  <div key={d} className="flex items-center gap-1.5">
                    <RadioGroupItem value={d} id={`density-${d}`} />
                    <Label htmlFor={`density-${d}`} className="text-sm capitalize cursor-pointer">{d}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => sonnerToast.success("Apparence mise à jour")}>Appliquer</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Section Header helper ─────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
