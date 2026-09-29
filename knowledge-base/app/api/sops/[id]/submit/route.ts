import { NextRequest } from 'next/server';
import { sopMutation } from '@/lib/sop-workflow';
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){return sopMutation(request,'submit',(await params).id);}

