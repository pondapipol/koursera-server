import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity,    JoinColumn,    ManyToOne,    PrimaryGeneratedColumn} from "typeorm";
import { CourseUnit } from "./CourseUnit";
// import { CourseUnit } from "./CourseMaterials";


@ObjectType()
@Entity('SubUnit')
export class SubUnit extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    subId: number;

    @Field()
    @Column('text')
    subName: string;

    @Field()
    @Column('text')
    contentType: string;

    @Field()
    @Column('text')
    content: string;

    @Field()
    @Column('text')
    videoPath: string;

    @Field()
    @Column('text')
    videoDescription: string;

    @Field()
    @Column("timestamptz")
    createDate: Date

    @Field()
    @Column('int')
    UnitId!: number;

    @ManyToOne(() => CourseUnit, courseunit => courseunit.subunit)
    @JoinColumn({name : "UnitId"})
    materials: CourseUnit;

}