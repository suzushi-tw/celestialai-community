
import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function POST(req: Request, res: Response) {
    if (req.method === 'POST') {

        const { getUser } = getKindeServerSession()
        const user = await getUser()

        const body = await req.json();
        let { url, name } = body;


        try {
            const createdurl = await prisma.file.create({
                data: {
                    key: name,
                    name: name,
                    userId: user?.id,
                    url: url,
                    type: "web",
                    uploadStatus: 'PROCESSING',
                },
            })


            const getmarkdown = await fetch(`https://r.jina.ai/${url}`, {
                method: 'GET',
                headers: {
                    "X-Return-Format": "markdown"
                },
            })
                .then(response => response.text()) // This returns a Promise<string>
                .then(text => {
                    console.log(text);
                    return text; // Explicitly return the text
                })
                .catch(error => {
                    console.error('Error:', error);
                    return undefined; // Return undefined in case of error
                });


            console.log(getmarkdown)

            const mdSplitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
                chunkSize: 1000,
                chunkOverlap: 100,
            });
            if (getmarkdown) {
                const mdDocs = await mdSplitter.createDocuments([getmarkdown]);

                const pinecone = getPineconeClient();
                const pineconeIndex = pinecone.Index(process.env.PINECONE_Index!);

                const embeddings = new OpenAIEmbeddings({
                    openAIApiKey: process.env.OPENAI_API_KEY!,
                });

                await PineconeStore.fromDocuments(mdDocs, embeddings, {
                    pineconeIndex,
                    namespace: createdurl.id,
                })

                await prisma.file.update({
                    data: {
                        uploadStatus: 'SUCCESS',
                    },
                    where: {
                        id: createdurl.id,
                    },
                })

                await prisma.user.update({
                    where: {
                        id: user?.id
                    },
                    data: {
                        Filenum: {
                            increment: 1
                        }
                    }
                })
            }


            return Response.json({ getmarkdown });

        } catch (error) {
            return Response.json({ error });
        }
    } else {
        return Response.json({ error: 'Missing user information' });
    }
}
