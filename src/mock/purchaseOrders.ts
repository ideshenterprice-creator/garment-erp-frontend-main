import type { Party, POItem, PurchaseOrder, PurchaseOrderStatus } from "@/types";
import { mockParties } from "@/mock/masters";

export interface POProductionStage {
  stage: "Cutting" | "Printing" | "Coloring" | "Stitching" | "Finishing";
  issued: number;
  done: number;
  pending: number;
  status: "DONE" | "IN_PROGRESS" | "PENDING";
}

export interface POFabricLot {
  id: string;
  lotNumber: string;
  supplierName: string;
  date: string;
  quantityKg: number;
  status: "RECEIVED" | "TO_PURCHASE";
}

export interface MockPurchaseOrder extends PurchaseOrder {
  productionStages?: POProductionStage[];
  fabricLots?: POFabricLot[];
  fabricNeededKg?: number;
}

function buyer(id: string, overrides?: Partial<Party>): Party {
  const base = mockParties.find((party) => party.id === id) ?? mockParties[0];
  return { ...base, type: "BUYER", ...overrides };
}

function sumSizes(item: Omit<POItem, "totalPieces" | "id" | "poId"> & {
  id: string;
  poId: string;
}): POItem {
  const totalPieces =
    item.qty_0_3M +
    item.qty_3_6M +
    item.qty_6_9M +
    item.qty_9_12M +
    item.qty_12_18M +
    item.qty_18_24M;
  return { ...item, totalPieces };
}

// TODO: Replace with TanStack Query API call
// Service: src/services/purchaseOrders.service.ts
// Query key: QUERY_KEYS.PURCHASE_ORDERS
export const mockPurchaseOrders: MockPurchaseOrder[] = [
  {
    id: "po-1",
    poNumber: "PO-2024-001",
    buyerId: "party-1",
    buyer: buyer("party-1", {
      name: "Al Reem Trading",
      city: "Dubai",
      country: "UAE",
    }),
    buyerPoReference: "AR/2024/001",
    orderDate: "2024-01-15",
    deliveryDate: "2024-03-30",
    shippingDestination: "Dubai, UAE",
    paymentTerms: "CIF, 60 Days",
    specialInstructions: "Care labels in Arabic and English required.",
    status: "ACTIVE",
    totalPieces: 5000,
    totalDesigns: 3,
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
    items: [
      sumSizes({
        id: "poi-1",
        poId: "po-1",
        designNumber: "D-41",
        garmentType: "Baby Bodysuit",
        color: "White",
        qty_0_3M: 200,
        qty_3_6M: 300,
        qty_6_9M: 400,
        qty_9_12M: 400,
        qty_12_18M: 350,
        qty_18_24M: 350,
      }),
    ],
  },
  {
    id: "po-2",
    poNumber: "PO-2024-002",
    buyerId: "party-2",
    buyer: buyer("party-2", {
      name: "Baby World LLC",
      city: "Dubai",
      country: "UAE",
    }),
    buyerPoReference: "BW/2024/UAE-09",
    orderDate: "2024-01-18",
    deliveryDate: "2024-04-15",
    shippingDestination: "Dubai, UAE",
    paymentTerms: "CIF, 60 Days",
    specialInstructions:
      "All garments must have care label in Arabic and English. Export quality packaging required.",
    status: "IN_PRODUCTION",
    totalPieces: 3200,
    totalDesigns: 2,
    createdAt: "2024-01-18T00:00:00.000Z",
    updatedAt: "2024-02-10T00:00:00.000Z",
    fabricNeededKg: 480,
    items: [
      sumSizes({
        id: "poi-2a",
        poId: "po-2",
        designNumber: "DSGN-1021",
        garmentType: "Romper",
        color: "Cloud Blue",
        qty_0_3M: 200,
        qty_3_6M: 300,
        qty_6_9M: 400,
        qty_9_12M: 350,
        qty_12_18M: 250,
        qty_18_24M: 100,
      }),
      sumSizes({
        id: "poi-2b",
        poId: "po-2",
        designNumber: "DSGN-1022",
        garmentType: "T-Shirt",
        color: "Soft Mint",
        qty_0_3M: 250,
        qty_3_6M: 350,
        qty_6_9M: 400,
        qty_9_12M: 300,
        qty_12_18M: 200,
        qty_18_24M: 100,
      }),
    ],
    productionStages: [
      {
        stage: "Cutting",
        issued: 3200,
        done: 3200,
        pending: 0,
        status: "DONE",
      },
      {
        stage: "Printing",
        issued: 3200,
        done: 2800,
        pending: 400,
        status: "IN_PROGRESS",
      },
      {
        stage: "Coloring",
        issued: 2800,
        done: 1500,
        pending: 1300,
        status: "IN_PROGRESS",
      },
      {
        stage: "Stitching",
        issued: 1500,
        done: 0,
        pending: 1500,
        status: "PENDING",
      },
      {
        stage: "Finishing",
        issued: 0,
        done: 0,
        pending: 0,
        status: "PENDING",
      },
    ],
    fabricLots: [
      {
        id: "lot-1",
        lotNumber: "LOT-2401",
        supplierName: "Sunrise Textiles",
        date: "2024-01-22",
        quantityKg: 220,
        status: "RECEIVED",
      },
      {
        id: "lot-2",
        lotNumber: "LOT-2408",
        supplierName: "Mehta Fabrics",
        date: "2024-02-02",
        quantityKg: 160,
        status: "RECEIVED",
      },
      {
        id: "lot-3",
        lotNumber: "LOT-PENDING",
        supplierName: "Anwar Thread",
        date: "2024-02-20",
        quantityKg: 100,
        status: "TO_PURCHASE",
      },
    ],
  },
  {
    id: "po-3",
    poNumber: "PO-2024-003",
    buyerId: "party-3",
    buyer: buyer("party-3", {
      name: "Noor Kids",
      city: "Ahmedabad",
      country: "India",
    }),
    buyerPoReference: "NK/2024/12",
    orderDate: "2024-01-20",
    deliveryDate: "2024-04-10",
    shippingDestination: "Ahmedabad, India",
    paymentTerms: "50% Advance, 50% on Delivery",
    specialInstructions: "",
    status: "READY_TO_SHIP",
    totalPieces: 2800,
    totalDesigns: 2,
    createdAt: "2024-01-20T00:00:00.000Z",
    updatedAt: "2024-03-01T00:00:00.000Z",
  },
  {
    id: "po-4",
    poNumber: "PO-2024-004",
    buyerId: "party-1",
    buyer: buyer("party-1", {
      name: "Al Reem Trading",
      city: "Dubai",
      country: "UAE",
    }),
    buyerPoReference: "AR/2024/044",
    orderDate: "2024-01-22",
    deliveryDate: "2024-03-15",
    shippingDestination: "Jebel Ali Port, UAE",
    paymentTerms: "LC at Sight",
    specialInstructions: "",
    status: "IN_PRODUCTION",
    totalPieces: 4500,
    totalDesigns: 4,
    createdAt: "2024-01-22T00:00:00.000Z",
    updatedAt: "2024-02-15T00:00:00.000Z",
  },
  {
    id: "po-5",
    poNumber: "PO-2024-005",
    buyerId: "party-2",
    buyer: buyer("party-2", {
      name: "Baby World LLC",
      city: "Mumbai",
      country: "India",
    }),
    buyerPoReference: "BW/2024/55",
    orderDate: "2024-01-25",
    deliveryDate: "2024-04-20",
    shippingDestination: "Mumbai, India",
    paymentTerms: "Net 30",
    specialInstructions: "",
    status: "ACTIVE",
    totalPieces: 1800,
    totalDesigns: 1,
    createdAt: "2024-01-25T00:00:00.000Z",
    updatedAt: "2024-01-25T00:00:00.000Z",
  },
  {
    id: "po-6",
    poNumber: "PO-2024-006",
    buyerId: "party-3",
    buyer: buyer("party-3", {
      name: "Global Kidswear Ltd.",
      city: "Surat",
      country: "India",
    }),
    buyerPoReference: "GK/2024/66",
    orderDate: "2024-01-28",
    deliveryDate: "2024-03-28",
    shippingDestination: "Hamburg Port, Germany",
    paymentTerms: "50% Advance, 50% on Delivery",
    specialInstructions: "",
    status: "COMPLETED",
    totalPieces: 6200,
    totalDesigns: 5,
    createdAt: "2024-01-28T00:00:00.000Z",
    updatedAt: "2024-03-20T00:00:00.000Z",
  },
  {
    id: "po-7",
    poNumber: "PO-2024-007",
    buyerId: "party-1",
    buyer: buyer("party-1", {
      name: "Tiny Togs Inc.",
      city: "Delhi",
      country: "India",
    }),
    buyerPoReference: "TT/2024/77",
    orderDate: "2024-02-01",
    deliveryDate: "2024-04-01",
    shippingDestination: "Delhi, India",
    paymentTerms: "Net 45",
    specialInstructions: "",
    status: "CANCELLED",
    totalPieces: 2100,
    totalDesigns: 2,
    createdAt: "2024-02-01T00:00:00.000Z",
    updatedAt: "2024-02-10T00:00:00.000Z",
  },
  {
    id: "po-8",
    poNumber: "PO-2024-008",
    buyerId: "party-2",
    buyer: buyer("party-2", {
      name: "Little Stars Co.",
      city: "Ludhiana",
      country: "India",
    }),
    buyerPoReference: "LS/2024/88",
    orderDate: "2024-02-05",
    deliveryDate: "2024-05-01",
    shippingDestination: "Ludhiana, India",
    paymentTerms: "CIF, 30 Days",
    specialInstructions: "",
    status: "READY_TO_SHIP",
    totalPieces: 3900,
    totalDesigns: 3,
    createdAt: "2024-02-05T00:00:00.000Z",
    updatedAt: "2024-03-15T00:00:00.000Z",
  },
];

export const mockBuyers: Party[] = [
  ...mockParties.filter((party) => party.type === "BUYER"),
  {
    id: "buyer-global",
    partyNumber: "PTY-GK",
    name: "Global Kidswear Ltd.",
    type: "BUYER",
    contact: "+91 98765 40000",
    gstNumber: "24GGGGG0000G1Z5",
    city: "Surat",
    country: "India",
    bankAccount: "",
    ifsc: "",
    bankName: "",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

export const PAYMENT_TERMS_OPTIONS = [
  "50% Advance, 50% on Delivery",
  "CIF, 60 Days",
  "CIF, 30 Days",
  "LC at Sight",
  "Net 30",
  "Net 45",
] as const;

export function getPOStatusLabel(status: PurchaseOrderStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "IN_PRODUCTION":
      return "In Production";
    case "READY_TO_SHIP":
      return "Ready to Ship";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
  }
}

export function generateNextPONumber(existing: PurchaseOrder[]): string {
  const year = new Date().getFullYear();
  const max = existing.reduce((acc, po) => {
    const match = po.poNumber.match(/PO-\d{4}-(\d+)/);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `PO-${year}-${String(max + 1).padStart(3, "0")}`;
}
