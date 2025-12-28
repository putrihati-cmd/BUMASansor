import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';


/**
 * Health Check Endpoint
 * Used by monitoring services (Uptime Robot, Pingdom, etc) to verify system health
 */
export async function GET() {
    const startTime = Date.now();
    const checks = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {}
    };

    try {
        // 1. Database connectivity check
        const dbStart = Date.now();
        await prisma.$queryRaw`SELECT 1 as health`;
        checks.checks.database = {
            status: 'healthy',
            responseTime: `${Date.now() - dbStart}ms`
        };

        // 2. Database pool status
        checks.checks.databasePool = {
            status: 'healthy',
            // Prisma doesn't expose pool stats directly, but we can infer from connection success
        };

        // 3. Environment variables check
        const envChecks = {
            DATABASE_URL: !!process.env.DATABASE_URL,
            NEXT_PUBLIC_API_URL: !!process.env.NEXT_PUBLIC_API_URL,
            JWT_SECRET: !!process.env.JWT_SECRET,
        };

        const missingEnvs = Object.entries(envChecks)
            .filter(([key, exists]) => !exists)
            .map(([key]) => key);

        checks.checks.environment = {
            status: missingEnvs.length === 0 ? 'healthy' : 'degraded',
            missing: missingEnvs
        };

        // 4. Overall response time
        checks.responseTime = `${Date.now() - startTime}ms`;

        // Determine overall status
        const hasUnhealthy = Object.values(checks.checks).some(
            check => check.status === 'unhealthy'
        );

        if (hasUnhealthy) {
            checks.status = 'unhealthy';
            return NextResponse.json(checks, { status: 503 });
        }

        return NextResponse.json(checks, { status: 200 });

    } catch (error) {
        checks.status = 'unhealthy';
        checks.checks.database = {
            status: 'unhealthy',
            error: error.message
        };
        checks.error = error.message;

        return NextResponse.json(checks, { status: 503 });
    }
}

/**
 * HEAD request support for simple uptime checks
 */
export async function HEAD() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return new Response(null, { status: 200 });
    } catch (error) {
        return new Response(null, { status: 503 });
    }
}

