import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'
import Chatdashboard from '@/components/dashboard/Chatdashboard';
import Unauthchatdashboard from '@/components/dashboard/Unauthchatdashbpard';


export const dynamic = 'force-dynamic'

const Page = async () => {
    const { getUser } = getKindeServerSession()
    const user = await getUser();

    if (!user || !user.id) {
        return (
            <Unauthchatdashboard />
        )
    }

    const dbUser = await prisma.user.findFirst({
        where: {
            id: user.id
        }
    })
    if (!dbUser) {
        redirect('/auth-callback?origin=dashboard')
    }

    const aimodel = await prisma.setting.findFirst({
        where: {
            userId: user.id
        }
    })

    return (

        <Chatdashboard  scroll={aimodel?.Scroll} aimodel={aimodel?.AI}/>
    )
}

export default Page
