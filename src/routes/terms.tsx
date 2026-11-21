import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/lib/bank';
import { LegalPage } from '@/components/bank/pages';
export const Route=createFileRoute('/terms')({head:()=>pageHead('Terms & Conditions','Terms & Conditions for the Auremont demonstration website.'),component:Page});
function Page(){return <LegalPage kind="terms"/>}
