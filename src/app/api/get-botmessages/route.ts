
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';


export const POST = async (req: Request) => {


    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { chatId } = await req.json();


    if (!chatId) {
        return NextResponse.json([]);
    }
    try {
        const messages = await prisma.chatmessage.findMany({
            where: {
                chatId: chatId,
            },
        })

        return NextResponse.json(messages);
    } catch (error) {
        console.log(error);
        return new Response('Internal Server Error', { status: 500 })
    }
};