import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PosExtensionsService {
    constructor(private readonly prisma: PrismaService) { }

    // --- Wholesale Prices ---

    async addWholesalePrice(warungProductId: string, data: { minQty: number; price: number }) {
        return this.prisma.wholesalePrice.create({
            data: {
                warungProductId,
                minQty: data.minQty,
                price: data.price,
            },
        });
    }

    async removeWholesalePrice(id: string) {
        return this.prisma.wholesalePrice.delete({ where: { id } });
    }

    // --- Modifiers ---

    async createModifierGroup(warungId: string, data: { name: string; minSelect?: number; maxSelect?: number; isRequired?: boolean }) {
        return this.prisma.modifierGroup.create({
            data: {
                warungId,
                ...data,
            },
        });
    }

    async addModifier(modifierGroupId: string, data: { name: string; price: number; stockQty?: number }) {
        return this.prisma.modifier.create({
            data: {
                modifierGroupId,
                ...data,
            },
        });
    }

    async linkModifierToProduct(warungProductId: string, modifierGroupId: string) {
        return this.prisma.productModifierGroup.create({
            data: {
                warungProductId,
                modifierGroupId,
            },
        });
    }

    // --- Bundles ---

    async createBundle(warungId: string, data: { name: string; price: number; items: { warungProductId: string; quantity: number }[] }) {
        return this.prisma.bundle.create({
            data: {
                warungId,
                name: data.name,
                price: data.price,
                items: {
                    create: data.items.map(item => ({
                        warungProductId: item.warungProductId,
                        quantity: item.quantity,
                    })),
                },
            },
            include: { items: true },
        });
    }

    // --- Ingredients & Recipes ---

    async createIngredient(warungId: string, data: { name: string; unit: string; stockQty: number; minStock: number }) {
        return this.prisma.ingredient.create({
            data: {
                warungId,
                ...data,
            },
        });
    }

    async createRecipe(warungProductId: string, ingredientId: string, quantity: number) {
        return this.prisma.recipe.create({
            data: {
                warungProductId,
                ingredientId,
                quantity,
            },
        });
    }

    // --- Tax & Service ---

    async updateTaxSettings(warungId: string, data: { taxRate?: number; serviceRate?: number; isTaxIncluded?: boolean }) {
        return this.prisma.taxSettings.upsert({
            where: { warungId },
            update: data,
            create: {
                warungId,
                taxRate: data.taxRate ?? 0,
                serviceRate: data.serviceRate ?? 0,
                isTaxIncluded: data.isTaxIncluded ?? false,
            },
        });
    }
}
