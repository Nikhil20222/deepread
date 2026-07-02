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