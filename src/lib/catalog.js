import client from '@/api/client';

export async function fetchProducts() {
    const res = await client.get('/products/');
    return res.data;
}
