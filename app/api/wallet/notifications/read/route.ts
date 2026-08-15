import { NextRequest } from 'next/server';
import {createClient} from '@supabase/supabase-js';

export async function POST(req:NextRequest) {
    const {userId,notificationId}=await req.json();
    const supabase=createClient(
        process.env.NEXT_PUBLIC_SERVICE_URL!,
        process.env.SUPABASE_SERVICE_KEY!

    );
    const query=supabase .from('notifications').update({is_read:true});
    if(notificationId) query.eq('id',notificationId);
    else query.eq('userId',userId);
    await query;
    return Response.json({sucess:true});
}