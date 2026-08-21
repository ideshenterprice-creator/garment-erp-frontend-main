import type { KarigarPayment, Operation, Party } from "@/types";
import { mockOperations, mockParties } from "@/mock/masters";
import { mockPurchaseOrders } from "@/mock/purchaseOrders";

export type SupplierPaymentStatus = "PAID" | "PARTIAL" | "UNPAID";
export type VoucherType = "PAYMENT" | "RECEIPT";

export interface MockKarigarPayment extends KarigarPayment {
  notes?: string;
}

export interface MockSupplierPayment {
  id: string;
  billNo: string;
  supplierId: string;
  supplierName: string;
  billDate: string;
  billAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: SupplierPaymentStatus;
  payments: {
    id: string;
    date: string;
    mode: string;
    referenceNo: string;
    amount: number;
    notes?: string;
  }[];
}

export interface MockVoucher {
  id: string;
  voucherNumber: string;
  date: string;
  type: VoucherType;
  partyDescription: string;
  amount: number;
  paymentMode: string;
  referenceNo: string;
  notes?: string;
}

export interface MockStatementTxn {
  id: string;
  date: string;
  description: string;
  refNo: string;
  debit: number;
  credit: number;
}

function karigar(id: string, overrides?: Partial<Party>): Party {
  const base = mockParties.find((p) => p.id === id) ?? mockParties[5];
  return { ...base, type: "KARIGAR", ...overrides };
}

function operation(id: string, overrides?: Partial<Operation>): Operation {
  const base = mockOperations.find((op) => op.id === id) ?? mockOperations[0];
  return { ...base, ...overrides };
}

// TODO: Replace with TanStack Query API call
// Service: src/services/accounts.service.ts
// Query key: QUERY_KEYS.KARIGAR_PAYMENTS
export const mockKarigarPayments: MockKarigarPayment[] = [
  {
    id: "kp-1",
    paymentNumber: "PAY-8821",
    karigarId: "party-extra-1",
    karigar: karigar("party-6", { id: "party-extra-1", name: "Arjun Kumar" }),
    poId: "po-1",
    operationId: "op-7",
    operation: operation("op-7", { name: "Single Needle Stitch", ratePerPiece: 12 }),
    productionEntryType: "STITCHING",
    piecesCompleted: 240,
    ratePerPiece: 12,
    amountDue: 2880,
    weekNumber: 42,
    year: 2024,
    status: "PENDING",
    paidAt: null,
    paymentMode: "",
    referenceNo: "",
  },
  {
    id: "kp-2",
    paymentNumber: "PAY-8820",
    karigarId: "party-6",
    karigar: karigar("party-6"),
    poId: "po-2",
    operationId: "op-5",
    operation: operation("op-5", { name: "Overlock Stitch", ratePerPiece: 1 }),
    productionEntryType: "STITCHING",
    piecesCompleted: 418,
    ratePerPiece: 1,
    amountDue: 418,
    weekNumber: 42,
    year: 2024,
    status: "PENDING",
    paidAt: null,
    paymentMode: "",
    referenceNo: "",
  },
  {
    id: "kp-3",
    paymentNumber: "PAY-8819",
    karigarId: "party-7",
    karigar: karigar("party-7"),
    poId: "po-1",
    operationId: "op-6",
    operation: operation("op-6", { name: "Flatlock", ratePerPiece: 8 }),
    productionEntryType: "STITCHING",
    piecesCompleted: 320,
    ratePerPiece: 8,
    amountDue: 2560,
    weekNumber: 42,
    year: 2024,
    status: "PENDING",
    paidAt: null,
    paymentMode: "",
    referenceNo: "",
  },
  {
    id: "kp-4",
    paymentNumber: "PAY-8818",
    karigarId: "party-6",
    karigar: karigar("party-6"),
    poId: "po-3",
    operationId: "op-9",
    operation: operation("op-9", { name: "Thread Cutting", ratePerPiece: 2 }),
    productionEntryType: "FINISHING",
    piecesCompleted: 500,
    ratePerPiece: 2,
    amountDue: 1000,
    weekNumber: 41,
    year: 2024,
    status: "PAID",
    paidAt: "2024-05-18",
    paymentMode: "UPI",
    referenceNo: "UPI-4412901",
  },
  {
    id: "kp-5",
    paymentNumber: "PAY-8817",
    karigarId: "party-7",
    karigar: karigar("party-7"),
    poId: "po-2",
    operationId: "op-5",
    operation: operation("op-5", { name: "Overlock", ratePerPiece: 4.5 }),
    productionEntryType: "STITCHING",
    piecesCompleted: 600,
    ratePerPiece: 4.5,
    amountDue: 2700,
    weekNumber: 41,
    year: 2024,
    status: "PAID",
    paidAt: "2024-05-15",
    paymentMode: "Cash",
    referenceNo: "",
  },
  {
    id: "kp-6",
    paymentNumber: "PAY-8816",
    karigarId: "party-extra-1",
    karigar: karigar("party-6", { id: "party-extra-1", name: "Arjun Kumar" }),
    poId: "po-4",
    operationId: "op-10",
    operation: operation("op-10", { name: "Ironing & Pack", ratePerPiece: 3 }),
    productionEntryType: "FINISHING",
    piecesCompleted: 280,
    ratePerPiece: 3,
    amountDue: 840,
    weekNumber: 42,
    year: 2024,
    status: "PENDING",
    paidAt: null,
    paymentMode: "",
    referenceNo: "",
  },
  {
    id: "kp-7",
    paymentNumber: "PAY-8815",
    karigarId: "party-6",
    karigar: karigar("party-6"),
    poId: "po-1",
    operationId: "op-4",
    operation: operation("op-4", { name: "Fabric Dyeing", ratePerPiece: 6 }),
    productionEntryType: "COLORING",
    piecesCompleted: 150,
    ratePerPiece: 6,
    amountDue: 900,
    weekNumber: 40,
    year: 2024,
    status: "PAID",
    paidAt: "2024-05-10",
    paymentMode: "Bank Transfer",
    referenceNo: "NEFT-99210",
  },
  {
    id: "kp-8",
    paymentNumber: "PAY-8814",
    karigarId: "party-7",
    karigar: karigar("party-7"),
    poId: "po-2",
    operationId: "op-7",
    operation: operation("op-7", { name: "Lock Stitch", ratePerPiece: 5 }),
    productionEntryType: "STITCHING",
    piecesCompleted: 236,
    ratePerPiece: 5,
    amountDue: 1180,
    weekNumber: 42,
    year: 2024,
    status: "PENDING",
    paidAt: null,
    paymentMode: "",
    referenceNo: "",
  },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/accounts.service.ts
// Query key: QUERY_KEYS.SUPPLIER_PAYMENTS
export const mockSupplierPayments: MockSupplierPayment[] = [
  {
    id: "sp-1",
    billNo: "PB-001",
    supplierId: "party-4",
    supplierName: "Sunrise Textiles",
    billDate: "2024-01-20",
    billAmount: 189000,
    amountPaid: 189000,
    balanceDue: 0,
    status: "PAID",
    payments: [
      {
        id: "spp-1",
        date: "2024-01-22",
        mode: "Bank Transfer",
        referenceNo: "TXN-8821",
        amount: 189000,
      },
    ],
  },
  {
    id: "sp-2",
    billNo: "PB-003",
    supplierId: "party-5",
    supplierName: "Mehta Fabrics",
    billDate: "2024-02-08",
    billAmount: 126000,
    amountPaid: 63000,
    balanceDue: 63000,
    status: "PARTIAL",
    payments: [
      {
        id: "spp-2",
        date: "2024-02-10",
        mode: "Bank Transfer",
        referenceNo: "TXN-9102",
        amount: 63000,
      },
    ],
  },
  {
    id: "sp-3",
    billNo: "PB-004",
    supplierId: "party-8",
    supplierName: "Anwar Thread House",
    billDate: "2024-02-10",
    billAmount: 66000,
    amountPaid: 0,
    balanceDue: 66000,
    status: "UNPAID",
    payments: [],
  },
  {
    id: "sp-4",
    billNo: "PB-005",
    supplierId: "party-4",
    supplierName: "Sunrise Textiles",
    billDate: "2024-02-12",
    billAmount: 45000,
    amountPaid: 0,
    balanceDue: 45000,
    status: "UNPAID",
    payments: [],
  },
  {
    id: "sp-5",
    billNo: "PB-006",
    supplierId: "party-5",
    supplierName: "Mehta Fabrics",
    billDate: "2024-01-28",
    billAmount: 98000,
    amountPaid: 98000,
    balanceDue: 0,
    status: "PAID",
    payments: [
      {
        id: "spp-3",
        date: "2024-01-30",
        mode: "UPI",
        referenceNo: "UPI-7781",
        amount: 98000,
      },
    ],
  },
  {
    id: "sp-6",
    billNo: "PB-007",
    supplierId: "party-8",
    supplierName: "Anwar Thread House",
    billDate: "2024-02-05",
    billAmount: 52000,
    amountPaid: 20000,
    balanceDue: 32000,
    status: "PARTIAL",
    payments: [
      {
        id: "spp-4",
        date: "2024-02-06",
        mode: "Cash",
        referenceNo: "",
        amount: 20000,
      },
    ],
  },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/accounts.service.ts
// Query key: QUERY_KEYS.VOUCHERS
export const mockVouchers: MockVoucher[] = [
  {
    id: "vch-1",
    voucherNumber: "VCH-001",
    date: "2024-01-15",
    type: "PAYMENT",
    partyDescription: "Electricity Bill",
    amount: 8200,
    paymentMode: "Bank Transfer",
    referenceNo: "NEFT-001",
  },
  {
    id: "vch-2",
    voucherNumber: "VCH-002",
    date: "2024-01-22",
    type: "RECEIPT",
    partyDescription: "Al Reem Trading",
    amount: 384000,
    paymentMode: "Wire Transfer",
    referenceNo: "WT-AR-001",
  },
  {
    id: "vch-3",
    voucherNumber: "VCH-003",
    date: "2024-01-25",
    type: "PAYMENT",
    partyDescription: "Factory Rent",
    amount: 45000,
    paymentMode: "Bank Transfer",
    referenceNo: "NEFT-088",
  },
  {
    id: "vch-4",
    voucherNumber: "VCH-004",
    date: "2024-02-01",
    type: "RECEIPT",
    partyDescription: "Baby World LLC",
    amount: 50000,
    paymentMode: "Wire Transfer",
    referenceNo: "WT-BW-004",
  },
  {
    id: "vch-5",
    voucherNumber: "VCH-005",
    date: "2024-02-05",
    type: "PAYMENT",
    partyDescription: "Staff Advance — Cutting Floor",
    amount: 12000,
    paymentMode: "Cash",
    referenceNo: "—",
  },
  {
    id: "vch-6",
    voucherNumber: "VCH-006",
    date: "2024-02-08",
    type: "PAYMENT",
    partyDescription: "Courier & Logistics",
    amount: 6400,
    paymentMode: "UPI",
    referenceNo: "UPI-5521",
  },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/accounts.service.ts
// Query key: QUERY_KEYS.ACCOUNT_STATEMENT
export const mockStatementByParty: Record<string, MockStatementTxn[]> = {
  "party-1": [
    {
      id: "st-1",
      date: "2024-01-20",
      description: "Sales Invoice",
      refNo: "INV-2024-001",
      debit: 384000,
      credit: 0,
    },
    {
      id: "st-2",
      date: "2024-01-22",
      description: "Payment received",
      refNo: "VCH-002",
      debit: 0,
      credit: 384000,
    },
    {
      id: "st-3",
      date: "2024-01-25",
      description: "Credit Note",
      refNo: "CN-001",
      debit: 0,
      credit: 8000,
    },
    {
      id: "st-4",
      date: "2024-01-28",
      description: "Debit Note",
      refNo: "DN-001",
      debit: 2400,
      credit: 0,
    },
    {
      id: "st-5",
      date: "2024-02-01",
      description: "Sales Invoice",
      refNo: "INV-2024-002",
      debit: 16000,
      credit: 0,
    },
    {
      id: "st-6",
      date: "2024-02-05",
      description: "Partial payment",
      refNo: "VCH-008",
      debit: 0,
      credit: 5000,
    },
    {
      id: "st-7",
      date: "2024-02-10",
      description: "Sales Invoice",
      refNo: "INV-2024-003",
      debit: 12000,
      credit: 0,
    },
    {
      id: "st-8",
      date: "2024-02-15",
      description: "Payment received",
      refNo: "VCH-012",
      debit: 0,
      credit: 1400,
    },
  ],
};

export const accountsKarigars = Array.from(
  new Map(mockKarigarPayments.map((p) => [p.karigarId, p.karigar])).values()
);

export const accountsPOs = mockPurchaseOrders.map((po) => ({
  id: po.id,
  poNumber: po.poNumber,
}));

export const accountsSuppliers = Array.from(
  new Map(
    mockSupplierPayments.map((p) => [
      p.supplierId,
      { id: p.supplierId, name: p.supplierName },
    ])
  ).values()
);

export const accountsParties = mockParties;

export function poNumberForId(poId: string): string {
  return mockPurchaseOrders.find((po) => po.id === poId)?.poNumber ?? poId;
}

export function generateNextVoucherNumber(existing: MockVoucher[]): string {
  const max = existing.reduce((acc, v) => {
    const match = v.voucherNumber.match(/VCH-(\d+)/);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `VCH-${String(max + 1).padStart(3, "0")}`;
}

export function buildRunningBalances(txns: MockStatementTxn[]) {
  let balance = 0;
  return txns.map((txn) => {
    balance += txn.debit - txn.credit;
    return { ...txn, balance };
  });
}
