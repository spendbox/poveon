import { UrgencyLevel, UrgencyOption, Request } from './types';

export const URGENCY_OPTIONS: UrgencyOption[] = [
    {
        level: UrgencyLevel.GENERAL,
        label: 'General',
        cost: 0,
        description: 'Standard visibility, no extra cost.',
        color: 'bg-slate-100 text-slate-700',
    },
    {
        level: UrgencyLevel.SERIOUS,
        label: 'Serious',
        cost: 500,
        description: 'Increased visibility for serious buyers.',
        color: 'bg-blue-100 text-blue-700',
    },
    {
        level: UrgencyLevel.EXTREMELY_URGENT,
        label: 'Extremely Urgent',
        cost: 50000,
        description: 'Maximum visibility for top priority.',
        color: 'bg-yellow-100 text-yellow-700',
    },
];

// Mock requests removed - all data now comes from Supabase
export const MOCK_REQUESTS: Request[] = [];

export const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Replace with your actual key in a real app
