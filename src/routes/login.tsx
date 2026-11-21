import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/lib/bank';
import { AuthPage } from '@/components/bank/auth';
export const Route=createFileRoute('/login')({head:()=>pageHead('Online Banking Login','Secure access to the Auremont demo website. No real banking services.'),component:Page});
function Page(){return <AuthPage mode="login"/>}
