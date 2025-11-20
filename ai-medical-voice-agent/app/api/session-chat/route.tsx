import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { eq, desc } from "drizzle-orm"; // ✅ added desc import

export async function POST(req: NextRequest) {
    const { notes, selectedDoctor } = await req.json();
    const user = await currentUser();
    try {
        const sessionId = uuidv4();
        const insertValues: any = {
            sessionId: sessionId,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            notes: notes,
            selectedDoctor: selectedDoctor,
            createdOn: new Date().toISOString()
        };

        await db.insert(SessionChatTable).values(insertValues);

        return NextResponse.json({ sessionId });
    } catch (e) {
        console.error("POST error:", e); // ✅ added log
        return new NextResponse("Internal Server Error", { status: 500 }); // ✅ added return
    }
}

export async function GET(req: NextRequest) {
   
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');
        const user = await currentUser();

        if (sessionId == 'all')
        {
              const result = await db.select().from(SessionChatTable)
                //@ts-ignore
                .where(eq(SessionChatTable.createdBy, user?.primaryEmailAddress?.emailAddress))
                .orderBy(desc(SessionChatTable.id));

            return NextResponse.json(result);
        }
        else{
               const result = await db.select().from(SessionChatTable)
                //@ts-ignore
                .where(eq(SessionChatTable.sessionId, sessionId));

            return NextResponse.json(result[0]);
        }
            
         
        
        
}
