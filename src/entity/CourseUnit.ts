import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { Course } from "./Course";
import { SubUnit } from "./SubUnit";
// import { SubUnit } from "./SubUnit";

@ObjectType()
@Entity('CourseUnit')
export class CourseUnit extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    UnitId: number;

    @Field()
    @Column('text')
    unitName: string;

    @Field()
    @Column("text")
    unitDescription: string

    @Field()
    @Column("timestamptz")
    createDate: Date

    @Field()
    @Column('int')
    courseId: number;

    @OneToMany(() => SubUnit, subunit => subunit.materials)
    subunit: SubUnit[];

    @ManyToOne(() => Course, course => course.courseUnit)
    @JoinColumn({ name: "courseId"})
    course: Course;
}