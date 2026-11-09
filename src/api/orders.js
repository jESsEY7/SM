import client from './client';

export const ordersApi = {
    /**
     * Create/place a new order
     * @param {Object} orderData
     */
    createOrder: async (orderData) => {
        const response = await client.post('/orders/', orderData);
        return response.data;
    },

    /**
     * Admin: get orders list with optional status filter
     * @param {string} [status]
     */
    getOrders: async (status) => {
        const params = status && status !== 'all' ? { status } : {};
        const response = await client.get('/orders/', { params });
        return response.data;
    },

    /**
     * Admin: update order status
     * @param {number} orderId
     * @param {string} status
     */
    updateStatus: async (orderId, status) => {
        const response = await client.patch(`/orders/${orderId}/status/`, { status });
        return response.data;
    },

    /**
     * Admin: get aggregated store analytics
     */
    getAnalytics: async () => {
        const response = await client.get('/orders/analytics/');
        return response.data;
    },
};

export default ordersApi;

