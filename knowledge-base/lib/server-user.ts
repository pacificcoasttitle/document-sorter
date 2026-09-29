import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
export class AccessError extends Error { constructor(message:string,public status:number){super(message);} }
export async function requireUser(request:NextRequest){
 if(!process.env.JWT_SECRET)throw new AccessError('Login configuration is unavailable.',503);
 let id:number;
 try{const payload=jwt.verify(request.cookies.get('auth-token')?.value||'',process.env.JWT_SECRET,{algorithms:['HS256']}) as jwt.JwtPayload;id=payload.userId;if(!Number.isInteger(id))throw new Error();}catch{throw new AccessError('Please sign in.',401);}
 const result=await pool.query('SELECT id,name,role FROM users WHERE id=$1',[id]);
 if(!result.rows[0])throw new AccessError('Please sign in.',401);
 return result.rows[0] as {id:number;name:string;role:string};
}
export function workflowError(error:unknown){
 if(error instanceof AccessError)return NextResponse.json({error:error.message},{status:error.status});
 return NextResponse.json({error:'Unable to complete this request.'},{status:500});
}
