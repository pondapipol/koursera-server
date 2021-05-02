import { ObjectType, Field, Int} from "type-graphql";
import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn} from "typeorm";
import { Course } from "./Course";
import { User } from "./User";


@ObjectType()
@Entity("CourseUserPayment")
export class CourseUserPayment extends BaseEntity{
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    public payId!: number;

    @Field()
    @Column("boolean")
    public paid!: boolean

    @Field()
    @Column("text")
    public cardnumber!: string

    @Field()
    @Column("text")
    public exmonth!: string

    @Field()
    @Column("text")
    public exyear!: string

    @Field()
    @Column("text")
    public cvc!: string
    
    @Field()
    @Column('text')
    public userId!: number;
    
    @Field()
    @Column('text')
    public courseId!: number;

    @ManyToOne(() => User, user => user.CourseUserPayment)
    @JoinColumn({ name: "userId"})
    public user!: User

    @ManyToOne(() => Course, course => course.CourseUserPayment)
    @JoinColumn({ name: "courseId"})
    public course!: Course

}
