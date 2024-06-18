import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'
import Chatdashboard from '@/components/dashboard/Chatdashboard';

interface PageProps {
    params: {
        id: string
    }
}

export const dynamic = 'force-dynamic'

const Page = async ({ params }: PageProps) => {
    const { getUser } = getKindeServerSession()
    const user = await getUser();

    if (!user || !user.id) redirect('/auth-callback?origin=dashboard')

    const { id } = params

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

        <Chatdashboard id={id} scroll={aimodel?.Scroll} aimodel={aimodel?.AI}/>
    )
}

export default Page
