import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { OpenAIEmbeddings } from "@langchain/openai";
import OpenAI from 'openai';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { Readable } from 'stream';
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient } from "@/lib/pinecone";
import axios from 'axios';
import FormData from "form-data";
import fs from "fs";
import { Uploadable } from 'openai/uploads.mjs';

export const maxDuration = 300;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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
            // Return a response indicating an internal server error
            return NextResponse.json(
                { error: "internal server error" },
                { status: 500 }
            );
        }
    } else {
        // Handle other HTTP methods if needed
        return NextResponse.json(
            { error: "Method not allowed" },
            { status: 405 }
        );
    }
}


async function convertAudioToText(audioData: Buffer) {
    // Define a temporary directory for storing the file
    const tempDir = '/tmp/audioFiles/';
    // Create the directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate a unique filename for the audio file
    const fileName = `${Date.now()}.mp3`;
    const filePath = `${tempDir}${fileName}`;

    // Save the audio data to a file
    fs.writeFileSync(filePath, audioData);

    // Now, use the correct path to the file for transcription
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
    });

    console.log(transcription.text);
    fs.unlinkSync(filePath); // Clean up the temporary file
    const transcribedText = transcription.text;
    return transcribedText;
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
            type: "audio",
            uploadStatus: 'PROCESSING',
        },
    })

    try {

        const response = await fetch(file.url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const text = await convertAudioToText(buffer);

        console.log(text)

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 100,
        });

        const output = await splitter.createDocuments([text]);

        const pinecone = getPineconeClient();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_Index!);

        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY!,
        });

        await PineconeStore.fromDocuments(output, embeddings, {
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