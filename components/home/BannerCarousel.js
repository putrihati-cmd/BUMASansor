'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BannerCarousel() {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const intervalRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await fetch('/api/banners');
                if (res.ok) {
                    const data = await res.json();
                    if (data && Array.isArray(data) && data.length > 0) {
                        setBanners(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch banners', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    };

    // Auto-play functionality
    useEffect(() => {
        if (isAutoPlaying && banners.length > 0) {
            intervalRef.current = setInterval(() => {
                goToNext();
            }, 4000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isAutoPlaying, currentIndex, banners.length]);

    const handleMouseEnter = () => setIsAutoPlaying(false);
    const handleMouseLeave = () => setIsAutoPlaying(true);

    if (loading) {
        return <div className="w-full aspect-[3/1] md:aspect-[4/1] bg-gray-200 animate-pulse rounded-lg" />;
    }

    if (banners.length === 0) {
        return null; // Or show a default fallback banner
    }

    return (
        <div
            className="relative w-full overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Banner Container */}
            <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map((banner, index) => (
                    <Link
                        key={banner.id}
                        href={banner.link || '#'}
                        className="w-full flex-shrink-0"
                    >
                        <div className="relative aspect-[3/1] md:aspect-[4/1] w-full">
                            <Image
                                src={banner.image_url}
                                alt={banner.alt_text || banner.title || 'Banner'}
                                fill
                                className="object-cover"
                                priority={index === 0}
                                sizes="100vw"
                            />
                            {/* Overlay Gradient for Text Readability if needed */}
                            <div className="absolute inset-0 bg-black/10" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Navigation Arrows - Desktop only */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full items-center justify-center shadow-md hover:bg-white transition-colors z-10"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6 text-neutral-700" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full items-center justify-center shadow-md hover:bg-white transition-colors z-10"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6 text-neutral-700" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {banners.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "transition-all duration-300 rounded-full",
                                currentIndex === index
                                    ? "w-6 h-2 bg-white"
                                    : "w-2 h-2 bg-white/50 hover:bg-white/70"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
