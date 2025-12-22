# Database Test Scripts

## Seed Database Script

### Purpose
The `seed-database.ts` script inserts comprehensive test data to verify the database design and all relationships work correctly.

### Test Data Created

- **1 Hospital**: City General Hospital
- **1 Doctor**: Dr. Michael Chen
- **1 Receptionist**: Sarah Johnson
- **2 Patients**: John Smith, Emily Rodriguez
- **Patient Data**: Full demographic information, allergies, chronic conditions
- **2 Appointments**: One scheduled, one completed
- **1 Visit**: Complete medical record with diagnosis, advice, next visit
- **1 Prescription**: With 2 medications
- **1 Medical Report**: Lab test report
- **1 Bill**: With 2 sections (consultation, pharmacy) and 3 items

### How to Run

**Prerequisites:**
1. Database must be set up and accessible
2. Prisma schema must be pushed/migrated to database
3. `.env` file must have `DATABASE_URL` configured

**Run the script:**

```bash
cd server
npx ts-node tests/seed-database.ts
```

**Or if you have ts-node globally:**

```bash
cd server
ts-node tests/seed-database.ts
```

**Or compile first then run:**

```bash
cd server
npm run build
node dist/tests/seed-database.ts
```

### What the Script Does

1. Creates all test data in the correct order (respecting foreign key constraints)
2. Prints progress for each step
3. Runs verification queries to test relationships
4. Displays a summary of all created data
5. Handles errors gracefully

### Verification Queries

The script automatically runs these verification queries:

1. **Hospital with Users**: Verifies hospital-user relationships
2. **Patient with Allergies/Conditions**: Tests patient data relationships
3. **Appointment with Visit**: Tests appointment-visit linkage
4. **Doctor Appointments**: Tests doctor-patient relationships

### Output

The script provides colored console output:
- 🔵 Blue: Step headers
- 🟢 Green: Success messages
- 🟡 Yellow: Information/details
- 🔴 Red: Errors

### Notes

- All users have password: `password123`
- Data is inserted in the correct order to satisfy foreign key constraints
- The script can be run multiple times (will create duplicate data)
- To clean the database, you can manually delete records or reset the database

### Troubleshooting

**Error: "Prisma Client not generated"**
```bash
npm run prisma:generate
```

**Error: "Database connection failed"**
- Check your `.env` file has correct `DATABASE_URL`
- Verify database is running and accessible

**Error: "Table does not exist"**
```bash
npm run prisma:push
# or
npm run prisma:migrate
```

