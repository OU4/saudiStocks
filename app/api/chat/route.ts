// app/api/chat/route.ts
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import crypto from "crypto";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultHeaders: {
    "anthropic-beta": "pdfs-2024-09-25"  // Add beta header here
  }
});

const responseSchema = z.object({
  response: z.string(),
  thinking: z.string(),
  user_mood: z.enum(["positive", "neutral", "negative", "curious", "frustrated", "confused"]),
  suggested_questions: z.array(z.string()),
  debug: z.object({
    context_used: z.boolean(),
  })
});

export async function POST(req: Request) {
  try {
    const { messages, pdfData } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    let messageContent;
    if (pdfData) {
      messageContent = [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfData,
            },
          },
          {
            type: 'text',
            text: latestMessage,
          },
        ],
      }];
    } else {
      messageContent = [{
        role: 'user',
        content: [{ 
          type: 'text', 
          text: latestMessage 
        }],
      }];
    }

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: messageContent,
    });

    const responseData = {
      response: response.content[0].text,
      thinking: "Processing your request",
      user_mood: "curious",
      suggested_questions: [
        "Can you summarize the main points?",
        "What are the key findings?",
        "Could you explain that in more detail?"
      ],
      debug: { context_used: true }
    };

    const validatedResponse = responseSchema.parse(responseData);
    
    return new Response(JSON.stringify({
      id: crypto.randomUUID(),
      ...validatedResponse,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in chat handler:", error);
    return new Response(
      JSON.stringify({
        response: "An error occurred while processing your request. Please try again.",
        thinking: "Error in processing",
        user_mood: "neutral",
        suggested_questions: [],
        debug: { context_used: false }
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}