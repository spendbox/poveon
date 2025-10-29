import React, { useState, useRef, useEffect } from 'react';
import { SortType } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface SortControlProps {
    sortBy: SortType;
    setSortBy: (sort: SortType) => void;
}

const SORT_OPTIONS: { value: SortType; label: string }[] = [
    { value: 'NEWEST', label: 'Newest' },
    { value: 'BUDGET_HIGH', label: 'Budget: High to Low' },
    { value: 'BUDGET_LOW', label: 'Budget: Low to High' },
    { value: 'APPLICANTS_HIGH', label: 'Applicants: Most to Fewest' },
    { value: 'APPLICANTS_LOW', label: 'Applicants: Fewest to Most' },
];

const SortControl: React.FC<SortControlProps> = ({ sortBy, setSortBy }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const selectedLabel = SORT_OPTIONS.find(opt => opt.value === sortBy)?.label;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);


    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white border border-slate-300 rounded-full shadow-sm py-1.5 pl-4 pr-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
                Sort by: {selectedLabel}
                <ChevronDownIcon />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-10">
                    <ul className="py-1">
                        {SORT_OPTIONS.map(option => (
                            <li key={option.value}>
                                <button
                                    onClick={() => {
                                        setSortBy(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm ${
                                        sortBy === option.value 
                                            ? 'bg-slate-100 text-slate-900 font-semibold' 
                                            : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SortControl;
