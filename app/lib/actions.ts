'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const statusConst = ['pending', 'paid'] as const;
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({ required_error: 'The customer id must be here.' }),
  amount: z.coerce
    .number()
    .nonnegative({ message: 'The amount must be more than 0 or equal.' }),
  status: z.enum(statusConst),
  date: z.string().date(),
});
const CreateInvoiceSchema = FormSchema.omit({ id: true, date: true });
const UpdateInvoiceSchema = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoiceSchema.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

  revalidatePath('/dashboard/invoices'); // here only invalids specific route in server-side router cache
  redirect('/dashboard/invoices'); // push on history
}
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoiceSchema.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;

  await sql`
  UPDATE invoices
  SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
  WHERE id = ${id}
`;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
