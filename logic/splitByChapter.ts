import { PDFExtract } from "pdf.js-extract";

interface Chapter {
  title: string;
  content: string;
  page: number;
  index: number;
}

export function splitByChapter(pdfPath: string): Chapter[] {
  const pdfExtract = new PDFExtract();
  const chapters: Chapter[] = [];
  pdfExtract.extract(pdfPath, {}, (err: any, data: any) => {
    if (err) throw new Error(`Failed to extract PDF: ${err.message}`);
    data.pages.forEach((pageItem: any, index: number) => {
      console.log("pageItem.content", pageItem.content);
      console.log("pageItem.page", pageItem.page);
      console.log("pageItem.index", index);
      const pageText = pageItem.content.map((item: any) => item.str).join(" ");
      chapters.push({
        title: pageText,
        content: pageText,
        page: pageItem.page,
        index: index,
      });
    });
  });
  return chapters;
}

splitByChapter("test.pdf");
