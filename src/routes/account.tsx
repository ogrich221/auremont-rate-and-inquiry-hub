import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/lib/bank';
import { AccountPage } from '@/components/bank/account';
export const Route=createFileRoute('/account')({head:()=>pageHead('Demo Account Overview','Simulated website account. No real financial operations.'),component:AccountPage});
