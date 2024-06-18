import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'
import Filedashboard from '@/components/dashboard/FileDashboard';


const Page = async () => {
    const { getUser } = getKindeServerSession()
    const user = await getUser();

    if (!user || !user.id) redirect('/auth-callback?origin=dashboard')

    const dbUser = await prisma.user.findFirst({
        where: {
            id: user.id
        }
    })
    if (!dbUser) {
        redirect('/auth-callback?origin=dashboard')
    }
    

    return (
        <Filedashboard  />
    )
}

export default Page