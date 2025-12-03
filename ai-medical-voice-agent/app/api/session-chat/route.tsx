/*import { db } from "@/config/db";
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
            selectedDoctor: JSON.stringify(selectedDoctor),
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
            
         
        
        
}*/
import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notes, selectedDoctor } = body;

    const user = await currentUser();

    // 🔥 FIX 1: authentication null check
    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const sessionId = uuidv4();

    const insertValues: any = {
      sessionId,
      createdBy: user.primaryEmailAddress?.emailAddress,
      notes: notes || "",
      selectedDoctor: JSON.stringify(selectedDoctor || {}), // 🔥 FIXED
      createdOn: new Date(),
    };

    await db.insert(SessionChatTable).values(insertValues);

    return NextResponse.json({ sessionId });
  } catch (e) {
    console.error("POST /api/session-chat ERROR →", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (sessionId === "all") {
      if (!user.primaryEmailAddress?.emailAddress) {
        return NextResponse.json(
          { error: "No primary email address found for user" },
          { status: 400 }
        );
      }

      const result = await db
        .select()
        .from(SessionChatTable)
        .where(eq(SessionChatTable.createdBy, user.primaryEmailAddress.emailAddress))
        .orderBy(desc(SessionChatTable.id));

      return NextResponse.json(result);
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(SessionChatTable)
      .where(eq(SessionChatTable.sessionId, sessionId));

    return NextResponse.json(result[0]);
  } catch (e) {
    console.error("GET /api/session-chat ERROR →", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

