import jwt from "jsonwebtoken"

export const getUserFromToken =  (token: string) => {
    try {
        return  jwt.verify(token, process.env.JWT_SECRET as string) as {
            userId: number
        }
    } catch (error) {
        return null
    }
   
}