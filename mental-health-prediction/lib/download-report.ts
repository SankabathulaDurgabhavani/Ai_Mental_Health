import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDFReport = (data: any, email: string) => {
    const doc = new jsPDF();
    const report = data.report || data;
    const summary = report.summary || {};

    // Title
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Mental Health Analysis Report", 14, 20);

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date(report.generated_at || Date.now()).toLocaleDateString()}`, 14, 30);
    doc.text(`User Email: ${email}`, 14, 36);

    // Summary Section
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Summary", 14, 50);

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Text Analyses: ${summary.total_text_analyses || 0}`, 14, 60);
    doc.text(`Total Emotion Analyses: ${summary.total_emotion_analyses || 0}`, 14, 68);
    doc.text(`Average Mental Health Score: ${summary.average_mental_health_score || 0}/100`, 14, 76);

    doc.text("Text Sentiment Breakdown:", 14, 88);
    const sentiments = summary.text_sentiment_breakdown || {};
    doc.text(`Positive: ${sentiments.positive || 0}`, 20, 96);
    doc.text(`Neutral: ${sentiments.neutral || 0}`, 20, 104);
    doc.text(`Negative: ${sentiments.negative || 0}`, 20, 112);

    let startY = 130;

    // Text Analyses Table
    if (report.text_analyses && report.text_analyses.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Text Analyses History", 14, startY);

        const textData = report.text_analyses.map((item: any) => [
            new Date(item.created_at).toLocaleDateString(),
            item.text.length > 50 ? item.text.substring(0, 50) + "..." : item.text,
            item.status,
            item.polarity,
        ]);

        autoTable(doc, {
            startY: startY + 5,
            head: [["Date", "Text", "Status", "Polarity"]],
            body: textData,
            theme: "grid",
            headStyles: { fillColor: [100, 100, 255] }
        });

        startY = (doc as any).lastAutoTable.finalY + 20;
    }

    // Emotion Analyses Table
    if (report.emotion_analyses && report.emotion_analyses.length > 0) {
        if (startY > 250) {
            doc.addPage();
            startY = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Emotion Analyses History", 14, startY);

        const emotionData = report.emotion_analyses.map((item: any) => [
            new Date(item.created_at).toLocaleDateString(),
            item.predicted_emotion,
            `${Math.round(item.confidence * 100)}%`,
            `${item.mental_health_score?.score || 0}/100`
        ]);

        autoTable(doc, {
            startY: startY + 5,
            head: [["Date", "Emotion", "Confidence", "Health Score"]],
            body: emotionData,
            theme: "grid",
            headStyles: { fillColor: [100, 200, 100] }
        });
    }

    // Save PDF
    doc.save(`mental-health-report-${new Date().toISOString().split("T")[0]}.pdf`);
};
