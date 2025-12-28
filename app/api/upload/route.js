import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { uploadImage, uploadMultipleImages } from '@/lib/cloudinary';

import { requireAuth } from '@/lib/auth';


export const POST = requireAuth(async function POST(request, context) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files');
        const folder = formData.get('folder') || 'general';

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        // Check if user is admin for certain folders
        const adminFolders = ['products', 'categories'];
        if (adminFolders.includes(folder) && context.user.role !== 'ADMIN' && context.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Convert files to base64
        const base64Images = [];
        for (const file of files) {
            const buffer = await file.arrayBuffer();
            const base64 = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`;
            base64Images.push(base64);
        }

        // Upload to Cloudinary
        let uploadedImages;
        if (base64Images.length === 1) {
            const result = await uploadImage(base64Images[0], folder);
            uploadedImages = [result];
        } else {
            uploadedImages = await uploadMultipleImages(base64Images, folder);
        }

        console.log(`✅ Uploaded ${uploadedImages.length} image(s) to ${folder}`);

        return NextResponse.json({
            success: true,
            images: uploadedImages,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload images', details: error.message },
            { status: 500 }
        );
    }
});

