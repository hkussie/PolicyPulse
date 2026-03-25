export type Policy = {
  id: number
  groupName: string | null
  groupDba: string | null
  policyStatus: string | null
  policyNumber: number | null
  carrier: string | null
  renewalDate: string | null
  lives: number | null
  agentName: string | null
  agencyName: string | null
  paragonSalesExec: string | null
  createdAt: string
  updatedAt: string
}

export type PolicyInput = Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>
