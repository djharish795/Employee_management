const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

async function main() {
  const secret = process.env.JWT_SECRET || 'super-secret-key-for-jwt-auth'; // Actually I should read .env from api
}
