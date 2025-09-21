import { TalkStyle } from "../messages/messages";

export async function koeiromapV0(
  message: string,
  speakerX: number,
  speakerY: number,
  style: TalkStyle
) {
  const param = {
    method: "POST",
    body: JSON.stringify({
      text: message,
      speaker_x: speakerX,
      speaker_y: speakerY,
      style: style,
    }),
    headers: {
       "Content-Type": "application/json",
    },
  };

  const koeiroRes = await fetch(
    "https://router.huggingface.co/fal-ai/fal-ai/kokoro/american-english",
    param
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await koeiroRes.json()) as any;

  return { audio: data.audio };
}

export async function koeiromapFreeV1(
  message: string,
  speakerX: number,
  speakerY: number,
  style: "talk" | "happy" | "sad",
  apiKey: string
) {
  // Request body
  const body = {
    text: message,
    speaker_x: speakerX,
    speaker_y: speakerY,
    style: style,
    output_format: "mp3",
  };

  const koeiroRes = await fetch(
    "https://router.huggingface.co/fal-ai/fal-ai/kokoro/american-english",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
         "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
      },
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await koeiroRes.json()) as any;

  return { audio: data.audio };
}
