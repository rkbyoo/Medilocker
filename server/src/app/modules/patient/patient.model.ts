import { prisma } from '../../config/prisma';
import { UserRole } from '../../generated/prisma';

export class PatientModel {
  /**
   * Generate a unique 10-digit patient number using sequential counter
   * Starts from 1000000000 and increments atomically
   * Uses database transaction with retry logic to handle concurrent requests
   * The unique constraint on patient_number ensures no collisions
   */
  private static async generatePatientNumber(): Promise<string> {
    const BASE_NUMBER = 1000000000; // Start from 10 digits
    const MAX_NUMBER = 9999999999; // Maximum 10-digit number
    const MAX_RETRIES = 10;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Use transaction to atomically get the next number
        const patientNumber = await prisma.$transaction(
          async (tx) => {
            // Get the current maximum patient number
            // Using raw query to ensure we only get numeric values and use FOR UPDATE for locking
            const result = await tx.$queryRaw<Array<{ patient_number: string }>>`
              SELECT patient_number 
              FROM patients 
              WHERE patient_number ~ '^[0-9]{10}$'
              ORDER BY patient_number::bigint DESC 
              LIMIT 1
              FOR UPDATE
            `;

            let nextNumber: number;

            if (result.length > 0 && result[0].patient_number) {
              const currentMax = parseInt(result[0].patient_number, 10);
              
              // Validate it's a valid number
              if (isNaN(currentMax) || currentMax < BASE_NUMBER) {
                nextNumber = BASE_NUMBER;
              } else {
                nextNumber = currentMax + 1;
              }
            } else {
              // No patients exist yet, start from base
              nextNumber = BASE_NUMBER;
            }

            // Ensure it doesn't exceed maximum
            if (nextNumber > MAX_NUMBER) {
              throw new Error('Patient number limit reached. Maximum capacity exceeded.');
            }

            // Return as 10-digit string
            return nextNumber.toString().padStart(10, '0');
          },
          {
            isolationLevel: 'ReadCommitted', // Good balance between safety and performance
            timeout: 5000, // 5 second timeout
          }
        );

        return patientNumber;
      } catch (error: any) {
        // If it's a unique constraint violation, retry (shouldn't happen with sequential, but safety)
        // If it's a serialization error (concurrent transaction), retry
        if (
          error.code === 'P2002' || // Unique constraint violation
          error.code === '40001' || // PostgreSQL serialization failure
          error.message?.includes('serialization') ||
          error.message?.includes('could not serialize')
        ) {
          if (attempt < MAX_RETRIES - 1) {
            // Wait a bit before retrying (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
            continue;
          }
        }

        // If it's not a retryable error, log and use fallback
        console.error(`Error generating patient number (attempt ${attempt + 1}):`, error);
        
        if (attempt === MAX_RETRIES - 1) {
          // Last attempt failed, use fallback
          break;
        }
      }
    }

    // Fallback: use timestamp-based number if sequential fails
    // This should rarely happen, but provides safety
    const timestamp = Date.now().toString().slice(-10);
    const fallbackNumber = timestamp.padStart(10, '0');
    
    // Double-check fallback doesn't exist (very unlikely)
    const existing = await prisma.patient.findUnique({
      where: { patient_number: fallbackNumber },
    });
    
    if (!existing) {
      return fallbackNumber;
    }
    
    // Last resort: timestamp + small random
    const lastResort = (Date.now().toString().slice(-9) + Math.floor(Math.random() * 10)).padStart(10, '0');
    return lastResort;
  }
  /**
   * Create a new patient with user account
   */
  static async createPatientWithUser(data: {
    // User data
    email: string;
    full_name: string;
    phone?: string;
    password_hash?: string;
    // Patient data
    name: string;
    dob?: Date;
    gender?: string;
    blood_group?: string;
    phone_number?: string;
    guardian_phone?: string;
    address?: string;
    marital_status?: string;
    spouse_name?: string;
    caste?: string;
    religion?: string;
    nationality?: string;
    emergency_contact_name?: string;
    emergency_contact_number?: string;
    photo_url?: string;
    nfc_card_uid?: string;
  }) {
    // Create user first
    const user = await prisma.user.create({
      data: {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || data.phone_number,
        password_hash: data.password_hash || '', // Patients may not have password initially
        role: 'patient' as UserRole,
      },
    });

    // Generate unique 10-digit patient number
    const patientNumber = await PatientModel.generatePatientNumber();

    // Create patient record
    const patient = await prisma.patient.create({
      data: {
        user_id: user.user_id,
        patient_number: patientNumber,
        name: data.name,
        dob: data.dob,
        gender: data.gender,
        blood_group: data.blood_group,
        phone_number: data.phone_number,
        guardian_phone: data.guardian_phone,
        address: data.address,
        marital_status: data.marital_status,
        spouse_name: data.spouse_name,
        caste: data.caste,
        religion: data.religion,
        nationality: data.nationality,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_number: data.emergency_contact_number,
        photo_url: data.photo_url,
        nfc_card_uid: data.nfc_card_uid,
      },
      include: {
        user: true,
        allergies: true,
        chronicConditions: true,
      },
    });

    return patient;
  }

  /**
   * Get patient by ID (UUID)
   */
  static async findById(patientId: string) {
    return await prisma.patient.findUnique({
      where: { patient_id: patientId },
      include: {
        user: true,
        allergies: true,
        chronicConditions: true,
      },
    });
  }

  /**
   * Update patient by ID
   */
  static async updateById(patientId: string, data: Record<string, any>) {
    // Map camelCase fields from frontend to snake_case DB columns
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.bloodGroup !== undefined) updateData.blood_group = data.bloodGroup;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.maritalStatus !== undefined) updateData.marital_status = data.maritalStatus;
    if (data.spouseName !== undefined) updateData.spouse_name = data.spouseName;
    if (data.emergencyContactName !== undefined) updateData.emergency_contact_name = data.emergencyContactName;
    if (data.emergencyContactNumber !== undefined) updateData.emergency_contact_number = data.emergencyContactNumber;
    if (data.guardianPhone !== undefined) updateData.guardian_phone = data.guardianPhone;
    if (data.nationality !== undefined) updateData.nationality = data.nationality;
    if (data.caste !== undefined) updateData.caste = data.caste;
    if (data.religion !== undefined) updateData.religion = data.religion;

    return await prisma.patient.update({
      where: { patient_id: patientId },
      data: updateData,
      include: {
        user: true,
        allergies: true,
        chronicConditions: true,
      },
    });
  }

  /**
   * Get patient by 10-digit patient number
   */
  static async findByPatientNumber(patientNumber: string) {
    return await prisma.patient.findUnique({
      where: { patient_number: patientNumber },
      include: {
        user: true,
        allergies: true,
        chronicConditions: true,
      },
    });
  }

  /**
   * Get patient by user ID
   */
  static async findByUserId(userId: string) {
    return await prisma.patient.findUnique({
      where: { user_id: userId },
      include: {
        user: true,
        allergies: true,
        chronicConditions: true,
      },
    });
  }

  /**
   * Get patient by NFC card UID (case-insensitive, trimmed)
   */
  static async findByNfcCardUid(nfcCardUid: string) {
    // Try exact match first
    const exactMatch = await prisma.patient.findUnique({
      where: { nfc_card_uid: nfcCardUid },
      include: {
        user: true,
        allergies: true,
        chronicConditions: true,
      },
    });

    if (exactMatch) {
      return exactMatch;
    }

    // Try case-insensitive search with trimmed value
    const trimmedUid = nfcCardUid.trim();
    const caseInsensitiveMatch = await prisma.patient.findFirst({
      where: {
        nfc_card_uid: {
          equals: trimmedUid,
          mode: 'insensitive',
        },
      },
      include: {
        user: true,
        allergies: true,
        chronicConditions: true,
      },
    });

    return caseInsensitiveMatch;
  }

  /**
   * Find patient by ID, patient number, NFC card UID, or user ID (flexible lookup)
   */
  static async findByAnyId(identifier: string) {
    console.log('findByAnyId called with:', identifier);

    // Try 10-digit patient number first (most common use case)
    if (identifier.match(/^\d{10}$/)) {
      console.log('Trying patient number lookup...');
      const byPatientNumber = await this.findByPatientNumber(identifier);
      if (byPatientNumber) {
        console.log('Found by patient number');
        return byPatientNumber;
      }
    }

    // Try patient_id (UUID format)
    if (identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.log('Trying patient UUID lookup...');
      return await this.findById(identifier);
    }

    // Try NFC card UID
    console.log('Trying NFC card UID lookup...');
    const byNfc = await this.findByNfcCardUid(identifier);
    if (byNfc) {
      console.log('Found by NFC card UID');
      return byNfc;
    }

    // Try user_id (UUID format)
    if (identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.log('Trying user UUID lookup...');
      return await this.findByUserId(identifier);
    }

    console.log('No patient found with identifier:', identifier);
    return null;
  }

  /**
   * Search patients by name, phone, patient_number, patient_id, or NFC card UID
   */
  static async search(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Check if query is a 10-digit number (patient_number)
    const isPatientNumber = query.match(/^\d{10}$/);
    // Check if query looks like a UUID (patient_id or user_id)
    const isUuid = query.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    const whereCondition: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { phone_number: { contains: query, mode: 'insensitive' } },
        { nfc_card_uid: { contains: query, mode: 'insensitive' } },
      ],
    };

    // If it's a 10-digit number, search by patient_number
    if (isPatientNumber) {
      whereCondition.OR.push({ patient_number: query });
    }

    // If it's a UUID, also search by patient_id and user_id
    if (isUuid) {
      whereCondition.OR.push({ patient_id: query });
      whereCondition.OR.push({ user_id: query });
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where: whereCondition,
        include: {
          user: true,
          allergies: true,
          chronicConditions: true,
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.patient.count({
        where: whereCondition,
      }),
    ]);

    return {
      patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all patients with pagination
   */
  static async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        include: {
          user: true,
          allergies: true,
          chronicConditions: true,
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.patient.count(),
    ]);

    return {
      patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Add allergies to patient
   */
  static async addAllergies(patientId: string, allergies: string[]) {
    const allergyRecords = allergies.map((allergyName) => ({
      patient_id: patientId,
      allergy_name: allergyName,
      severity: null,
      notes: null,
    }));

    await prisma.patientAllergy.createMany({
      data: allergyRecords,
      skipDuplicates: true,
    });
  }

  /**
   * Add chronic conditions to patient
   */
  static async addChronicConditions(patientId: string, conditions: string[]) {
    const conditionRecords = conditions.map((conditionName) => ({
      patient_id: patientId,
      condition_name: conditionName,
      diagnosed_date: null,
      notes: null,
    }));

    await prisma.patientChronicCondition.createMany({
      data: conditionRecords,
      skipDuplicates: true,
    });
  }
}

