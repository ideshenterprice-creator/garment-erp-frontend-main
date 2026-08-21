import { ROUTES } from "@/constants/routes";

export type NotificationCategory =
  | "PURCHASE_ORDER"
  | "INVENTORY"
  | "PRODUCTION"
  | "ACCOUNTS"
  | "TEAM";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  createdAt: string;
  isRead: boolean;
  href: string;
}

// TODO: Replace with TanStack Query API call
// Service: src/services/notifications.service.ts
// Query key: QUERY_KEYS.NOTIFICATIONS
export const mockNotifications: AppNotification[] = [
  {
    id: "notif-1",
    title: "PO delivery approaching",
    message: "PO-2024-001 for Al Reem Trading is due in 45 days.",
    category: "PURCHASE_ORDER",
    createdAt: "2024-02-14T09:30:00.000Z",
    isRead: false,
    href: ROUTES.PURCHASE_ORDERS.DETAIL("po-1"),
  },
  {
    id: "notif-2",
    title: "Low stock alert",
    message: "Cotton fabric has dropped below the reorder threshold.",
    category: "INVENTORY",
    createdAt: "2024-02-14T08:15:00.000Z",
    isRead: false,
    href: ROUTES.INVENTORY.STOCK,
  },
  {
    id: "notif-3",
    title: "Cutting bundle ready",
    message: "Bundle BND-204 is ready to move to printing.",
    category: "PRODUCTION",
    createdAt: "2024-02-13T16:45:00.000Z",
    isRead: false,
    href: ROUTES.PRODUCTION.ROOT,
  },
  {
    id: "notif-4",
    title: "Supplier payment due",
    message: "Payment for Sunrise Textiles is pending confirmation.",
    category: "ACCOUNTS",
    createdAt: "2024-02-13T11:20:00.000Z",
    isRead: true,
    href: ROUTES.ACCOUNTS.SUPPLIER_PAYMENTS,
  },
  {
    id: "notif-5",
    title: "Sales bill submitted",
    message: "Invoice INV-2024-001 was submitted for Al Reem Trading.",
    category: "ACCOUNTS",
    createdAt: "2024-02-12T14:05:00.000Z",
    isRead: true,
    href: ROUTES.SALES.BILLS,
  },
  {
    id: "notif-6",
    title: "Team invite accepted",
    message: "Priya Mehta accepted the Team Member invite.",
    category: "TEAM",
    createdAt: "2024-02-11T10:00:00.000Z",
    isRead: true,
    href: ROUTES.TEAM.ROOT,
  },
  {
    id: "notif-7",
    title: "Wastage return recorded",
    message: "2.4 kg cutting scrap returned from Floor A.",
    category: "INVENTORY",
    createdAt: "2024-02-10T17:30:00.000Z",
    isRead: true,
    href: ROUTES.INVENTORY.WASTAGE,
  },
  {
    id: "notif-8",
    title: "New purchase order created",
    message: "PO-2024-008 was created for Blue Wave Apparel.",
    category: "PURCHASE_ORDER",
    createdAt: "2024-02-09T12:10:00.000Z",
    isRead: true,
    href: ROUTES.PURCHASE_ORDERS.ROOT,
  },
];
