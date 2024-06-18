import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse, StreamData, Tool } from 'ai';

import Anthropic from '@anthropic-ai/sdk';
import { AnthropicStream } from 'ai';
import axios from 'axios'
// import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import prisma from '@/lib/prisma';
import { OpenAIEmbeddings } from "@langchain/openai";
import { getPineconeClient } from '@/lib/pinecone';
import { CoreTool } from 'ai';
import { PineconeStore } from "@langchain/pinecone";
import { Whisper } from 'next/font/google';


const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
    role: string;
    content: string;
}

export async function POST(req: Request) {
    try {

        const { getUser } = getKindeServerSession();
        const user = await getUser();
        const userId = user?.id
        if (!userId) return new Response('Unauthorized', { status: 401 });


        const body = await req.json();
        const { messages, previousmessage, aimodel, id } = body;

        console.log(id)

        const namespace = await prisma.chatbotlist.findFirst({
            where: {
                id: id
            }
        })

        if (!namespace) return new Response('Invalid ID', { status: 400 });


        const reversedMessages = messages.reverse();

        // Find the latest user message
        const userMessage = reversedMessages.find((message: Message) => message.role === 'user');
        const query = userMessage ? userMessage.content : '';

        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY!,
        });
        const pinecone = getPineconeClient();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_Index!);
        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: namespace?.chatbotId,
        });
        const results = await vectorStore.similaritySearch(query, 7);




        if ((aimodel == 'claude-3-haiku-20240307' || aimodel == "claude-3-sonnet-20240229") && process.env.ANTHROPIC_API_KEY) {


            const response = await anthropic.messages.create({
                messages: [
                    {
                        role: 'user',
                        content: `Use the following pieces of context (or previous conversation if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
                                  
                              \n----------------\n
                              
                              PREVIOUS CONVERSATION:
                              ${previousmessage}
                              
                              \n----------------\n
                              
                              CONTEXT:
                              ${results.map((r) => r.pageContent).join('\n\n')}
                              
                              USER INPUT: ${query}`,
                    },
                    {
                        role: 'assistant',
                        content: 'Use the pieces of context (or previous conversation if needed, the piece of context is a document or PDF) to answer the users question in markdown format. Respond to the user in the same language as their input, and pay attention if the user uses traditional Chinese or simplified Chinese so you will not mix the output on this two languages. If you do not know the answer, reply with you do not know or kindly ask follow up questions politely so user elaborate more.',
                    },

                ],
                model: "claude-3-haiku-20240307",
                stream: true,
                max_tokens: 4096,
            });

            const stream = AnthropicStream(response, {
                onStart: async () => {
                    await prisma.chatbotmessage.create({
                        data: {
                            content: query,
                            role: "user",
                            chatbotlistId: namespace.id,
                        }
                    });
                },
                onCompletion: async (completion) => {
                    await prisma.chatbotmessage.create({
                        data: {
                            content: completion,
                            chatbotlistId: namespace.id,
                            role: "assistant"
                        }
                    })
                },
            });

            if (aimodel == "claude-3-sonnet-20240229") {
                await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        AdvanceAI: {
                            increment: 1
                        }
                    },
                })
            }

            return new StreamingTextResponse(stream)



        } else if ((aimodel == "gpt-3.5-turbo" || aimodel == "gpt-4-turbo-2024-04-09" || aimodel == "gpt-4o-2024-05-13") && process.env.OPENAI_API_KEY) {


            const response = await openai.chat.completions.create({
                model: aimodel,
                temperature: 0,
                tool_choice: "auto",
                tools,
                stream: true,
                messages: [
                    {
                        role: 'system',
                        content:
                            'Answer the question from user based on the context or previous conversation. Respond to the user in the same language as their input. If you do not know the answer, reply with you do not know or kindly ask follow up questions politely so user elaborate more.',
                    },
                    {
                        role: 'user',
                        content: `Use the following pieces of context (or previous conversaton if needed) to answer the question.
                          
                    \n----------------\n
                    
                    PREVIOUS CONVERSATION:
                    ${previousmessage}
                    
                    \n----------------\n
                    
                    CONTEXT:
                    ${results.map((r) => r.pageContent).join('\n\n')}
                    
                    USER INPUT: ${query}`,

                    },
                ],
            });


            const stream = OpenAIStream(response, {
                onStart: async () => {
                    await prisma.chatbotmessage.create({
                        data: {
                            content: query,
                            role: "user",
                            chatbotlistId: namespace.id,
                        }
                    });
                },
                onCompletion: async (completion) => {
                    await prisma.chatbotmessage.create({
                        data: {
                            content: completion,
                            chatbotlistId: namespace.id,
                            role: "assistant"
                        }
                    })
                },
            });

            if (aimodel == "gpt-4-turbo-2024-04-09" || aimodel == "gpt-4o-2024-05-13") {
                await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        AdvanceAI: {
                            increment: 1
                        }
                    },
                })
            }

            return new StreamingTextResponse(stream);
        }
    } catch (error) {
        console.error('Error:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
}


const tools: Tool[] = [
    {
        type: 'function',
        function: {
            name: 'get_current_weather',
            description: 'Get the current weather',
            parameters: {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description: 'The city and state, e.g. San Francisco, CA',
                    },
                    format: {
                        type: 'string',
                        enum: ['celsius', 'fahrenheit'],
                        description:
                            'The temperature unit to use. Infer this from the users location.',
                    },
                },
                required: ['location', 'format'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'generateBarChart',
            description: `Generate JSON data for a bar chart. It must contain properties label, type, and value. Each object represents a data point in a series. The label property should contain the name about what the data refers to, the type property should indicate the series (e.g., "series1", "series2"), and the value property should always contain a number. '
                      
      EXAMPLE:
      {
          label: 'Mon.',
          type: 'series1',
          value: 2800,
      },
      {
          label: 'Mon.',
          type: 'series2',
          value: 2260,
      },
      {
          label: 'Tues.',
          type: 'series1',
          value: 1800,
      },
      {
          label: 'Tues.',
          type: 'series2',
          value: 1300,
      },
      {
          label: 'Wed.',
          type: 'series1',
          value: 950,
      },
      {
          label: 'Wed.',
          type: 'series2',
          value: 900,
      },
      `,
            parameters: {
                type: 'object',
                properties: {
                    data: {
                        type: 'string',
                        description: 'The raw data to be visualized in the bar chart.',
                    },
                },
                required: ['barchart'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'generatePieChart',
            description: `Generate JSON data for a pie chart. With properties type, and value for a pie chart. Each object represents a data point in a series. The type property should indicate what the item is about, and the value property should always contain a number. '
                      
      EXAMPLE:
      {
          type: 'Type1',
          value: 27,
      },
      {
          type: 'Type2',
          value: 25,
      },
      {
          type: 'Type3',
          value: 18,
      },
      {
          type: 'Type4',
          value: 15,
      },
      {
          type: 'Type5',
          value: 10,
      },
      {
          type: 'Others',
          value: 5,
      },
      `,
            parameters: {
                type: 'object',
                Description: "The Json array for the dataset",
                properties: {
                    "piechart": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "type": { "type": "string" },
                                "value": { "type": "integer" }
                            },
                        }
                    }
                },
                required: ['piechart'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'generateLineChart',
            description: `Generate JSON data for a Line chart(In plain text without escape character). With properties representing the x axis as well as y axis.
                      
      EXAMPLE:
      { Days: '1991', value: 3 },
      { Days: '1992', value: 4 },
      { Days: '1993', value: 3.5 },
      { Days: '1994', value: 5 },
      { Days: '1995', value: 4.9 },
      `,
            parameters: {
                type: 'object',
                Description: "The Json array for the dataset",
                properties: {
                    "linechart": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "date": { "type": "string" },
                                "value": { "type": "integer" }
                            },
                        }
                    }
                },
                required: ['linechart'],
            },

        },
    },
    {
        type: 'function',
        function: {
            name: 'generateDate',
            description: `Generate the date for a typescript calander component based on the information
      `,
            parameters: {
                type: 'object',
                Description: "The Json array for the dataset",
                properties: {
                    "piechart": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "Date": { "type": "string" },
                            },
                        }
                    }
                },
                required: ['Date'],
            },
        },
    },
];

