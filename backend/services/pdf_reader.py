import fitz


def extract_text(pdf_path):

    try:

        document = fitz.open(pdf_path)

        text = ""

        total_pages = document.page_count

        for page in document:

            text += page.get_text()

        document.close()

        return {
            "success": True,
            "text": text,
            "pages": total_pages
        }

    except Exception as error:

        return {
            "success": False,
            "message": str(error)
        }


def extract_text_from_bytes(pdf_bytes):
    """Extract text directly from PDF bytes in memory, no disk needed.
    Safe for serverless environments with read-only filesystems (e.g. Vercel)."""

    try:

        document = fitz.open(stream=pdf_bytes, filetype="pdf")

        text = ""

        total_pages = document.page_count

        for page in document:

            text += page.get_text()

        document.close()

        return {
            "success": True,
            "text": text,
            "pages": total_pages
        }

    except Exception as error:

        return {
            "success": False,
            "message": str(error)
        }