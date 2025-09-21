import { NextRequest, NextResponse } from "next/server";
import { CloudClient, Collection, Metadata } from "chromadb";

interface AddDataRequest {
  ids: string[];
  documents: string[];
  metadatas: Metadata[];
}

const chromaClient = new CloudClient({
  tenant: process.env.CHROMA_TENANT!,
  database: process.env.CHROMA_DATABASE!,
  apiKey: process.env.CHROMA_API_KEY!,
});

let myCollection: Collection | null = null;

const getMyCollection = async () => {
  if (!myCollection) {
    myCollection = await chromaClient.getOrCreateCollection({
      name: "portfolio",
    });
  }
  return myCollection;
};

export async function POST(request: NextRequest) {
  try {
    // Check if request has a body
    const contentLength = request.headers.get('content-length');
    if (!contentLength || contentLength === '0') {
      return NextResponse.json(
        { success: false, message: "Request body is required" },
        { status: 400 }
      );
    }

    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { success: false, message: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    let data: AddDataRequest;
    
    try {
      data = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON format" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.ids || !data.documents || !data.metadatas) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Missing required fields: ids, documents, and metadatas are required" 
        },
        { status: 400 }
      );
    }

    // Validate array lengths match
    if (data.ids.length !== data.documents.length || 
        data.ids.length !== data.metadatas.length) {
      return NextResponse.json(
        { 
          success: false, 
          message: "ids, documents, and metadatas arrays must have the same length" 
        },
        { status: 400 }
      );
    }

    const collection = await getMyCollection();

    await collection.add({
      ids: data.ids,
      documents: data.documents,
      metadatas: data.metadatas,
    });

    return NextResponse.json({
      success: true,
      message: "Data added successfully",
      data: {
        count: data.ids.length,
        ids: data.ids
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to add data" 
      },
      { status: 500 }
    );
  }
}