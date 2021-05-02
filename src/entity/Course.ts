import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity,  JoinColumn,  ManyToOne,  OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { CourseUnit } from "./CourseUnit";
import { CourseUserPayment } from "./CourseUserPayment";
import { User } from "./User";


@ObjectType()
@Entity('courses')
export class Course extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    courseId: number;

    @Field()
    @Column('text')
    courseName : string;

    @Field()
    @Column('text')
    courseDescription : string;

    @Field()
    @Column('text')
    category : string;

    @Field()
    @Column('text')
    timeEstimation : string;

    @Field()
    @Column('text')  
    level : string;

    @Field()
    @Column('text')
    organization : string;

    @Field()
    @Column('integer')
    creatorId : number;

    @Field()
    @Column('text')
    coverImage: string
    
    @Field()
    @Column("timestamptz")
    createDate: Date
    
    @ManyToOne(() => User, user => user.creator)
    @JoinColumn({name : "creatorId"})
    course: User;

    @OneToMany(() => CourseUserPayment, CourseUserPayment => CourseUserPayment.course)
    public CourseUserPayment!: CourseUserPayment[];

    @OneToMany(() => CourseUnit, courseunit => courseunit.course)
    courseUnit: CourseUnit[]
}
