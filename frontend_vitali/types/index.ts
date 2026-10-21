export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'FAMILY';

export interface UserResponse {
  id: number;
  email: string;
  role: Role;
  token?: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  role: Role;
}

export interface PatientProfile {
  id: number;
  medicalHistory?: string;
  emergencyContact?: string;
}

export interface DoctorProfile {
  id: number;
  specialty: string;
  licenseNumber: string;
  approved: boolean;
}