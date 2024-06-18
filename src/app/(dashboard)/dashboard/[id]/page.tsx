import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'
import Chatbotdashboard from '@/components/dashboard/Chatbotdashboard';

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

    const chatbot = await prisma.chatbot.findFirst({
        where: {
            id: id
        }
    })

    const chatbotlist = await prisma.chatbotlist.findFirst({
        where: {
            id: id
        }
    })

    let chatbotName = '';
    if (chatbot) {
        chatbotName = chatbot.name;
    } else if (chatbotlist) {
        const chatbotFromList = await prisma.chatbot.findFirst({
            where: {
                id: chatbotlist.chatbotId
            }
        })
        if (chatbotFromList) {
            chatbotName = chatbotFromList.name;
        }
    }

    if (!chatbot && !chatbotlist) {
        redirect('/auth-callback?origin=dashboard')
    }

   
    return (
        <Chatbotdashboard id={id} name={chatbotName} chatbotid={id}  />
    )
}

export default Page
