import { CircleChevronLeft, CircleChevronRight } from 'lucide-react';
import { useState } from 'react';
import { pdfjs } from 'react-pdf';
import { Document, Page } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

export default function PDFViewer({ fileURL }: { fileURL: string }) {
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    function handleLeftClick() {
        setPageNumber(pageNumber-1);
    }

    function handleRightClick() {
        setPageNumber(pageNumber+1);
    }

    return (
        <div>
            <p className="text-white">
                Page {pageNumber} of {numPages}
            </p>
            <Document file={{
                url: fileURL
            }} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} />
            </Document>
            <div
            className={`z-100 flex justify-between w-full absolute top-1/2 transform -translate-y-1/2 left-0 p-3 ${numPages === 1 ? "hidden" : ""}`}>
            <button
            disabled={pageNumber === 1}
            onClick={handleLeftClick}
            className="z-100 px-1 py-1 bg-black opacity-50 text-white rounded-full hover:opacity-70 transition cursor-pointer m-4 disabled:bg-gray-500 disabled:hover:opacity-50 disabled:cursor-not-allowed"
            >
            <CircleChevronLeft size={40} />
            </button>
            <button
            disabled={pageNumber === numPages}
            onClick={handleRightClick}
            className="z-100 px-1 py-1 bg-black opacity-50 text-white rounded-full hover:opacity-70 transition cursor-pointer m-4 disabled:bg-gray-500 disabled:hover:opacity-50 disabled:cursor-not-allowed"
            >
            <CircleChevronRight size={40} />
            </button>
            </div>
        </div>
    );
}

