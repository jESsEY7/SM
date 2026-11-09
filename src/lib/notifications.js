// Email notifications are handled by the Django backend.
// These are no-op stubs kept for compatibility; real emails go through Django signals.

export const ADMIN_NOTIFICATION_EMAIL = 'orders@lumenbeauty.com';

function money(n) {
    return `$${Number(n || 0).toFixed(0)}`;
}

export async function sendAdminOrderAlert(order) {
    // The backend sends admin notifications via email on order creation.
    console.info(`[LUMEN] Order ${order.order_number} placed — backend will notify admin.`);
}

export async function sendCustomerOrderConfirmation(order) {
    // The backend sends customer confirmation emails.
    console.info(`[LUMEN] Confirmation for ${order.order_number} → backend sends to ${order.email}.`);
}
