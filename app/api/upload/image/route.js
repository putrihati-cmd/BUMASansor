/**
 * POST /api/upload/image
 * Upload image to Cloudinary
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { v2 as cloudinary } from 'cloudinary';


// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'File harus berupa gambar (JPG, PNG, WebP, GIF)' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB for Cloudinary free tier)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'Ukuran file maksimal 10MB' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'infiatinstore/products', // Organize in folder
                    resource_type: 'image',
                    transformation: [
                        { width: 1200, height: 1200, crop: 'limit' }, // Max 1200x1200
                        { quality: 'auto:good' }, // Auto optimize quality
                        { fetch_format: 'auto' }, // Auto format (WebP for modern browsers)
                    ],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        return NextResponse.json({
            success: true,
            data: {
                url: uploadResponse.secure_url,
                publicId: uploadResponse.public_id,
                width: uploadResponse.width,
                height: uploadResponse.height,
                format: uploadResponse.format,
                size: uploadResponse.bytes,
            },
            message: 'Upload berhasil'
        });

    } catch (error) {
        console.error('[Upload Image] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Gagal mengupload gambar' },
            { status: 500 }
        );
    }
}

