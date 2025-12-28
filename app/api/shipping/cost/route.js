import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getMultipleCourierCosts, formatShippingCosts, DEFAULT_ORIGIN_CITY_ID, POPULAR_COURIERS } from '@/lib/rajaongkir';


// Fallback rates when API is not configured
function getFallbackRates(weight) {
    const baseRate = Math.ceil(weight / 1000) * 10000;
    return [
        { courier: 'JNE', courierName: 'JNE', service: 'REG', description: 'Reguler', cost: baseRate, etd: '3-5', note: '' },
        { courier: 'JNE', courierName: 'JNE', service: 'YES', description: 'Yakin Esok Sampai', cost: baseRate + 15000, etd: '1-2', note: '' },
        { courier: 'SICEPAT', courierName: 'SiCepat', service: 'BEST', description: 'Best Express', cost: baseRate + 3000, etd: '2-3', note: '' },
        { courier: 'JNT', courierName: 'J&T Express', service: 'EZ', description: 'Express', cost: baseRate + 1000, etd: '2-4', note: '' },
        { courier: 'ANTERAJA', courierName: 'AnterAja', service: 'REG', description: 'Regular', cost: baseRate - 2000, etd: '3-5', note: '' },
    ];
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { destinationCityId, weight, couriers } = body;

        // Validation
        if (!weight || weight <= 0) {
            return NextResponse.json(
                { error: 'Valid weight is required (in grams)' },
                { status: 400 }
            );
        }

        // Check if API key is configured
        if (!process.env.RAJAONGKIR_API_KEY) {
            console.log('⚠️ RajaOngkir API key not configured, using fallback rates');
            const fallbackRates = getFallbackRates(weight);
            return NextResponse.json({
                success: true,
                shippingOptions: fallbackRates,
                isFallback: true,
            });
        }

        if (!destinationCityId) {
            return NextResponse.json(
                { error: 'Destination city ID is required' },
                { status: 400 }
            );
        }

        // Use popular couriers if not specified
        const selectedCouriers = couriers || POPULAR_COURIERS.map(c => c.code);

        // Get shipping costs
        const results = await getMultipleCourierCosts({
            origin: DEFAULT_ORIGIN_CITY_ID,
            destination: destinationCityId,
            weight: weight,
            couriers: selectedCouriers,
        });

        // Format for frontend
        const formattedCosts = formatShippingCosts(results);
        formattedCosts.sort((a, b) => a.cost - b.cost);

        console.log(`✅ Calculated shipping costs for ${formattedCosts.length} options`);

        return NextResponse.json({
            success: true,
            shippingOptions: formattedCosts,
            isFallback: false,
        });
    } catch (error) {
        console.error('Calculate shipping cost error:', error);

        // Return fallback on error
        const weight = 500; // default weight
        const fallbackRates = getFallbackRates(weight);
        return NextResponse.json({
            success: true,
            shippingOptions: fallbackRates,
            isFallback: true,
            error: error.message,
        });
    }
}


