import "reflect-metadata";
import 'dotenv/config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import { CourseResolver } from "./CourseResolver"
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";
import { verify } from 'jsonwebtoken'
import { createAccessToken, createRefreshToken } from "./auth";
import { User } from './entity/User'
import { sendRefreshToken } from "./sendRefreshToken";
import cors from 'cors'


(async () => {
    const app = express()
    app.use(cors({
        credentials : true,
        origin : 'http://localhost:3000'
    }))
    app.use(cookieParser())
    app.get('/', (_req, res) => {
        res.send('hello')
    })
    
    app.post("/refresh_token", async (req, res) => {
        const token = req.cookies.jid
        if (!token) {
            return res.send({ok : false, accessToken : ""})
        }
        
        let payload: any = null
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)
        } catch(err) {
            console.log(err)
            return res.send({ok : false, accessToken : ""})
        }

        // token is valid
        // we can send back token 
        const user = await User.findOne({ id: payload.userId })

        if (!user) {
            return res.send({ok : false, accessToken : ""})
        }

        if (user.tokenVersion !== payload.tokenVerison) {
            
        }

        sendRefreshToken(res, createRefreshToken(user))
        return res.send({ok : true, accessToken : createAccessToken(user)})

    })


    await createConnection();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers : [UserResolver, CourseResolver],
            authChecker: (roles) => {
            // here we can read the user from context
            // and check his permission in the db against the `roles` argument
            // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]
            console.log(roles)
            return true// or false if access is denied
          }
        }),
        context : ({req, res}) => ({req, res})
    })

    apolloServer.applyMiddleware({ app, cors : false })

    app.listen(4000, () => {
        console.log('listening on port 4000')
    })
})()

