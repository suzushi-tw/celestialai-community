import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { OpenAIEmbeddings } from "@langchain/openai";

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient } from "@/lib/pinecone";
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';

const client = new S3Client({
    region: process.env.S3_UPLOAD_REGION,
    credentials: {
        secretAccessKey: process.env.S3_UPLOAD_SECRET || '',
        accessKeyId: process.env.S3_UPLOAD_KEY || '',
    },
});

const middleware = async () => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) throw new Error('Unauthorized')

    return { userId: user.id }
}

export async function POST(req: Request, res: Response) {
    if (req.method === 'POST') {

        const body = await req.json();
        const { file_key, file_name } = body;
        console.log(file_key, file_name);

        const s3url = `https://${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com/${file_key}`;
        const file = {
            key: file_key,
            name: file_name,
            url: s3url,
        };
        const metadata = await middleware();
        try {

            const createfile = await onUploadComplete({ file, metadata });

            // 返回檔案的資訊給客戶端
            if (createfile) {

                await prisma.user.update({
                    where: {
                        id: metadata.userId
                    },
                    data: {
                        Filenum: {
                            increment: 1
                        }
                    }
                })

                return NextResponse.json(
                    {
                        file_id: createfile.id,
                    },
                    { status: 200 }
                );
            }

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
    file,
}: {
    metadata: Awaited<ReturnType<typeof middleware>>
    file: {
        key: string
        name: string
        url: string
    }
}) => {
    const isFileExist = await prisma.file.findFirst({
        where: {
            key: file.key,
        },
    })

    if (isFileExist) return

    const createdFile = await prisma.file.create({
        data: {
            key: file.key,
            name: file.name,
            userId: metadata.userId,
            url: file.url,
            uploadStatus: 'PROCESSING',
        },
    })



    try {
        const response = await fetch(
            file.url
        )

        const blob = await response.blob()

        const loader = new DocxLoader(blob);

        // extract pdf page level text
        const docs = await loader.load();

        const pinecone = getPineconeClient();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_Index!);

        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY!,
        });

        await PineconeStore.fromDocuments(docs, embeddings, {
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