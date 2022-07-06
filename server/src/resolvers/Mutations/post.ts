import { Post, Prisma } from "@prisma/client"
import {Context} from "../../index"
import { canUserMutatePost } from "../../utils/canUserMutatePost"

interface PostArgs {
    post: {
        title?: string
        content?: string
    }
}

interface PostPayloadType {
    userErrors: {
        message: string
    }[]
    post: Post | Prisma.Prisma__PostClient<Post>| null 
}


export const postResolvers = {
    postCreate: async (_: any, {post} :PostArgs, {prisma, userInfo}: Context):Promise<PostPayloadType> => {
        if(!userInfo){
            return {
                userErrors: [{
                    message: "Forbidden access (unauthenticated)"
                }],
                post: null
            }
        }

        const {title, content} = post
        if(!title || !content){
            return {
                userErrors: [{
                    message: "You must provide a title and content to create a post"
                }],
                post: null
            }
        }

        return {
            userErrors: [],
            post:  await prisma.post.create({
                data: {
                    title,
                    content,
                    authorId: userInfo.userId
                }
            })
    
        }
    },
    postUpdate: async (_:any, {post, postId}: {postId: string, post: PostArgs["post"]}, {prisma, userInfo}: Context):Promise<PostPayloadType> => {

        if(!userInfo){
            return {
                userErrors: [{
                    message: "Forbidden access (unauthenticated)"
                }],
                post: null
            }
        }
 
        const error = await canUserMutatePost({
            userId: userInfo.userId, 
            postId: Number(postId), 
            prisma})

        if(error) return error;
         
        const {title, content} = post 
        if(!title && !content){
            return {
                userErrors: [{message: "Need to have at least one field to update"}],
                post: null 
            }
        }

        const existingPost = await prisma.post.findUnique({
            where: {
                id: Number(postId)
            }
        })

        if(!existingPost){
            return {
                userErrors: [
                    {message: "Post can't be found"}
                ],
                post: null
            }
        }   

        let payloadToUpdate = {
            title,
            content 
        }

        if(!title) delete payloadToUpdate.title 
        if(!content) delete payloadToUpdate.content

        return {
            userErrors: [],
            post: prisma.post.update({
                data: {
                    ...payloadToUpdate
                },
                where: {
                    id: Number(postId)
                }
            })
        }
        
    },
    postPublish: async (_:any, {postId}: {postId: string}, {prisma, userInfo}: Context): Promise<PostPayloadType> => {
        if(!userInfo){
            return {
                userErrors: [{
                    message: "Forbidden access (unauthenticated)"
                }],
                post: null
            }
        }

        const error = await canUserMutatePost({
            userId: userInfo.userId, 
            postId: Number(postId), 
            prisma})

        if(error) return error;

        
        return {
            userErrors: [],
            post: prisma.post.update({
                data: {
                    published: true
                },
                where: {
                    id: Number(postId)
                }
            })
        }
    },
    postUnpublish: async (_:any, {postId}: {postId: string}, {prisma, userInfo}: Context): Promise<PostPayloadType> => {
        if(!userInfo){
            return {
                userErrors: [{
                    message: "Forbidden access (unauthenticated)"
                }],
                post: null
            }
        }

        const error = await canUserMutatePost({
            userId: userInfo.userId, 
            postId: Number(postId), 
            prisma})

        if(error) return error;

        
        return {
            userErrors: [],
            post: prisma.post.update({
                data: {
                    published: false
                },
                where: {
                    id: Number(postId)
                }
            })
        }
    },
    postDelete: async (_:any, {postId}: {postId: string}, {prisma, userInfo}: Context):Promise<PostPayloadType> => {


        const post = await prisma.post.findUnique({
            where: {
                id: Number(postId)
            }
        })

        if(!post){
            return {
                userErrors: [
                    {message: "Post can't be found"}
                ],
                post: null
            }
        }   

        if(!userInfo){
            return {
                userErrors: [{
                    message: "Forbidden access (unauthenticated)"
                }],
                post: null
            }
        }
 
        const error = await canUserMutatePost({
            userId: userInfo.userId, 
            postId: Number(postId), 
            prisma})

        if(error) return error;

        await prisma.post.delete({where: {id: Number(postId)}})
        return {
            userErrors: [],
            post 
        }
    }
}