// TypeScript types aligned with backend DTOs and Prisma schema

export enum Role {
  GM = 'GM',
  REGION_MANAGER = 'REGION_MANAGER',
  DELEGATE = 'DELEGATE',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Region {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegionManager {
  id: string;
  userId: string;
  regionId: string;
  startAt: string;
  endAt?: string | null;
  user?: User;
  region?: Region;
}

export interface Delegate {
  id: string;
  name: string;
  phone?: string | null;
  regionId: string;
  userId?: string | null;
  managerId: string;
  region?: Region;
  user?: User;
  manager?: RegionManager;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  cin: string;
  fullName: string;
  status: string;
  delegateId: string;
  delegate?: Delegate;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  memberId: string;
  delegateId?: string | null;
  amount: string | number;
  paidAt: string;
  member?: Member;
  delegate?: Delegate;
}

// Auth DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: Role;
  delegateId?: string;
  iat?: number;
  exp?: number;
}

// Create DTOs
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: 'GM' | 'REGION_MANAGER' | 'DELEGATE';
}

export interface CreateRegionDto {
  name: string;
}

export interface CreateManagerDto {
  userId: string;
  regionId: string;
  startAt?: string;
  endAt?: string | null;
}

export interface CreateDelegateDto {
  name: string;
  phone?: string;
  regionId: string;
  managerId: string;
  userId?: string;
}

export interface CreateMemberDto {
  cin: string;
  fullName: string;
  status?: string;
}

export interface CreatePaymentDto {
  memberId: string;
  amount: number;
  paidAt?: string;
}

// Query DTOs
export interface QueryMemberDto {
  delegateId?: string;
  status?: string;
}

export interface QueryPaymentDto {
  delegateId?: string;
  memberId?: string;
  startDate?: string;
  endDate?: string;
}

// Report types
export interface GlobalSummary {
  totalRegions: number;
  totalManagers: number;
  totalDelegates: number;
  totalMembers: number;
  totalPayments: number;
  totalAmount: string;
}

export interface RegionReport {
  regionId: string;
  regionName: string;
  delegatesCount: number;
  membersCount: number;
  paymentsCount: number;
  totalAmount: string;
}

export interface DelegateReport {
  delegateId: string;
  delegateName: string;
  regionName: string;
  membersCount: number;
  paymentsCount: number;
  totalAmount: string;
  members: Member[];
}

// API Error
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
