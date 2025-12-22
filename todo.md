# TODO & Future Enhancements

This file tracks pending tasks and future improvements for the Medical Management System.

---

## 🔴 High Priority (For Demo)

### Authentication & Authorization
- [ ] Implement role-based access control (RBAC) middleware
- [ ] Add permission checks for different user roles
- [ ] Implement session timeout handling

### Appointments API
- [ ] Create appointment module (model, service, controller, routes)
- [ ] Implement `POST /api/appointments` - Create appointment (receptionist)
- [ ] Implement `GET /api/appointments/doctor/:doctorId` - Get doctor's appointments
- [ ] Implement `GET /api/appointments/:id` - Get appointment details
- [ ] Implement `PUT /api/appointments/:id/status` - Update appointment status
- [ ] Add appointment validation (no double-booking, time conflicts)

### Visits API
- [ ] Create visit module (model, service, controller, routes)
- [ ] Implement `POST /api/visits` - Create visit from appointment (doctor)
- [ ] Implement `GET /api/visits/:id` - Get visit with prescriptions
- [ ] Link visits to appointments properly

### Prescriptions API
- [ ] Create prescription module (model, service, controller, routes)
- [ ] Implement `POST /api/prescriptions` - Add prescription to visit
- [ ] Implement `GET /api/prescriptions/visit/:visitId` - Get visit prescriptions
- [ ] Add medication validation

### Frontend Integration
- [ ] Update appointments API calls in frontend
- [ ] Update visits API calls in frontend
- [ ] Update prescriptions API calls in frontend
- [ ] Add error handling and loading states
- [ ] Add form validation on frontend

---

## 🟡 Medium Priority

### Patient Management
- [ ] Add patient update endpoint (`PUT /api/patients/:id`)
- [ ] Add patient delete endpoint (`DELETE /api/patients/:id`)
- [ ] Add patient photo upload functionality
- [ ] Add patient search filters (by date, age, etc.)

### Reports & Billing
- [ ] Create reports API module
- [ ] Create billing API module
- [ ] Implement bill generation from visits
- [ ] Add payment tracking

### Data Validation
- [ ] Add comprehensive input validation
- [ ] Add data sanitization
- [ ] Add rate limiting for API endpoints
- [ ] Add request size limits

### Error Handling
- [ ] Improve error messages for better debugging
- [ ] Add structured error logging
- [ ] Add error tracking/monitoring

---

## 🟢 Low Priority / Future Enhancements

### Patient ID System Enhancement
- [ ] **Implement Crockford Base32 Patient ID System**
  - Add `hospital_code` field to Hospital model (2 chars, Base32-safe)
  - Create `patient_id_seq` counter table:
    ```sql
    CREATE TABLE patient_id_seq (
        hospital_code char(2),
        time_bucket int,
        seq int,
        PRIMARY KEY (hospital_code, time_bucket)
    );
    ```
  - Implement Crockford Base32 encoding (alphabet: `0123456789ABCDEFGHJKMNPQRSTVWXYZ`)
  - Format: `HH TTTT SSSS` (2-char hospital code + 4-char time bucket + 4-char sequence)
  - Use atomic `INSERT ... ON CONFLICT DO UPDATE ... RETURNING seq`
  - Benefits: Near-zero collision, deterministic, scalable, production-ready
  - Capacity: ~1 trillion IDs per hospital before time bucket wraps

### NFC Card Integration
- [ ] Add NFC card reader integration
- [ ] Implement NFC card scanning endpoint
- [ ] Add NFC card assignment during patient registration
- [ ] Add NFC card validation

### Multi-Hospital Support
- [ ] Add hospital selection in patient registration
- [ ] Add hospital filtering in queries
- [ ] Implement hospital-specific configurations
- [ ] Add hospital admin panel

### Advanced Features
- [ ] Add patient medical history timeline
- [ ] Add appointment reminders (SMS/Email)
- [ ] Add prescription refill tracking
- [ ] Add lab test result management
- [ ] Add imaging report management
- [ ] Add doctor notes and observations
- [ ] Add patient discharge summaries

### Security Enhancements
- [ ] Implement API rate limiting
- [ ] Add request logging and audit trails
- [ ] Add IP whitelisting for admin endpoints
- [ ] Implement two-factor authentication (2FA)
- [ ] Add password complexity requirements
- [ ] Add account lockout after failed login attempts

### Performance Optimization
- [ ] Add database query optimization
- [ ] Implement caching layer (Redis)
- [ ] Add database connection pooling optimization
- [ ] Implement pagination for all list endpoints
- [ ] Add database indexes for frequently queried fields

### Testing
- [ ] Add unit tests for all modules
- [ ] Add integration tests for API endpoints
- [ ] Add end-to-end tests for critical flows
- [ ] Add load testing
- [ ] Add security testing

### Documentation
- [ ] Create comprehensive API documentation (Swagger/OpenAPI)
- [ ] Add code comments and JSDoc
- [ ] Create user manual for receptionists
- [ ] Create user manual for doctors
- [ ] Create deployment guide

### UI/UX Improvements
- [ ] Add dark mode toggle
- [ ] Improve mobile responsiveness
- [ ] Add keyboard shortcuts
- [ ] Add print functionality for reports
- [ ] Add export to PDF functionality
- [ ] Add data visualization (charts, graphs)

### Integration
- [ ] Add email service integration (for notifications)
- [ ] Add SMS service integration (for reminders)
- [ ] Add payment gateway integration
- [ ] Add lab system integration
- [ ] Add pharmacy system integration

---

## 📝 Notes

### Current Implementation Status
- ✅ Authentication system (login, logout, refresh token)
- ✅ Patient registration with user account creation
- ✅ Patient search (by ID, NFC, name, phone)
- ✅ Sequential 10-digit patient number generation
- ✅ Database schema with Prisma
- ✅ CORS configuration
- ✅ Frontend-backend integration for auth and patients

### Technical Debt
- Patient number generation uses sequential counter (simple but works)
- No hospital code in patient IDs yet (single hospital assumption)
- No comprehensive error handling middleware
- No API rate limiting
- No request validation middleware (using Zod but could be more comprehensive)

---

## 🎯 Demo Checklist

### Must Have (Critical for Demo)
- [x] Receptionist login
- [x] Doctor login
- [x] Patient registration
- [x] Patient lookup/search
- [ ] Appointment booking (receptionist)
- [ ] Doctor viewing appointments
- [ ] Doctor creating visit from appointment
- [ ] Doctor adding prescription

### Nice to Have (If Time Permits)
- [ ] View patient medical history
- [ ] View prescriptions
- [ ] Basic bill generation

---

## 🔄 Migration Notes

When implementing the Crockford Base32 system:
1. Add `hospital_code` to Hospital model
2. Create migration for `patient_id_seq` table
3. Migrate existing patients to new ID format (or keep both)
4. Update all patient lookup functions
5. Update frontend to handle new ID format

---

Last Updated: 2024-12-22

