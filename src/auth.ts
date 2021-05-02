import { User } from "./entity/User";
import { sign } from 'jsonwebtoken'
import 'dotenv/config'

export const createAccessToken = (user: User) => {
    return sign({ userId: user.id, userRole: user.role}, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn : '15m'
    })
}

export const createRefreshToken = (user : User) => {
    return sign({ userId: user.id, tokenVerison : user.tokenVersion}, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn : '7d'
    })
}

