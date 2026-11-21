import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { pageHead } from '@/lib/bank';
import { siteQuery } from './index';
import { AdminPage } from '@/components/bank/account';
export const Route=createFileRoute('/admin')({head:()=>pageHead('Website Administration','Role-protected website content management and private inquiry inbox.'),loader:({context})=>context.queryClient.ensureQueryData(siteQuery),component:Page});
function Page(){const {data}=useSuspenseQuery(siteQuery);return <AdminPage initial={data}/>}
