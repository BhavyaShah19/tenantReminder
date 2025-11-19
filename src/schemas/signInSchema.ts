import { z } from 'zod'

export const signInSchema = z.object({
  identifier: z.string(),
  password: z.string()
})

export const signUpSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string().min(6),
});

export const tenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  leaseStart: z.string().min(1, 'Lease start date is required').optional(),
  leaseEnd: z.string().min(1, 'Lease end date is required').optional()
});

export const unitSchema = z.object({
  unitName: z.string().min(1, 'Unit name is required'),
  tenants: z.array(tenantSchema).min(1, 'At least one tenant is required'),
});

export const billSchema = z.object({
  unitId: z.string().min(1, 'Please select a unit'),
  billType: z.string().min(1, 'Please select a bill type'),
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  status: z.string().default('pending').optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  proofUrl: z.string().optional().or(z.literal('')),
});
export type BillType = {
  id: string,
  unitId: string,
  amount: number,
  billType: string,
  dueDate: string,
  status: string,
  dateSent: string,
  datePaid: string,
  proofURL: string,
}
export type TenantType = {
  id: string,
  name: string,
  phoneNumber: string,
  leaseStart: string,
  leaseEnd: string
}

export type UnitType = {
  id: string,
  unitName: string,
  tenants: TenantType[]
}