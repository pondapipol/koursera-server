import { verify } from 'jsonwebtoken'
import {Arg, Ctx, Mutation, Query, Resolver} from 'type-graphql'
import { Raw } from 'typeorm'
// import { Like } from 'typeorm'
import { Course } from './entity/Course'
import { CourseUnit } from './entity/CourseUnit'
import { CourseUserPayment } from './entity/CourseUserPayment'
import { SubUnit } from './entity/SubUnit'
// import { User } from './entity/User'
import { MyContext } from './MyContext'


@Resolver()
export class CourseResolver {

    @Mutation(() => Boolean)
    async CreateCourse(
        @Arg('CourseName') CourseName : string,
        @Arg("CourseDescription") CourseDescription : string ,
        @Arg("category") Category: string,
        @Arg("timeEst") timeEst: string,
        @Arg("level") level: string,
        @Arg("organization") organization:string,
        @Arg("creatorId") creatorId: number,
        @Arg('coverImage') coverImage: string

    ) {
        try {
            await Course.insert({
                courseName: CourseName,
                courseDescription: CourseDescription,
                category: Category,
                timeEstimation : timeEst,
                level,
                organization,
                creatorId,
                coverImage,
                createDate: new Date()
            })
        } catch(err) {
            console.log(err)
            return false
        }

        return true
        
    }

    @Mutation(() => Boolean)
    async updateCourse(
        @Arg('courseId') courseId: number,
        @Arg('CourseName') courseName : string,
        @Arg("CourseDescription") courseDescription : string ,
        @Arg("category") category: string,
        @Arg("timeEst") timeEst: string,
        @Arg("level") level: string,
        @Arg("organization") organization:string,
        @Arg('coverImage') coverImage: string
    ) {
        try {
            await Course.update({courseId}, {
                courseName,
                courseDescription,
                category,
                timeEstimation: timeEst,
                level,
                organization,
                coverImage,
            })
        } catch(err) {
            console.log(err)
            return false
        }
        return true
    }

    @Mutation(() => Boolean)
    async deleteCourse(
        @Arg('courseId') courseId: number
    ) {
        try {
            const courseunit = await CourseUnit.find({where: {courseId}})
            
            courseunit.forEach(async course => {
                await SubUnit.delete({UnitId : course.UnitId})
                await CourseUnit.delete({UnitId : course.UnitId})
            })
            await Course.delete({courseId})
        } catch(err) {
            console.log(err)
            return false
        }
        return true
    }

    @Mutation(() => Boolean) 
    async addCourseUnit(
        @Arg("unitName") unitName: string,
        @Arg("unitDescription") unitDescription: string, 
        @Arg("courseId") courseId: number,
    ) {
        try {
            await CourseUnit.insert({
                unitName,
                unitDescription,
                courseId,
                createDate: new Date()
            })
        } catch(err) {
            console.log(err)
            return false
        }
        return true
    }

    @Mutation(() => Boolean)
    async updateUnit(
        @Arg("unitId") unitId: number,
        @Arg("unitName") unitName: string,
        @Arg("unitDescription") unitDescription: string, 
        // @Arg("createDate") createDate: string
    ) {
        try {
            await CourseUnit.update({UnitId: unitId}, {
                unitName,
                unitDescription,
                // createDate
            })
        } catch(err) {
            console.log(err)
            return false
        }
        return true
    }

    @Mutation(() => Boolean)
    async deleteCourseunit(
        @Arg('UnitId') UnitId: number
    ) {
        try {
            
            await SubUnit.delete({UnitId})
            await CourseUnit.delete({UnitId})
        } catch(err) {
            console.log(err)
            return false
        }
        return true
    }

    @Query(() => [Course])
    course(
        @Arg('findmethod') findmethod: string
    ) {
        if (findmethod == 'All') {
            return Course.find({take: 16, order: {createDate : "ASC"}})
        } else {
            return Course.find({where: {category: findmethod}, take: 16, order: {createDate : "ASC"}})
        }
        
    }

    @Query(() => [Course])
    courseExplore(
        @Arg('findmethod') findmethod: string
    ) {
        const methodValue = {
            'datascience': "Data science",
            'computerscience' : "Computer science",
            'business': "Business",
            'personaldev': "Personal Development",
            "it": "Information Technology"
        }
        if (findmethod === 'all') {
            return Course.find({order: {createDate : "ASC"}})
        } else if (findmethod == 'datascience') {
            return Course.find({where: {category: methodValue['datascience'] }, order: {createDate : "ASC"}})
        } else if (findmethod == 'computerscience') {
            return Course.find({where: {category: methodValue['computerscience'] }, order: {createDate : "ASC"}})
        } else if (findmethod == 'business') {
            return Course.find({where: {category: methodValue['business'] }, order: {createDate : "ASC"}})
        } else if (findmethod == 'personaldev') {
            return Course.find({where: {category: methodValue['personaldev'] }, order: {createDate : "ASC"}})
        } else if (findmethod == 'it') {
            return Course.find({where: {category: methodValue['it'] }, order: {createDate : "ASC"}})
        } else {
            return []
        }

    }

    @Query(() => [Course])
    coursefind() {
        return Course.find()
    }

    @Query(() => Course)
    courseOne(
        @Arg('courseId') courseId: number
    ) {
        return Course.findOne({where: {
            courseId
        }})
    }

    @Query(() => CourseUserPayment)
    ispaid(
        @Arg('courseId') courseId: number,
        @Ctx() context: MyContext
    ) {

        const authorization = context.req.headers['authorization']
        if (!authorization) {
            return null
        }
        try {
            const token = authorization.split(' ')[1]
            // console.log(token)
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!)
            context.payload = payload as any;
            // const role = payload
            return CourseUserPayment.findOne({where: {
                courseId: courseId,
                userId: payload.userId
            }})
        } catch(err) {
            console.log(err)
            return null
        }
        
    }

    @Query(() => [Course])
    courseSearch(
        @Arg('name') name: string
    ) {
        return Course.find({where:{
            courseName : Raw(alias => `${alias} ILIKE '${name}'`)
        }

        , take: 16})
    }

    @Query(() => [CourseUnit])
    courseunit(
        @Arg('courseId') courseId: number
    ) {
        return CourseUnit.find({
            where: {
                courseId
            },
            order: {
                createDate: "ASC"
            }
        })
    }

    @Query(() => CourseUnit)
    courseunitOne(
        @Arg('unitId') unitId: number
    ) {
        return CourseUnit.findOne({
            where: {
                UnitId: unitId
            }
        })
    }

    @Query(() => [SubUnit])
    subunit(
        @Arg('unitId') unitId: number
    ) {
        return SubUnit.find({
            where: {
                UnitId : unitId
            },
            order: {
                createDate: "ASC"
            }
        })
    }

    @Query(() => SubUnit)
    async subunitOne(
        @Arg('subId') subId: number
    ) {
        const data = await SubUnit.findOne({
            where: {
                subId
            }})
        if (data == null) { 
            return false
        }
        console.log(data)
        return data
        
    }

    @Mutation(() => Boolean)
    async deleteSubunit(
        @Arg('subId') subId: number
    ) {
        try {
            await SubUnit.delete({subId})
        } catch(err) {
            console.log(err)
            return false
        }
        return true
    }

    

    @Mutation(() => Boolean)
    async updateSubunit(
        @Arg("subId") subId: number,
        @Arg("subName") subName: string,
        @Arg("contentType") contentType: string, 
        @Arg("content") content: string,
        @Arg("videoPath") videoPath :string,
        @Arg('videoDescripiton') videoDescription: string,
        @Arg("unitId") unitId: number,
        @Arg("createDate") createDate: string
    ) {
        try {
            await SubUnit.update({subId},
                {
                subName,
                contentType,
                content,
                videoPath,
                videoDescription,
                UnitId: unitId,
                createDate: createDate
            })
        } catch(err) {
            console.log(err)
            return false
        }
        return true
    }

    @Mutation(() => Boolean)
    async addSubunit(
        @Arg("subName") subName: string,
        @Arg("contentType") contentType: string, 
        @Arg("content") content: string,
        @Arg("videoPath") videoPath :string,
        @Arg('videoDescripiton') videoDescription: string,
        @Arg("unitId") unitId: number,
    ) {
        try {
            await SubUnit.insert({
                subName,
                contentType,
                content,
                videoPath,
                videoDescription,
                UnitId: unitId,
                createDate: new Date()
            })
        } catch(err) {
            console.log(err)
            return false
        }
        return true
    }

    @Query(() => [Course])
    instructorCourse(
        @Arg('creatorId') creatorId: number
    ) {
        return Course.find({
            where: {
                creatorId 
            },
            order: {
                createDate: "ASC"
            }
        })
    }

    @Query(() => [Course])
    individualCourse(
        @Arg('courseId') courseId: number
    ) {
        return Course.find({
            where: {
                courseId 
            }
        })
    }

    @Query(() => [CourseUserPayment])
    paymentstatus() {
        return CourseUserPayment.find()
    }

    @Mutation(() => Boolean)
    async unenroll(
        @Arg('courseId') courseId: number,
        @Arg('userId') userId:number
    ) {
        try {
            await CourseUserPayment.delete({courseId, userId})
        } catch(err) {
            console.log(err)
            return false
        }
        return true
    }

    @Mutation(() => Boolean)
    async enroll(
        @Arg('paid') paid: boolean,
        @Arg('cardnumber') cardnumber: string,
        @Arg('exmonth') exmonth: string,
        @Arg('exyear') exyear: string,
        @Arg('cvc') cvc: string,
        @Arg('userId') userId: number,
        @Arg('courseId') courseId: number
    ) {
        try {
            await CourseUserPayment.insert({
                paid,
                cardnumber: cardnumber,
                exmonth,
                exyear,
                cvc,
                courseId: courseId,
                userId: userId
            }) 
        }
        catch(err) {
            console.log(err)
            return false
        }
        return true
    }


    @Query(() => [CourseUserPayment])
    enrolledCourse(
        @Arg("userId") userId: number
    ) {
        return CourseUserPayment.find({where: {userId}})
    }

    @Query(() => Boolean)
    async enrolledCourseId(
        @Arg("userId") userId: number,
        @Arg("courseId") courseId: number
    ) {
        
        const paymentdata = await CourseUserPayment.find({where: {userId, courseId}})
        if (paymentdata.length > 0) {
            return true
        } else {
            return false
        }
        
    }

    // @Query(() => Course)
    // isowner(
    //     @Arg("courseId") courseId:number
    // ) {

    // }
}

