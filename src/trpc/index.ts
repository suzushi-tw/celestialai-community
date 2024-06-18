import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { absoluteUrl } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { Pinecone } from '@pinecone-database/pinecone';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getPineconeClient } from '@/lib/pinecone';


export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
    if (!user.email || !user.id) throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {

      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });

      await prisma.setting.create({
        data: {
          userId: user.id
        }
      })
    }

    return { success: true };
  }),

  getChatbot: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await prisma.chatbot.findMany({
      where: {
        userId: userId
      },
    });

  }),


  getAccountdetail: privateProcedure.query(async ({ ctx }) => {

    const { userId } = ctx;

    return await prisma.user.findFirst({
      where: {
        id: userId
      },
      select: {
        AdvanceAI: true,
        Credits: true,
        Chatbot: true,
        Filenum: true
      }
    })

  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx

    return await prisma.file.findMany({
      where: {
        userId,
        type: "file"
      },
    })
  }),

  getFilelist: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx

    return await prisma.file.findMany({
      where: {
        userId,
        uploadStatus: 'SUCCESS',
      },
    })
  }),

  getWeb: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx

    return await prisma.file.findMany({
      where: {
        userId,
        type: "web"
      },
    })
  }),

  getAudio: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx

    return await prisma.file.findMany({
      where: {
        userId,
        type: "audio"
      },
    })
  }),

  getAiresearch: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await prisma.file.findMany({
      where: {
        userId,
        type: "research"
      }
    })
  }),

  getNotion: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await prisma.file.findMany({
      where: {
        userId,
        type: "notion"
      }
    })
  }),



  filescount: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        AdvanceAI: true,
        Credits: true,
      },
    });

    const aiusgae = user?.AdvanceAI || 0;
    const credits = user?.Credits || 0;

    return [
      { type: 'Advance AI', count: aiusgae },
      { type: 'Credits', count: credits },
    ];
  }),


  getNotionlist: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    const data = await prisma.notion.findFirst({
      where: {
        userId,
      },
      select: {
        page: true
      }
    });
    if (!data || !data.page || typeof data.page !== 'object') {
      throw new Error('Data is missing or not in the expected format');
    }

    const stringpages = JSON.stringify(data.page)

    // Use a type assertion to tell TypeScript that data.page is an object with a 'pages' property
    const pages = (data.page as { pages: any[] }).pages;

    return pages;

  }),

  getchatbot: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const chatbot = await prisma.chatbotlist.findFirst({
        where: {
          id: input.key,
        },
      })

      if (!chatbot) throw new TRPCError({ code: 'NOT_FOUND' })

      return chatbot
    }),


  getChatbotlist: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx

      return await prisma.chatbotlist.findMany({
        where: {
          chatbotId: input.id
        },
        orderBy: { createdAt: 'desc' },
      })
    }),



  getChatlist: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx

    return await prisma.chat.findMany({
      where: {
        userId,
      },
      orderBy: { createdAt: 'desc' },
    })
  }),


  deleteFile: privateProcedure
    .input(z.object({ id: z.string(), key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const file = await prisma.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      })
      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      try {
        await prisma.file.delete({
          where: {
            userId: userId,
            id: input.id,
            key: input.key,
          },
        })
        const pinecone = getPineconeClient();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_Index!);

        const namespace = input.id;

        // Delete all records in the specified namespace
        await pineconeIndex.namespace(namespace).deleteAll();

      } catch (error) {
        console.error('Error deleting file:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }

      return file
    }),

  deletes3File: privateProcedure
    .input(z.object({ id: z.string(), key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const file = await prisma.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      await prisma.file.delete({
        where: {
          id: input.id,
          key: input.key,
        },
      })
      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });
      const pineconeIndex = pinecone.Index(process.env.PINECONE_Index!);
      const namespace = input.id;

      // Delete all records in the specified namespace
      await pineconeIndex.namespace(namespace).deleteAll();



      const client = new S3Client({
        region: process.env.S3_UPLOAD_REGION,
        credentials: {
          secretAccessKey: process.env.S3_UPLOAD_SECRET || '',
          accessKeyId: process.env.S3_UPLOAD_KEY || '',
        },
      });
      try {
        const deleteParams = {
          Bucket: process.env.S3_UPLOAD_BUCKET,
          Key: input.key,
        };

        await client.send(new DeleteObjectCommand(deleteParams));


      } catch (error) {
        console.error('Error deleting file:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }


      return file
    }),

})


export type AppRouter = typeof appRouter
