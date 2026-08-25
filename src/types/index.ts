export type UserRole = "ADMIN" | "TEAM_MEMBER";

export type PartyType = "BUYER" | "SUPPLIER" | "KARIGAR";

export type ProductCategory =
  | "RAW_MATERIAL"
  | "FINISHED_GOOD"
  | "ACCESSORY"
  | "WASTAGE";

export type ProductUnit = "KG" | "PCS" | "METERS" | "ROLLS";

export type SizeLabel =
  | "SIZE_0_3M"
  | "SIZE_3_6M"
  | "SIZE_6_9M"
  | "SIZE_9_12M"
  | "SIZE_12_18M"
  | "SIZE_18_24M";

export type OperationStage =
  | "CUTTING"
  | "PRINTING"
  | "COLORING"
  | "STITCHING"
  | "FINISHING";

export type TaxType = "ZERO_RATED" | "IGST" | "CGST_SGST";

export type KarigarPaymentType = "PIECE_RATE" | "WEEKLY_SALARY" | "BOTH";

export type PurchaseOrderStatus =
  | "ACTIVE"
  | "IN_PRODUCTION"
  | "READY_TO_SHIP"
  | "COMPLETED"
  | "CANCELLED";

export type PurchaseBillStatus = "PENDING" | "CONFIRMED" | "RETURNED";

export type StockStatus = "AVAILABLE" | "LOW" | "OUT_OF_STOCK";

export type IssueType =
  | "CUTTING"
  | "PRINTING"
  | "STITCHING"
  | "FINISHING"
  | "SAMPLE"
  | "PATTERN";

export type IssueStatus = "ISSUED" | "RETURNED" | "PARTIAL";

export type BundleStage =
  | "CUTTING"
  | "PRINTING"
  | "COLORING"
  | "STITCHING"
  | "FINISHING"
  | "BOXING"
  | "COMPLETED";

export type BundleStatus = "IN_PROGRESS" | "COMPLETED";

export type SalesBillStatus = "DRAFT" | "SUBMITTED" | "PAID" | "RETURNED";

export type PaymentStatus = "PENDING" | "PAID";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Party {
  id: string;
  partyNumber: string;
  name: string;
  type: PartyType;
  contact: string | null;
  gstNumber: string | null;
  city: string | null;
  country: string | null;
  bankAccount: string | null;
  ifsc: string | null;
  bankName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSize {
  id: string;
  productId: string;
  sizeLabel: SizeLabel;
}

export interface Product {
  id: string;
  productCode: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  gstRate: number;
  description: string;
  isActive: boolean;
  sizes?: ProductSize[];
}

export interface Operation {
  id: string;
  operationCode: string;
  name: string;
  stage: OperationStage;
  ratePerPiece: number;
  unit: string;
  isActive: boolean;
}

export interface GSTRate {
  id: string;
  category: string;
  gstPercent: number;
  taxType: TaxType;
  applicableOn: string;
  notes: string;
}

export interface KarigarOperation {
  id: string;
  karigarProfileId: string;
  operationId: string;
  operation: Operation;
}

/** Backend flattens join rows to operation objects on list/detail responses. */
export type KarigarAssignedOperation = Pick<
  Operation,
  "id" | "operationCode" | "name" | "stage" | "ratePerPiece"
>;

export interface KarigarPartySummary {
  id: string;
  partyNumber: string;
  name: string;
  contact: string | null;
  type: PartyType;
  city: string | null;
  country?: string | null;
}

export interface KarigarProfile {
  id: string;
  partyId: string;
  party: KarigarPartySummary;
  paymentType: KarigarPaymentType;
  weeklySalary: number | null;
  isActive: boolean;
  operations: KarigarAssignedOperation[];
}

export interface CreatePartyPayload {
  name: string;
  type: PartyType;
  contact?: string;
  gstNumber?: string;
  city?: string;
  country?: string;
  bankAccount?: string;
  ifsc?: string;
  bankName?: string;
}

export interface CreateProductPayload {
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  gstRate: number;
  description?: string;
  sizes?: SizeLabel[];
}

export interface CreateOperationPayload {
  name: string;
  stage: OperationStage;
  ratePerPiece: number;
  unit?: string;
}

export interface CreateGSTPayload {
  category: string;
  gstPercent: number;
  taxType: TaxType;
  applicableOn: string;
  notes?: string;
}

export interface CreateKarigarPayload {
  partyId: string;
  paymentType: KarigarPaymentType;
  weeklySalary?: number;
  operationIds?: string[];
}

export interface AccountStatementTransaction {
  date: string;
  description: string;
  referenceType: string;
  referenceId: string;
  refNumber: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AccountStatement {
  party: { id: string; name: string; type: PartyType };
  period: { from: string; to: string };
  summary: {
    totalBilled: number;
    totalReceived: number;
    outstanding: number;
    lastTransactionDate: string | null;
  };
  transactions: AccountStatementTransaction[];
  closingBalance: number;
  balanceType: "RECEIVABLE" | "PAYABLE";
}

export interface POItem {
  id: string;
  poId: string;
  designNumber: string;
  garmentType: string;
  color: string;
  qty_0_3M: number;
  qty_3_6M: number;
  qty_6_9M: number;
  qty_9_12M: number;
  qty_12_18M: number;
  qty_18_24M: number;
  totalPieces: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  buyerId: string;
  buyer: Pick<
    Party,
    "id" | "partyNumber" | "name" | "city" | "country" | "type"
  >;
  buyerPoReference: string;
  orderDate: string;
  deliveryDate: string;
  shippingDestination: string;
  paymentTerms: string;
  specialInstructions: string | null;
  status: PurchaseOrderStatus;
  totalPieces: number;
  totalDesigns: number;
  items?: POItem[];
  productionProgress?: POProductionStages;
  fabricLots?: POFabricLot[];
  createdAt: string;
  updatedAt: string;
}

export type POStageProgressStatus = "DONE" | "IN_PROGRESS" | "PENDING";

export interface POStageProgress {
  issued: number;
  completed: number;
  pending: number;
  status: POStageProgressStatus;
}

export interface POProductionStages {
  cutting: POStageProgress;
  printing: POStageProgress;
  coloring: POStageProgress;
  stitching: POStageProgress;
  finishing: POStageProgress;
}

export interface POFabricLot {
  lotNumber: number;
  billId: string;
  billNumber: string;
  supplier: { id: string; name: string };
  date: string;
  netWeight: number;
  status: PurchaseBillStatus;
  ratePerKg?: number;
  totalAmount?: number;
}

export interface CreatePOItemPayload {
  designNumber: string;
  garmentType: string;
  color: string;
  qty_0_3M: number;
  qty_3_6M: number;
  qty_6_9M: number;
  qty_9_12M: number;
  qty_12_18M: number;
  qty_18_24M: number;
}

export interface CreatePurchaseOrderPayload {
  buyerId: string;
  buyerPoReference: string;
  orderDate: string;
  deliveryDate: string;
  shippingDestination: string;
  paymentTerms: string;
  specialInstructions?: string;
  items: CreatePOItemPayload[];
}

export interface POListSummary {
  totalActive: number;
  totalInProduction: number;
  totalReadyToShip: number;
  totalCompleted: number;
}

export interface PurchaseBillSupplier {
  id: string;
  partyNumber?: string;
  name: string;
  city?: string | null;
  country?: string | null;
  contact?: string | null;
  type?: PartyType;
}

export interface PurchaseBillProduct {
  id: string;
  productCode?: string;
  name: string;
  category?: ProductCategory;
  unit?: ProductUnit;
  gstRate?: number;
}

export interface PurchaseBillPO {
  id: string;
  poNumber: string;
  status?: PurchaseOrderStatus;
  buyer?: { id: string; name: string };
}

export interface SupplierBillPayment {
  id: string;
  purchaseBillId: string;
  supplierId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMode: string;
  referenceNo: string | null;
  notes?: string | null;
}

export interface PurchaseBillStockUpdate {
  stockUpdated: boolean;
  stockUpdatedAt: string | null;
  quantityAdded: number;
}

export interface PurchaseBill {
  id: string;
  billNumber: string;
  supplierId: string;
  supplier: PurchaseBillSupplier;
  supplierInvoiceNo: string | null;
  purchaseDate: string;
  poId: string | null;
  po: PurchaseBillPO | null;
  productId: string;
  product: PurchaseBillProduct;
  vehicleNumber: string | null;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  ratePerKg: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  status: PurchaseBillStatus;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  stockUpdate?: PurchaseBillStockUpdate;
  paymentHistory?: SupplierBillPayment[];
  totalPaid?: number;
  outstanding?: number;
}

export interface CreatePurchaseBillPayload {
  supplierId: string;
  supplierInvoiceNo: string;
  purchaseDate: string;
  poId: string;
  productId: string;
  vehicleNumber?: string;
  grossWeight: number;
  tareWeight: number;
  ratePerKg: number;
}

export interface PurchaseBillsSummary {
  totalBillsThisMonth: number;
  totalFabricPurchasedKg: number;
  pendingApprovalCount: number;
}

export interface PurchaseRegisterRow {
  billNumber: string;
  date: string;
  supplier: { id: string; name: string };
  fabricType: { id: string; name: string; productCode?: string };
  qty: number;
  rate: number;
  total: number;
  gst: number;
  netTotal: number;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
  outstanding: number;
  status: PurchaseBillStatus;
}

export interface PurchaseRegisterResponse {
  filters: {
    from: string;
    to: string;
    supplierId: string | null;
    fabricType: string | null;
  };
  summary: {
    totalPurchases: number;
    totalFabricReceived: number;
    pendingPayments: number;
  };
  bills: PurchaseRegisterRow[];
  totals: {
    totalQty: number;
    totalAmount: number;
    totalGST: number;
    totalNetTotal: number;
  };
}

export interface Stock {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  lastUpdated: string;
  stockStatus: StockStatus;
}

export interface IssueRecord {
  id: string;
  issueNumber: string;
  issueDate: string;
  issueType: IssueType;
  productId: string;
  product: Product;
  poId: string;
  po: PurchaseOrder;
  karigarId: string;
  karigar: Party;
  quantityIssued: number;
  bundleNumber: string;
  status: IssueStatus;
}

export interface Bundle {
  id: string;
  bundleNumber: string;
  poId: string;
  poItemId: string;
  currentStage: BundleStage;
  status: BundleStatus;
}

export interface SalesBillItem {
  id: string;
  salesBillId: string;
  designNumber: string;
  garmentType: string;
  color: string;
  size: string;
  quantity: number;
  ratePerPiece: number;
  amount: number;
}

export interface SalesBill {
  id: string;
  invoiceNumber: string;
  poId: string;
  po: PurchaseOrder;
  buyerId: string;
  buyer: Party;
  invoiceDate: string;
  paymentTerms: string;
  shippingDestination: string;
  currency: string;
  exchangeRate: number;
  subTotal: number;
  gstAmount: number;
  netTotal: number;
  status: SalesBillStatus;
  items?: SalesBillItem[];
}

export interface KarigarPayment {
  id: string;
  paymentNumber: string;
  karigarId: string;
  karigar: Party;
  poId: string;
  operationId: string;
  operation: Operation;
  productionEntryType: string;
  piecesCompleted: number;
  ratePerPiece: number;
  amountDue: number;
  weekNumber: number;
  year: number;
  status: PaymentStatus;
  paidAt: string | null;
  paymentMode: string;
  referenceNo: string;
}
