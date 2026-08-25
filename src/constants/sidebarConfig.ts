import { ROUTES } from "@/constants/routes";

export interface SidebarSubItem {
  label: string;
  href: string;
}

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
  subItems?: SidebarSubItem[];
}

export const sidebarConfig: SidebarItem[] = [
  {
    label: "Masters",
    href: ROUTES.MASTERS.ROOT,
    icon: "Database",
    subItems: [
      { label: "Party Master", href: ROUTES.MASTERS.PARTY },
      { label: "Product Master", href: ROUTES.MASTERS.PRODUCT },
      { label: "Operations & Rates", href: ROUTES.MASTERS.OPERATIONS },
      { label: "GST Master", href: ROUTES.MASTERS.GST },
      { label: "Karigar Master", href: ROUTES.MASTERS.KARIGAR },
    ],
  },
  {
    label: "Purchase Orders",
    href: ROUTES.PURCHASE_ORDERS.ROOT,
    icon: "ClipboardList",
  },
  {
    label: "Purchase",
    href: ROUTES.PURCHASE.ROOT,
    icon: "ShoppingCart",
    subItems: [
      { label: "Purchase Bills", href: ROUTES.PURCHASE.BILLS },
      { label: "Purchase Register", href: ROUTES.PURCHASE.REGISTER },
    ],
  },
  {
    label: "Inventory",
    href: ROUTES.INVENTORY.STOCK,
    icon: "Package",
    subItems: [
      { label: "Stock View", href: ROUTES.INVENTORY.STOCK },
      { label: "Issue Material", href: ROUTES.INVENTORY.ISSUE_NEW },
      { label: "Issue History", href: ROUTES.INVENTORY.ISSUE_HISTORY },
      { label: "Cutting Wastage", href: ROUTES.INVENTORY.WASTAGE },
    ],
  },
  {
    label: "Production",
    href: ROUTES.PRODUCTION.ROOT,
    icon: "Factory",
  },
  {
    label: "Boxing & Dispatch",
    href: ROUTES.BOXING.BOXES,
    icon: "Box",
    subItems: [
      { label: "Box Packing", href: ROUTES.BOXING.BOXES },
      { label: "Containers", href: ROUTES.BOXING.CONTAINERS },
    ],
  },
  {
    label: "Sales",
    href: ROUTES.SALES.BILLS,
    icon: "Receipt",
    subItems: [
      { label: "Sales Bills", href: ROUTES.SALES.BILLS },
      { label: "Credit/Debit Notes", href: ROUTES.SALES.NOTES },
      { label: "Sales Register", href: ROUTES.SALES.REGISTER },
    ],
  },
  {
    label: "Accounts",
    href: ROUTES.ACCOUNTS.KARIGAR_PAYMENTS,
    icon: "Wallet",
    subItems: [
      {
        label: "Karigar Payment",
        href: ROUTES.ACCOUNTS.KARIGAR_PAYMENTS,
      },
      {
        label: "Supplier Payments",
        href: ROUTES.ACCOUNTS.SUPPLIER_PAYMENTS,
      },
      { label: "Vouchers", href: ROUTES.ACCOUNTS.VOUCHERS },
      { label: "Account Statement", href: ROUTES.ACCOUNTS.STATEMENT },
    ],
  },
  {
    label: "Team Management",
    href: ROUTES.TEAM.ROOT,
    icon: "Users",
    adminOnly: true,
  },
];
