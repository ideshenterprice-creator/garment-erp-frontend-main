import type {
  IssueRecord,
  IssueType,
  Party,
  Product,
  ProductCategory,
  ProductUnit,
  PurchaseOrder,
  Stock,
} from "@/types";
import { mockParties, mockProducts } from "@/mock/masters";
import { mockPurchaseOrders } from "@/mock/purchaseOrders";

export type StockSortOption = "lastUpdated" | "name" | "quantity";

export interface MockStockItem extends Stock {
  lastUpdatedLabel: string;
  allocated?: number;
  minStock?: number;
}

export type MockIssueDisplayStatus = "RETURNED" | "IN_PROGRESS" | "PENDING";

export interface MockIssueRecord extends IssueRecord {
  displayStatus: MockIssueDisplayStatus;
  materialLabel: string;
  unitLabel: string;
  designNumber?: string;
}

export type WastageStatus = "SOLD" | "IN_STOCK";

export interface MockWastageEntry {
  id: string;
  entryNumber: string;
  date: string;
  poId: string;
  poNumber: string;
  designCode: string;
  fabricType: string;
  fabricProductId: string;
  wastageQty: number;
  returnedBy: string;
  status: WastageStatus;
  remarks?: string;
  valuePerKg: number;
}

function productByName(
  name: string,
  category: ProductCategory,
  unit: ProductUnit,
  id: string
): Product {
  const existing = mockProducts.find((item) => item.name === name);
  if (existing) return existing;
  return {
    id,
    productCode: id.toUpperCase(),
    name,
    category,
    unit,
    gstRate: 5,
    description: name,
    isActive: true,
  };
}

function karigar(name: string, id: string): Party {
  const existing = mockParties.find((party) => party.name === name);
  if (existing) return existing;
  return {
    id,
    partyNumber: id,
    name,
    type: "KARIGAR",
    contact: "+91 90000 00000",
    gstNumber: "",
    city: "Surat",
    country: "India",
    bankAccount: "",
    ifsc: "",
    bankName: "",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
}

function po(id: string): PurchaseOrder {
  return mockPurchaseOrders.find((order) => order.id === id) ?? mockPurchaseOrders[0];
}

// TODO: Replace with TanStack Query API call
// Service: src/services/inventory.service.ts
// Query key: QUERY_KEYS.STOCK
export const mockStockItems: MockStockItem[] = [
  {
    id: "stock-1",
    productId: "prod-1",
    product: productByName("Cotton Interlock Fabric", "RAW_MATERIAL", "KG", "prod-cotton-fabric"),
    quantity: 1840,
    lastUpdated: new Date().toISOString(),
    lastUpdatedLabel: "Today 09:12 AM",
    stockStatus: "AVAILABLE",
    allocated: 450,
    minStock: 200,
  },
  {
    id: "stock-2",
    productId: "prod-2",
    product: productByName("Baby Bodysuit 0-3M", "FINISHED_GOOD", "PCS", "prod-bodysuit-03"),
    quantity: 320,
    lastUpdated: new Date().toISOString(),
    lastUpdatedLabel: "Today 08:45 AM",
    stockStatus: "AVAILABLE",
  },
  {
    id: "stock-3",
    productId: "prod-3",
    product: productByName("Poly Bag (small)", "ACCESSORY", "PCS", "prod-poly-small"),
    quantity: 4200,
    lastUpdated: "2024-02-12T00:00:00.000Z",
    lastUpdatedLabel: "12 Feb 2024",
    stockStatus: "AVAILABLE",
  },
  {
    id: "stock-4",
    productId: "prod-4",
    product: productByName("Cutting Wastage Fabric", "WASTAGE", "KG", "prod-wastage-fabric"),
    quantity: 124,
    lastUpdated: new Date().toISOString(),
    lastUpdatedLabel: "Today 10:00 AM",
    stockStatus: "AVAILABLE",
  },
  {
    id: "stock-5",
    productId: "prod-sleepsuit",
    product: productByName("Baby Sleepsuit 0-3M", "FINISHED_GOOD", "PCS", "prod-sleepsuit"),
    quantity: 0,
    lastUpdated: "",
    lastUpdatedLabel: "—",
    stockStatus: "OUT_OF_STOCK",
  },
  {
    id: "stock-6",
    productId: "prod-8",
    product: productByName("Interlock Fabric", "RAW_MATERIAL", "KG", "prod-8"),
    quantity: 960,
    lastUpdated: "2024-02-18T00:00:00.000Z",
    lastUpdatedLabel: "18 Feb 2024",
    stockStatus: "AVAILABLE",
  },
  {
    id: "stock-7",
    productId: "prod-rib",
    product: productByName("Rib Knit", "RAW_MATERIAL", "METERS", "prod-rib"),
    quantity: 540,
    lastUpdated: "2024-02-15T00:00:00.000Z",
    lastUpdatedLabel: "15 Feb 2024",
    stockStatus: "LOW",
  },
  {
    id: "stock-8",
    productId: "prod-snap",
    product: productByName("Snap Buttons", "ACCESSORY", "PCS", "prod-snap"),
    quantity: 12500,
    lastUpdated: "2024-02-10T00:00:00.000Z",
    lastUpdatedLabel: "10 Feb 2024",
    stockStatus: "AVAILABLE",
  },
  {
    id: "stock-9",
    productId: "prod-romper",
    product: productByName("Romper Set", "FINISHED_GOOD", "PCS", "prod-romper"),
    quantity: 180,
    lastUpdated: new Date().toISOString(),
    lastUpdatedLabel: "Yesterday",
    stockStatus: "AVAILABLE",
  },
  {
    id: "stock-10",
    productId: "prod-fleece",
    product: productByName("Fleece Fabric", "RAW_MATERIAL", "KG", "prod-fleece"),
    quantity: 720,
    lastUpdated: "2024-02-20T00:00:00.000Z",
    lastUpdatedLabel: "20 Feb 2024",
    stockStatus: "AVAILABLE",
  },
  {
    id: "stock-11",
    productId: "prod-poplin",
    product: productByName("Cotton Poplin - Navy Blue", "RAW_MATERIAL", "KG", "prod-poplin"),
    quantity: 1840,
    lastUpdated: new Date().toISOString(),
    lastUpdatedLabel: "Today 11:00 AM",
    stockStatus: "AVAILABLE",
  },
  {
    id: "stock-12",
    productId: "prod-scrap",
    product: productByName("Mixed Fabric Scrap", "WASTAGE", "KG", "prod-scrap"),
    quantity: 48,
    lastUpdated: "2024-02-19T00:00:00.000Z",
    lastUpdatedLabel: "19 Feb 2024",
    stockStatus: "LOW",
  },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/inventory.service.ts
// Query key: QUERY_KEYS.ISSUES
export const mockIssueRecords: MockIssueRecord[] = [
  {
    id: "iss-1",
    issueNumber: "ISS-041",
    issueDate: "2024-02-20",
    issueType: "CUTTING",
    productId: "prod-cotton-fabric",
    product: productByName("Cotton Interlock", "RAW_MATERIAL", "KG", "prod-cotton-fabric"),
    materialLabel: "Cotton Interlock",
    unitLabel: "kg",
    poId: "po-2",
    po: po("po-2"),
    karigarId: "k-mohammed",
    karigar: karigar("Mohammed Cutter", "k-mohammed"),
    quantityIssued: 200,
    bundleNumber: "BND-041",
    status: "RETURNED",
    displayStatus: "RETURNED",
    designNumber: "D-42",
  },
  {
    id: "iss-2",
    issueNumber: "ISS-042",
    issueDate: "2024-02-20",
    issueType: "PRINTING",
    productId: "prod-cut-d42",
    product: productByName("Cut Pieces D-42", "FINISHED_GOOD", "PCS", "prod-cut-d42"),
    materialLabel: "Cut Pieces D-42",
    unitLabel: "pcs",
    poId: "po-2",
    po: po("po-2"),
    karigarId: "k-raju",
    karigar: karigar("Raju Printer", "k-raju"),
    quantityIssued: 450,
    bundleNumber: "BND-042",
    status: "ISSUED",
    displayStatus: "IN_PROGRESS",
  },
  {
    id: "iss-3",
    issueNumber: "ISS-043",
    issueDate: "2024-02-19",
    issueType: "STITCHING",
    productId: "prod-printed",
    product: productByName("Printed Pieces", "FINISHED_GOOD", "PCS", "prod-printed"),
    materialLabel: "Printed Pieces",
    unitLabel: "pcs",
    poId: "po-1",
    po: po("po-1"),
    karigarId: "party-7",
    karigar: karigar("Suresh Tailor", "party-7"),
    quantityIssued: 380,
    bundleNumber: "BND-043",
    status: "ISSUED",
    displayStatus: "IN_PROGRESS",
  },
  {
    id: "iss-4",
    issueNumber: "ISS-044",
    issueDate: "2024-02-18",
    issueType: "SAMPLE",
    productId: "prod-fleece",
    product: productByName("Fleece Fabric", "RAW_MATERIAL", "KG", "prod-fleece"),
    materialLabel: "Fleece Fabric",
    unitLabel: "kg",
    poId: "po-4",
    po: po("po-4"),
    karigarId: "party-6",
    karigar: karigar("Ramesh Karigar", "party-6"),
    quantityIssued: 25,
    bundleNumber: "BND-044",
    status: "PARTIAL",
    displayStatus: "PENDING",
  },
  {
    id: "iss-5",
    issueNumber: "ISS-045",
    issueDate: "2024-02-18",
    issueType: "PATTERN",
    productId: "prod-pattern",
    product: productByName("Pattern Paper", "ACCESSORY", "PCS", "prod-pattern"),
    materialLabel: "Pattern Paper",
    unitLabel: "pcs",
    poId: "po-1",
    po: po("po-1"),
    karigarId: "k-mohammed",
    karigar: karigar("Mohammed Cutter", "k-mohammed"),
    quantityIssued: 12,
    bundleNumber: "BND-045",
    status: "RETURNED",
    displayStatus: "RETURNED",
  },
  {
    id: "iss-6",
    issueNumber: "ISS-046",
    issueDate: "2024-02-17",
    issueType: "CUTTING",
    productId: "prod-poplin",
    product: productByName("Cotton Poplin - Navy Blue", "RAW_MATERIAL", "KG", "prod-poplin"),
    materialLabel: "Cotton Poplin - Navy Blue",
    unitLabel: "kg",
    poId: "po-3",
    po: po("po-3"),
    karigarId: "k-abdul",
    karigar: karigar("Abdul Textile Mills (Karigar)", "k-abdul"),
    quantityIssued: 150,
    bundleNumber: "BND-046",
    status: "ISSUED",
    displayStatus: "IN_PROGRESS",
  },
  {
    id: "iss-7",
    issueNumber: "ISS-047",
    issueDate: "2024-02-16",
    issueType: "STITCHING",
    productId: "prod-cut-d42",
    product: productByName("Cut Pieces D-42", "FINISHED_GOOD", "PCS", "prod-cut-d42"),
    materialLabel: "Cut Pieces D-42",
    unitLabel: "pcs",
    poId: "po-2",
    po: po("po-2"),
    karigarId: "party-7",
    karigar: karigar("Suresh Tailor", "party-7"),
    quantityIssued: 220,
    bundleNumber: "BND-047",
    status: "PARTIAL",
    displayStatus: "PENDING",
  },
  {
    id: "iss-8",
    issueNumber: "ISS-048",
    issueDate: "2024-02-15",
    issueType: "SAMPLE",
    productId: "prod-printed",
    product: productByName("Printed Pieces", "FINISHED_GOOD", "PCS", "prod-printed"),
    materialLabel: "Printed Pieces",
    unitLabel: "pcs",
    poId: "po-5",
    po: po("po-5"),
    karigarId: "k-raju",
    karigar: karigar("Raju Printer", "k-raju"),
    quantityIssued: 0,
    bundleNumber: "BND-048",
    status: "PARTIAL",
    displayStatus: "PENDING",
  },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/inventory.service.ts
// Query key: QUERY_KEYS.WASTAGE
export const mockWastageEntries: MockWastageEntry[] = [
  {
    id: "cw-1",
    entryNumber: "CW-001",
    date: "2024-01-21",
    poId: "po-1",
    poNumber: "PO-2024-001",
    designCode: "D-42",
    fabricType: "Cotton Interlock",
    fabricProductId: "prod-cotton-fabric",
    wastageQty: 18,
    returnedBy: "Mohammed Cutter",
    status: "SOLD",
    valuePerKg: 45,
  },
  {
    id: "cw-2",
    entryNumber: "CW-002",
    date: "2024-01-22",
    poId: "po-2",
    poNumber: "PO-2024-002",
    designCode: "DSGN-1021",
    fabricType: "Cotton Interlock",
    fabricProductId: "prod-cotton-fabric",
    wastageQty: 22,
    returnedBy: "Mohammed Cutter",
    status: "IN_STOCK",
    valuePerKg: 45,
  },
  {
    id: "cw-3",
    entryNumber: "CW-003",
    date: "2024-01-24",
    poId: "po-4",
    poNumber: "PO-2024-004",
    designCode: "D-55",
    fabricType: "Fleece Fabric",
    fabricProductId: "prod-fleece",
    wastageQty: 31,
    returnedBy: "Ramesh Karigar",
    status: "IN_STOCK",
    valuePerKg: 40,
  },
  {
    id: "cw-4",
    entryNumber: "CW-004",
    date: "2024-01-26",
    poId: "po-1",
    poNumber: "PO-2024-001",
    designCode: "D-43",
    fabricType: "Rib Knit",
    fabricProductId: "prod-rib",
    wastageQty: 14,
    returnedBy: "Suresh Tailor",
    status: "SOLD",
    valuePerKg: 38,
  },
  {
    id: "cw-5",
    entryNumber: "CW-005",
    date: "2024-01-28",
    poId: "po-3",
    poNumber: "PO-2024-003",
    designCode: "D-60",
    fabricType: "Cotton Poplin - Navy Blue",
    fabricProductId: "prod-poplin",
    wastageQty: 27,
    returnedBy: "Abdul Textile Mills",
    status: "IN_STOCK",
    valuePerKg: 42,
  },
  {
    id: "cw-6",
    entryNumber: "CW-006",
    date: "2024-01-30",
    poId: "po-8",
    poNumber: "PO-2024-008",
    designCode: "D-71",
    fabricType: "Cotton Interlock",
    fabricProductId: "prod-cotton-fabric",
    wastageQty: 60,
    returnedBy: "Mohammed Cutter",
    status: "SOLD",
    valuePerKg: 45,
  },
];

export const ADJUSTMENT_REASONS = [
  "Physical Count Correction",
  "Damaged Goods Write-off",
  "Found Stock",
  "Transfer Correction",
  "Other",
] as const;

export const ISSUE_TYPE_OPTIONS: { label: string; value: IssueType }[] = [
  { label: "Cutting Issue", value: "CUTTING" },
  { label: "Printing Issue", value: "PRINTING" },
  { label: "Stitching Issue", value: "STITCHING" },
  { label: "Finishing Issue", value: "FINISHING" },
  { label: "Sample Issue", value: "SAMPLE" },
  { label: "Pattern Issue", value: "PATTERN" },
];

export function getIssueTypeLabel(type: IssueType): string {
  return ISSUE_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? type;
}

export function getUnitLabel(unit: ProductUnit): string {
  if (unit === "KG") return "kg";
  if (unit === "PCS") return "pcs";
  if (unit === "METERS") return "meters";
  return "rolls";
}

export function generateNextIssueNumber(existing: IssueRecord[]): string {
  const max = existing.reduce((acc, item) => {
    const match = item.issueNumber.match(/ISS-?(?:2024-)?(\d+)/);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 40);
  return `ISS-2024-${String(max + 1).padStart(3, "0")}`;
}

export function generateNextBundleNumber(existing: IssueRecord[]): string {
  const max = existing.reduce((acc, item) => {
    const match = item.bundleNumber.match(/BND-?(?:2024-)?(\d+)/);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 40);
  return `BND-2024-${String(max + 1).padStart(3, "0")}`;
}

export function generateNextWastageNumber(existing: MockWastageEntry[]): string {
  const max = existing.reduce((acc, item) => {
    const match = item.entryNumber.match(/CW-(\d+)/);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `CW-${String(max + 1).padStart(3, "0")}`;
}

export const mockKarigarParties: Party[] = [
  karigar("Abdul Textile Mills (Karigar)", "k-abdul"),
  karigar("Mohammed Cutter", "k-mohammed"),
  karigar("Raju Printer", "k-raju"),
  ...mockParties.filter((party) => party.type === "KARIGAR"),
];

export interface MockLinkedPOOption {
  id: string;
  label: string;
  poNumber: string;
  designs: { id: string; designNumber: string }[];
}

// TODO: Replace with TanStack Query API call
// Service: src/services/inventory.service.ts
// Query key: QUERY_KEYS.PURCHASE_ORDERS
export const mockLinkedPOOptions: MockLinkedPOOption[] = [
  {
    id: "po-summer",
    label: "PO-8829-X (Summer Collection)",
    poNumber: "PO-8829-X",
    designs: [
      { id: "poi-floral", designNumber: "DSN-FLORAL-202" },
      { id: "poi-summer-2", designNumber: "DSN-SUMMER-110" },
    ],
  },
  ...mockPurchaseOrders.map((order) => ({
    id: order.id,
    label: `${order.poNumber}${order.buyer?.name ? ` (${order.buyer.name})` : ""}`,
    poNumber: order.poNumber,
    designs: (order.items ?? []).map((item) => ({
      id: item.id,
      designNumber: item.designNumber,
    })),
  })),
];
