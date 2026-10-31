import { z } from "zod";

export const requestStatuses = ["pending", "under_review", "payment_verified", "processing", "completed", "rejected", "cancelled"] as const;
export type RequestStatus = (typeof requestStatuses)[number];
export type RequestType = "deposit" | "withdrawal";

export type Game = { id: string; name: string; playerIdLabel: string; enabled: boolean };
export type PaymentDestination = { id: string; method: string; accountNumber: string; accountTitle: string };
export type CustomerRequest = {
  id: string; type: RequestType; status: RequestStatus; amountPkr: number;
  gameName: string; playerId: string; createdAt: string; calculatedCoins?: number;
};

export const depositSchema = z.object({
  amountPkr: z.coerce.number().positive().max(10000000),
  gameId: z.string().uuid(),
  playerId: z.string().trim().min(1).max(100),
  paymentDestinationId: z.string().uuid(),
  transactionId: z.string().trim().min(1).max(120),
  whatsappNumber: z.string().trim().max(30).optional(),
  proof: z.instanceof(File).refine((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Upload a JPG, PNG, or WebP image").refine((file) => file.size <= 5 * 1024 * 1024, "Image must be 5 MB or smaller")
});

export const withdrawalSchema = z.object({
  amountPkr: z.coerce.number().positive().max(10000000),
  gameId: z.string().uuid(),
  playerId: z.string().trim().min(1).max(100),
  payoutMethod: z.string().trim().min(1).max(80),
  accountNumber: z.string().trim().min(1).max(120),
  accountTitle: z.string().trim().min(1).max(120),
  whatsappNumber: z.string().trim().max(30).optional()
});

export const statusLabel: Record<RequestStatus, string> = {
  pending: "Pending", under_review: "Under review", payment_verified: "Payment verified",
  processing: "Processing", completed: "Completed", rejected: "Rejected", cancelled: "Cancelled"
};
