import React, { useState } from 'react';
import { ArrowUpRight, Sparkles, Shield, Clock, Award } from 'lucide-react';
import Reveal from '@/components/site/Reveal';
import { SylviaMonogram } from '@/components/ui/SylviaBrandLogo';

const CLINICAL_PROCEDURES = [
    {
        id: 'facial-contour',
        title: 'Precision Facial Rejuvenation',
        category: 'Aesthetic Medicine',
        subtitle: 'Advanced micro-infusion & skin contouring',
        image: '/images/clinic/clinic-1.jpeg',
        time: '60 min',
        doctor: 'Sylvia Muchiri, Lead Aesthetic Specialist',
        description: 'Biomimetic peptide infusion combined with micro-targeted hydration to restore cellular volume and natural luminance.',
    },
    {
        id: 'barrier-repair',
        title: 'Cellular Barrier Hydration',
        category: 'Clinical Dermatology',
        subtitle: 'Ceramide micro-lipid conditioning',
        image: '/images/clinic/clinic-2.jpeg',
        time: '45 min',
        doctor: 'Sylvia Muchiri, Aesthetic Specialist',
        description: 'Deep dermal squalane bath designed to soothe erythema, rebuild epidermal lipids, and lock in nine-hour moisture.',
    },
    {
        id: 'radiance-peel',
        title: 'Skin Health & Complexion Glow',
        category: 'Facial Aesthetics',
        subtitle: 'Non-invasive radiance stimulation',
        image: '/images/clinic/clinic-3.jpeg',
        time: '50 min',
        doctor: 'Sylvia Muchiri,Aesthetic Specialist',
        description: 'Medical-grade antioxidants and gentle exfoliating botanical acids calibrated for melanin-rich and sensitive skin types.',
    },
    {
        id: 'diagnostic-suite',
        title: 'Bespoke Aesthetic Diagnostics',
        category: 'Consultation',
        subtitle: 'Undertone reading & personalized regimen',
        image: '/images/clinic/clinic-4.jpeg',
        time: '30 min',
        doctor: 'Sylvia Muchiri, Aesthetic Specialist',
        description: 'High-resolution digital skin analysis to determine depth, undertone, elasticity, and formulate your personalized shade match.',
    },
    {
        id: 'collagen-boost',
        title: 'Micro-Targeted Peptide Therapy',
        category: 'Collagen Activation',
        subtitle: 'Active dermal renewal',
        image: '/images/clinic/clinic-5.jpeg',
        time: '60 min',
        doctor: 'Precision Therapy',
        description: 'Targeted delivery of multi-weight hyaluronic acid and bioactive amino acids for prolonged firmness and refined texture.',
    },
    {
        id: 'sculpt-glow',
        title: 'Advanced Skin Restoration',
        category: 'Treatment Protocol',
        subtitle: 'Complete skin recovery & glow',
        image: '/images/clinic/clinic-6.jpeg',
        time: '75 min',
        doctor: 'Sylvia Muchiri, Aesthetic Specialist',
        description: 'Comprehensive restorative protocol combining lymphatic drainage, cryo-sculpting, and customized clinical pigment blending.',
    },
];

export default function ClinicalGallery() {
    const [activeItem, setActiveItem] = useState(CLINICAL_PROCEDURES[0]);

    return (
        <section id="clinical-services" className="relative px-5 py-24 sm:px-8 sm:py-32">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <Reveal className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs text-primary font-medium mb-4">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Sylvia Aesthetics · Clinical Experience</span>
                        </div>
                        <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.75rem)] font-normal uppercase leading-[0.94] tracking-[0.08em] text-foreground">
                            Treatments & Aesthetic Therapies
                        </h2>
                        <p className="mt-4 text-[15px] leading-relaxed text-foreground/70">
                            Experience physician-grade skin therapies performed in our private Nairobi treatment rooms.
                        </p>
                    </Reveal>
                    <div className="shrink-0 flex items-center gap-3">
                        <SylviaMonogram className="h-10 w-6 text-primary" />
                        <span className="label-mono text-xs text-foreground/50">
                            Inquire: info@sylviamuchiriaesthetics.com
                        </span>
                    </div>
                </div>

                {/* Treatment Cards Grid */}
                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {CLINICAL_PROCEDURES.map((procedure) => (
                        <div
                            key={procedure.id}
                            className="group glass-panel relative flex flex-col overflow-hidden rounded-[2rem] border border-border/40 p-4 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:border-primary/40"
                        >
                            {/* Image container with elegant arch / cartouche aesthetic */}
                            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] bg-black/10">
                                <img
                                    src={procedure.image}
                                    alt={procedure.title}
                                    className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                                    loading="lazy"
                                />

                                {/* Pill Cartouche Tag */}
                                <div className="absolute left-3.5 top-3.5 rounded-full bg-background/85 px-3 py-1 backdrop-blur-md border border-border/30 text-[10px] uppercase tracking-[0.2em] font-medium text-foreground">
                                    {procedure.category}
                                </div>

                                <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 backdrop-blur-md border border-border/30 text-[10px] text-foreground/75">
                                    <Clock className="h-3 w-3 text-primary" />
                                    <span>{procedure.time}</span>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent p-4 pt-10">
                                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                                        {procedure.subtitle}
                                    </p>
                                    <h3 className="font-display text-lg font-normal uppercase tracking-[0.06em] text-foreground mt-0.5">
                                        {procedure.title}
                                    </h3>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="flex flex-1 flex-col justify-between p-2 pt-4">
                                <p className="text-xs leading-relaxed text-foreground/65 font-light">
                                    {procedure.description}
                                </p>

                                <div className="mt-5 flex items-center justify-between border-t border-border/30 pt-3 text-xs">
                                    <span className="text-[11px] text-foreground/50 font-mono">
                                        {procedure.doctor}
                                    </span>
                                    <a
                                        href="#top"
                                        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-primary font-medium hover:underline"
                                    >
                                        <span>Consult</span>
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Consultation Banner with authentic clinic photo */}
                <div className="glass-solid mt-16 relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 border border-border/40 shadow-xl">
                    <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 text-primary text-xs uppercase tracking-[0.2em] font-mono mb-2">
                                <Award className="h-4 w-4" />
                                <span>Sylvia Muchiri Aesthetics Clinic</span>
                            </div>
                            <h3 className="font-display text-2xl sm:text-4xl font-normal uppercase leading-[1.05] tracking-[0.08em] text-foreground">
                                Private Clinical Consultations in Nairobi
                            </h3>
                            <p className="mt-4 text-sm leading-relaxed text-foreground/75 font-light max-w-lg">
                                Schedule an appointment with our clinical specialists or explore our medical-grade shade matching studio.
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <a
                                    href="mailto:concierge@sylviamuchiriaesthetics.com?subject=Consultation%20Inquiry%20-%20Sylvia%20Aesthetics"
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-[11px] font-medium uppercase tracking-[0.24em] text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all"
                                >
                                    Book Session
                                </a>
                                <a
                                    href="#shade-studio"
                                    className="glass-btn inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[11px] font-medium uppercase tracking-[0.24em] text-foreground hover:border-primary/50 transition-all"
                                >
                                    Skin Tone Calibration
                                </a>
                            </div>
                        </div>

                        {/* Dual aesthetic image preview */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="overflow-hidden rounded-2xl aspect-[3/4] shadow-md border border-border/30">
                                <img
                                    src="/images/clinic/clinic-7.jpeg"
                                    alt="Sylvia Aesthetics facial procedure"
                                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                            </div>
                            <div className="overflow-hidden rounded-2xl aspect-[3/4] shadow-md border border-border/30 translate-y-4">
                                <img
                                    src="/images/clinic/clinic-8.jpeg"
                                    alt="Sylvia Aesthetics clinic care"
                                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

