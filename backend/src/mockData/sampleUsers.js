/**
 * Sample Users with ABHA IDs for Testing
 * These users can be seeded into the database for development/testing
 */

const sampleUsers = [
  {
    name: "Rohit Sinha",
    email: "rohit.sinha@example.com",
    password: "Test@123",
    age: 45,
    gender: "male",
    userType: "patient",
    language: "en",
    phoneNumber: "9876543210",
    abhaNumber: "1011-2233-4455-6677",
    abhaAddress: "rohit.sinha@abdm",
    abhaLinked: true,
    diagnosisType: "Type 2 Diabetes",
    targetGlucoseRange: {
      min: 70,
      max: 140
    },
    medications: [
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        startDate: new Date("2024-01-15")
      }
    ]
  },
  {
    name: "Manish Deshmukh",
    email: "manish.deshmukh@example.com",
    password: "Test@123",
    age: 38,
    gender: "male",
    userType: "patient",
    language: "hi",
    phoneNumber: "9876543211",
    abhaNumber: "2022-3344-5566-7788",
    abhaAddress: "manish.deshmukh@abdm",
    abhaLinked: true,
    diagnosisType: "Type 1 Diabetes",
    targetGlucoseRange: {
      min: 80,
      max: 150
    },
    medications: [
      {
        name: "Insulin Glargine",
        dosage: "10 units",
        frequency: "Once daily at bedtime",
        startDate: new Date("2023-06-20")
      }
    ]
  },
  {
    name: "Kavita Joshi",
    email: "kavita.joshi@example.com",
    password: "Test@123",
    age: 52,
    gender: "female",
    userType: "patient",
    language: "en",
    phoneNumber: "9876543212",
    abhaNumber: "3033-4455-6677-8899",
    abhaAddress: "kavita.joshi@abdm",
    abhaLinked: true,
    diagnosisType: "Type 2 Diabetes",
    targetGlucoseRange: {
      min: 70,
      max: 140
    },
    medications: [
      {
        name: "Glipizide",
        dosage: "5mg",
        frequency: "Before breakfast",
        startDate: new Date("2024-03-10")
      }
    ]
  },
  {
    name: "Shalini Mehta",
    email: "shalini.mehta@example.com",
    password: "Test@123",
    age: 62,
    gender: "female",
    userType: "patient",
    language: "hi",
    phoneNumber: "9876543213",
    abhaNumber: "4044-5566-7788-9900",
    abhaAddress: "shalini.mehta@abdm",
    abhaLinked: true,
    diagnosisType: "Type 2 Diabetes",
    targetGlucoseRange: {
      min: 70,
      max: 130
    },
    medications: [
      {
        name: "Metformin",
        dosage: "850mg",
        frequency: "Twice daily with meals",
        startDate: new Date("2023-11-05")
      },
      {
        name: "Sitagliptin",
        dosage: "100mg",
        frequency: "Once daily",
        startDate: new Date("2024-02-01")
      }
    ]
  },
  {
    name: "Rajesh Nair",
    email: "rajesh.nair@example.com",
    password: "Test@123",
    age: 48,
    gender: "male",
    userType: "patient",
    language: "en",
    phoneNumber: "9876543214",
    abhaNumber: "5055-6677-8899-0011",
    abhaAddress: "rajesh.nair@abdm",
    abhaLinked: true,
    diagnosisType: "Pre-Diabetes",
    targetGlucoseRange: {
      min: 70,
      max: 100
    },
    medications: []
  },
  {
    name: "Sunita Sharma",
    email: "sunita.sharma@example.com",
    password: "Test@123",
    age: 35,
    gender: "female",
    userType: "patient",
    language: "hi",
    phoneNumber: "9876543215",
    abhaNumber: "6066-7788-9900-1122",
    abhaAddress: "sunita.sharma@abdm",
    abhaLinked: true,
    diagnosisType: "Gestational Diabetes",
    targetGlucoseRange: {
      min: 70,
      max: 140
    },
    medications: [
      {
        name: "Insulin Aspart",
        dosage: "4 units",
        frequency: "Before meals",
        startDate: new Date("2025-10-15")
      }
    ]
  }
];

module.exports = sampleUsers;
