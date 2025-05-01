// lib/jsonStorage.ts
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

// Define the base directory for our JSON storage
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const CALCULATIONS_FILE = path.join(DATA_DIR, "calculations.json");
const TOKENS_FILE = path.join(DATA_DIR, "tokens.json");

// Make sure our data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Create empty files with default data if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }));
}

if (!fs.existsSync(CALCULATIONS_FILE)) {
  fs.writeFileSync(CALCULATIONS_FILE, JSON.stringify({ calculations: [] }));
}

if (!fs.existsSync(TOKENS_FILE)) {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify({ tokens: [] }));
}

// User type definition
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Token type for email verification and password reset
export interface Token {
  id: string;
  userId: string;
  token: string;
  type: "email-verification" | "password-reset";
  expiresAt: string;
  createdAt: string;
}

// Calculation type for storing lighting calculations
export interface Calculation {
  id: string;
  userId: string;
  name: string;
  roomDimensions: {
    length: number;
    width: number;
    height: number;
    workplaneHeight: number;
  };
  lightingRequirements: {
    targetIlluminance: number;
    fluxPerLamp: number;
    contaminationLevel: string;
    maintenanceInterval: number;
    ceilingReflectance: number;
    wallReflectance: number;
  };
  results: any; // Lighting calculation results
  createdAt: string;
  updatedAt: string;
}

// Read users from file
export function getUsers(): User[] {
  const data = fs.readFileSync(USERS_FILE, "utf8");
  return JSON.parse(data).users;
}

// Write users to file
export function saveUsers(users: User[]): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
}

// Get user by email
export function getUserByEmail(email: string): User | null {
  const users = getUsers();
  return users.find((user) => user.email === email) || null;
}

// Get user by ID
export function getUserById(id: string): User | null {
  const users = getUsers();
  return users.find((user) => user.id === id) || null;
}

// Create a new user
export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const users = getUsers();

  // Check if user already exists
  if (users.some((user) => user.email === email)) {
    throw new Error("User with this email already exists");
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create new user
  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    passwordHash,
    isVerified: true, //temporary as of now
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Add user to array and save
  users.push(newUser);
  saveUsers(users);

  return newUser;
}

// Verify user's password
export async function verifyPassword(
  user: User,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

// Update user verification status
export function verifyUser(userId: string): boolean {
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return false;
  }

  users[userIndex].isVerified = true;
  users[userIndex].updatedAt = new Date().toISOString();
  saveUsers(users);

  return true;
}

// Update user's password
export async function updatePassword(
  userId: string,
  newPassword: string
): Promise<boolean> {
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return false;
  }

  // Hash the new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  users[userIndex].passwordHash = passwordHash;
  users[userIndex].updatedAt = new Date().toISOString();
  saveUsers(users);

  return true;
}

// Token management
export function getTokens(): Token[] {
  const data = fs.readFileSync(TOKENS_FILE, "utf8");
  return JSON.parse(data).tokens;
}

export function saveTokens(tokens: Token[]): void {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify({ tokens }, null, 2));
}

export function createToken(
  userId: string,
  type: "email-verification" | "password-reset"
): Token {
  const tokens = getTokens();

  // Remove any existing tokens of the same type for this user
  const filteredTokens = tokens.filter(
    (token) => !(token.userId === userId && token.type === type)
  );

  // Create a new token
  const newToken: Token = {
    id: uuidv4(),
    userId,
    token: uuidv4(), // Generate a random token
    type,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    createdAt: new Date().toISOString(),
  };

  // Add token to array and save
  filteredTokens.push(newToken);
  saveTokens(filteredTokens);

  return newToken;
}

export function getTokenByValue(tokenValue: string): Token | null {
  const tokens = getTokens();
  return tokens.find((token) => token.token === tokenValue) || null;
}

export function removeToken(tokenId: string): void {
  const tokens = getTokens();
  const filteredTokens = tokens.filter((token) => token.id !== tokenId);
  saveTokens(filteredTokens);
}

// Calculation management
export function getCalculations(): Calculation[] {
  const data = fs.readFileSync(CALCULATIONS_FILE, "utf8");
  return JSON.parse(data).calculations;
}

export function getCalculationsByUserId(userId: string): Calculation[] {
  const calculations = getCalculations();
  return calculations.filter((calc) => calc.userId === userId);
}

export function saveCalculations(calculations: Calculation[]): void {
  fs.writeFileSync(
    CALCULATIONS_FILE,
    JSON.stringify({ calculations }, null, 2)
  );
}

export function createCalculation(
  userId: string,
  name: string,
  roomDimensions: any,
  lightingRequirements: any,
  results: any
): Calculation {
  const calculations = getCalculations();

  const newCalculation: Calculation = {
    id: uuidv4(),
    userId,
    name,
    roomDimensions,
    lightingRequirements,
    results,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  calculations.push(newCalculation);
  saveCalculations(calculations);

  return newCalculation;
}

export function updateCalculation(
  calculationId: string,
  updates: Partial<Calculation>
): Calculation | null {
  const calculations = getCalculations();
  const calcIndex = calculations.findIndex((calc) => calc.id === calculationId);

  if (calcIndex === -1) {
    return null;
  }

  // Update the calculation
  calculations[calcIndex] = {
    ...calculations[calcIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveCalculations(calculations);

  return calculations[calcIndex];
}

export function deleteCalculation(calculationId: string): boolean {
  const calculations = getCalculations();
  const filteredCalculations = calculations.filter(
    (calc) => calc.id !== calculationId
  );

  if (filteredCalculations.length === calculations.length) {
    return false; // Nothing was deleted
  }

  saveCalculations(filteredCalculations);
  return true;
}
