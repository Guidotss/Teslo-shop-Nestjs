import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'users'})
export class User {
    @PrimaryGeneratedColumn('uuid')
    id:string; 

    @Column({
        type:'text',
        unique:true
    })
    email:string;

    @Column({
        type:'text',
    })
    password:string; 

    @Column({
        type:'text',
    })
    fullName:string; 

    @Column({
        type:'bool',
    })
    isActive:boolean;

    @Column({
        type:'text',
        array:true,
        default:['user']
    })
    roles:string[];
}
