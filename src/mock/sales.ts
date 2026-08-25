import type { Party, PurchaseOrder, SalesBill, SalesBillItem } from "@/types";
import { mockParties } from "@/mock/masters";
import { mockPurchaseOrders } from "@/mock/purchaseOrders";
import { mockContainers } from "@/mock/boxing";

export type NoteType = "CREDIT" | "DEBIT";

export interface MockSalesPayment {
  id: string;
  salesBillId: string;
  date: string;
  method: string;
  amount: number;
  referenceNo: string;
  processedBy: string;
  status: "SUCCESS" | "PENDING";
}

export interface MockSalesBill extends SalesBill {
  containerNo: string;
  buyerPoReference: string;
  paymentTerms?: string;
  shippingDestination?: string;
  totalPieces: number;
  amountReceived: number;
  payments: MockSalesPayment[];
  billingAddress: string;
  internalNote?: string;
}

export interface MockCreditDebitNote {
  id: string;
  noteNumber: string;
  type: NoteType;
  salesBillId: string;
  invoiceNumber: string;
  buyerId: string;
  buyerName: string;
  date: string;
  amount: number;
  reason: string;
}

export interface MockSalesRegisterRow {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  buyerName: string;
  poNumber: string;
  totalPieces: number;
  netAmount: number;
  amountReceived: number;
  outstanding: number;
  paymentStatus: "PAID" | "PENDING";
}

export interface FinishedStockBySize {
  designNumber: string;
  color: string;
  size: string;
  available: number;
}

function buyer(id: string): Party {
  return mockParties.find((p) => p.id === id) ?? mockParties[0];
}

function po(id: string): PurchaseOrder {
  return mockPurchaseOrders.find((p) => p.id === id) ?? mockPurchaseOrders[0];
}

// TODO: Replace with TanStack Query API call
// Service: src/services/sales.service.ts
// Query key: QUERY_KEYS.SALES_BILLS
export const mockFinishedStockBySize: FinishedStockBySize[] = [
  { designNumber: "D-42", color: "White", size: "0-3M", available: 320 },
  { designNumber: "D-42", color: "White", size: "3-6M", available: 280 },
  { designNumber: "D-42", color: "White", size: "6-9M", available: 250 },
  { designNumber: "D-42", color: "White", size: "9-12M", available: 200 },
  { designNumber: "D-43", color: "Blue", size: "9-12M", available: 90 },
  { designNumber: "D-43", color: "Blue", size: "0-3M", available: 150 },
  { designNumber: "D-41", color: "White", size: "0-3M", available: 180 },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/sales.service.ts
// Query key: QUERY_KEYS.SALES_BILLS
export const mockSalesBills: MockSalesBill[] = [
  {
    id: "sb-1",
    invoiceNumber: "INV-2024-001",
    poId: "po-1",
    po: po("po-1"),
    buyerId: "party-1",
    buyer: buyer("party-1"),
    invoiceDate: "2024-01-20",
    paymentTerms: "CIF, 60 Days",
    shippingDestination: "Dubai, UAE",
    currency: "USD",
    exchangeRate: 83.14,
    subTotal: 384000,
    gstAmount: 0,
    netTotal: 384000,
    status: "PAID",
    containerNo: "CTN-001",
    buyerPoReference: "AR/2024/001",
    totalPieces: 2950,
    amountReceived: 384000,
    billingAddress: "Suit 402, Al Reem Tower, Deira, Dubai, UAE",
    payments: [
      {
        id: "pay-1",
        salesBillId: "sb-1",
        date: "2024-01-22",
        method: "Wire Transfer",
        amount: 384000,
        referenceNo: "WT-AR-001",
        processedBy: "Raj Sharma",
        status: "SUCCESS",
      },
    ],
    items: [
      {
        id: "sbi-1",
        salesBillId: "sb-1",
        designNumber: "D-42",
        garmentType: "Premium Twill Fabric - Navy Blue",
        color: "Navy",
        size: "—",
        quantity: 1200,
        ratePerPiece: 120,
        amount: 144000,
      },
      {
        id: "sbi-2",
        salesBillId: "sb-1",
        designNumber: "D-41",
        garmentType: "Egyptian Cotton Blend - White",
        color: "White",
        size: "—",
        quantity: 800,
        ratePerPiece: 150,
        amount: 120000,
      },
      {
        id: "sbi-3",
        salesBillId: "sb-1",
        designNumber: "THR-01",
        garmentType: "Industrial Stitching Thread - Black",
        color: "Black",
        size: "—",
        quantity: 500,
        ratePerPiece: 60,
        amount: 30000,
      },
      {
        id: "sbi-4",
        salesBillId: "sb-1",
        designNumber: "CNV-01",
        garmentType: "Reinforced Canvas Linings",
        color: "Natural",
        size: "—",
        quantity: 450,
        ratePerPiece: 200,
        amount: 90000,
      },
    ],
  },
  {
    id: "sb-2",
    invoiceNumber: "INV-2024-002",
    poId: "po-2",
    po: po("po-2"),
    buyerId: "party-2",
    buyer: buyer("party-2"),
    invoiceDate: "2024-10-12",
    paymentTerms: "CIF, 60 Days",
    shippingDestination: "Dubai, UAE",
    currency: "USD",
    exchangeRate: 83.14,
    subTotal: 420000,
    gstAmount: 0,
    netTotal: 420000,
    status: "PAID",
    containerNo: "CTN-002",
    buyerPoReference: "BW/2024/UAE-09",
    totalPieces: 4200,
    amountReceived: 420000,
    billingAddress: "Office 12, Business Bay, Dubai, UAE",
    payments: [
      {
        id: "pay-2",
        salesBillId: "sb-2",
        date: "2024-10-20",
        method: "Wire Transfer",
        amount: 420000,
        referenceNo: "WT-BW-002",
        processedBy: "Raj Sharma",
        status: "SUCCESS",
      },
    ],
    items: [],
  },
  {
    id: "sb-3",
    invoiceNumber: "INV-2024-003",
    poId: "po-1",
    po: po("po-1"),
    buyerId: "party-1",
    buyer: buyer("party-1"),
    invoiceDate: "2024-10-15",
    paymentTerms: "CIF, 60 Days",
    shippingDestination: "Dubai, UAE",
    currency: "USD",
    exchangeRate: 83.14,
    subTotal: 280000,
    gstAmount: 0,
    netTotal: 280000,
    status: "SUBMITTED",
    containerNo: "CTN-003",
    buyerPoReference: "AR/2024/003",
    totalPieces: 2100,
    amountReceived: 0,
    billingAddress: "Suit 402, Al Reem Tower, Deira, Dubai, UAE",
    payments: [],
    items: [],
  },
  {
    id: "sb-4",
    invoiceNumber: "INV-2024-004",
    poId: "po-3",
    po: po("po-3"),
    buyerId: mockParties[0]?.id ?? "party-1",
    buyer: buyer(mockParties[0]?.id ?? "party-1"),
    invoiceDate: "2024-10-18",
    paymentTerms: "LC at Sight / 60 Days",
    shippingDestination: "Stockholm, SE",
    currency: "USD",
    exchangeRate: 83.14,
    subTotal: 41000,
    gstAmount: 0,
    netTotal: 41000,
    status: "DRAFT",
    containerNo: "MSCU-99210-4",
    buyerPoReference: "Ref: SE-291-K",
    totalPieces: 500,
    amountReceived: 0,
    billingAddress: "Nordic Apparel Group AB, Stockholm",
    payments: [],
    items: [],
  },
  {
    id: "sb-5",
    invoiceNumber: "INV-2024-005",
    poId: "po-2",
    po: po("po-2"),
    buyerId: "party-2",
    buyer: buyer("party-2"),
    invoiceDate: "2024-09-28",
    paymentTerms: "CIF, 60 Days",
    shippingDestination: "Dubai, UAE",
    currency: "USD",
    exchangeRate: 83.0,
    subTotal: 195000,
    gstAmount: 0,
    netTotal: 195000,
    status: "SUBMITTED",
    containerNo: "CTN-004",
    buyerPoReference: "BW/2024/UAE-12",
    totalPieces: 1800,
    amountReceived: 50000,
    billingAddress: "Office 12, Business Bay, Dubai, UAE",
    payments: [],
    items: [],
  },
  {
    id: "sb-6",
    invoiceNumber: "INV-2024-006",
    poId: "po-4",
    po: po("po-4"),
    buyerId: "party-1",
    buyer: buyer("party-1"),
    invoiceDate: "2024-08-10",
    paymentTerms: "CIF, 60 Days",
    shippingDestination: "Dubai, UAE",
    currency: "USD",
    exchangeRate: 82.5,
    subTotal: 150000,
    gstAmount: 0,
    netTotal: 150000,
    status: "RETURNED",
    containerNo: "CTN-005",
    buyerPoReference: "AR/2024/008",
    totalPieces: 1200,
    amountReceived: 0,
    billingAddress: "Suit 402, Al Reem Tower, Deira, Dubai, UAE",
    payments: [],
    items: [],
  },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/sales.service.ts
// Query key: QUERY_KEYS.SALES_NOTES
export const mockCreditDebitNotes: MockCreditDebitNote[] = [
  {
    id: "note-1",
    noteNumber: "CN-2024-001",
    type: "CREDIT",
    salesBillId: "sb-1",
    invoiceNumber: "INV-2024-001",
    buyerId: "party-1",
    buyerName: "Al Reem Trading",
    date: "2024-01-28",
    amount: 12000,
    reason: "Short shipment adjustment for size mix variance on D-42.",
  },
  {
    id: "note-2",
    noteNumber: "DN-2024-001",
    type: "DEBIT",
    salesBillId: "sb-2",
    invoiceNumber: "INV-2024-002",
    buyerId: "party-2",
    buyerName: "Baby World LLC",
    date: "2024-10-22",
    amount: 8500,
    reason: "Additional freight surcharge billed to buyer as agreed.",
  },
  {
    id: "note-3",
    noteNumber: "CN-2024-002",
    type: "CREDIT",
    salesBillId: "sb-3",
    invoiceNumber: "INV-2024-003",
    buyerId: "party-1",
    buyerName: "Al Reem Trading",
    date: "2024-10-25",
    amount: 5000,
    reason: "Quality claim settlement for rejected pieces batch.",
  },
];

export function getStockForItem(
  designNumber: string,
  color: string,
  size: string
): number {
  const match = mockFinishedStockBySize.find(
    (item) =>
      item.designNumber === designNumber &&
      item.color.toLowerCase() === color.toLowerCase() &&
      item.size === size
  );
  return match?.available ?? 0;
}

export function generateNextInvoiceNumber(existing: MockSalesBill[]): string {
  const max = existing.reduce((acc, bill) => {
    const match = bill.invoiceNumber.match(/INV-2024-(\d+)/);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `INV-2024-${String(max + 1).padStart(3, "0")}`;
}

export function generateNextNoteNumber(
  existing: MockCreditDebitNote[],
  type: NoteType
): string {
  const prefix = type === "CREDIT" ? "CN" : "DN";
  const max = existing.reduce((acc, note) => {
    if (note.type !== type) return acc;
    const match = note.noteNumber.match(new RegExp(`${prefix}-2024-(\\d+)`));
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `${prefix}-2024-${String(max + 1).padStart(3, "0")}`;
}

export function buildRegisterRows(bills: MockSalesBill[]): MockSalesRegisterRow[] {
  return bills
    .filter((bill) => bill.status !== "DRAFT")
    .map((bill) => ({
      id: bill.id,
      invoiceNumber: bill.invoiceNumber,
      invoiceDate: bill.invoiceDate,
      buyerName: bill.buyer.name,
      poNumber: bill.po.poNumber,
      totalPieces: bill.totalPieces,
      netAmount: bill.netTotal,
      amountReceived: bill.amountReceived,
      outstanding: Math.max(0, bill.netTotal - bill.amountReceived),
      paymentStatus:
        bill.amountReceived >= bill.netTotal ? "PAID" : "PENDING",
    }));
}

export function poItemsToBillDraftItems(
  poId: string
): Omit<SalesBillItem, "id" | "salesBillId" | "quantity" | "ratePerPiece" | "amount">[] {
  const order = mockPurchaseOrders.find((item) => item.id === poId);
  if (!order?.items?.length) return [];

  const rows: Omit<
    SalesBillItem,
    "id" | "salesBillId" | "quantity" | "ratePerPiece" | "amount"
  >[] = [];

  const sizeMap: { key: keyof typeof order.items[0]; label: string }[] = [
    { key: "qty_0_3M", label: "0-3M" },
    { key: "qty_3_6M", label: "3-6M" },
    { key: "qty_6_9M", label: "6-9M" },
    { key: "qty_9_12M", label: "9-12M" },
    { key: "qty_12_18M", label: "12-18M" },
    { key: "qty_18_24M", label: "18-24M" },
  ];

  for (const item of order.items) {
    for (const size of sizeMap) {
      const qty = item[size.key] as number;
      if (qty > 0) {
        rows.push({
          designNumber: item.designNumber,
          garmentType: item.garmentType,
          color: item.color,
          size: size.label,
        });
      }
    }
  }

  return rows;
}

export const salesContainers = mockContainers.map((ctn) => ({
  id: ctn.id,
  containerNumber: ctn.containerNumber,
  poId: ctn.poId,
}));

export const salesBuyers = mockParties.filter((p) => p.type === "BUYER");
