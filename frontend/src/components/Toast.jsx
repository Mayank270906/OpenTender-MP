import { useState, useCallback } from 'react';

let toastSetter = null;

export function showToast(message, type = 'success') {
    if (toastSetter) {
        toastSetter({ message, type, visible: true });
        setTimeout(() => {
            toastSetter(prev => ({ ...prev, visible: false }));
        }, 3500);
    }
}

export default function Toast() {
    const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

    toastSetter = useCallback((val) => {
        if (typeof val === 'function') setToast(val);
        else setToast(val);
    }, []);

    if (!toast.visible) return null;

    return (
        <div className={`toast toast-${toast.type}`}>
            <span className="toast-icon">{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>{toast.message}</span>
        </div>
    );
}
