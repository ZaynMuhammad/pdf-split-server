import { mdToPdf } from "md-to-pdf";
import path from "path";
import fs from "fs/promises";

const filePath = path.join(__dirname, "./test.md");
const outputPath = path.join(__dirname, "./test.pdf");

export async function convertMarkdownToPdf(
  inputPath: string,
  outputPath: string
): Promise<void> {
  try {
    const markdownContent = await fs.readFile(inputPath, "utf-8");

    const pdf = await mdToPdf(
      { content: markdownContent },
      {
        dest: outputPath,
        stylesheet: [
          `
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 2cm;
          }
          h1, h2, h3 {
            color: #333;
          }
          code {
            background-color: #f4f4f4;
            padding: 2px 4px;
            border-radius: 4px;
          }
          pre {
            background-color: #f4f4f4;
            padding: 1em;
            border-radius: 4px;
            overflow-x: auto;
          }
          `,
        ],
      }
    );

    if (pdf) {
      await fs.writeFile(outputPath, pdf.content);
    }
  } catch (error: any) {
    throw new Error(
      `Failed to convert markdown to PDF: ${error?.message || "Unknown error"}`
    );
  }
}

convertMarkdownToPdf(filePath, outputPath);
