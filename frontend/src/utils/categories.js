export const CATEGORIES = {
    0: 'Construction',
    1: 'IT',
    2: 'Logistics',
    3: 'Research',
    4: 'Healthcare',
    5: 'Other',
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([value, label]) => ({
    value: Number(value),
    label,
}));
