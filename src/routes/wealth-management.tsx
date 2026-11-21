import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/lib/bank';
import { ProductPage } from '@/components/bank/pages';
export const Route=createFileRoute('/wealth-management')({head:()=>pageHead('Wealth Management','A thoughtful perspective on your financial future.'),component:Page});
function Page(){return <ProductPage kind="wealth"/>}
