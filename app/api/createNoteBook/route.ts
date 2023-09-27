import { db } from "@/lib/db";
import { $notes } from "@/lib/db/schema";
import { generateImage, generateImagePrompt } from "@/lib/openai";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

///api/createNoteBook
export async function POST(req:Request){
    const {userId} =auth()
    if(!userId){
        return new NextResponse('Unauthorized',{status:401})
    }
    const body=await req.json();
    const {name}=body;

    if(!name){
        return new NextResponse('Name is required',{status:400})
    }
    const image_description=await generateImagePrompt(name);
    console.log({image_description});

    if(!image_description){
        return new NextResponse('Image description is required',{status:400})
    }
    
     const image_url=await generateImage(image_description);

        if(!image_url){
          console.log(`---Failed to generate Image!----`);
          
            return new NextResponse('Failed to generate Image!',{status:500})
        }

        const notes_ids= await db.insert($notes).values({
            name,
            imageUrl:image_url,
            userId,
        })
        .returning({
            insertedId: $notes.id,
        })


        return NextResponse.json({
            note_id: notes_ids[0].insertedId,
          });

}