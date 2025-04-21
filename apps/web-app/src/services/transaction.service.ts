import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

interface TransactionRecord {
  id: number;
  amount: number;
  senderAddress: string;
  senderId: number | null;
  recipientAddress: string;
  recipientId: number | null;
  txHash: string;
  note: string | null;
  createdAt: string;
}

class TransactionService {
  static async getTransactionRecords(): Promise<TransactionRecord[]> {
    const response = await ApiClient.get<TransactionRecord[]>(
      API_ENDPOINTS.TRANSACTION_RECORDS,
    );
    return response;
  }

  static async createTransactionRecord(
    data: Omit<TransactionRecord, "id" | "createdAt">,
  ) {
    const response = await ApiClient.post<TransactionRecord>(
      API_ENDPOINTS.TRANSACTION_RECORDS,
      data as any,
    );
    return response;
  }
}

export default TransactionService;
export type { TransactionRecord };
