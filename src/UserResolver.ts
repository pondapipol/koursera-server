import {Arg, Authorized, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware} from 'type-graphql'
import {compare, hash} from 'bcryptjs'
import { User } from './entity/User'
import { MyContext } from './MyContext'
import { createAccessToken, createRefreshToken } from './auth'
import { isAuth } from './isAuth'
import { sendRefreshToken } from './sendRefreshToken'
import { getConnection } from 'typeorm'
import { verify } from 'jsonwebtoken'

@ObjectType()
class LoginResponse {
    @Field()
    accessToken : string;

    @Field(() => User)
    user: User
    
}

@Resolver()
export class UserResolver {

    @Authorized()
    @Query(() => String)
    authortest() {
 
        return "yep you're allowed"
    }

    @Query(() => String)
    hello() {
        return 'hi'
    }


    // Check if the user is logged in
    @Query(() => User)
    @UseMiddleware(isAuth)
    bye(
        @Ctx() {payload} : MyContext
    ) {
        // return `Your user id is ${payload!.userId} with role ${payload!.userRole}`
        return User.findOne({where: {id: payload!.userId}})
    }

    @Query(() => User, {nullable: true})
    authandRole (
        @Ctx() context: MyContext
    ) {
        const authorization = context.req.headers['authorization']
        if (!authorization) {
            return null
        }
        try {
            const token = authorization.split(' ')[1]
            console.log(token)
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!)
            context.payload = payload as any;
            // const role = payload
            return User.findOne(payload.userId)
        } catch(err) {
            console.log(err)
            return null
        }
    }

    

    // Query all user
    @Query(() => [User])
    users() {
        return User.find()
    }

    @Query(() => User)
    usersid(
        @Arg('userId') userId: number
    ) {
        return User.findOne({where: {id : userId}})
    }

    @Mutation(() => Boolean)
    async updateUser(
        @Arg('userId') userId: number,
        @Arg('email') email: string,
        @Arg('name') name : string,
        @Arg('profileImage') profileimage: string,
        @Arg('aboutme') aboutme: string,
        @Arg('age') age: string
    ) {
        try {
            await User.update({id: userId}, {
                email,
                name,
                profileimage,
                aboutme,
                age
            })
        } catch(err) {
            console.log(err)
            return false
        }
        return true
    }
    



    @Query(() => User, {nullable : true})
    me(
        @Ctx() context: MyContext
    ) {
        const authorization = context.req.headers['authorization']
        if (!authorization) {
            return null
        }
        try {
            const token = authorization.split(' ')[1]
            console.log(token)
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!)
            context.payload = payload as any;
            // const role = payload
            return User.findOne(payload.userId)
        } catch(err) {
            console.log(err)
            return null
        }
    }

    @Mutation(() => Boolean)
    async register(
        @Arg('email') email: string,
        @Arg("name") name: string,
        @Arg('password') password : string,
        @Arg('role') role: string 
    ) {
        const hashedPassword = await hash(password, 12)

        try {
            await User.insert({
                email,
                name,
                password : hashedPassword,
                role: role
            })
        } catch(err) {
            console.log(err)
            return false
        }
        return true
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password : string,
        @Ctx() {res}: MyContext
    ): Promise<LoginResponse> {
        const user = await User.findOne({where : {email}})

        if (!user) {
            throw new Error ('Could not find user')
        }

        const valid = await compare(password, user.password)

        if (!valid) {
            throw new Error("Invalid Password")
        }

        // login successful
        sendRefreshToken(res, createRefreshToken(user))

        return {
            accessToken : createAccessToken(user),
            user
        }
    }

    @Mutation(() => Boolean)
    async revokeRefreshTokensForUser(
        @Arg('userId', () => Int) userId : number
    ) {
        await getConnection()
        .getRepository(User)
        .increment({id : userId}, 'tokenVersion', 1)

        return true
    }

    // for delete test data
    // @Mutation(() => Boolean)
    // async deleteUserField() {
    //     await getConnection()
    //     .getRepository(User)
    //     .delete([])

    //     return true
    // }

    @Mutation(() => Boolean)
    async logout(@Ctx() {res}: MyContext) {
        sendRefreshToken(res, '')
        return true
    }
}