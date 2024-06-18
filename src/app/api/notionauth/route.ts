import { NextApiRequest, NextApiResponse } from 'next';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextResponse } from 'next/server';
import axios from 'axios';
import prisma from '@/lib/prisma';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';



export async function POST(req: Request, res: Response) {

    const body = await req.json();
    const { code } = body;
    console.log(code);

    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const userId = user?.id

    if (!code) {
        return NextResponse.json(
            { error: "no url" },
            { status: 400 }
        );
    }

    const clientId = process.env.OAUTH_CLIENT_ID;
    const clientSecret = process.env.OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.OAUTH_REDIRECT_URI;
    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    console.log(clientId + ' ' + clientSecret + " " + encoded)

    try {


        const response = await axios.post("https://api.notion.com/v1/oauth/token", JSON.stringify({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectUri,
        }), {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Basic ${encoded}`,
            },
        });


        if (response.status !== 200) {
            throw new Error('Failed to exchange code for token');
        }

        console.log(response)

        const data = response.data;

        const pagesresponse = await fetch('https://api.notion.com/v1/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${data.access_token}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },

        });

        const pagesData = await pagesresponse.json();

        console.log(JSON.stringify(pagesData, null, 2))

        const pages = pagesData.results
            .filter((page: any) => page.properties.title)
            .map((page: any) => ({
                pageId: page.id,
                pageTitle: page.properties.title.title[0]?.text.content,
            }));


        console.log(pages);

        const algorithm = 'aes-256-cbc';

        // Generate a secure, random key
        const key = process.env.Notion_KEY!

        // Generate an initialization vector
        const iv = randomBytes(16);

        const cipher = createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data.access_token, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        console.log(encrypted)

        if (userId) {

            const check = await prisma.notion.findFirst({
                where: {
                    userId: userId
                }
            })

            if (check) {
                await prisma.notion.update({
                    where: {
                        accessToken: check.accessToken
                    },
                    data: {
                        accessToken: data.access_token,
                        workspaceId: data.workspace_id,
                        workspaceName: data.workspace_name,
                        page: { pages },
                    }
                });
                return NextResponse.json(
                    { pagesData },
                    { status: 200 }
                );
            } else {
                await prisma.notion.create({
                    data: {
                        accessToken: data.access_token,
                        workspaceId: data.workspace_id,
                        workspaceName: data.workspace_name,
                        page: { pages },
                        userId: userId,
                    },
                });
            }
        }

        return NextResponse.json(
            { pagesData },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "internal server error " },
            { status: 500 }
        );
    }
}
