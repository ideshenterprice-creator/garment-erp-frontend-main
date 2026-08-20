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
  contact: string;
  gstNumber: string;
  city: string;
  country: string;
  bankAccount: string;
  ifsc: string;
  bankName: string;
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

export interface KarigarProfile {
  id: string;
  partyId: string;
  party: Party;
  paymentType: KarigarPaymentType;
  weeklySalary: number;
  isActive: boolean;
  operations: KarigarOperation[];
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
  buyer: Party;
  buyerPoReference: string;
  orderDate: string;
  deliveryDate: string;
  shippingDestination: string;
  paymentTerms: string;
  specialInstructions: string;
  status: PurchaseOrderStatus;
  totalPieces: number;
  totalDesigns: number;
  items?: POItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseBill {
  id: string;
  billNumber: string;
  supplierId: string;
  supplier: Party;
  supplierInvoiceNo: string;
  purchaseDate: string;
  poId: string;
  po: PurchaseOrder;
  productId: string;
  product: Product;
  vehicleNumber: string;
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
