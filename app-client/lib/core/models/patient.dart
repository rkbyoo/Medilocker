class Patient {
  final String patientId;
  final String patientNumber;
  final String userId;
  final String name;
  final String dob;
  final String gender;
  final String bloodGroup;
  final String phoneNumber;
  final String address;
  final String emergencyContactName;
  final String emergencyContactNumber;
  final String guardianPhone;
  final String maritalStatus;
  final String? spouseName;
  final String? caste;
  final String? religion;
  final String nationality;
  final bool nfcCardLinked;
  final List<Allergy> allergies;
  final List<ChronicCondition> chronicConditions;

  Patient({
    required this.patientId,
    required this.patientNumber,
    required this.userId,
    required this.name,
    required this.dob,
    required this.gender,
    required this.bloodGroup,
    required this.phoneNumber,
    required this.address,
    required this.emergencyContactName,
    required this.emergencyContactNumber,
    required this.guardianPhone,
    required this.maritalStatus,
    this.spouseName,
    this.caste,
    this.religion,
    required this.nationality,
    required this.nfcCardLinked,
    this.allergies = const [],
    this.chronicConditions = const [],
  });

  factory Patient.fromJson(Map<String, dynamic> json) {
    return Patient(
      patientId: json['patient_id'] ?? '',
      patientNumber: json['patient_number'] ?? '',
      userId: json['user_id'] ?? '',
      name: json['name'] ?? '',
      dob: json['dob'] ?? '',
      gender: json['gender'] ?? '',
      bloodGroup: json['blood_group'] ?? '',
      phoneNumber: json['phone_number'] ?? '',
      address: json['address'] ?? '',
      emergencyContactName: json['emergency_contact_name'] ?? '',
      emergencyContactNumber: json['emergency_contact_number'] ?? '',
      guardianPhone: json['guardian_phone'] ?? '',
      maritalStatus: json['marital_status'] ?? '',
      spouseName: json['spouse_name'],
      caste: json['caste'],
      religion: json['religion'],
      nationality: json['nationality'] ?? '',
      nfcCardLinked: json['nfc_card_linked'] ?? false,
      allergies: (json['allergies'] as List?)
              ?.map((e) => Allergy.fromJson(e))
              .toList() ??
          [],
      chronicConditions: (json['chronic_conditions'] as List?)
              ?.map((e) => ChronicCondition.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class Allergy {
  final String allergyId;
  final String allergyName;
  final String severity;
  final String? notes;

  Allergy({
    required this.allergyId,
    required this.allergyName,
    required this.severity,
    this.notes,
  });

  factory Allergy.fromJson(Map<String, dynamic> json) {
    return Allergy(
      allergyId: json['allergy_id'] ?? '',
      allergyName: json['allergy_name'] ?? '',
      severity: json['severity'] ?? '',
      notes: json['notes'],
    );
  }
}

class ChronicCondition {
  final String conditionId;
  final String conditionName;
  final String diagnosedDate;
  final String? notes;

  ChronicCondition({
    required this.conditionId,
    required this.conditionName,
    required this.diagnosedDate,
    this.notes,
  });

  factory ChronicCondition.fromJson(Map<String, dynamic> json) {
    return ChronicCondition(
      conditionId: json['condition_id'] ?? '',
      conditionName: json['condition_name'] ?? '',
      diagnosedDate: json['diagnosed_date'] ?? '',
      notes: json['notes'],
    );
  }
}
