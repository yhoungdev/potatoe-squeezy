export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bounties: {
        Row: {
          id: string
          issueId: number
          repositoryId: number
          amount: number
          currency: string
          status: string
          createdAt: string
          expiresAt: string | null
          claimedBy: string | null
          paidTo: string | null
          transactionId: string | null
          network: string
        }
        Insert: {
          id?: string
          issueId: number
          repositoryId: number
          amount: number
          currency: string
          status: string
          createdAt?: string
          expiresAt?: string | null
          claimedBy?: string | null
          paidTo?: string | null
          transactionId?: string | null
          network: string
        }
        Update: {
          id?: string
          issueId?: number
          repositoryId?: number
          amount?: number
          currency?: string
          status?: string
          createdAt?: string
          expiresAt?: string | null
          claimedBy?: string | null
          paidTo?: string | null
          transactionId?: string | null
          network?: string
        }
      }
      wallet_links: {
        Row: {
          id: string
          githubId: string
          walletAddress: string
          createdAt: string
          verified: boolean
        }
        Insert: {
          id?: string
          githubId: string
          walletAddress: string
          createdAt?: string
          verified?: boolean
        }
        Update: {
          id?: string
          githubId?: string
          walletAddress?: string
          createdAt?: string
          verified?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 