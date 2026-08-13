import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Generate a PDF from the AI Judge Report page.
 *
 * The report page should contain an element with:
 *
 * id="judge-report-content"
 *
 * Everything inside that element will be captured
 * and placed into the PDF.
 */
export async function generateJudgePdf({
    elementId = "judge-report-content",
    fileName = "AI-Judge-Debate-Report.pdf",
}) {
    const element = document.getElementById(elementId);

    if (!element) {
        throw new Error(
            `Unable to generate PDF. Element #${elementId} was not found.`
        );
    }

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f3f4f6",
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
    });

    const imageData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imageWidth = pageWidth;
    const imageHeight =
        (canvas.height * imageWidth) / canvas.width;

    let heightLeft = imageHeight;
    let position = 0;

    // First page
    pdf.addImage(
        imageData,
        "PNG",
        0,
        position,
        imageWidth,
        imageHeight
    );

    heightLeft -= pageHeight;

    // Additional pages
    while (heightLeft > 0) {
        position = heightLeft - imageHeight;

        pdf.addPage();

        pdf.addImage(
            imageData,
            "PNG",
            0,
            position,
            imageWidth,
            imageHeight
        );

        heightLeft -= pageHeight;
    }

    pdf.save(fileName);
}


/**
 * Creates a safe filename for the report.
 */
export function createJudgePdfFileName(sessionId) {
    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");

    return `AI-Judge-Report-Session-${sessionId}-${timestamp}.pdf`;
}