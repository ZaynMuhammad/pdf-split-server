function seperateByPage(pdf: string) {
  const pdfSplit = pdf.split("Page");
  console.log("pdfSplit", pdfSplit);
  return pdfSplit;
}

export { seperateByPage };
