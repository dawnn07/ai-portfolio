import { koeiromapFreeV1 } from "@/features/koeiromap/koeiromap";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, speakerX, speakerY, style, apiKey } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    const voice = await koeiromapFreeV1(
      message,
      speakerX,
      speakerY,
      style,
      apiKey
    );

    return NextResponse.json(voice);

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
