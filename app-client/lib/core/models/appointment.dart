class Appointment {
  final String appointmentId;
  final String patientId;
  final String scheduledDateTime;
  final String status;
  final String department;
  final String reason;
  final String? notes;
  final Doctor doctor;
  final Hospital hospital;
  final String? cancelledAt;
  final String? cancelledReason;

  Appointment({
    required this.appointmentId,
    required this.patientId,
    required this.scheduledDateTime,
    required this.status,
    required this.department,
    required this.reason,
    this.notes,
    required this.doctor,
    required this.hospital,
    this.cancelledAt,
    this.cancelledReason,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      appointmentId: json['appointment_id'] ?? '',
      patientId: json['patient_id'] ?? '',
      scheduledDateTime: json['scheduled_date_time'] ?? '',
      status: json['status'] ?? '',
      department: json['department'] ?? '',
      reason: json['reason'] ?? '',
      notes: json['notes'],
      doctor: json['doctor'] != null ? Doctor.fromJson(json['doctor']) : Doctor(
        doctorId: json['doctor_id'] ?? '',
        fullName: json['doctor_name'] ?? '',
        specialization: json['department'] ?? '',
        hospitalId: json['hospital_id'] ?? '',
        hospitalName: json['hospital_name'] ?? '',
      ),
      hospital: json['hospital'] != null ? Hospital.fromJson(json['hospital']) : Hospital(
        hospitalId: json['hospital_id'] ?? '',
        name: json['hospital_name'] ?? '',
        address: '',
        contactNumber: '',
      ),
      cancelledAt: json['cancelled_at'],
      cancelledReason: json['cancelled_reason'],
    );
  }
}

class Doctor {
  final String doctorId;
  final String fullName;
  final String specialization;
  final String hospitalId;
  final String hospitalName;

  Doctor({
    required this.doctorId,
    required this.fullName,
    required this.specialization,
    required this.hospitalId,
    required this.hospitalName,
  });

  factory Doctor.fromJson(Map<String, dynamic> json) {
    return Doctor(
      doctorId: json['doctor_id'] ?? '',
      fullName: json['full_name'] ?? '',
      specialization: json['specialization'] ?? '',
      hospitalId: json['hospital_id'] ?? '',
      hospitalName: json['hospital_name'] ?? '',
    );
  }
}

class Hospital {
  final String hospitalId;
  final String name;
  final String address;
  final String contactNumber;

  Hospital({
    required this.hospitalId,
    required this.name,
    required this.address,
    required this.contactNumber,
  });

  factory Hospital.fromJson(Map<String, dynamic> json) {
    return Hospital(
      hospitalId: json['hospital_id'] ?? '',
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      contactNumber: json['contact_number'] ?? '',
    );
  }
}
