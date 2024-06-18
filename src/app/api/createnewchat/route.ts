import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { Pinecone } from '@pinecone-database/pinecone';
import { NextResponse } from "next/server";
import { getPineconeClient } from '@/lib/pinecone';
import { Whisper } from 'next/font/google';
export const maxDuration = 300;



const middleware = async () => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) throw new Error('Unauthorized')

    return { userId: user.id }
}

export async function POST(req: Request, res: Response) {
    if (req.method === 'POST') {

        const body = await req.json();
        const { id, name } = body;

        console.log(id)

        console.log(name)

        const metadata = await middleware();

        const newchat = await prisma.chatbotlist.findFirst({
            where: {
                id: id
            }
        })

        try {

            const chatbot = await prisma.chatbotlist.create({
                data: {
                    chatbotId: newchat?.chatbotId,
                    name: name
                }
            })

            return NextResponse.json(
                {
                    chat_id: chatbot.id,
                },
                { status: 200 }
            );


        } catch (error) {
            console.error(error);
            return NextResponse.json(
                { error: "internal server error" },
                { status: 500 }
            );
        }
    }
}