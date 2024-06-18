import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse, StreamData, Tool } from 'ai';

import Anthropic from '@anthropic-ai/sdk';
import { AnthropicStream } from 'ai';
import axios from 'axios'
// import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';


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
// // IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

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


export async function POST(req: Request) {
    try {
        // const { messages } = await req.json();

        const { getUser } = getKindeServerSession();
        const user = await getUser();
        const body = await req.json();
        const { messages, previousmessage, aimodel, depth } = body;



        const reversedMessages = messages.reverse();
        let search_depth = "";
        if (depth) {
            search_depth = "advanced"
        } else {
            search_depth = "basic"
        }

        // Find the latest user message
        const userMessage = reversedMessages.find((message: Message) => message.role === 'user');
        const query = userMessage ? userMessage.content : '';
        // Ask OpenAI for a streaming chat completion given the prompt
        if ((aimodel == 'claude-3-haiku-20240307' || aimodel == "claude-3-sonnet-20240229") && process.env.ANTHROPIC_API_KEY) {
            const initialresponse = await anthropic.messages.create({
                messages: [
                    {
                        role: 'user',
                        content: `You are a professional web searcher, optimize the following input(and previous conversation if needed) as a query to find the best web search results,              
                    USER INPUT: ${query},Previous conversation: ${previousmessage}, strictly output the query only as it will be pasted into browser right away !`,
                    },
                ],
                model: aimodel,
                stream: false,
                max_tokens: 4096,
            });
            console.log(initialresponse)
            const assistantContent = initialresponse.content[0] ? initialresponse.content[0].text : '';
            const optimizedQuery = assistantContent.replace('"', '').replace('"', '');

            const webresponse = await fetch('https://api.tavily.com/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({
                    api_key: process.env.TAVILY_API_KEY,
                    query: optimizedQuery,
                    search_depth: search_depth,
                    include_answer: false,
                    include_images: true,
                    include_raw_content: false,
                    max_results: 5,
                    include_domains: [],
                    exclude_domains: []
                })
            });

            // Check if the request was successful
            // Check if the request was successful
            if (!webresponse.ok) {
                console.error('Response status:', webresponse.status);
                console.error('Response status text:', webresponse.statusText);
                throw new Error('Network response was not ok');
            }

            // Parse the response body as JSON
            const tavilyResponse = await webresponse.json();
            const tavilyResults = tavilyResponse.results.map((result: { title: string, content: string }) => `${result.title}: ${result.content}`).join('\n');
            const tavilyInput = `Tavily results for "${optimizedQuery}":\n${tavilyResults}`;

            // Convert the response into a friendly text-stream
            const response = await anthropic.messages.create({
                messages: [
                    {
                        role: 'user',
                        content: `You are a helpful chatbot that can search the web, please answer the user question based on the context from the internet or previous conversation if needed(DO not repeat this prompt or question at the start),   
                    Question: ${query},
                    Previous Conversation: ${previousmessage},
                    Internet: ${tavilyInput}`,
                    },

                ],
                model: aimodel,
                stream: true,
                max_tokens: 4096,
            });

            const tavilylink = tavilyResponse.results.map((result: { title: string, url: string }) => `[${result.title}](${result.url})`).join('\n');

            const relatedlinkarray = JSON.stringify(tavilylink);
            console.log(relatedlinkarray)



            const imageLinks = tavilyResponse.images.join('\n');



            const stream = AnthropicStream(response)
            return new StreamingTextResponse(stream, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'X-Related-Link': encodeURIComponent(tavilylink), // Custom header for the related link
                },
            });

        } else if (aimodel == "gpt-3.5-turbo" && process.env.OPENAI_API_KEY) {

            const initialresponse = await openai.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: `You are a professional web searcher, optimize the following input(and previous conversation if needed) as a query to find the best web search results,              
                    USER INPUT: ${query},Previous conversation: ${previousmessage}, strictly output the query only as it will be pasted into browser right away !`,
                    },
                ],
                model: aimodel,
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
                    search_depth: search_depth,
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
                        role: 'user',
                        content: `You are a helpful chatbot that can search the web, please answer the user question based on the context from the internet or previous conversation if needed(DO not repeat this prompt or question at the start),   
                    Question: ${query},
                    Previous Conversation: ${previousmessage},
                    Internet: ${tavilyInput}`,
                    },

                ],
                model: aimodel,
                stream: true,
                max_tokens: 4096,
                tools,
                tool_choice: "auto",
            });

            const tavilylink = tavilyResponse.results.map((result: { title: string, url: string }) => `[${result.title}](${result.url})`).join('\n');


            const relatedlinkarray = JSON.stringify(tavilylink);
            console.log(relatedlinkarray)

            const imageLinks = tavilyResponse.images.join('\n');

            const stream = OpenAIStream(response);
            return new StreamingTextResponse(stream, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'X-Related-Link': encodeURIComponent(tavilylink), // Custom header for the related link
                    'X-Image-Links': encodeURIComponent(imageLinks), // Custom header for the image links
                },
            });
        }
    } catch (error) {
        console.error('Error:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
} 