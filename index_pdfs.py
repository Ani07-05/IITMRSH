from haystack.document_stores import ElasticsearchDocumentStore
from haystack.nodes import PDFToTextConverter, PreProcessor
import os

# Initialize the document store with authentication details
document_store = ElasticsearchDocumentStore(
    host="localhost",
    port=9200,
    username="elastic",
    password="eFwAc5dVJ4sK74Yd-Lz4",  # Replace this with your actual password
    scheme="http"
)

# Load and index PDF documents (the rest of your code)
pdf_converter = PDFToTextConverter(remove_numeric_tables=True)
preprocessor = PreProcessor(
    split_by="word",
    split_length=200,
    split_respect_sentence_boundary=True
)

# Directory with PDFs to index
pdf_dir = "./backend_pdfs"

for pdf_file in os.listdir(pdf_dir):
    pdf_path = os.path.join(pdf_dir, pdf_file)
    # Convert PDF to text
    doc_text = pdf_converter.convert(file_path=pdf_path, meta={"name": pdf_file})
    # Preprocess the text
    docs = preprocessor.process(doc_text)
    # Write to document store
    document_store.write_documents(docs)

print("PDFs have been indexed successfully!")
