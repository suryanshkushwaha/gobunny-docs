import {
  BookOpen,
  Building2,
  Compass,
  ConciergeBell,
  Globe2,
  History,
  Home,
  Image as ImageIcon,
  KeyRound,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogIn,
  MailCheck,
  Map,
  PanelLeft,
  QrCode,
  Rocket,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserPlus,
  Users,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

/**
 * A lucide icon for every nav item.
 */
export const navIcons: Record<string, LucideIcon> = {
  '/': BookOpen,
  '/getting-started': Rocket,

  '/before-you-sign-in/landing-page': Globe2,
  '/before-you-sign-in/sign-up': UserPlus,
  '/before-you-sign-in/sign-in': LogIn,
  '/before-you-sign-in/reset-password': KeyRound,
  '/before-you-sign-in/accept-team-invite': MailCheck,

  // PanelLeft matches the SidebarTrigger icon.
  '/dashboard/navigation': PanelLeft,
  '/dashboard/overview': LayoutDashboard,
  '/dashboard/guest-requests': ConciergeBell, // app: Guest Requests
  '/properties/properties': Building2, // app: Properties
  '/properties/rooms': Home, // app: Rooms tab
  '/properties/menu': Utensils, // app: Menu tab
  '/properties/services': ConciergeBell, // app: Services tab
  '/properties/local-guide': Map, // app: Local Guide tab
  '/properties/property-settings': Settings, // app: Settings tab
  '/properties/property-branding': ImageIcon, // app: Branding tab
  '/properties/property-qr-customization': QrCode, // app: QR Customization tab

  '/master-setup/services': ConciergeBell, // app: Master Services
  '/master-setup/menus': Utensils, // app: Master Menus
  '/master-setup/local-guides': Compass, // app: Master Local Guides

  '/platform-setup/branding': ImageIcon, // app: Branding
  '/platform-setup/qr-customization': QrCode, // app: QR Customization
  '/platform-setup/domain': Globe2, // app: Domain
  '/platform-setup/integrations': Send, // app: Integrations

  '/administration/team': Users, // app: Team
  '/administration/audit-logs': History, // app: Audit Logs
  '/administration/settings': Settings, // app: Settings
  '/administration/changelog': Sparkles, // app: "What's new" dialog

  '/guest-portal/overview': QrCode,
  '/guest-portal/home': Home,
  '/guest-portal/dining': Utensils,
  '/guest-portal/services': ConciergeBell,
  '/guest-portal/guide': Map,
  '/guest-portal/status': ListChecks,

  '/reference/roles-and-permissions': ShieldCheck,
  '/reference/troubleshooting': LifeBuoy,
};

/** One icon per section, for the home page's section grid. */
export const sectionIcons: Record<string, LucideIcon> = {
  'before-you-sign-in': LogIn,
  dashboard: LayoutDashboard,
  properties: Building2,
  'master-setup': Layers,
  'platform-setup': SlidersHorizontal,
  administration: ShieldCheck,
  'guest-portal': QrCode,
  reference: BookOpen,
};

export function iconFor(route: string): LucideIcon {
  return navIcons[route] ?? BookOpen;
}

export function SectionIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Icon = sectionIcons[slug] ?? BookOpen;
  return <Icon aria-hidden='true' className={className} />;
}

/**
 * Renders the icon for a route.
 *
 * Every consumer wants the same thing, and resolving the component through a
 * plain lookup here keeps callers from aliasing a call result into a
 * capitalised local — which reads to React's lint rules as defining a new
 * component on each render.
 */
export function NavIcon({
  route,
  className,
}: {
  route: string;
  className?: string;
}) {
  const Icon = navIcons[route] ?? BookOpen;
  return <Icon aria-hidden='true' className={className} />;
}
