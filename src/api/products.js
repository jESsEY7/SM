import client from './client';

export const productsApi = {
    getAll: async (all = false) => {
        const response = await client.get(`/products/${all ? '?all=true' : ''}`);
        return response.data;
    },

    getByIdOrSlug: async (idOrSlug) => {
        const response = await client.get(`/products/${idOrSlug}/`);
        return response.data;
    },

    create: async (productData) => {
        const response = await client.post('/products/', productData);
        return response.data;
    },

    update: async (id, productData) => {
        const response = await client.patch(`/products/${id}/`, productData);
        return response.data;
    },

    delete: async (id) => {
        const response = await client.delete(`/products/${id}/`);
        return response.data;
    },
};

export default productsApi;
