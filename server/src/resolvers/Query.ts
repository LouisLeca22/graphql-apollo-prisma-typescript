import { Post, User} from "@prisma/client";
import { Context } from "..";


export  const Query = {
    posts: async (_:any, __:any, {prisma}:Context):Promise<Post[]> => {
        return await prisma.post.findMany({ where: {published: true}, orderBy: [{createdAt: "desc"}]})
    },
    me: async (_:any, __:any, {prisma, userInfo}:Context):Promise<User | null>=> {
        if(!userInfo) return null 
        return prisma.user.findUnique({
            where: {
                id: userInfo.userId
            }
        })
    },
    profile: async (_:any, {userId}: {userId: string}, {prisma, userInfo}: Context) => {
        const isMyProfile = Number(userId) === userInfo?.userId
        const profile = await prisma.profile.findUnique({where: {userId: Number(userId)}})
        if(!profile) return null 
        return {...profile, isMyProfile}
    }

}