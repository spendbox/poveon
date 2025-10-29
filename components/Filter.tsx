import React from 'react';
import { FilterType, UrgencyLevel } from '../types';

interface FilterProps {
    currentFilter: FilterType;
    setFilter: (filter: FilterType) => void;
}

const Filter: React.FC<FilterProps> = ({ currentFilter, setFilter }) => {
    const filters: { label: string; value: FilterType }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'Serious', value: UrgencyLevel.SERIOUS },
        { label: 'Urgent', value: UrgencyLevel.EXTREMELY_URGENT },
    ];
    
    // De-emphasize personal filters when a general filter is selected
    const isPersonalFilterActive = currentFilter === 'MY_REQUESTS' || currentFilter === 'MY_APPLICATIONS';

    return (
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full flex-wrap justify-center">
            {filters.map(({ label, value }) => (
                <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                        currentFilter === value && !isPersonalFilterActive
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:bg-white/60'
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

export default Filter;