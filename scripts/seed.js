require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/llm-gateway');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users.');

    const mockUsers = [
      {
        name: 'Test User 1',
        apiKey: 'test-key-12345',
        dailyTokenLimit: 50000,
        monthlyTokenLimit: 500000
      },
      {
        name: 'Test User 2',
        apiKey: 'test-key-67890',
        dailyTokenLimit: 10000,
        monthlyTokenLimit: 100000
      }
    ];

    await User.insertMany(mockUsers);
    console.log('Mock users inserted successfully:');
    mockUsers.forEach(u => console.log(`- ${u.name}: API Key = ${u.apiKey}`));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
