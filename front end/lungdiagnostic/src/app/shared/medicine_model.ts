import { Url } from "url";

export interface singupModel{
    email: string,
    occupation:string,
    phone_number: string,
    
    name: string,
    password: string,
    is_superuser:boolean,
    manager:string,
    
  
}

export interface AuthResData{
    _id?: string,
    email: string,
    name?: string,
    occupation:string,
    is_subscribed:boolean,
    phone_number: string,
    token?: string
    is_superuser:boolean,
    manager:string,
    photo:Url,
}

export interface loginModel{
    email: string,
    password: string
}

export class User{
    constructor(
        public id: string,
        public email: string,
        public phone_number: string,
        public name: string,
        public token: string,
        public occupation:string,
        public is_superuser:boolean,
        public manager:string,
        public photo:Url,
    ){}
    
}