import { mockPurchaseOrders } from "@/mock/purchaseOrders";
import { mockParties } from "@/mock/masters";

export type BoxStatus = "LOADED" | "PACKED" | "PENDING";
export type ContainerStatus = "LOADING" | "READY" | "DISPATCHED" | "PENDING";

export type BoxSizeQty = {
  qty_0_3M: number;
  qty_3_6M: number;
  qty_6_9M: number;
  qty_9_12M: number;
  qty_12_18M: number;
  qty_18_24M: number;
};

export interface MockBox {
  id: string;
  boxNumber: string;
  poId: string;
  poNumber: string;
  designNumber: string;
  color: string;
  sizes: BoxSizeQty;
  totalPieces: number;
  containerId: string | null;
  containerNumber: string | null;
  status: BoxStatus;
  packedDate: string;
  notes?: string;
}

export interface MockContainer {
  id: string;
  containerNumber: string;
  poId: string;
  poNumber: string;
  buyerId: string;
  buyerName: string;
  destination: string;
  dispatchDate: string | null;
  status: ContainerStatus;
  boxIds: string[];
  createdAt: string;
}

export interface FinishedStockKey {
  designNumber: string;
  color: string;
  available: number;
}

export function emptyBoxSizes(): BoxSizeQty {
  return {
    qty_0_3M: 0,
    qty_3_6M: 0,
    qty_6_9M: 0,
    qty_9_12M: 0,
    qty_12_18M: 0,
    qty_18_24M: 0,
  };
}

export function sumBoxSizes(sizes: BoxSizeQty): number {
  return (
    sizes.qty_0_3M +
    sizes.qty_3_6M +
    sizes.qty_6_9M +
    sizes.qty_9_12M +
    sizes.qty_12_18M +
    sizes.qty_18_24M
  );
}

export function generateNextBoxNumber(existing: MockBox[]): string {
  const max = existing.reduce((acc, box) => {
    const match = box.boxNumber.match(/BOX-(\d+)/);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `BOX-${String(max + 1).padStart(3, "0")}`;
}

export function generateNextContainerNumber(
  existing: MockContainer[]
): string {
  const max = existing.reduce((acc, ctn) => {
    const match = ctn.containerNumber.match(/CTN-(\d+)/);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `CTN-${String(max + 1).padStart(3, "0")}`;
}

// TODO: Replace with TanStack Query API call
// Service: src/services/boxing.service.ts
// Query key: QUERY_KEYS.BOXES
export const mockFinishedStock: FinishedStockKey[] = [
  { designNumber: "D-42", color: "White", available: 320 },
  { designNumber: "D-42", color: "Optic White", available: 320 },
  { designNumber: "D-43", color: "Blue", available: 280 },
  { designNumber: "D-41", color: "Yellow", available: 200 },
  { designNumber: "D-55", color: "Pink", available: 150 },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/boxing.service.ts
// Query key: QUERY_KEYS.BOXES
export const mockBoxes: MockBox[] = [
  {
    id: "box-1",
    boxNumber: "BOX-001",
    poId: "po-1",
    poNumber: "PO-2024-001",
    designNumber: "D-42",
    color: "White",
    sizes: {
      qty_0_3M: 10,
      qty_3_6M: 10,
      qty_6_9M: 10,
      qty_9_12M: 10,
      qty_12_18M: 10,
      qty_18_24M: 10,
    },
    totalPieces: 60,
    containerId: "ctn-1",
    containerNumber: "CTN-001",
    status: "LOADED",
    packedDate: "2024-01-20",
  },
  {
    id: "box-2",
    boxNumber: "BOX-002",
    poId: "po-1",
    poNumber: "PO-2024-001",
    designNumber: "D-42",
    color: "White",
    sizes: {
      qty_0_3M: 12,
      qty_3_6M: 12,
      qty_6_9M: 12,
      qty_9_12M: 8,
      qty_12_18M: 8,
      qty_18_24M: 8,
    },
    totalPieces: 60,
    containerId: "ctn-1",
    containerNumber: "CTN-001",
    status: "LOADED",
    packedDate: "2024-01-21",
  },
  {
    id: "box-3",
    boxNumber: "BOX-003",
    poId: "po-1",
    poNumber: "PO-2024-001",
    designNumber: "D-41",
    color: "Yellow",
    sizes: {
      qty_0_3M: 15,
      qty_3_6M: 15,
      qty_6_9M: 10,
      qty_9_12M: 10,
      qty_12_18M: 5,
      qty_18_24M: 5,
    },
    totalPieces: 60,
    containerId: "ctn-1",
    containerNumber: "CTN-001",
    status: "LOADED",
    packedDate: "2024-01-22",
  },
  {
    id: "box-4",
    boxNumber: "BOX-004",
    poId: "po-2",
    poNumber: "PO-2024-002",
    designNumber: "D-43",
    color: "Blue",
    sizes: {
      qty_0_3M: 10,
      qty_3_6M: 10,
      qty_6_9M: 10,
      qty_9_12M: 10,
      qty_12_18M: 10,
      qty_18_24M: 10,
    },
    totalPieces: 60,
    containerId: null,
    containerNumber: null,
    status: "PACKED",
    packedDate: "2024-01-23",
  },
  {
    id: "box-5",
    boxNumber: "BOX-005",
    poId: "po-2",
    poNumber: "PO-2024-002",
    designNumber: "D-43",
    color: "Blue",
    sizes: {
      qty_0_3M: 8,
      qty_3_6M: 12,
      qty_6_9M: 12,
      qty_9_12M: 12,
      qty_12_18M: 8,
      qty_18_24M: 8,
    },
    totalPieces: 60,
    containerId: null,
    containerNumber: null,
    status: "PACKED",
    packedDate: "2024-01-24",
  },
  {
    id: "box-6",
    boxNumber: "BOX-006",
    poId: "po-3",
    poNumber: "PO-2024-003",
    designNumber: "D-55",
    color: "Pink",
    sizes: {
      qty_0_3M: 5,
      qty_3_6M: 5,
      qty_6_9M: 10,
      qty_9_12M: 10,
      qty_12_18M: 15,
      qty_18_24M: 15,
    },
    totalPieces: 60,
    containerId: null,
    containerNumber: null,
    status: "PENDING",
    packedDate: "2024-01-25",
  },
];

// TODO: Replace with TanStack Query API call
// Service: src/services/boxing.service.ts
// Query key: QUERY_KEYS.CONTAINERS
export const mockContainers: MockContainer[] = [
  {
    id: "ctn-1",
    containerNumber: "CTN-001",
    poId: "po-1",
    poNumber: "PO-2024-001",
    buyerId: "party-1",
    buyerName: "Al Reem Trading",
    destination: "Dubai, UAE",
    dispatchDate: "2024-02-01",
    status: "DISPATCHED",
    boxIds: ["box-1", "box-2", "box-3"],
    createdAt: "2024-01-18",
  },
  {
    id: "ctn-2",
    containerNumber: "CTN-002",
    poId: "po-2",
    poNumber: "PO-2024-002",
    buyerId: "party-2",
    buyerName: "Baby World LLC",
    destination: "Dubai, UAE",
    dispatchDate: null,
    status: "LOADING",
    boxIds: [],
    createdAt: "2024-01-25",
  },
  {
    id: "ctn-3",
    containerNumber: "CTN-003",
    poId: "po-3",
    poNumber: "PO-2024-003",
    buyerId: mockParties[0]?.id ?? "party-1",
    buyerName: mockParties[0]?.name ?? "Buyer",
    destination: "Riyadh, KSA",
    dispatchDate: null,
    status: "READY",
    boxIds: [],
    createdAt: "2024-01-26",
  },
  {
    id: "ctn-4",
    containerNumber: "CTN-004",
    poId: "po-4",
    poNumber: "PO-2024-004",
    buyerId: "party-1",
    buyerName: "Al Reem Trading",
    destination: "Abu Dhabi, UAE",
    dispatchDate: null,
    status: "PENDING",
    boxIds: [],
    createdAt: "2024-01-27",
  },
];

export const boxingPOs = mockPurchaseOrders.map((po) => ({
  id: po.id,
  poNumber: po.poNumber,
  buyerId: po.buyerId,
  buyerName: po.buyer.name,
  destination: po.shippingDestination,
  designs: (po.items ?? []).map((item) => ({
    id: item.id,
    designNumber: item.designNumber,
    garmentType: item.garmentType,
    color: item.color,
  })),
}));

export function getFinishedStock(
  designNumber: string,
  color: string
): number {
  const match = mockFinishedStock.find(
    (item) =>
      item.designNumber.toLowerCase() === designNumber.toLowerCase() &&
      item.color.toLowerCase() === color.toLowerCase()
  );
  return match?.available ?? 0;
}

export function getContainerById(id: string): MockContainer | undefined {
  return mockContainers.find((ctn) => ctn.id === id);
}
