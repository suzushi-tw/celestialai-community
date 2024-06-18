'use server'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import prisma from '@/lib/prisma'
import { Pinecone } from '@pinecone-database/pinecone';

export async function deletechatbot(chatid: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  console.log(chatid)
  if (!user) {
    throw new Error('Unauthrozied');
  }

  const findchatbot = await prisma.chatbot.findFirst({
    where: {
      userId: user.id,
      id: chatid
    }
  })

  if (!findchatbot) {
    throw new Error('Chatbot deleted ...');
  }

  try {

    const deletechatid = await prisma.chatbotlist.findMany({
      where: {
        chatbotId: chatid
      },
    })

    await Promise.all(deletechatid.map(async item => {
      await prisma.chatbotmessage.deleteMany({
        where: {
          chatbotlistId: item.id
        }
      });
    }))

    const deletechat = await prisma.chatbotlist.deleteMany({
      where: {
        chatbotId: chatid
      },
    })

    const deletechatbot = await prisma.chatbot.delete({
      where: {
        userId: user?.id,
        id: chatid
      }
    })

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_Index!);
    const namespace = chatid;

    // Delete all records in the specified namespace
    await pineconeIndex.namespace(namespace).deleteAll();

  } catch (error) {
    console.log(error)
    throw new Error('There was an error deleting chat');
  }

}

export async function setAimodel(model: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  const setting = await prisma.setting.findFirst({
    where: {
      userId: user?.id
    }
  });

  const aimodel = await prisma.setting.update({
    where: {
      id: setting?.id,
      userId: user?.id
    },
    data: {
      AI: model
    }
  })
}

export async function setscroll(scroll: boolean) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  const setting = await prisma.setting.findFirst({
    where: {
      userId: user?.id
    }
  });

  const scrolleffect = await prisma.setting.update({
    where: {
      id: setting?.id,
      userId: user?.id
    },
    data: {
      Scroll: scroll
    }
  })
}


export async function deletechat(chatid: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (user != null) {
    const deletemessage = await prisma.chatmessage.deleteMany({
      where: {
        chatId: chatid,
      }
    })
    const deletechat = await prisma.chat.delete({
      where: {
        id: chatid,
        userId: user.id
      },
    })
  }
}

export async function updatefilename(id: string, name: string) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (user != null && id) {
    await prisma.file.update({
      where: {
        id: id,
        userId: user.id
      },
      data: {
        name: name
      }
    })
  }
}


