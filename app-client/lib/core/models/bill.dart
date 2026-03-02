import 'appointment.dart';

class Bill {
  final String billId;
  final String visitId;
  final double totalAmount;
  final String currency;
  final String paymentStatus;
  final String? paymentDate;
  final String visitDate;
  final Hospital hospital;
  final List<BillSection> sections;

  Bill({
    required this.billId,
    required this.visitId,
    required this.totalAmount,
    required this.currency,
    required this.paymentStatus,
    this.paymentDate,
    required this.visitDate,
    required this.hospital,
    this.sections = const [],
  });

  factory Bill.fromJson(Map<String, dynamic> json) {
    return Bill(
      billId: json['bill_id'] ?? '',
      visitId: json['visit_id'] ?? '',
      totalAmount: (json['total_amount'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'INR',
      paymentStatus: json['payment_status'] ?? '',
      paymentDate: json['payment_date'],
      visitDate: json['visit_date'] ?? '',
      hospital: Hospital.fromJson(json['hospital'] ?? {}),
      sections: (json['sections'] as List?)
              ?.map((e) => BillSection.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class BillSection {
  final String sectionId;
  final String sectionType;
  final double sectionTotal;
  final List<BillItem> items;

  BillSection({
    required this.sectionId,
    required this.sectionType,
    required this.sectionTotal,
    this.items = const [],
  });

  factory BillSection.fromJson(Map<String, dynamic> json) {
    return BillSection(
      sectionId: json['section_id'] ?? '',
      sectionType: json['section_type'] ?? '',
      sectionTotal: (json['section_total'] ?? 0).toDouble(),
      items: (json['items'] as List?)
              ?.map((e) => BillItem.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class BillItem {
  final String itemId;
  final String description;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  BillItem({
    required this.itemId,
    required this.description,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory BillItem.fromJson(Map<String, dynamic> json) {
    return BillItem(
      itemId: json['item_id'] ?? '',
      description: json['description'] ?? '',
      quantity: json['quantity'] ?? 0,
      unitPrice: (json['unit_price'] ?? 0).toDouble(),
      totalPrice: (json['total_price'] ?? 0).toDouble(),
    );
  }
}
