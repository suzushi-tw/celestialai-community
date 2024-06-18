import { NextApiRequest, NextApiResponse } from 'next';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextResponse } from 'next/server';
import axios from 'axios';
import prisma from '@/lib/prisma';
import page from '@/app/(dashboard)/auth-callback/page';
import { json } from 'stream/consumers';



export async function POST(req: Request, res: Response) {


    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();
        const userId = user?.id


        const notion = "secret_70cT06Xu0IPuSBTY16uzkY1Gt0JIhqIbvZEfrvUwUyl"

        console.log(notion)


        const pagesresponse = await fetch('https://api.notion.com/v1/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notion}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filter: {
                    value: "page",
                    property: "object"
                },
                sort: {
                    direction: "ascending",
                    timestamp: "last_edited_time"
                },
            }),
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


        return NextResponse.json(
            { pagesresponse },
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
