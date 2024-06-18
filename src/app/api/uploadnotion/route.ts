import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { OpenAIEmbeddings } from "@langchain/openai";

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { PDFLoader, } from "@langchain/community/document_loaders/fs/pdf";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient } from "@/lib/pinecone";

import { NotionAPILoader } from "@langchain/community/document_loaders/web/notionapi";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
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
        const { data } = body;
        console.log(data);

        const metadata = await middleware();


        try {

            let createfiles = [];
            for (const item of data) {
                const result = await onUploadComplete({ page: item, metadata });
                createfiles.push(result);
            }

            await prisma.user.update({
                where: {
                    id: metadata.userId
                },
                data: {
                    Filenum: {
                        increment: data.length
                    }
                }
            })

            if (createfiles.length > 0) {
                return NextResponse.json(
                    { status: 200 }
                );
            }

            return NextResponse.json(
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



const onUploadComplete = async ({
    metadata,
    page,
}: {
    metadata: Awaited<ReturnType<typeof middleware>>
    page: {
        pageId: string
        pageTitle: string
    }
}) => {
    const isFileExist = await prisma.file.findFirst({
        where: {
            name: page.pageTitle,
        },
    })

    if (isFileExist) return

    const createdFile = await prisma.file.create({
        data: {
            key: page.pageId,
            name: page.pageTitle,
            userId: metadata.userId,
            url: "",
            type: "notion",
            uploadStatus: 'PROCESSING',
        },
    })



    try {

        const notion = await prisma.notion.findFirst({
            where: {
                userId: metadata.userId
            }
        })

        const pageLoader = new NotionAPILoader({
            clientOptions: {
                auth: notion?.accessToken,
            },
            id: page.pageId,
            type: "page",
        });
        const splitter = new RecursiveCharacterTextSplitter();

        const pageDocs = await pageLoader.load();
        const splitDocs = await splitter.splitDocuments(pageDocs);

        console.log({ pageDocs });

        const pinecone = getPineconeClient();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_Index!);

        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY!,
        });

        await PineconeStore.fromDocuments(splitDocs, embeddings, {
            pineconeIndex,
            namespace: createdFile.id,
        });


        await prisma.file.update({
            data: {
                uploadStatus: 'SUCCESS',
            },
            where: {
                id: createdFile.id,
            },
        })


        return createdFile;


    } catch (err) {
        console.error('An error occurred:', err);
        await prisma.file.update({
            data: {
                uploadStatus: 'FAILED',
            },
            where: {
                id: createdFile.id,
            },
        })
    }
}