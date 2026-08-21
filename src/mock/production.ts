import type { BundleStage, Party, PaymentStatus } from "@/types";
import { mockParties } from "@/mock/masters";
import { mockPurchaseOrders } from "@/mock/purchaseOrders";

export type ProductionStageTab =
  | "CUTTING"
  | "PRINTING"
  | "COLORING"
  | "STITCHING"
  | "FINISHING";

export type SizeQtyKey =
  | "qty_0_3M"
  | "qty_3_6M"
  | "qty_6_9M"
  | "qty_9_12M"
  | "qty_12_18M"
  | "qty_18_24M";

export type SizeBreakdown = Record<SizeQtyKey, number>;

export type JourneyStageStatus = "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED";

export type StitchingEntryStatus = "RETURNED" | "IN_PROGRESS" | "PENDING";

export interface MockCuttingEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  poId: string;
  poNumber: string;
  designNumber: string;
  designLabel: string;
  bundleNumber: string;
  fabricKg: number;
  pieces: number;
  sizes: SizeBreakdown;
  wastageKg: number;
  karigarId: string;
  karigarName: string;
  ratePerPiece: number;
  amountDue: number;
}

export interface MockPrintingEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  poId: string;
  poNumber: string;
  designNumber: string;
  bundleNumber: string;
  piecesReceived: number;
  piecesReturned: number;
  piecesRejected: number;
  karigarId: string;
  karigarName: string;
  ratePerPiece: number;
  amountDue: number;
}

export interface MockColoringEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  poId: string;
  poNumber: string;
  designNumber: string;
  bundleNumber: string;
  piecesReceived: number;
  colorApplied: string;
  colorHex: string;
  piecesReturned: number;
  piecesRejected: number;
  karigarId: string;
  karigarName: string;
  ratePerPiece: number;
  amountDue: number;
}

export interface MockStitchingEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  poId: string;
  poNumber: string;
  designNumber: string;
  bundleNumber: string;
  karigarId: string;
  karigarName: string;
  operationId: string;
  operationName: string;
  piecesGiven: number;
  piecesReturned: number;
  piecesRejected: number;
  ratePerPiece: number;
  amountDue: number;
  status: StitchingEntryStatus;
}

export interface MockFinishingEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  poId: string;
  poNumber: string;
  designNumber: string;
  bundleNumber: string;
  piecesReceived: number;
  operationId: string;
  operationName: string;
  piecesCompleted: number;
  karigarId: string;
  karigarName: string;
  ratePerPiece: number;
  amountDue: number;
}

export interface BundleJourneyStage {
  stage: string;
  status: JourneyStageStatus;
  summary: string;
  dateLabel: string;
  subItems?: { label: string; summary: string }[];
}

export interface BundlePaymentRow {
  id: string;
  karigarName: string;
  operationName: string;
  pieces: number;
  ratePerPiece: number;
  amount: number;
  status: PaymentStatus;
}

export interface MockBundleRecord {
  id: string;
  bundleNumber: string;
  poId: string;
  poNumber: string;
  designNumber: string;
  garmentType: string;
  color: string;
  currentStage: BundleStage;
  status: "IN_PROGRESS" | "COMPLETED" | "READY_FOR_BOXING";
  totalPieces: number;
  fabricIssuedKg: number;
  wastageKg: number;
  sizes: SizeBreakdown;
  createdAt: string;
  journey: BundleJourneyStage[];
  payments: BundlePaymentRow[];
}

export interface ProductionOperationRate {
  id: string;
  name: string;
  stage: ProductionStageTab;
  ratePerPiece: number;
}

export interface ProductionFilters {
  poId: string;
  dateFrom: string;
  dateTo: string;
  karigarId: string;
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

export const emptySizeBreakdown = (): SizeBreakdown => ({
  qty_0_3M: 0,
  qty_3_6M: 0,
  qty_6_9M: 0,
  qty_9_12M: 0,
  qty_12_18M: 0,
  qty_18_24M: 0,
});

export function sumSizeBreakdown(sizes: SizeBreakdown): number {
  return (
    sizes.qty_0_3M +
    sizes.qty_3_6M +
    sizes.qty_6_9M +
    sizes.qty_9_12M +
    sizes.qty_12_18M +
    sizes.qty_18_24M
  );
}

// TODO: Replace with TanStack Query API call
// Service: src/services/production.service.ts
// Query key: QUERY_KEYS.PRODUCTION
export const productionOperationRates: ProductionOperationRate[] = [
  { id: "prod-op-cut", name: "Fabric Cutting", stage: "CUTTING", ratePerPiece: 0.75 },
  { id: "prod-op-print", name: "Screen Printing", stage: "PRINTING", ratePerPiece: 2.0 },
  { id: "prod-op-color", name: "Coloring", stage: "COLORING", ratePerPiece: 1.2 },
  { id: "prod-op-side", name: "Side Seam", stage: "STITCHING", ratePerPiece: 0.55 },
  { id: "prod-op-sleeve", name: "Sleeve Attach", stage: "STITCHING", ratePerPiece: 0.6 },
  { id: "prod-op-collar", name: "Collar Prep", stage: "STITCHING", ratePerPiece: 0.45 },
  { id: "prod-op-overlock", name: "Overlock", stage: "STITCHING", ratePerPiece: 1.0 },
  { id: "prod-op-bottom", name: "Bottom Hem", stage: "STITCHING", ratePerPiece: 0.5 },
  { id: "prod-op-flatlock", name: "Flatlock", stage: "STITCHING", ratePerPiece: 0.55 },
  { id: "prod-op-lock", name: "Lock Stitch", stage: "STITCHING", ratePerPiece: 0.35 },
  { id: "prod-op-iron", name: "Ironing", stage: "FINISHING", ratePerPiece: 0.3 },
  { id: "prod-op-poly", name: "Poly Packing", stage: "FINISHING", ratePerPiece: 0.25 },
  { id: "prod-op-gift", name: "Gift Packing", stage: "FINISHING", ratePerPiece: 0.4 },
  { id: "prod-op-hanger", name: "Hanger Attachment", stage: "FINISHING", ratePerPiece: 0.2 },
];

export const mockProductionKarigars: Party[] = [
  karigar("Imran Ali", "k-imran"),
  karigar("Raju Printer", "k-raju"),
  karigar("Anwar Colorist", "k-anwar"),
  karigar("Rashid Ali", "k-rashid"),
  karigar("Mohd. Salim", "k-salim"),
  karigar("Anita Finishing", "k-anita"),
  karigar("Amit Sharma", "k-amit"),
  karigar("Vinod Gupta (Printer Expert)", "k-vinod"),
  karigar("Amit Kumar", "k-amit-k"),
  karigar("Mohammad Salim", "k-mohammad"),
  ...mockParties.filter((party) => party.type === "KARIGAR"),
];

export const mockProductionPOs = mockPurchaseOrders.map((po) => ({
  id: po.id,
  poNumber: po.poNumber,
  label: `${po.poNumber}${po.buyer?.name ? ` (${po.buyer.name})` : ""}`,
  designs: (po.items ?? []).map((item) => ({
    id: item.id,
    designNumber: item.designNumber,
    garmentType: item.garmentType,
    color: item.color,
  })),
}));

// TODO: Replace with TanStack Query API call
// Service: src/services/production.service.ts
// Query key: QUERY_KEYS.PRODUCTION
export const mockCuttingEntries: MockCuttingEntry[] = [
  {
    id: "ce-1",
    entryNumber: "CE-8821",
    entryDate: "2023-10-24",
    poId: "po-1",
    poNumber: "PO-2023-45",
    designNumber: "D-42",
    designLabel: "Summer Cotton T",
    bundleNumber: "B-102",
    fabricKg: 120.5,
    pieces: 920,
    sizes: {
      qty_0_3M: 200,
      qty_3_6M: 400,
      qty_6_9M: 320,
      qty_9_12M: 0,
      qty_12_18M: 0,
      qty_18_24M: 0,
    },
    wastageKg: 18.2,
    karigarId: "k-imran",
    karigarName: "Imran Ali",
    ratePerPiece: 0.75,
    amountDue: 690,
  },
  {
    id: "ce-2",
    entryNumber: "CE-8822",
    entryDate: "2024-01-20",
    poId: "po-2",
    poNumber: "PO-2024-002",
    designNumber: "D-43",
    designLabel: "Baby Romper",
    bundleNumber: "BND-001",
    fabricKg: 98.4,
    pieces: 850,
    sizes: {
      qty_0_3M: 150,
      qty_3_6M: 200,
      qty_6_9M: 200,
      qty_9_12M: 150,
      qty_12_18M: 100,
      qty_18_24M: 50,
    },
    wastageKg: 12.5,
    karigarId: "k-amit",
    karigarName: "Amit Sharma",
    ratePerPiece: 0.75,
    amountDue: 637.5,
  },
  {
    id: "ce-3",
    entryNumber: "CE-8823",
    entryDate: "2024-01-21",
    poId: "po-1",
    poNumber: "PO-2024-001",
    designNumber: "D-41",
    designLabel: "Baby Bodysuit",
    bundleNumber: "BND-002",
    fabricKg: 110.0,
    pieces: 970,
    sizes: {
      qty_0_3M: 160,
      qty_3_6M: 180,
      qty_6_9M: 200,
      qty_9_12M: 150,
      qty_12_18M: 140,
      qty_18_24M: 140,
    },
    wastageKg: 1.25,
    karigarId: "k-amit",
    karigarName: "Amit Sharma",
    ratePerPiece: 0.75,
    amountDue: 727.5,
  },
  {
    id: "ce-4",
    entryNumber: "CE-8824",
    entryDate: "2024-01-22",
    poId: "po-3",
    poNumber: "PO-2024-003",
    designNumber: "D-55",
    designLabel: "Kids Jumper",
    bundleNumber: "BND-003",
    fabricKg: 75.2,
    pieces: 640,
    sizes: {
      qty_0_3M: 100,
      qty_3_6M: 120,
      qty_6_9M: 140,
      qty_9_12M: 120,
      qty_12_18M: 80,
      qty_18_24M: 80,
    },
    wastageKg: 8.4,
    karigarId: "k-imran",
    karigarName: "Imran Ali",
    ratePerPiece: 0.75,
    amountDue: 480,
  },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/production.service.ts
// Query key: QUERY_KEYS.PRODUCTION
export const mockPrintingEntries: MockPrintingEntry[] = [
  {
    id: "pr-1",
    entryNumber: "PR-001",
    entryDate: "2024-01-21",
    poId: "po-1",
    poNumber: "PO-2024-001",
    designNumber: "D-42",
    bundleNumber: "BND-001",
    piecesReceived: 980,
    piecesReturned: 978,
    piecesRejected: 2,
    karigarId: "k-raju",
    karigarName: "Raju Printer",
    ratePerPiece: 2.0,
    amountDue: 1956,
  },
  {
    id: "pr-2",
    entryNumber: "PR-002",
    entryDate: "2024-01-22",
    poId: "po-2",
    poNumber: "PO-2024-002",
    designNumber: "D-43",
    bundleNumber: "BND-002",
    piecesReceived: 970,
    piecesReturned: 965,
    piecesRejected: 5,
    karigarId: "k-vinod",
    karigarName: "Vinod Gupta (Printer Expert)",
    ratePerPiece: 2.0,
    amountDue: 1930,
  },
  {
    id: "pr-3",
    entryNumber: "PR-003",
    entryDate: "2024-01-23",
    poId: "po-1",
    poNumber: "PO-2024-001",
    designNumber: "D-41",
    bundleNumber: "BND-003",
    piecesReceived: 850,
    piecesReturned: 848,
    piecesRejected: 2,
    karigarId: "k-raju",
    karigarName: "Raju Printer",
    ratePerPiece: 2.0,
    amountDue: 1696,
  },
  {
    id: "pr-4",
    entryNumber: "PR-004",
    entryDate: "2024-01-24",
    poId: "po-3",
    poNumber: "PO-2024-003",
    designNumber: "D-55",
    bundleNumber: "BND-004",
    piecesReceived: 640,
    piecesReturned: 638,
    piecesRejected: 2,
    karigarId: "k-raju",
    karigarName: "Raju Printer",
    ratePerPiece: 2.0,
    amountDue: 1276,
  },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/production.service.ts
// Query key: QUERY_KEYS.PRODUCTION
export const mockColoringEntries: MockColoringEntry[] = [
  {
    id: "cl-1",
    entryNumber: "CL-001",
    entryDate: "2024-01-22",
    poId: "po-1",
    poNumber: "PO-2024-001",
    designNumber: "D-42",
    bundleNumber: "BND-001",
    piecesReceived: 978,
    colorApplied: "White",
    colorHex: "#ffffff",
    piecesReturned: 976,
    piecesRejected: 2,
    karigarId: "k-anwar",
    karigarName: "Anwar Colorist",
    ratePerPiece: 1.2,
    amountDue: 1171.2,
  },
  {
    id: "cl-2",
    entryNumber: "CL-002",
    entryDate: "2024-01-23",
    poId: "po-2",
    poNumber: "PO-2024-002",
    designNumber: "D-43",
    bundleNumber: "BND-002",
    piecesReceived: 965,
    colorApplied: "Blue",
    colorHex: "#2563eb",
    piecesReturned: 962,
    piecesRejected: 3,
    karigarId: "k-anwar",
    karigarName: "Anwar Colorist",
    ratePerPiece: 1.2,
    amountDue: 1154.4,
  },
  {
    id: "cl-3",
    entryNumber: "CL-003",
    entryDate: "2024-01-24",
    poId: "po-1",
    poNumber: "PO-2024-001",
    designNumber: "D-41",
    bundleNumber: "BND-003",
    piecesReceived: 848,
    colorApplied: "Yellow",
    colorHex: "#eab308",
    piecesReturned: 845,
    piecesRejected: 3,
    karigarId: "k-anwar",
    karigarName: "Anwar Colorist",
    ratePerPiece: 1.2,
    amountDue: 1014,
  },
  {
    id: "cl-4",
    entryNumber: "CL-004",
    entryDate: "2024-01-25",
    poId: "po-3",
    poNumber: "PO-2024-003",
    designNumber: "D-55",
    bundleNumber: "BND-004",
    piecesReceived: 638,
    colorApplied: "Pink",
    colorHex: "#ec4899",
    piecesReturned: 635,
    piecesRejected: 3,
    karigarId: "k-amit-k",
    karigarName: "Amit Kumar",
    ratePerPiece: 1.2,
    amountDue: 762,
  },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/production.service.ts
// Query key: QUERY_KEYS.PRODUCTION
export const mockStitchingEntries: MockStitchingEntry[] = [
  {
    id: "st-1",
    entryNumber: "ST-8821",
    entryDate: "2024-05-24",
    poId: "po-1",
    poNumber: "PO-1044",
    designNumber: "D-42",
    bundleNumber: "BNDL-004",
    karigarId: "k-rashid",
    karigarName: "Rashid Ali",
    operationId: "prod-op-side",
    operationName: "Side Seam",
    piecesGiven: 420,
    piecesReturned: 418,
    piecesRejected: 2,
    ratePerPiece: 0.55,
    amountDue: 229.9,
    status: "RETURNED",
  },
  {
    id: "st-2",
    entryNumber: "ST-8822",
    entryDate: "2024-05-24",
    poId: "po-2",
    poNumber: "PO-1045",
    designNumber: "D-43",
    bundleNumber: "BNDL-005",
    karigarId: "k-salim",
    karigarName: "Mohd. Salim",
    operationId: "prod-op-sleeve",
    operationName: "Sleeve Attach",
    piecesGiven: 400,
    piecesReturned: 400,
    piecesRejected: 0,
    ratePerPiece: 0.6,
    amountDue: 240,
    status: "RETURNED",
  },
  {
    id: "st-3",
    entryNumber: "ST-8823",
    entryDate: "2024-05-23",
    poId: "po-1",
    poNumber: "PO-1044",
    designNumber: "D-41",
    bundleNumber: "BNDL-006",
    karigarId: "k-rashid",
    karigarName: "Rashid Ali",
    operationId: "prod-op-collar",
    operationName: "Collar Prep",
    piecesGiven: 380,
    piecesReturned: 377,
    piecesRejected: 3,
    ratePerPiece: 0.45,
    amountDue: 169.65,
    status: "IN_PROGRESS",
  },
  {
    id: "st-4",
    entryNumber: "ST-8824",
    entryDate: "2024-05-22",
    poId: "po-3",
    poNumber: "PO-1046",
    designNumber: "D-55",
    bundleNumber: "BNDL-007",
    karigarId: "k-amit-k",
    karigarName: "Amit Kumar",
    operationId: "prod-op-overlock",
    operationName: "Overlock",
    piecesGiven: 420,
    piecesReturned: 418,
    piecesRejected: 2,
    ratePerPiece: 1.0,
    amountDue: 418,
    status: "RETURNED",
  },
  {
    id: "st-5",
    entryNumber: "ST-8825",
    entryDate: "2024-05-21",
    poId: "po-2",
    poNumber: "PO-1045",
    designNumber: "D-43",
    bundleNumber: "BNDL-008",
    karigarId: "k-salim",
    karigarName: "Mohd. Salim",
    operationId: "prod-op-bottom",
    operationName: "Bottom Hem",
    piecesGiven: 360,
    piecesReturned: 360,
    piecesRejected: 0,
    ratePerPiece: 0.5,
    amountDue: 180,
    status: "PENDING",
  },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/production.service.ts
// Query key: QUERY_KEYS.PRODUCTION
export const mockFinishingEntries: MockFinishingEntry[] = [
  {
    id: "fn-1",
    entryNumber: "FN-001",
    entryDate: "2024-01-25",
    poId: "po-1",
    poNumber: "PO-2024-001",
    designNumber: "D-42",
    bundleNumber: "BND-001",
    piecesReceived: 974,
    operationId: "prod-op-iron",
    operationName: "Ironing",
    piecesCompleted: 974,
    karigarId: "k-anita",
    karigarName: "Anita Finishing",
    ratePerPiece: 0.3,
    amountDue: 292.2,
  },
  {
    id: "fn-2",
    entryNumber: "FN-002",
    entryDate: "2024-01-25",
    poId: "po-1",
    poNumber: "PO-2024-001",
    designNumber: "D-42",
    bundleNumber: "BND-001",
    piecesReceived: 974,
    operationId: "prod-op-poly",
    operationName: "Poly Packing",
    piecesCompleted: 974,
    karigarId: "k-anita",
    karigarName: "Anita Finishing",
    ratePerPiece: 0.25,
    amountDue: 243.5,
  },
  {
    id: "fn-3",
    entryNumber: "FN-003",
    entryDate: "2024-01-26",
    poId: "po-2",
    poNumber: "PO-2024-002",
    designNumber: "D-43",
    bundleNumber: "BND-002",
    piecesReceived: 960,
    operationId: "prod-op-iron",
    operationName: "Ironing",
    piecesCompleted: 960,
    karigarId: "k-mohammad",
    karigarName: "Mohammad Salim",
    ratePerPiece: 0.3,
    amountDue: 288,
  },
  {
    id: "fn-4",
    entryNumber: "FN-004",
    entryDate: "2024-01-26",
    poId: "po-2",
    poNumber: "PO-2024-002",
    designNumber: "D-43",
    bundleNumber: "BND-002",
    piecesReceived: 960,
    operationId: "prod-op-gift",
    operationName: "Gift Packing",
    piecesCompleted: 958,
    karigarId: "k-anita",
    karigarName: "Anita Finishing",
    ratePerPiece: 0.4,
    amountDue: 383.2,
  },
  {
    id: "fn-5",
    entryNumber: "FN-005",
    entryDate: "2024-01-27",
    poId: "po-3",
    poNumber: "PO-2024-003",
    designNumber: "D-55",
    bundleNumber: "BND-003",
    piecesReceived: 960,
    operationId: "prod-op-hanger",
    operationName: "Hanger Attachment",
    piecesCompleted: 958,
    karigarId: "k-mohammad",
    karigarName: "Mohammad Salim",
    ratePerPiece: 0.2,
    amountDue: 191.6,
  },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/production.service.ts
// Query key: QUERY_KEYS.PRODUCTION
export const mockBundleRecords: MockBundleRecord[] = [
  {
    id: "bundle-1",
    bundleNumber: "BND-001",
    poId: "po-1",
    poNumber: "PO-2024-001",
    designNumber: "D-42",
    garmentType: "Baby Bodysuit",
    color: "White",
    currentStage: "FINISHING",
    status: "READY_FOR_BOXING",
    totalPieces: 974,
    fabricIssuedKg: 110,
    wastageKg: 1.25,
    sizes: {
      qty_0_3M: 160,
      qty_3_6M: 180,
      qty_6_9M: 200,
      qty_9_12M: 150,
      qty_12_18M: 140,
      qty_18_24M: 140,
    },
    createdAt: "2024-01-20",
    journey: [
      {
        stage: "Cutting",
        status: "COMPLETED",
        summary: "970 pcs cut · 1.25 kg wastage · Amit Sharma",
        dateLabel: "20 Jan 2024",
      },
      {
        stage: "Printing",
        status: "COMPLETED",
        summary: "978 returned · 2 rejected · Raju Printer",
        dateLabel: "21 Jan 2024",
      },
      {
        stage: "Coloring",
        status: "COMPLETED",
        summary: "White · 976 returned · Anwar Colorist",
        dateLabel: "22 Jan 2024",
      },
      {
        stage: "Stitching",
        status: "COMPLETED",
        summary: "All stitching operations complete",
        dateLabel: "24 Jan 2024",
        subItems: [
          { label: "Side Seam", summary: "418 pcs · Rashid Ali" },
          { label: "Overlock", summary: "418 pcs · Amit Kumar" },
        ],
      },
      {
        stage: "Finishing",
        status: "IN_PROGRESS",
        summary: "Ironing done · Poly packing pending",
        dateLabel: "25 Jan 2024",
        subItems: [
          { label: "Ironing", summary: "974 pcs · Anita Finishing" },
          { label: "Poly Packing", summary: "In progress" },
        ],
      },
      {
        stage: "Boxing",
        status: "NOT_STARTED",
        summary: "Waiting for finishing completion",
        dateLabel: "—",
      },
    ],
    payments: [
      {
        id: "pay-1",
        karigarName: "Amit Sharma",
        operationName: "Fabric Cutting",
        pieces: 970,
        ratePerPiece: 0.75,
        amount: 727.5,
        status: "PAID",
      },
      {
        id: "pay-2",
        karigarName: "Raju Printer",
        operationName: "Screen Printing",
        pieces: 978,
        ratePerPiece: 2.0,
        amount: 1956,
        status: "PAID",
      },
      {
        id: "pay-3",
        karigarName: "Anwar Colorist",
        operationName: "Coloring",
        pieces: 976,
        ratePerPiece: 1.2,
        amount: 1171.2,
        status: "PENDING",
      },
      {
        id: "pay-4",
        karigarName: "Anita Finishing",
        operationName: "Ironing",
        pieces: 974,
        ratePerPiece: 0.3,
        amount: 292.2,
        status: "PENDING",
      },
    ],
  },
  {
    id: "bundle-2",
    bundleNumber: "B-102",
    poId: "po-1",
    poNumber: "PO-2023-45",
    designNumber: "D-42",
    garmentType: "Summer Cotton T",
    color: "White",
    currentStage: "CUTTING",
    status: "IN_PROGRESS",
    totalPieces: 920,
    fabricIssuedKg: 120.5,
    wastageKg: 18.2,
    sizes: {
      qty_0_3M: 200,
      qty_3_6M: 400,
      qty_6_9M: 320,
      qty_9_12M: 0,
      qty_12_18M: 0,
      qty_18_24M: 0,
    },
    createdAt: "2023-10-24",
    journey: [
      {
        stage: "Cutting",
        status: "COMPLETED",
        summary: "920 pcs cut · 18.2 kg wastage · Imran Ali",
        dateLabel: "24 Oct 2023",
      },
      {
        stage: "Printing",
        status: "NOT_STARTED",
        summary: "Awaiting cutting handoff",
        dateLabel: "—",
      },
      {
        stage: "Coloring",
        status: "NOT_STARTED",
        summary: "Not started",
        dateLabel: "—",
      },
      {
        stage: "Stitching",
        status: "NOT_STARTED",
        summary: "Not started",
        dateLabel: "—",
      },
      {
        stage: "Finishing",
        status: "NOT_STARTED",
        summary: "Not started",
        dateLabel: "—",
      },
      {
        stage: "Boxing",
        status: "NOT_STARTED",
        summary: "Not started",
        dateLabel: "—",
      },
    ],
    payments: [
      {
        id: "pay-b102-1",
        karigarName: "Imran Ali",
        operationName: "Fabric Cutting",
        pieces: 920,
        ratePerPiece: 0.75,
        amount: 690,
        status: "PENDING",
      },
    ],
  },
  {
    id: "bundle-3",
    bundleNumber: "BND-002",
    poId: "po-2",
    poNumber: "PO-2024-002",
    designNumber: "D-43",
    garmentType: "Baby Romper",
    color: "Blue",
    currentStage: "COLORING",
    status: "IN_PROGRESS",
    totalPieces: 965,
    fabricIssuedKg: 98.4,
    wastageKg: 12.5,
    sizes: {
      qty_0_3M: 150,
      qty_3_6M: 200,
      qty_6_9M: 200,
      qty_9_12M: 150,
      qty_12_18M: 100,
      qty_18_24M: 50,
    },
    createdAt: "2024-01-20",
    journey: [
      {
        stage: "Cutting",
        status: "COMPLETED",
        summary: "850 pcs · Amit Sharma",
        dateLabel: "20 Jan 2024",
      },
      {
        stage: "Printing",
        status: "COMPLETED",
        summary: "965 returned · Vinod Gupta",
        dateLabel: "22 Jan 2024",
      },
      {
        stage: "Coloring",
        status: "IN_PROGRESS",
        summary: "Blue coloring in progress",
        dateLabel: "23 Jan 2024",
      },
      {
        stage: "Stitching",
        status: "NOT_STARTED",
        summary: "Not started",
        dateLabel: "—",
      },
      {
        stage: "Finishing",
        status: "NOT_STARTED",
        summary: "Not started",
        dateLabel: "—",
      },
      {
        stage: "Boxing",
        status: "NOT_STARTED",
        summary: "Not started",
        dateLabel: "—",
      },
    ],
    payments: [
      {
        id: "pay-b2-1",
        karigarName: "Amit Sharma",
        operationName: "Fabric Cutting",
        pieces: 850,
        ratePerPiece: 0.75,
        amount: 637.5,
        status: "PAID",
      },
      {
        id: "pay-b2-2",
        karigarName: "Vinod Gupta (Printer Expert)",
        operationName: "Screen Printing",
        pieces: 965,
        ratePerPiece: 2.0,
        amount: 1930,
        status: "PENDING",
      },
    ],
  },
];

export function getBundleByNumber(
  bundleNumber: string
): MockBundleRecord | undefined {
  return mockBundleRecords.find(
    (bundle) =>
      bundle.bundleNumber.toLowerCase() === bundleNumber.toLowerCase()
  );
}

export function getRateForStage(stage: ProductionStageTab): number {
  return (
    productionOperationRates.find((op) => op.stage === stage)?.ratePerPiece ?? 0
  );
}

export function getOperationRate(operationId: string): number {
  return (
    productionOperationRates.find((op) => op.id === operationId)?.ratePerPiece ??
    0
  );
}

export function getOperationsForStage(stage: ProductionStageTab) {
  return productionOperationRates.filter((op) => op.stage === stage);
}

export function getBundlesForStage(
  completedBefore: ProductionStageTab
): { bundleNumber: string; label: string; pieces: number }[] {
  const stageOrder: ProductionStageTab[] = [
    "CUTTING",
    "PRINTING",
    "COLORING",
    "STITCHING",
    "FINISHING",
  ];
  const requiredIndex = stageOrder.indexOf(completedBefore);

  if (completedBefore === "CUTTING") {
    return mockCuttingEntries.map((entry) => ({
      bundleNumber: entry.bundleNumber,
      label: `${entry.bundleNumber} (${entry.designLabel})`,
      pieces: entry.pieces,
    }));
  }

  if (completedBefore === "PRINTING") {
    return mockPrintingEntries.map((entry) => ({
      bundleNumber: entry.bundleNumber,
      label: `${entry.bundleNumber} (${entry.designNumber})`,
      pieces: entry.piecesReturned,
    }));
  }

  if (completedBefore === "COLORING") {
    return mockColoringEntries.map((entry) => ({
      bundleNumber: entry.bundleNumber,
      label: `${entry.bundleNumber} (${entry.designNumber})`,
      pieces: entry.piecesReturned,
    }));
  }

  if (completedBefore === "STITCHING") {
    return mockStitchingEntries
      .filter((entry) => entry.status === "RETURNED")
      .map((entry) => ({
        bundleNumber: entry.bundleNumber,
        label: `${entry.bundleNumber} (${entry.designNumber})`,
        pieces: entry.piecesReturned,
      }));
  }

  void requiredIndex;
  return mockFinishingEntries.map((entry) => ({
    bundleNumber: entry.bundleNumber,
    label: `${entry.bundleNumber} (${entry.designNumber})`,
    pieces: entry.piecesCompleted,
  }));
}

export function filterByProductionFilters<
  T extends { poId: string; karigarId: string; entryDate: string },
>(items: T[], filters: ProductionFilters): T[] {
  return items.filter((item) => {
    if (filters.poId !== "ALL" && item.poId !== filters.poId) return false;
    if (filters.karigarId !== "ALL" && item.karigarId !== filters.karigarId) {
      return false;
    }
    if (filters.dateFrom && item.entryDate < filters.dateFrom) return false;
    if (filters.dateTo && item.entryDate > filters.dateTo) return false;
    return true;
  });
}
