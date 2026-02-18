/**
 * Returns a human-readable countdown from now to a Unix timestamp (seconds).
 */
export function getTimeLeft(unixTimestamp) {
    const total = unixTimestamp * 1000 - Date.now();

    if (total <= 0) return 'Ended';

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m ${seconds}s left`;
}

/**
 * Formats a Unix timestamp (seconds) into a readable datetime string.
 */
export function formatTimestamp(unixTimestamp) {
    if (!unixTimestamp) return '—';
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Status enum matching Solidity TenderStatus:
 * 0 = Open, 1 = BiddingClosed, 2 = RevealClosed, 3 = Finalized, 4 = Canceled
 */
export const STATUS_LABELS = ['Open', 'Bidding Closed', 'Reveal Closed', 'Finalized', 'Canceled'];

export function getStatusLabel(status) {
    return STATUS_LABELS[status] || 'Unknown';
}

export function getStatusColor(status) {
    const colors = ['#16A34A', '#F59E0B', '#EF4444', '#6B7280', '#EF4444'];
    return colors[status] || '#6B7280';
}
