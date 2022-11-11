export interface Order {
  _id: string;
  customerPhoneNo: string;
  orderBillNo: string;
  orderType: string;
  orderModelNo: string;
  orderDescription: string;
  totalAmount: number;
  amountPaid: number;
  amountPaidToday: number;
  transactionType: string;
  transactionSummary: string;
  orderStatus: string;
  lastUpdatedDate: string;
  image: string;
  creator: string;
}
