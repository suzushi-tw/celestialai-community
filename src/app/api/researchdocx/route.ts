
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextResponse } from 'next/server';

import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse, StreamData, Tool } from 'ai';
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicStream } from 'ai';
import { Document, Packer, Paragraph, TextRun, PageBreak } from "docx";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import prisma from '@/lib/prisma';
export const maxDuration = 300;

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
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
        console.log(body)

        const { name, description, pages } = body;

        const metadata = await middleware();

        try {
            let paragraphs = [];

            for (const item of pages) {
                const { title, description: pageDescription } = item;

                const initialresponse = await openai.chat.completions.create({
                    messages: [
                        {
                            role: 'user',
                            content: `You are a professional researcher currently working on one of the page of word document with Topic: ${name} and Description: ${description},           
                                Title of that page: ${title}, Description: ${pageDescription}, now write a optimized query to search the web so you have the info to continue writing your paper !`,
                        },
                    ],
                    model: "gpt-3.5-turbo",
                    stream: false,
                    max_tokens: 4096,
                });

                const assistantContent = initialresponse.choices[0].message.content;
                console.log(assistantContent)

                const webresponse = await fetch('https://api.tavily.com/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify({
                        api_key: process.env.TAVILY_API_KEY,
                        query: assistantContent,
                        search_depth: "basic",
                        include_answer: false,
                        include_images: true,
                        include_raw_content: false,
                        max_results: 5,
                        include_domains: [],
                        exclude_domains: []
                    })
                });

                if (!webresponse.ok) {
                    console.error('Response status:', webresponse.status);
                    console.error('Response status text:', webresponse.statusText);
                    throw new Error('Network response was not ok');
                }

                const tavilyResponse = await webresponse.json();
                const tavilyResults = tavilyResponse.results.map((result: { title: string, content: string }) => `${result.title}: ${result.content}`).join('\n');
                const tavilyInput = `Tavily results for "${assistantContent}":\n${tavilyResults}`;

                const response = await openai.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content:
                                'Use the following pieces of context to continue writing the paper.',
                        },
                        {
                            role: 'user',
                            content: `You are a professional researcher currently working on one of the page for the paper with Topic: ${name} and Description: ${description}, 
                                Title of that page: ${title}, Description: ${pageDescription}, utilize the followin web search result to continue writing.
                                Internet: ${tavilyInput}`,
                        },

                    ],
                    model: "gpt-3.5-turbo",
                    stream: false,
                });
                const pageContent = response.choices[0].message.content;

                paragraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: pageContent || '',
                                font: "Arial",
                                size: 12,
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new PageBreak(),
                        ],
                    })
                );

            }

            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: paragraphs,
                    },
                ],
            });

            const buffer = await Packer.toBuffer(doc)
            const documentname=`documents/${name}.docx`
            const s3url = `https://${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com/${documentname}`;
            const s3command = new PutObjectCommand({
                Bucket: process.env.S3_UPLOAD_BUCKET,
                Key: documentname,
                Body: buffer,
                ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            try {
                const data = await client.send(s3command);
                console.log("Success", data);
                await prisma.file.create({
                    data: {
                        name: name,
                        key: documentname,
                        userId: metadata.userId,
                        type: "research",
                        url: s3url
                    }
                });
            } catch (err) {
                console.log("Error", err);
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