export enum UrgencyLevel {
    GENERAL = 'GENERAL',
    SERIOUS = 'SERIOUS',
    EXTREMELY_URGENT = 'EXTREMELY_URGENT',
}

export type FilterType = 'ALL' | UrgencyLevel | 'MY_REQUESTS' | 'MY_APPLICATIONS';

export type SortType = 'NEWEST' | 'BUDGET_HIGH' | 'BUDGET_LOW' | 'APPLICANTS_HIGH' | 'APPLICANTS_LOW';

export type VerificationStatus = 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED';

export interface Applicant {
    userId: string;
    userName: string;
    appliedAt: string;
}

export interface Request {
    id: string;
    userId: string;
    userName: string;
    userVerification: VerificationStatus;
    title: string;
    description: string;
    category: string;
    budget: number;
    urgency: UrgencyLevel;
    createdAt: string;
    applicants: Applicant[];
    rawInput?: string;
    whatsapp?: string;
    email?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    walletBalance: number;
    verificationStatus: VerificationStatus;
    phone?: string;
    bio?: string;
    location?: string;
    joinedDate?: string;
}

export interface UrgencyOption {
    level: UrgencyLevel;
    label: string;
    cost: number;
    description: string;
    color: string;
}

export type ModalType = 'REQUEST' | 'AUTH' | 'WALLET' | 'CONFIRMATION' | 'PROFILE' | null;

export type AuthAction = 'LOGIN' | 'REGISTER';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}
