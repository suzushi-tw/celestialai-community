import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'
import Workplacedashboard from '@/components/dashboard/Workplacedashboard';


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
        <Workplacedashboard />
    )
}

export default Page