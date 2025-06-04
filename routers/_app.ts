import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import PDFParse from "pdf-parse";

interface Chapter {
  title: string;
  content: string;
}

interface SpeechResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

let chapters: Chapter[] = [
  { title: "Chapter test", content: "Chapter test content" },
];

function processText(text: string): string {
  return text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/•/g, "")
    .replace(/\|/g, "and")
    .replace(/\s*:\s*/g, ": ")
    .replace(/\s*-\s*/g, " ")
    .trim();
}

function chunkText(text: string, maxChunkSize: number = 30000): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        chunks.push(sentence.trim());
      }
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

async function processChunkWithGemini(chunk: string): Promise<string> {
  try {
    const response = await fetch("http://localhost:8000/api/v1/speech-test", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        text: chunk,
      }),
    });

    const data = (await response.json()) as SpeechResponse;
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response from speech API");
    }
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error processing chunk:", error);
    throw error;
  }
}

export const appRouter = router({
  getChapters: publicProcedure.query(async () => {
    return chapters;
  }),

  addChapter: publicProcedure
    .input(z.object({ title: z.string().min(1), content: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const newChapter = { title: input.title, content: input.content };
      chapters.push(newChapter);
      return { success: true, chapter: newChapter };
    }),

  parsePdf: publicProcedure
    .input(
      z.object({
        pdfBuffer: z.instanceof(Buffer),
      })
    )
    .mutation(async ({ input }) => {
      const pdfData = await PDFParse(input.pdfBuffer);
      const processedText = processText(pdfData.text);
      const textChunks = chunkText(processedText);

      const speechResults = [];
      for (const chunk of textChunks) {
        const speechText = await processChunkWithGemini(chunk);
        speechResults.push(speechText);
      }

      return {
        success: true,
        data: {
          text: processedText,
          pages: pdfData.numpages,
          info: pdfData.info,
          speechChunks: speechResults,
        },
      };
    }),

  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
});

export type AppRouter = typeof appRouter;
