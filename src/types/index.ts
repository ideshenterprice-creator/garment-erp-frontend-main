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
  imagePath?: string | null;
  imageUrl?: string | null;
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
  isActive?: boolean;
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
  gstPercent: number;
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

export type WastageStatus = "IN_STOCK" | "SOLD";

export type StockAdjustmentType = "ADD" | "REDUCE";

export type StockAdjustmentReason =
  | "PHYSICAL_COUNT_CORRECTION"
  | "DAMAGED"
  | "SAMPLE_USED"
  | "OTHER";

export interface StockProduct {
  id: string;
  productCode?: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
}

export interface Stock {
  id: string;
  productId: string;
  product: StockProduct;
  quantity: number;
  lastUpdated: string;
  stockStatus: StockStatus;
}

export interface AdjustStockPayload {
  adjustmentType: StockAdjustmentType;
  quantity: number;
  reason: StockAdjustmentReason;
  notes?: string;
  date?: string;
}

export interface IssueRecordPO {
  id: string;
  poNumber: string;
  status?: PurchaseOrderStatus;
}

export interface IssueRecord {
  id: string;
  issueNumber: string;
  issueDate: string;
  issueType: IssueType;
  productId: string;
  product: StockProduct;
  poId: string;
  po: IssueRecordPO;
  poItemId?: string;
  karigarId: string;
  karigar: Pick<Party, "id" | "partyNumber" | "name" | "type" | "contact">;
  quantityIssued: number;
  bundleNumber: string;
  status: IssueStatus;
  notes?: string | null;
  bundles?: Array<{
    id: string;
    bundleNumber: string;
    currentStage: BundleStage;
    status: BundleStatus;
  }>;
}

export interface CreateIssuePayload {
  issueDate: string;
  issueType: IssueType;
  productId: string;
  poId: string;
  poItemId: string;
  karigarId: string;
  quantityIssued: number;
  notes?: string;
}

export interface CuttingWastage {
  id: string;
  wastageNumber: string;
  poId: string;
  po: IssueRecordPO;
  designCode: string;
  fabricTypeId: string;
  fabricType: StockProduct;
  wastageQty: number;
  returnedById: string;
  returnedBy: Pick<Party, "id" | "partyNumber" | "name" | "type">;
  dateOfReturn: string;
  remarks: string | null;
  status: WastageStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface WastageSummary {
  totalWastageInStock: number;
  totalWastageSold: number;
  totalWastageValue: number;
}

export interface WastageListResponse {
  data: CuttingWastage[];
  total: number;
  page: number;
  limit: number;
  summary: WastageSummary;
}

export interface CreateWastagePayload {
  poId: string;
  designCode: string;
  fabricProductId: string;
  wastageQty: number;
  returnedByPartyId: string;
  dateOfReturn: string;
  remarks?: string;
}

export interface Bundle {
  id: string;
  bundleNumber: string;
  poId: string;
  poItemId: string | null;
  currentStage: BundleStage;
  status: BundleStatus;
  po?: IssueRecordPO;
  poItem?: Pick<POItem, "id" | "designNumber" | "garmentType" | "color"> | null;
  issue?: {
    id: string;
    issueNumber: string;
    quantityIssued: number;
    karigarId?: string;
    karigar?: Pick<Party, "id" | "name">;
  } | null;
  createdAt?: string;
}

export type ProductionStageTab =
  | "CUTTING"
  | "PRINTING"
  | "COLORING"
  | "STITCHING"
  | "FINISHING";

export interface ProductionFilters {
  poId: string;
  from: string;
  to: string;
  karigarId: string;
}

export interface SizeBreakdown {
  qty_0_3M: number;
  qty_3_6M: number;
  qty_6_9M: number;
  qty_9_12M: number;
  qty_12_18M: number;
  qty_18_24M: number;
}

export interface ProductionPartyRef {
  id: string;
  name: string;
  partyNumber?: string;
}

export interface ProductionBundleRef {
  id: string;
  bundleNumber: string;
  currentStage?: BundleStage;
  status?: BundleStatus;
}

export interface CuttingEntry extends SizeBreakdown {
  id: string;
  entryNumber: string;
  entryDate: string;
  bundleId: string;
  poId: string;
  poItemId: string;
  karigarId: string;
  fabricIssuedKg: number;
  totalPiecesCut: number;
  wastageKg: number;
  karigar?: ProductionPartyRef;
  po?: IssueRecordPO;
  bundle?: ProductionBundleRef;
  poItem?: Pick<POItem, "id" | "designNumber" | "garmentType" | "color">;
}

export interface CuttingListSummary {
  totalPiecesCut: number;
  totalWastageKg: number;
  totalKarigarPaymentDue: number;
}

export interface CreateCuttingPayload extends SizeBreakdown {
  entryDate: string;
  bundleId: string;
  poId: string;
  poItemId: string;
  karigarId: string;
  fabricIssuedKg: number;
  wastageKg: number;
}

export interface PrintingEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  bundleId: string;
  poId: string;
  karigarId: string;
  piecesReceived: number;
  piecesReturned: number;
  piecesRejected: number;
  karigar?: ProductionPartyRef;
  po?: IssueRecordPO;
  bundle?: ProductionBundleRef;
}

export interface PrintingListSummary {
  totalPiecesReturned: number;
  totalPiecesRejected: number;
  totalKarigarPaymentDue: number;
}

export interface CreatePrintingPayload {
  entryDate: string;
  bundleId: string;
  poId: string;
  karigarId: string;
  piecesReturned: number;
  piecesRejected?: number;
}

export interface ColoringEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  bundleId: string;
  poId: string;
  karigarId: string;
  colorApplied: string;
  piecesReceived: number;
  piecesReturned: number;
  piecesRejected: number;
  karigar?: ProductionPartyRef;
  po?: IssueRecordPO;
  bundle?: ProductionBundleRef;
}

export interface ColoringListSummary {
  totalPiecesReturned: number;
  totalPiecesRejected: number;
  totalKarigarPaymentDue: number;
}

export interface CreateColoringPayload {
  entryDate: string;
  bundleId: string;
  poId: string;
  karigarId: string;
  colorApplied: string;
  piecesReturned: number;
  piecesRejected?: number;
}

export interface StitchingEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  bundleId: string;
  poId: string;
  karigarId: string;
  operationId: string;
  piecesGiven: number;
  piecesReturned: number;
  piecesRejected: number;
  karigar?: ProductionPartyRef;
  po?: IssueRecordPO;
  bundle?: ProductionBundleRef;
  operation?: Pick<Operation, "id" | "name" | "stage" | "ratePerPiece">;
}

export interface StitchingListSummary {
  totalPiecesReturned: number;
  totalKarigarPaymentDue: number;
}

export interface CreateStitchingPayload {
  entryDate: string;
  bundleId: string;
  poId: string;
  karigarId: string;
  operationId: string;
  piecesGiven: number;
  piecesReturned: number;
  piecesRejected?: number;
}

export interface FinishingEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  bundleId: string;
  poId: string;
  karigarId: string;
  operationId: string;
  piecesReceived: number;
  piecesCompleted: number;
  karigar?: ProductionPartyRef;
  po?: IssueRecordPO;
  bundle?: ProductionBundleRef;
  operation?: Pick<Operation, "id" | "name" | "stage" | "ratePerPiece">;
}

export interface FinishingListSummary {
  totalPiecesCompleted: number;
  totalKarigarPaymentDue: number;
}

export interface CreateFinishingPayload {
  entryDate: string;
  bundleId: string;
  poId: string;
  karigarId: string;
  operationId: string;
  piecesReceived: number;
  piecesCompleted: number;
}

export interface ProductionCreateResult<T> {
  entry: T;
  payment?: {
    id: string;
    amountDue: number;
    ratePerPiece?: number;
  };
  paymentAmount?: number;
}

export interface BundleSummary {
  bundleNumber: string;
  poNumber: string;
  designNumber: string | null;
  garmentType: string | null;
  fabricIssuedKg: number;
  currentStage: BundleStage;
  status: BundleStatus;
}

export interface BundleJourneyStageDetail {
  completed?: boolean;
  entryDate?: string;
  karigar?: ProductionPartyRef;
  totalPiecesCut?: number;
  wastageKg?: number;
  piecesReceived?: number;
  piecesReturned?: number;
  piecesRejected?: number;
  colorApplied?: string;
  boxNumber?: string | null;
  entries?: Array<{
    operation?: Pick<Operation, "id" | "name" | "stage">;
    piecesGiven?: number;
    piecesReturned?: number;
    piecesCompleted?: number;
    karigar?: ProductionPartyRef;
  }>;
}

export interface BundleJourney {
  bundleNumber: string;
  stages: {
    cutting: BundleJourneyStageDetail | null;
    printing: BundleJourneyStageDetail | null;
    coloring: BundleJourneyStageDetail | null;
    stitching: BundleJourneyStageDetail | null;
    finishing: BundleJourneyStageDetail | null;
    boxing: BundleJourneyStageDetail | null;
  };
}

export interface BundlePaymentRow {
  karigar: ProductionPartyRef;
  operation: string;
  stage: OperationStage | string;
  piecesCompleted: number;
  ratePerPiece: number;
  amountDue: number;
  status: PaymentStatus;
  paidAt: string | null;
}

export interface BundlePaymentsResponse {
  data: BundlePaymentRow[];
  totalPaymentForBundle: number;
}

export type ProductionListResponse<T, S> = PaginatedResponseLike<T> & {
  summary: S;
};

export interface PaginatedResponseLike<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SalesBillItem {
  id: string;
  salesBillId: string;
  poItemId?: string;
  designNumber: string;
  garmentType: string;
  color: string;
  size: string;
  quantity: number;
  ratePerPiece: number;
  amount: number;
}

export interface SalesPaymentHistoryItem {
  id: string;
  salesBillId: string;
  date: string;
  paymentMode: string;
  amount: number;
  referenceNo: string | null;
  processedBy: string;
  status: "SUCCESS" | "PENDING";
}

export interface SalesBillPaymentRecord {
  totalPaid: number;
  outstanding: number;
}

export interface SalesBill {
  id: string;
  invoiceNumber: string;
  poId: string;
  po: Pick<PurchaseOrder, "id" | "poNumber" | "status"> & {
    buyerPoReference?: string;
  };
  buyerId: string;
  buyer: Pick<Party, "id" | "name" | "city" | "country" | "type">;
  containerId?: string | null;
  container?: {
    id: string;
    containerNumber: string;
    status?: ContainerStatus;
    destination?: string;
  } | null;
  invoiceDate: string;
  submittedAt?: string | null;
  currency: string;
  exchangeRate: number;
  subTotal: number;
  gstAmount: number;
  netTotal: number;
  status: SalesBillStatus;
  items?: SalesBillItem[];
  totalPieces?: number;
  paymentRecord?: SalesBillPaymentRecord;
  payment?: {
    amountPaid: number;
    outstanding: number;
  };
  paymentHistory?: SalesPaymentHistoryItem[];
}

export interface CreateSalesBillItemPayload {
  poItemId: string;
  designNumber: string;
  garmentType: string;
  color: string;
  size: string;
  quantity: number;
  ratePerPiece: number;
}

export interface CreateSalesBillPayload {
  poId: string;
  containerId?: string;
  invoiceDate: string;
  currency: string;
  exchangeRate: number;
  items: CreateSalesBillItemPayload[];
}

export interface RecordSalesPaymentPayload {
  amountReceived: number;
  paymentDate: string;
  paymentMode: string;
  referenceNo?: string;
}

export interface SalesBillsListSummary {
  totalBilledThisMonth: number;
  pendingPayment: number;
  billsRaised: number;
}

export interface SalesBillsListResponse
  extends PaginatedResponseLike<SalesBill> {
  summary?: SalesBillsListSummary;
}

export type SalesNoteType = "CREDIT" | "DEBIT";

export interface SalesNote {
  id: string;
  noteNumber: string;
  type: SalesNoteType;
  salesBillId: string;
  buyerId: string;
  amount: number;
  reason: string;
  date: string;
  salesBill?: Pick<SalesBill, "id" | "invoiceNumber" | "netTotal" | "status">;
  buyer?: Pick<Party, "id" | "name" | "type">;
}

export interface CreateSalesNotePayload {
  type: SalesNoteType;
  salesBillId: string;
  amount: number;
  reason: string;
  date: string;
}

export interface SalesRegisterBill extends SalesBill {
  totalPieces: number;
  amountPaid: number;
  outstanding: number;
}

export interface SalesRegisterResponse {
  summary: {
    totalSales: number;
    totalPieces: number;
    outstanding: number;
  };
  bills: SalesRegisterBill[];
  totals: {
    totalAmount: number;
    totalPieces: number;
  };
}

export interface KarigarPayment {
  id: string;
  paymentNumber: string;
  karigarId: string;
  karigar: Pick<Party, "id" | "name" | "partyNumber">;
  poId: string;
  po?: Pick<PurchaseOrder, "id" | "poNumber"> | null;
  operationId: string;
  operation: Pick<Operation, "id" | "name">;
  productionEntryType: string;
  piecesCompleted: number;
  ratePerPiece: number;
  amountDue: number;
  weekNumber: number;
  year: number;
  status: PaymentStatus;
  paidAt: string | null;
  paymentMode: string | null;
  referenceNo: string | null;
  notes?: string | null;
}

export interface KarigarPaymentsSummary {
  totalDueThisWeek: number;
  totalPaidThisMonth: number;
  pendingCount: number;
}

export interface KarigarPaymentsListResponse
  extends PaginatedResponseLike<KarigarPayment> {
  summary?: KarigarPaymentsSummary;
}

export interface ConfirmKarigarPaymentPayload {
  paymentDate: string;
  paymentMode: string;
  referenceNo?: string;
}

export type SupplierBillPayStatus = "PAID" | "PARTIAL" | "UNPAID";

export interface SupplierBillPaymentRow {
  id: string;
  billNumber: string;
  supplierId: string;
  supplier?: Pick<Party, "id" | "name">;
  purchaseDate: string;
  totalAmount: number;
  totalPaid: number;
  outstanding: number;
  paymentStatus: SupplierBillPayStatus;
  payments?: Array<{
    id: string;
    amountPaid: number;
    paymentDate: string;
    paymentMode: string;
    referenceNo?: string | null;
    notes?: string | null;
  }>;
}

export interface SupplierPaymentsSummary {
  totalPending: number;
  totalPaidThisMonth: number;
}

export interface SupplierPaymentsListResponse
  extends PaginatedResponseLike<SupplierBillPaymentRow> {
  summary?: SupplierPaymentsSummary;
}

export interface RecordSupplierPaymentPayload {
  purchaseBillId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMode: string;
  referenceNo?: string;
  notes?: string;
}

export type VoucherType = "PAYMENT" | "RECEIPT";

export interface Voucher {
  id: string;
  voucherNumber: string;
  type: VoucherType;
  partyDescription: string;
  amount: number;
  paymentMode: string;
  referenceNo: string | null;
  date: string;
  notes: string | null;
  createdById?: string;
  createdBy?: { id: string; name: string; email?: string };
}

export interface CreateVoucherPayload {
  type: VoucherType;
  partyDescription: string;
  amount: number;
  paymentMode: string;
  referenceNo?: string;
  date: string;
  notes?: string;
}

export type BoxStatus = "PACKED" | "LOADED" | "PENDING";

export type ContainerStatus = "LOADING" | "READY" | "DISPATCHED" | "PENDING";

export interface BoxPacking extends SizeBreakdown {
  id: string;
  boxNumber: string;
  poId: string;
  poItemId: string;
  designNumber: string;
  color: string;
  totalPieces: number;
  containerId: string | null;
  status: BoxStatus;
  createdAt: string;
  updatedAt?: string;
  po?: Pick<PurchaseOrder, "id" | "poNumber" | "status"> & {
    buyer?: Pick<Party, "id" | "name" | "city" | "country">;
  };
  poItem?: Pick<POItem, "id" | "designNumber" | "garmentType" | "color">;
  container?: {
    id: string;
    containerNumber: string;
    status: ContainerStatus;
  } | null;
}

export interface CreateBoxPayload extends SizeBreakdown {
  poId: string;
  poItemId: string;
  designNumber: string;
  color: string;
}

export interface BoxesListSummary {
  boxesPackedThisMonth?: number;
  totalPiecesPacked?: number;
  boxesLoadedInContainer?: number;
}

export interface BoxesListResponse extends PaginatedResponseLike<BoxPacking> {
  summary?: BoxesListSummary;
}

export interface Container {
  id: string;
  containerNumber: string;
  poId: string;
  buyerId: string;
  destination: string;
  dispatchDate: string | null;
  status: ContainerStatus;
  createdAt: string;
  updatedAt?: string;
  buyer?: Pick<Party, "id" | "name" | "city" | "country">;
  po?: Pick<PurchaseOrder, "id" | "poNumber" | "status">;
  boxes?: BoxPacking[];
  boxCount?: number;
  totalPieces?: number;
}

export interface ContainerSizeSummary {
  total_0_3M: number;
  total_3_6M: number;
  total_6_9M: number;
  total_9_12M: number;
  total_12_18M: number;
  total_18_24M: number;
  grandTotalPieces: number;
  boxCount: number;
}

export interface ContainerDetail extends Container {
  boxes: BoxPacking[];
  sizeSummary: ContainerSizeSummary;
}

export interface CreateContainerPayload {
  poId: string;
  destination: string;
  dispatchDate?: string;
}

export interface AddBoxToContainerPayload {
  boxId: string;
}

export interface MarkDispatchedPayload {
  dispatchDate: string;
}

export interface BoxFilters {
  poId: string;
  status: "ALL" | BoxStatus;
  from: string;
  to: string;
}

export interface ContainerFilters {
  poId: string;
  status: "ALL" | ContainerStatus;
}
