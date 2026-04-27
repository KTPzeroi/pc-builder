import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/performance
 * Returns the dynamic max scores from the Component table.
 * These are used by the Build Page as baselines for Min-Max Normalization.
 */
export async function GET() {
    try {
        const FALLBACK_CPU = 30000;
        const FALLBACK_GPU = 30000;

        const [cpuResult, gpuResult] = await Promise.all([
            prisma.component.aggregate({
                _max: { cpuMultiScore: true },
                where: { type: 'CPU' },
            }),
            prisma.component.aggregate({
                _max: { gpuScore: true },
                where: { type: 'GPU' },
            }),
        ]);

        const maxCpuScore = cpuResult._max.cpuMultiScore ?? FALLBACK_CPU;
        const maxGpuScore = gpuResult._max.gpuScore ?? FALLBACK_GPU;

        return NextResponse.json({
            maxCpuScore: maxCpuScore > 0 ? maxCpuScore : FALLBACK_CPU,
            maxGpuScore: maxGpuScore > 0 ? maxGpuScore : FALLBACK_GPU,
        });
    } catch (error) {
        console.error('Failed to fetch performance baselines:', error);
        return NextResponse.json(
            { maxCpuScore: 30000, maxGpuScore: 30000 },
            { status: 200 } // Return fallback even on error so page still renders
        );
    }
}
