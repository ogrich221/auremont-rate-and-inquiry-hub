import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/lib/bank';
import { FAQPage } from '@/components/bank/pages';
export const Route=createFileRoute('/faq')({head:()=>pageHead('Frequently Asked Questions','Clear answers about the Auremont demonstration.'),component:Page});
function Page(){return <FAQPage/>}
