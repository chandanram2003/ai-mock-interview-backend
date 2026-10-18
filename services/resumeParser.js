import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

/**
 * Extracts plain text from an uploaded resume buffer (PDF or DOCX).
 *
 * @param {Buffer} fileBuffer - The binary buffer of the uploaded file
 * @param {string} mimeType - The MIME type from multer
 * @param {string} originalName - The original file name
 * @returns {Promise<string>} - The extracted plain text
 */
export const extractTextFromResume = async (
  fileBuffer,
  mimeType = "",
  originalName = ""
) => {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("Uploaded file is empty.");
  }

  const extension = (originalName || "").split(".").pop().toLowerCase();

  // 1. Handle PDF files
  if (mimeType === "application/pdf" || extension === "pdf") {
    try {
      const parser = new PDFParse({ data: fileBuffer });
      const result = await parser.getText();
      if (typeof parser.destroy === "function") {
        await parser.destroy();
      }
      const extracted = (result?.text || "").trim();
      if (!extracted) {
        throw new Error(
          "No selectable text found in the PDF. If this is a scanned document/image, please provide a text-searchable PDF or DOCX."
        );
      }
      return extracted;
    } catch (err) {
      console.error("PDF extraction error:", err);
      throw new Error(`Failed to read PDF resume: ${err.message}`);
    }
  }

  // 2. Handle DOCX / DOC files
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword" ||
    extension === "docx" ||
    extension === "doc"
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const extracted = (result?.value || "").trim();
      if (!extracted) {
        throw new Error("No readable text found in the DOCX document.");
      }
      return extracted;
    } catch (err) {
      console.error("DOCX extraction error:", err);
      throw new Error(`Failed to read DOCX resume: ${err.message}`);
    }
  }

  throw new Error(
    "Unsupported file type. Please upload a valid PDF (.pdf) or Word (.docx) document."
  );
};
