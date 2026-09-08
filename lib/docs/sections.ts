// The source of truth for section labels, ordering and landing-page copy.

export type DocSection = {
  slug: string;
  label: string;
  order: number;
  description: string;
};

export const sections: DocSection[] = [
  {
    "slug": "before-you-sign-in",
    "label": "Before you sign in",
    "order": 3,
    "description": "The screens you see before you have an account, and how to get one."
  },
  {
    "slug": "dashboard",
    "label": "Dashboard",
    "order": 4,
    "description": "Finding your way around, and the screens your team works in daily."
  },
  {
    "slug": "properties",
    "label": "Properties",
    "order": 5,
    "description": "Everything inside one property: rooms, menu, services, local guide, and its own settings."
  },
  {
    "slug": "master-setup",
    "label": "Master Setup",
    "order": 6,
    "description": "Build your services, menus, and local recommendations once for the whole business, then choose which properties offer them."
  },
  {
    "slug": "platform-setup",
    "label": "Platform Setup",
    "order": 7,
    "description": "Account-wide setup shared by every property: branding, QR codes, your web address, and Telegram."
  },
  {
    "slug": "administration",
    "label": "Administration",
    "order": 8,
    "description": "Your team, your account, and the record of what changed."
  },
  {
    "slug": "guest-portal",
    "label": "Guest Portal",
    "order": 9,
    "description": "What your guests see after they scan a room QR code, so your front desk can answer their questions."
  },
  {
    "slug": "reference",
    "label": "Reference",
    "order": 10,
    "description": "Role permissions in full, and what to do when something is not working."
  }
];

export const sectionBySlug = new Map(sections.map((s) => [s.slug, s]));
