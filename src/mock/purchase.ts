import type {
  Party,
  Product,
  PurchaseBill,
  PurchaseBillStatus,
  PurchaseOrder,
} from "@/types";
import { mockParties, mockProducts } from "@/mock/masters";
import { mockPurchaseOrders } from "@/mock/purchaseOrders";

export interface BillPayment {
  id: string;
  date: string;
  method: string;
  reference: string;
  amount: number;
}

export interface MockPurchaseBill extends PurchaseBill {
  fabricLabel: string;
  fabricBadge: "cotton" | "fleece" | "rib";
  amountPaid: number;
  payments: BillPayment[];
  stockUpdatedAt?: string;
}

function supplier(id: string, overrides?: Partial<Party>): Party {
  const base =
    mockParties.find((party) => party.id === id && party.type === "SUPPLIER") ??
    mockParties.find((party) => party.type === "SUPPLIER") ??
    mockParties[0];
  return { ...base, type: "SUPPLIER", ...overrides };
}

function product(id: string, overrides?: Partial<Product>): Product {
  const base =
    mockProducts.find((item) => item.id === id) ??
    mockProducts.find((item) => item.category === "RAW_MATERIAL") ??
    mockProducts[0];
  return { ...base, ...overrides };
}

function po(id: string): PurchaseOrder {
  return (
    mockPurchaseOrders.find((order) => order.id === id) ?? mockPurchaseOrders[0]
  );
}

// TODO: Replace with TanStack Query API call
// Service: src/services/purchase.service.ts
// Query key: QUERY_KEYS.PURCHASE_BILLS
export const mockPurchaseBills: MockPurchaseBill[] = [
  {
    id: "bill-1",
    billNumber: "PB-001",
    supplierId: "party-4",
    supplier: supplier("party-4", { name: "Sunrise Textiles" }),
    supplierInvoiceNo: "ST-INV-4421",
    purchaseDate: "2024-01-20",
    poId: "po-2",
    po: po("po-2"),
    productId: "prod-1",
    product: product("prod-1", { name: "Cotton Interlock" }),
    fabricLabel: "Cotton Interlock",
    fabricBadge: "cotton",
    vehicleNumber: "GJ-05-AB-1234",
    grossWeight: 1040,
    tareWeight: 40,
    netWeight: 1000,
    ratePerKg: 180,
    gstPercent: 5,
    gstAmount: 9000,
    totalAmount: 189000,
    status: "CONFIRMED",
    confirmedAt: "2024-01-20T11:32:00.000Z",
    createdAt: "2024-01-20T00:00:00.000Z",
    amountPaid: 189000,
    stockUpdatedAt: "2024-01-20T11:32:00.000Z",
    payments: [
      {
        id: "pay-1",
        date: "2024-01-22",
        method: "Bank Transfer",
        reference: "TXN - 8821",
        amount: 189000,
      },
    ],
  },
  {
    id: "bill-2",
    billNumber: "PB-002",
    supplierId: "party-5",
    supplier: supplier("party-5", { name: "Mehta Fabrics" }),
    supplierInvoiceNo: "MF-8821",
    purchaseDate: "2024-01-22",
    poId: "po-1",
    po: po("po-1"),
    productId: "prod-8",
    product: product("prod-8", { name: "Fleece Fabric" }),
    fabricLabel: "Fleece Fabric",
    fabricBadge: "fleece",
    vehicleNumber: "PB-10-CD-7788",
    grossWeight: 860,
    tareWeight: 40,
    netWeight: 820,
    ratePerKg: 210,
    gstPercent: 5,
    gstAmount: 8610,
    totalAmount: 180810,
    status: "PENDING",
    confirmedAt: null,
    createdAt: "2024-01-22T00:00:00.000Z",
    amountPaid: 0,
    payments: [],
  },
  {
    id: "bill-3",
    billNumber: "PB-003",
    supplierId: "party-8",
    supplier: supplier("party-8", { name: "Anwar Thread" }),
    supplierInvoiceNo: "AT-3301",
    purchaseDate: "2024-01-24",
    poId: "po-4",
    po: po("po-4"),
    productId: "prod-5",
    product: product("prod-5", { name: "Rib Fabric" }),
    fabricLabel: "Rib Fabric",
    fabricBadge: "rib",
    vehicleNumber: "DL-01-EF-2211",
    grossWeight: 520,
    tareWeight: 20,
    netWeight: 500,
    ratePerKg: 195,
    gstPercent: 5,
    gstAmount: 4875,
    totalAmount: 102375,
    status: "CONFIRMED",
    confirmedAt: "2024-01-24T10:00:00.000Z",
    createdAt: "2024-01-24T00:00:00.000Z",
    amountPaid: 50000,
    payments: [
      {
        id: "pay-2",
        date: "2024-01-25",
        method: "UPI",
        reference: "UPI-4412",
        amount: 50000,
      },
    ],
  },
  {
    id: "bill-4",
    billNumber: "PB-004",
    supplierId: "party-4",
    supplier: supplier("party-4", { name: "Sunrise Textiles" }),
    supplierInvoiceNo: "ST-INV-4502",
    purchaseDate: "2024-01-26",
    poId: "po-2",
    po: po("po-2"),
    productId: "prod-1",
    product: product("prod-1", { name: "Cotton Interlock" }),
    fabricLabel: "Cotton Interlock",
    fabricBadge: "cotton",
    vehicleNumber: "GJ-05-XY-9988",
    grossWeight: 1280,
    tareWeight: 50,
    netWeight: 1230,
    ratePerKg: 185,
    gstPercent: 5,
    gstAmount: 11377.5,
    totalAmount: 238727.5,
    status: "RETURNED",
    confirmedAt: "2024-01-26T09:00:00.000Z",
    createdAt: "2024-01-26T00:00:00.000Z",
    amountPaid: 0,
    payments: [],
  },
  {
    id: "bill-5",
    billNumber: "PB-005",
    supplierId: "party-5",
    supplier: supplier("party-5", { name: "Mehta Fabrics" }),
    supplierInvoiceNo: "MF-9011",
    purchaseDate: "2024-01-28",
    poId: "po-5",
    po: po("po-5"),
    productId: "prod-8",
    product: product("prod-8", { name: "Fleece Fabric" }),
    fabricLabel: "Fleece Fabric",
    fabricBadge: "fleece",
    vehicleNumber: "MH-12-GH-3344",
    grossWeight: 760,
    tareWeight: 30,
    netWeight: 730,
    ratePerKg: 205,
    gstPercent: 5,
    gstAmount: 7482.5,
    totalAmount: 157132.5,
    status: "PENDING",
    confirmedAt: null,
    createdAt: "2024-01-28T00:00:00.000Z",
    amountPaid: 0,
    payments: [],
  },
  {
    id: "bill-6",
    billNumber: "PB-006",
    supplierId: "party-8",
    supplier: supplier("party-8", { name: "Luxe Textiles Co." }),
    supplierInvoiceNo: "LX-2201",
    purchaseDate: "2024-01-30",
    poId: "po-3",
    po: po("po-3"),
    productId: "prod-1",
    product: product("prod-1", { name: "Cotton Interlock" }),
    fabricLabel: "Cotton Interlock",
    fabricBadge: "cotton",
    vehicleNumber: "TN-37-AB-1234",
    grossWeight: 1100,
    tareWeight: 45,
    netWeight: 1055,
    ratePerKg: 190,
    gstPercent: 5,
    gstAmount: 10022.5,
    totalAmount: 210472.5,
    status: "CONFIRMED",
    confirmedAt: "2024-01-30T14:00:00.000Z",
    createdAt: "2024-01-30T00:00:00.000Z",
    amountPaid: 210472.5,
    payments: [
      {
        id: "pay-3",
        date: "2024-02-01",
        method: "Bank Transfer",
        reference: "TXN - 9910",
        amount: 210472.5,
      },
    ],
  },
  {
    id: "bill-7",
    billNumber: "PB-007",
    supplierId: "party-4",
    supplier: supplier("party-4", { name: "Sunrise Textiles" }),
    supplierInvoiceNo: "ST-INV-4600",
    purchaseDate: "2024-02-02",
    poId: "po-8",
    po: po("po-8"),
    productId: "prod-5",
    product: product("prod-5", { name: "Rib Fabric" }),
    fabricLabel: "Rib Fabric",
    fabricBadge: "rib",
    vehicleNumber: "RJ-14-KL-5566",
    grossWeight: 640,
    tareWeight: 25,
    netWeight: 615,
    ratePerKg: 200,
    gstPercent: 5,
    gstAmount: 6150,
    totalAmount: 129150,
    status: "PENDING",
    confirmedAt: null,
    createdAt: "2024-02-02T00:00:00.000Z",
    amountPaid: 0,
    payments: [],
  },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/purchase.service.ts
// Query key: QUERY_KEYS.PURCHASE_BILLS
export const mockSuppliers: Party[] = [
  ...mockParties.filter((party) => party.type === "SUPPLIER"),
  {
    id: "supplier-luxe",
    partyNumber: "PTY-LX",
    name: "Luxe Textiles Co.",
    type: "SUPPLIER",
    contact: "+91 98765 41111",
    gstNumber: "33LLLLL0000L1Z5",
    city: "Tirupur",
    country: "India",
    bankAccount: "",
    ifsc: "",
    bankName: "",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/purchase.service.ts
// Query key: QUERY_KEYS.PURCHASE_BILLS
export const mockFabricProducts: Product[] = [
  ...mockProducts.filter((item) => item.category === "RAW_MATERIAL"),
  {
    id: "prod-cotton-240",
    productCode: "SKU-C240",
    name: "Cotton Interlock - 240 GSM",
    category: "RAW_MATERIAL",
    unit: "KG",
    gstRate: 5,
    description: "Cotton interlock 240 GSM",
    isActive: true,
  },
];

export function getBillStatusLabel(status: PurchaseBillStatus): string {
  if (status === "PENDING") return "Pending";
  if (status === "CONFIRMED") return "Confirmed";
  return "Returned";
}

export function generateNextBillNumber(existing: PurchaseBill[]): string {
  const max = existing.reduce((acc, bill) => {
    const match = bill.billNumber.match(/PB-(\d+)/);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `PB-${String(max + 1).padStart(3, "0")}`;
}

export function calcBillAmounts(
  netWeight: number,
  ratePerKg: number,
  gstPercent: number
) {
  const taxable = netWeight * ratePerKg;
  const gstAmount = (taxable * gstPercent) / 100;
  const totalAmount = taxable + gstAmount;
  return { taxable, gstAmount, totalAmount };
}
