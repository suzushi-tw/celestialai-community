import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse, StreamData, Tool } from 'ai';

import Anthropic from '@anthropic-ai/sdk';
import { AnthropicStream } from 'ai';
import axios from 'axios'
// import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

// // IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {


        const body = await req.json();
        const { messages, name, description } = body;
        const message = JSON.stringify(messages);



        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',

            stream: true,
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a helpful assistant. Your goal is to generate a JSON array describing the title and description for each page of the document based on the context'
                },
                {
                    role: 'user',
                    content: `Use the following pieces of context to generate a JSON array describing the title and description for each page of the document based on the context
                      
                \n----------------\n
                
                Name of the document: ${name}
                Description of the document: ${description}

                EXAMPLE:
                {title: '', description: ''},
                {title: '', description: ''},
                {title: '', description: ''},
                {title: '', description: ''},
                {title: '', description: ''}
                `,
                },
            ],

        });

        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);

    } catch (error) {
        console.error('Error:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
} 