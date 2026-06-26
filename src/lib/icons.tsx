import {
  GraduationCap,
  BookOpen,
  FileEdit,
  TrendingUp,
  Briefcase,
  Brain,
  Award,
  Sigma,
  ArrowUpDown,
  Languages,
  BadgeCheck,
  Menu,
  X,
  Check,
  Copy,
  History,
  Printer,
  Globe,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CalendarDays,
  Timer,
  Clock,
  Info,
  HelpCircle,
  CheckCircle2,
  Bookmark,
  BookmarkPlus,
  BookmarkCheck,
  Trash2,
  Upload,
  ArrowLeftRight,
  Flag,
  Share2,
  RefreshCw,
  BarChart3,
  AlertTriangle,
  MessageCircle,
  Calculator,
  Compass,
  FileText,
  MousePointerClick,
  Megaphone,
  SearchX,
  Search,
  UserRound,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  UserPlus,
  Home,
  type LucideIcon,
} from "lucide-react";

/**
 * Material Symbols Outlined icon-font yerine kullanılan lucide-react eşlemesi.
 *
 * Neden: eski yaklaşım `<span class="material-symbols-outlined">menu</span>`
 * şeklindeydi — bu, ikon adını (örn. "menu", "north_east") gerçek bir DOM
 * metni olarak bırakıyordu. Bu metinler agent/screen-reader/arama motoru
 * taraması yapan her şeye düz metin olarak görünüyordu ("İNCELE north_east"
 * gibi) ve ek olarak Google Fonts'tan ayrı, render-blocking bir icon-font
 * dosyası indirmeyi gerektiriyordu (mobil FCP/LCP'yi doğrudan etkiliyordu).
 *
 * Veriler (mock.json, site.ts, score-calculators.ts) ikon adını halen aynı
 * Material-Symbols-stili string key olarak tutuyor (örn. "school",
 * "trending_up") — bu sayede veri katmanına dokunmadan sadece render
 * tarafını gerçek SVG'ye çevirebiliyoruz. .astro dosyalarında `client:*`
 * yönergesi olmadan kullanılırsa derleme zamanında statik SVG'ye dönüşür,
 * sıfır ekstra JS gönderir.
 */
export const iconMap: Record<string, LucideIcon> = {
  school: GraduationCap,
  menu_book: BookOpen,
  auto_stories: BookOpen,
  edit_document: FileEdit,
  trending_up: TrendingUp,
  work: Briefcase,
  work_outline: Briefcase,
  cases: Briefcase,
  psychology: Brain,
  military_tech: Award,
  functions: Sigma,
  swap_vert: ArrowUpDown,
  translate: Languages,
  workspace_premium: BadgeCheck,
  verified: BadgeCheck,
  menu: Menu,
  close: X,
  check: Check,
  check_circle: CheckCircle2,
  content_copy: Copy,
  picture_as_pdf: Printer,
  history: History,
  public: Globe,
  quiz: HelpCircle,
  edit_note: FileEdit,
  subject: BookOpen,
  expand_more: ChevronDown,
  expand_less: ChevronUp,
  chevron_right: ChevronRight,
  chevron_left: ChevronLeft,
  arrow_forward: ArrowRight,
  arrow_right_alt: ArrowRight,
  north_east: ArrowUpRight,
  calendar_month: Calendar,
  event: CalendarDays,
  event_upcoming: CalendarDays,
  timer: Timer,
  schedule: Clock,
  info: Info,
  help: HelpCircle,
  task_alt: CheckCircle2,
  bookmark: Bookmark,
  bookmark_add: BookmarkPlus,
  bookmark_added: BookmarkCheck,
  delete: Trash2,
  delete_sweep: Trash2,
  upload: Upload,
  compare_arrows: ArrowLeftRight,
  flag: Flag,
  share: Share2,
  refresh: RefreshCw,
  bar_chart: BarChart3,
  warning: AlertTriangle,
  chat: MessageCircle,
  calculate: Calculator,
  explore: Compass,
  article: FileText,
  ads_click: MousePointerClick,
  campaign: Megaphone,
  search_off: SearchX,
  search: Search,
  account: UserRound,
  person: UserRound,
  visibility: Eye,
  visibility_off: EyeOff,
  login: LogIn,
  logout: LogOut,
  person_add: UserPlus,
  home: Home,
};

type IconProps = {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
  title?: string;
};

/**
 * Tek bir ikonu render eder. Dekoratif kullanım varsayılan: `aria-hidden`.
 * Anlamlı bir ikon (örn. tek başına bir butonun içeriği) ise `title` prop'u
 * ile gerçek bir erişilebilir isim ver; bu durumda `role="img"` + `aria-label`
 * eklenir ve `aria-hidden` kaldırılır.
 */
export function Icon({ name, className, size = 20, strokeWidth = 1.75, title }: IconProps) {
  const Cmp = iconMap[name] ?? HelpCircle;
  if (title) {
    return (
      <Cmp
        role="img"
        aria-label={title}
        className={className}
        size={size}
        strokeWidth={strokeWidth}
      />
    );
  }
  return (
    <Cmp aria-hidden="true" className={className} size={size} strokeWidth={strokeWidth} />
  );
}
