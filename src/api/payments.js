import client from './client';

export const paymentsApi = {
    /**
     * Initiate M-Pesa STK Push
     * @param {Object} data { order_id, phone_number }
     */
    initiateSTKPush: async (data) => {
        const response = await client.post('/payments/mpesa/stkpush/', data);
        return response.data;
    },

    /**
     * Query M-Pesa payment transaction status
     * @param {string} checkoutRequestId
     */
    checkStatus: async (checkoutRequestId) => {
        const response = await client.get(`/payments/mpesa/status/${checkoutRequestId}/`);
        return response.data;
    },

    /**
     * Generate dynamic M-Pesa QR code for an order
     * @param {Object} data { order_id }
     */
    generateDynamicQR: async (data) => {
        const response = await client.post('/payments/mpesa/qr/', data);
        return response.data;
    },

    /**
     * Sandbox simulation tool for callbacks
     * @param {string} checkoutRequestId
     * @param {string} scenario 'success' | 'cancelled' | 'failed' | 'timeout'
     */
    simulateCallback: async (checkoutRequestId, scenario = 'success') => {
        const response = await client.post('/payments/mpesa/simulate-callback/', {
            checkout_request_id: checkoutRequestId,
            scenario,
        });
        return response.data;
    },

    /**
     * Admin: fetch list of payment transactions
     * @param {string} [status]
     */
    getTransactions: async (status) => {
        const params = status && status !== 'all' ? { status } : {};
        const response = await client.get('/payments/transactions/', { params });
        return response.data;
    },

    /**
     * Admin: fetch single transaction details
     * @param {number} id
     */
    getTransactionDetail: async (id) => {
        const response = await client.get(`/payments/transactions/${id}/`);
        return response.data;
    },
};

export default paymentsApi;

