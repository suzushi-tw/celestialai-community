// check if he is subscribes or not!
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import Accountdashboard from "@/components/dashboard/Accountdashboard"
import prisma from '@/lib/prisma'

const Page = async () => {


  const { getUser } = getKindeServerSession()
  const user = await getUser();


  const aimodel = await prisma.setting.findFirst({
    where: {
      userId: user?.id
    }
  })

  return (
    <Accountdashboard aimodel={aimodel?.AI} scroll={aimodel?.Scroll} />
  )
}

export default Page