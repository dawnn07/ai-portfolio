import { CohereClient } from 'cohere-ai';
import { Message } from "../messages/messages";

// Convert Message format to Cohere format
function convertToCohereMessages(messages: Message[]) {
  const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
  
  return nonSystemMessages.map(msg => ({
    role: msg.role === 'user' ? "USER" as const : "CHATBOT" as const,
    message: msg.content
  }));
}

export async function getChatResponse(messages: Message[], apiKey: string) {
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const cohere = new CohereClient({
    token: apiKey,
  });

  const systemMessage = messages.find(msg => msg.role === 'system');
  const preamble = systemMessage?.content || undefined;

  const cohereMessages = convertToCohereMessages(messages);
  const currentMessage = cohereMessages[cohereMessages.length - 1]?.message;
  const chatHistory = cohereMessages.slice(0, -1);

  if (!currentMessage) {
    throw new Error("No user message found");
  }

  try {
    const response = await cohere.chat({
      model: 'command-a-03-2025',
      message: currentMessage,
      chatHistory: chatHistory.length > 0 ? chatHistory : undefined,
      preamble: preamble,
    });

    return { message: response.text || "An error has occurred" };
  } catch (error) {
    console.error('Cohere API error:', error);
    throw error;
  }
}

export async function getChatResponseStream(
  messages: Message[],
  apiKey: string
) {
  console.log("Starting stream...");

  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const systemMessage = messages.find(msg => msg.role === 'system');
  const preamble = systemMessage?.content;

  const cohereMessages = convertToCohereMessages(messages);
  const currentMessage = cohereMessages[cohereMessages.length - 1]?.message;
  const chatHistory = cohereMessages.slice(0, -1);

  if (!currentMessage) {
    throw new Error("No user message found");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    "Accept": "text/event-stream",
  };

  const requestBody = {
    model: 'command-a-03-2025',
    message: currentMessage,
    ...(chatHistory.length > 0 && { chat_history: chatHistory }),
    ...(preamble && { preamble }),
    stream: true,
    max_tokens: 1000,
    temperature: 0.7,
  };

  try {
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`Cohere API error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body reader");
    }

    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log("Stream completed");
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // Split by lines and process each complete line
            const lines = buffer.split('\n');
            buffer = lines.pop() || ""; // Keep the last incomplete line in buffer

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) continue;

              // Handle Server-Sent Events format
              if (trimmedLine.startsWith('event:')) {
                // Skip event type lines, we only care about data
                continue;
              }

              if (trimmedLine.startsWith('data:')) {
                const jsonData = trimmedLine.slice(5).trim(); // Remove 'data:' prefix
                
                if (jsonData === '[DONE]') {
                  console.log("Received [DONE] signal");
                  continue;
                }

                try {
                  const parsed = JSON.parse(jsonData);
                  console.log("Parsed event:", parsed);

                  // Handle Cohere streaming format
                  if (parsed.event_type === 'text-generation' && parsed.text) {
                    console.log("Enqueueing text:", parsed.text);
                    controller.enqueue(parsed.text);
                  } else if (parsed.event_type === 'stream-start') {
                    console.log("Stream started");
                  } else if (parsed.event_type === 'stream-end') {
                    console.log("Stream ended");
                  }

                } catch (parseError) {
                  console.warn("JSON parse error for data:", jsonData, parseError);
                }
              }
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
          controller.close();
        }
      }
    });

    return stream;

  } catch (error) {
    throw error;
  }
}