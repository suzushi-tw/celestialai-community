import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { Pinecone } from '@pinecone-database/pinecone';
import { NextResponse } from "next/server";
import { getPineconeClient } from '@/lib/pinecone';
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
        const { selectedIds, name } = body;
        console.log(selectedIds);

        console.log(name)

        const metadata = await middleware();

        const newchat = await prisma.chatbot.create({
            data: {
                name: name,
                index: process.env.PINECONE_Index!,
                userId: metadata.userId
            }
        })

        try {

            const pinecone = getPineconeClient();

            for (const id of selectedIds) {
                const pineconeIndex = pinecone.Index(process.env.PINECONE_Index!).namespace(id);
                const queryResponse = await pineconeIndex.query({
                    vector: new Array(1536).fill(0),
                    topK: 10000,
                    includeValues: true,
                    includeMetadata: true
                });
                console.log(queryResponse)

                const matches = queryResponse.matches;

                const filteredMatches = matches.map(match => ({
                    id: match.id,
                    values: match.values,
                    metadata: match.metadata
                }));

                console.log(filteredMatches);
                await pinecone.Index(process.env.PINECONE_Index!)
                    .namespace(newchat.id).upsert(filteredMatches)
            }

            const chatbot = await prisma.chatbotlist.create({
                data:{
                    chatbotId: newchat.id,
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