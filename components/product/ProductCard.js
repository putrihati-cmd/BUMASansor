'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Star, MapPin, Flame } from 'lucide-react';
import { formatRupiah, calculateDiscountPercentage, formatSoldCount } from '@/lib/utils';
import { cn } from '@/lib/utils';
import useCartStore from '@/store/cart';

export default function ProductCard({ product, variant = 'default' }) {
    const { addItem, openCart } = useCartStore();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
        openCart();
    };

    const discountPercentage = calculateDiscountPercentage(
        product.base_price,
        product.sale_price
    );

    const soldCount = product.soldCount || product.reviewCount * 5 || 0;
    const isHotItem = soldCount > 100;

    return (
        <Link href={`/products/${product.slug}`}>
            <article className={cn(
                "group bg-white rounded overflow-hidden transition-all duration-200",
                "border border-gray-200/80 hover:border-gray-300",
                "cursor-pointer",
                "h-full flex flex-col",
                variant === 'compact' && "rounded-sm"
            )}>
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-neutral-50 shrink-0">
                    <Image
                        src={product.images?.[0] || '/api/placeholder/400'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />

                    {/* Discount Badge - Shopee Ultra Compact */}
                    {discountPercentage > 0 && (
                        <div className="absolute top-0 right-0 z-10">
                            <div className="bg-secondary-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg shadow-sm leading-none flex flex-col items-center justify-center min-w-[28px] h-[32px]">
                                <span className="text-[8px] font-medium">Model</span>
                                <span>{discountPercentage}%</span>
                            </div>
                        </div>
                    )}

                    {/* Hot Item Badge - Compact */}
                    {isHotItem && (
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            <Flame className="w-2.5 h-2.5" />
                            HOT
                        </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // TODO: Add to wishlist
                        }}
                        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-white hover:scale-110"
                        aria-label="Tambah ke wishlist"
                    >
                        <Heart className="w-4 h-4 text-neutral-600 hover:text-red-500 transition-colors" />
                    </button>

                    {/* Quick Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        className="absolute bottom-2 right-2 p-2.5 bg-primary-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-600 hover:scale-110"
                        aria-label="Tambah ke keranjang"
                    >
                        <ShoppingCart className="w-4 h-4" />
                    </button>

                    {/* Stock Badge (if low) */}
                    {product.stock > 0 && product.stock < 10 && (
                        <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            Sisa {product.stock}
                        </div>
                    )}
                </div>

                {/* Content - Marketplace Standard */}
                <div className="p-1.5 md:p-2 flex-1 flex flex-col">
                    {/* Name - Fixed height for consistency (2 lines) */}
                    <h3 className="text-[11px] md:text-sm font-normal text-[#212121] line-clamp-2 mb-0.5 leading-snug h-[2rem] md:h-[2.4rem]" title={product.name}>
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-1 flex-wrap">
                        <span className="text-sm md:text-lg font-bold text-primary-600">
                            {formatRupiah(product.sale_price || product.base_price)}
                        </span>
                        {product.sale_price && (
                            <span className="text-[9px] md:text-xs text-neutral-400 line-through truncate">
                                {formatRupiah(product.base_price)}
                            </span>
                        )}
                    </div>

                    {/* Rating & Sold - Ultra Small */}
                    <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-auto">
                        <div className="flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                            <span>{product.rating || '5.0'}</span>
                        </div>
                        <span className="border-l border-gray-300 pl-2">{formatSoldCount(soldCount)} terjual</span>
                    </div>

                    {/* Location - Optional - Hidden on smallest mobile if needed, or keeping it tiny */}
                    {product.location && (
                        <div className="flex items-center gap-1 mt-1 text-[9px] text-neutral-400">
                            <MapPin className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[100px]">{product.location}</span>
                        </div>
                    )}
                </div>
            </article>
        </Link>
    );
}
