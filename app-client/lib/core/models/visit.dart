import 'appointment.dart';

class Visit {
  final String visitId;
  final String patientId;
  final String visitDate;
  final String visitType;
  final String diagnosis;
  final String notes;
  final String advice;
  final String? nextVisitDate;
  final Hospital hospital;
  final Doctor doctor;
  final List<Prescription> prescriptions;
  final List<Report> reports;

  Visit({
    required this.visitId,
    required this.patientId,
    required this.visitDate,
    required this.visitType,
    required this.diagnosis,
    required this.notes,
    required this.advice,
    this.nextVisitDate,
    required this.hospital,
    required this.doctor,
    this.prescriptions = const [],
    this.reports = const [],
  });

  factory Visit.fromJson(Map<String, dynamic> json) {
    return Visit(
      visitId: json['visit_id'] ?? '',
      patientId: json['patient_id'] ?? '',
      visitDate: json['visit_date'] ?? '',
      visitType: json['visit_type'] ?? '',
      diagnosis: json['diagnosis'] ?? '',
      notes: json['notes'] ?? '',
      advice: json['advice'] ?? '',
      nextVisitDate: json['next_visit_date'],
      hospital: Hospital.fromJson(json['hospital'] ?? {}),
      doctor: Doctor.fromJson(json['doctor'] ?? {}),
      prescriptions: (json['prescriptions'] as List?)
              ?.map((e) => Prescription.fromJson(e))
              .toList() ??
          [],
      reports: (json['reports'] as List?)
              ?.map((e) => Report.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class Prescription {
  final String prescriptionId;
  final String visitId;
  final String prescribedBy;
  final String prescribedDate;
  final List<Medication> medications;

  Prescription({
    required this.prescriptionId,
    required this.visitId,
    required this.prescribedBy,
    required this.prescribedDate,
    this.medications = const [],
  });

  factory Prescription.fromJson(Map<String, dynamic> json) {
    return Prescription(
      prescriptionId: json['prescription_id'] ?? '',
      visitId: json['visit_id'] ?? '',
      prescribedBy: json['prescribed_by'] ?? '',
      prescribedDate: json['prescribed_date'] ?? '',
      medications: (json['medications'] as List?)
              ?.map((e) => Medication.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class Medication {
  final String medicationId;
  final String drugName;
  final String dosage;
  final String frequency;
  final String duration;
  final String instructions;

  Medication({
    required this.medicationId,
    required this.drugName,
    required this.dosage,
    required this.frequency,
    required this.duration,
    required this.instructions,
  });

  factory Medication.fromJson(Map<String, dynamic> json) {
    return Medication(
      medicationId: json['medication_id'] ?? '',
      drugName: json['drug_name'] ?? '',
      dosage: json['dosage'] ?? '',
      frequency: json['frequency'] ?? '',
      duration: json['duration'] ?? '',
      instructions: json['instructions'] ?? '',
    );
  }
}

class Report {
  final String reportId;
  final String visitId;
  final String reportType;
  final String title;
  final String fileUrl;
  final String fileType;
  final String uploadedAt;
  final String hospitalName;

  Report({
    required this.reportId,
    required this.visitId,
    required this.reportType,
    required this.title,
    required this.fileUrl,
    required this.fileType,
    required this.uploadedAt,
    required this.hospitalName,
  });

  factory Report.fromJson(Map<String, dynamic> json) {
    return Report(
      reportId: json['report_id'] ?? '',
      visitId: json['visit_id'] ?? '',
      reportType: json['report_type'] ?? '',
      title: json['title'] ?? '',
      fileUrl: json['file_url'] ?? '',
      fileType: json['file_type'] ?? '',
      uploadedAt: json['uploaded_at'] ?? '',
      hospitalName: json['hospital_name'] ?? '',
    );
  }
}
