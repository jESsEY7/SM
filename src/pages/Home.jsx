import { useQuery } from '@tanstack/react-query';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import CartDrawer from '@/components/cart/CartDrawer';
import Hero from '@/components/home/Hero';
import ClinicalGallery from '@/components/home/ClinicalGallery';
import Catalog from '@/components/home/Catalog';
import CatalogSkeleton from '@/components/home/CatalogSkeleton';
import ShadeStudio from '@/components/home/ShadeStudio';
import FormulaSection from '@/components/home/FormulaSection';
import UgcSection from '@/components/home/UgcSection';
import { fetchProducts } from '@/lib/catalog';
import { CLINICAL_PRODUCTS } from '@/data/clinicalProducts';

export default function Home() {
    const { data: products, isLoading } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
    const list = Array.isArray(products) && products.length > 0 ? products : CLINICAL_PRODUCTS;

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-transparent text-foreground transition-colors duration-500">
            <SiteHeader />
            <main>
                <Hero />
                <ClinicalGallery />
                {isLoading ? <CatalogSkeleton /> : <Catalog products={list} />}
                {!isLoading && list.length > 0 && <ShadeStudio products={list} />}
                <UgcSection />
                <FormulaSection />
            </main>
            <SiteFooter />
            <CartDrawer />
        </div>
    );
}
