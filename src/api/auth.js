import client from './client';

export const authApi = {
    login: async (email, password) => {
        const response = await client.post('/auth/login/', { email, password });
        return response.data;
    },

    register: async (userData) => {
        const response = await client.post('/auth/register/', userData);
        return response.data;
    },

    getMe: async () => {
        const response = await client.get('/auth/me/');
        return response.data;
    },

    logout: async (refreshToken) => {
        const response = await client.post('/auth/logout/', { refresh: refreshToken });
        return response.data;
    },

    /**
     * Admin: get list of registered users
     */
    getUsers: async () => {
        const response = await client.get('/auth/users/');
        return response.data;
    },
};

export default authApi;

