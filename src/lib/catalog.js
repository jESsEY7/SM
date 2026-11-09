import client from '@/api/client';
import { CLINICAL_PRODUCTS } from '@/data/clinicalProducts';

export async function fetchProducts() {
    try {
        const res = await client.get('/products/');
        // Verify res.data is actually a valid array from Django
        if (Array.isArray(res.data) && res.data.length > 0) {
            return res.data;
        }
        // If Django returns DRF paginated structure: { results: [...] }
        if (res.data && Array.isArray(res.data.results) && res.data.results.length > 0) {
            return res.data.results;
        }
        return CLINICAL_PRODUCTS;
    } catch {
        // Return clinical catalog fallback if local Django server is not reachable
        return CLINICAL_PRODUCTS;
    }
}
