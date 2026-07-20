"""
PDF and text file extraction service using PyPDF2.
"""
import os
import logging

logger = logging.getLogger(__name__)


def extract_text_from_file(filepath: str) -> str:
    """
    Extract text from a PDF or TXT file.
    Returns the extracted text as a string.
    Raises ValueError or IOError on failure.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")

    ext = os.path.splitext(filepath)[1].lower()

    if ext == ".txt":
        return _extract_from_txt(filepath)
    elif ext == ".pdf":
        return _extract_from_pdf(filepath)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def _extract_from_txt(filepath: str) -> str:
    """Read a plain text file."""
    encodings = ["utf-8", "latin-1", "cp1252"]
    for enc in encodings:
        try:
            with open(filepath, "r", encoding=enc) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    raise IOError(f"Could not decode text file: {filepath}")


def _extract_from_pdf(filepath: str) -> str:
    """Extract text from a PDF file using PyPDF2."""
    try:
        import PyPDF2
    except ImportError:
        raise ImportError("PyPDF2 is not installed. Run: pip install PyPDF2")

    text_parts = []
    try:
        with open(filepath, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            if reader.is_encrypted:
                try:
                    reader.decrypt("")
                except Exception:
                    raise ValueError("PDF is encrypted and cannot be read without a password.")

            num_pages = len(reader.pages)
            logger.info(f"Extracting text from {num_pages} pages of {filepath}")

            for page_num, page in enumerate(reader.pages):
                try:
                    page_text = page.extract_text() or ""
                    text_parts.append(page_text)
                except Exception as e:
                    logger.warning(f"Could not extract page {page_num}: {e}")
                    continue

    except PyPDF2.errors.PdfReadError as e:
        raise ValueError(f"Could not read PDF: {str(e)}")

    full_text = "\n".join(text_parts).strip()
    if not full_text:
        raise ValueError("No text could be extracted from this PDF. It may be image-based.")
    return full_text
