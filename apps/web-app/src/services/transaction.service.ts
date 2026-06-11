import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

interface TransactionRecord {
  id: number;
  amount: number;
  senderAddress: string;
  senderId: number | null;
  senderType?: "human" | "agent" | null;
  senderName?: string | null;
  senderAvatarUrl?: string | null;
  paymentProtocol?: "wallet" | "x402" | "mpp" | null;
  recipientAddress: string;
  recipientId: number | null;
  txHash: string;
  note: string | null;
  createdAt: string;
}

export interface TipperRecord {
  identityKey: string;
  userId: number | null;
  username: string;
  profileUsername: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  senderType: "human" | "agent";
  senderAddress: string;
  totalAmount: string;
  tipCount: number;
  lastTippedAt: string | null;
}

class TransactionService {
  static async getTransactionRecords(): Promise<TransactionRecord[]> {
    const response = await ApiClient.get<TransactionRecord[]>(
      API_ENDPOINTS.TRANSACTION_RECORDS,
    );
    return response;
  }

  static async getTippers(): Promise<TipperRecord[]> {
    const response = await ApiClient.get<TipperRecord[]>(
      API_ENDPOINTS.TRANSACTION_TIPPERS,
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
