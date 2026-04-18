import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:intl/intl.dart';
import '../models/bill.dart';

class BillPdfService {
  static Future<void> generateAndShareBill(Bill bill) async {
    final pdf = pw.Document();

    final dateStr = bill.createdAt != null 
        ? DateFormat('MMM dd, yyyy').format(DateTime.parse(bill.createdAt!).toLocal())
        : DateFormat('MMM dd, yyyy').format(DateTime.parse(bill.visitDate).toLocal());

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // Header
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(
                        bill.hospital.name,
                        style: pw.TextStyle(
                          fontSize: 24,
                          fontWeight: pw.FontWeight.bold,
                        ),
                      ),
                      pw.SizedBox(height: 4),
                      pw.Text(bill.hospital.address),
                      pw.Text('Contact: ${bill.hospital.contactNumber}'),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text(
                        'MEDICAL RECEIPT',
                        style: pw.TextStyle(
                          fontSize: 20,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.blue700,
                        ),
                      ),
                      pw.SizedBox(height: 8),
                      pw.Text('Bill ID: #B-${bill.billId.split('-').first.toUpperCase()}'),
                      pw.Text('Date: $dateStr'),
                    ],
                  ),
                ],
              ),
              pw.Divider(thickness: 2, color: PdfColors.grey300, height: 40),

              // Patient / Visit Info
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('Visit ID:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      pw.Text('#V-${bill.visitId.split('-').first.toUpperCase()}'),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text('Payment Status:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                      pw.Text(bill.paymentStatus.toUpperCase()),
                    ],
                  ),
                ],
              ),
              pw.SizedBox(height: 30),

              // Items Table Header
              pw.Container(
                padding: const pw.EdgeInsets.all(8),
                decoration: const pw.BoxDecoration(color: PdfColors.grey200),
                child: pw.Row(
                  children: [
                    pw.Expanded(flex: 3, child: pw.Text('Description', style: pw.TextStyle(fontWeight: pw.FontWeight.bold))),
                    pw.Expanded(child: pw.Text('Qty', style: pw.TextStyle(fontWeight: pw.FontWeight.bold), textAlign: pw.TextAlign.center)),
                    pw.Expanded(child: pw.Text('Unit Price', style: pw.TextStyle(fontWeight: pw.FontWeight.bold), textAlign: pw.TextAlign.right)),
                    pw.Expanded(child: pw.Text('Total', style: pw.TextStyle(fontWeight: pw.FontWeight.bold), textAlign: pw.TextAlign.right)),
                  ],
                ),
              ),

              // Sections and Items
              ...bill.sections.map((section) {
                return pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Container(
                      padding: const pw.EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                      child: pw.Text(
                        section.sectionType.replaceAll('_', ' ').toUpperCase(),
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold, color: PdfColors.blue800),
                      ),
                    ),
                    ...section.items.map((item) {
                      return pw.Container(
                        padding: const pw.EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                        child: pw.Row(
                          children: [
                            pw.Expanded(flex: 3, child: pw.Text(item.description)),
                            pw.Expanded(child: pw.Text('${item.quantity}', textAlign: pw.TextAlign.center)),
                            pw.Expanded(child: pw.Text('INR ${item.unitPrice.toStringAsFixed(2)}', textAlign: pw.TextAlign.right)),
                            pw.Expanded(child: pw.Text('INR ${item.totalPrice.toStringAsFixed(2)}', textAlign: pw.TextAlign.right)),
                          ],
                        ),
                      );
                    }),
                    pw.Divider(thickness: 0.5, color: PdfColors.grey200),
                  ],
                );
              }),

              pw.Spacer(),

              // Total
              pw.Divider(thickness: 2),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.end,
                children: [
                  pw.Text(
                    'TOTAL AMOUNT: ',
                    style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold),
                  ),
                  pw.Text(
                    'INR ${bill.totalAmount.toStringAsFixed(2)}',
                    style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold, color: PdfColors.blue900),
                  ),
                ],
              ),
              pw.SizedBox(height: 40),
              
              // Footer
              pw.Center(
                child: pw.Text(
                  'This is a computer generated receipt. No signature is required.',
                  style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey500),
                ),
              ),
            ],
          );
        },
      ),
    );

    await Printing.sharePdf(
      bytes: await pdf.save(),
      filename: 'Receipt_#B-${bill.billId.split('-').first.toUpperCase()}.pdf',
    );
  }
}
