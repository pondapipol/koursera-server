import { ObjectType, Field, Int} from "type-graphql";
import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany} from "typeorm";
import { Course } from "./Course";
import { CourseUserPayment } from "./CourseUserPayment";


@ObjectType()
@Entity("users")
export class User extends BaseEntity{
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column('text')
    name: string;

    @Field()
    @Column({
        type: "text",
        default : ""
    })
    profileimage: string

    @Field()
    @Column({
        type: "text",
        default : ""
    })
    aboutme: string

    @Field()
    @Column({
        type: "text",
        default : ""
    })
    age: string

    @Field()
    @Column('text')
    email: string;

    @Column('text')
    password: string;

    @Column("int", {default : 0})
    tokenVersion: number

    @Field()
    @Column ({
        type: "text",
        nullable : true,
        default : "user"
    })
    role: string

    @OneToMany(() => Course, course => course.course)
    public creator!: Course[];

    @OneToMany(() => CourseUserPayment, CourseUserPayment => CourseUserPayment.user)
    public CourseUserPayment!: CourseUserPayment[];
}
