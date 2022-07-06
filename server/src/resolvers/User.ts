
import { Context } from "..";

interface UserParentType {
    id: number, 
}

export  const User = {
    posts: async (parent: UserParentType, __:any, {userInfo, prisma}:Context) => {
        const isOwnAccount = parent.id === userInfo?.userId 
        if(isOwnAccount){
            return prisma.post.findMany({
                where: {
                    authorId: parent.id
                },
                orderBy: [{
                    createdAt: "desc"
                }]
            })
        } 

        return prisma.post.findMany({where: {
            authorId: parent.id,
            published: true
        }, orderBy: [{
            createdAt: "desc"
        }]})
    },
}