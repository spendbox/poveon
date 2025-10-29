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

export const MOCK_REQUESTS: Request[] = [
    {
        id: '1',
        userId: 'user-2',
        userName: 'Jane Doe',
        userVerification: 'VERIFIED',
        title: 'Build a Mobile App for a Fitness Startup',
        description: 'I need a cross-platform mobile app (iOS and Android) for a new fitness startup. Key features should include user profiles, workout tracking, social sharing, and a subscription model. Looking for a developer or team with experience in React Native or Flutter.',
        category: 'Mobile Development',
        budget: 2500000,
        urgency: UrgencyLevel.EXTREMELY_URGENT,
        createdAt: '2023-10-26T10:00:00Z',
        email: 'jane.doe@example.com',
        applicants: [],
    },
    {
        id: '2',
        userId: 'user-3',
        userName: 'Sam Wilson',
        userVerification: 'NOT_VERIFIED',
        title: 'Logo Design for a Coffee Shop',
        description: 'I am opening a new coffee shop called "The Daily Grind" and need a modern, minimalist logo. It should be versatile for use on cups, signage, and social media. Please provide a portfolio of previous logo work.',
        category: 'Graphic Design',
        budget: 75000,
        urgency: UrgencyLevel.SERIOUS,
        createdAt: '2023-10-25T14:30:00Z',
        whatsapp: '+2348012345678',
        email: 'sam.wilson@example.com',
        applicants: [
            { userId: 'user-4', userName: 'Chris Evans', appliedAt: '2023-10-25T18:00:00Z' }
        ],
    },
     {
        id: '3',
        userId: 'user-4',
        userName: 'Chris Evans',
        userVerification: 'PENDING',
        title: 'Content Writer for a Tech Blog',
        description: 'Looking for an experienced content writer to produce 4 high-quality blog posts per month for a tech blog focused on AI and machine learning. Each article should be around 1500 words and well-researched.',
        category: 'Writing & Translation',
        budget: 120000,
        urgency: UrgencyLevel.GENERAL,
        createdAt: '2023-10-24T09:00:00Z',
        email: 'chris.evans@example.com',
        applicants: [],
    }
];

export const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Replace with your actual key in a real app
