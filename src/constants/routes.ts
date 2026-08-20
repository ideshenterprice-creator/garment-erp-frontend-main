export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
    ACCEPT_INVITE: "/accept-invite",
  },
  MASTERS: {
    ROOT: "/masters",
    PARTY: "/masters/party",
    PRODUCT: "/masters/product",
    OPERATIONS: "/masters/operations",
    GST: "/masters/gst",
    KARIGAR: "/masters/karigar",
  },
  PURCHASE_ORDERS: {
    ROOT: "/purchase-orders",
    NEW: "/purchase-orders/new",
    DETAIL: (id: string) => `/purchase-orders/${id}`,
  },
  PURCHASE: {
    ROOT: "/purchase",
    BILLS: "/purchase/bills",
    NEW: "/purchase/bills/new",
    DETAIL: (id: string) => `/purchase/bills/${id}`,
    REGISTER: "/purchase/register",
  },
  INVENTORY: {
    STOCK: "/inventory/stock",
    ISSUE: "/inventory/issue",
    ISSUE_NEW: "/inventory/issue/new",
    ISSUE_HISTORY: "/inventory/issue/history",
    WASTAGE: "/inventory/wastage",
  },
  PRODUCTION: {
    ROOT: "/production",
    BUNDLE_DETAIL: (bundleNumber: string) =>
      `/production/bundles/${bundleNumber}`,
  },
  BOXING: {
    BOXES: "/boxing/boxes",
    CONTAINERS: "/boxing/containers",
    CONTAINER_DETAIL: (id: string) => `/boxing/containers/${id}`,
  },
  SALES: {
    BILLS: "/sales/bills",
    NEW_BILL: "/sales/bills/new",
    BILL_DETAIL: (id: string) => `/sales/bills/${id}`,
    NOTES: "/sales/notes",
    REGISTER: "/sales/register",
  },
  ACCOUNTS: {
    KARIGAR_PAYMENTS: "/accounts/karigar-payments",
    SUPPLIER_PAYMENTS: "/accounts/supplier-payments",
    VOUCHERS: "/accounts/vouchers",
    STATEMENT: "/accounts/statement",
  },
  TEAM: {
    ROOT: "/team",
  },
} as const;
