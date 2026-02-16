import { Body, Controller, Delete, Param, Patch, Post, Get, UseGuards } from '@nestjs/common';
import { PosExtensionsService } from './pos-extensions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('pos/extensions')
@UseGuards(JwtAuthGuard)
export class PosExtensionsController {
    constructor(private readonly extensionsService: PosExtensionsService) { }

    @Post('wholesale/:warungProductId')
    addWholesalePrice(@Param('warungProductId') id: string, @Body() data: { minQty: number; price: number }) {
        return this.extensionsService.addWholesalePrice(id, data);
    }

    @Delete('wholesale/:id')
    removeWholesalePrice(@Param('id') id: string) {
        return this.extensionsService.removeWholesalePrice(id);
    }

    @Post('modifier-groups')
    createModifierGroup(@Body() data: { warungId: string; name: string; minSelect?: number; maxSelect?: number; isRequired?: boolean }) {
        return this.extensionsService.createModifierGroup(data.warungId, data);
    }

    @Post('modifier-groups/:id/modifiers')
    addModifier(@Param('id') id: string, @Body() data: { name: string; price: number; stockQty?: number }) {
        return this.extensionsService.addModifier(id, data);
    }

    @Post('products/:warungProductId/modifiers/:groupId')
    linkModifier(@Param('warungProductId') pid: string, @Param('groupId') gid: string) {
        return this.extensionsService.linkModifierToProduct(pid, gid);
    }

    @Post('bundles')
    createBundle(@Body() data: { warungId: string; name: string; price: number; items: { warungProductId: string; quantity: number }[] }) {
        return this.extensionsService.createBundle(data.warungId, data);
    }

    @Post('ingredients')
    createIngredient(@Body() data: { warungId: string; name: string; unit: string; stockQty: number; minStock: number }) {
        return this.extensionsService.createIngredient(data.warungId, data);
    }

    @Post('recipes')
    createRecipe(@Body() data: { warungProductId: string; ingredientId: string; quantity: number }) {
        return this.extensionsService.createRecipe(data.warungProductId, data.ingredientId, data.quantity);
    }

    @Patch('tax-settings/:warungId')
    updateTax(@Param('warungId') id: string, @Body() data: { taxRate?: number; serviceRate?: number; isTaxIncluded?: boolean }) {
        return this.extensionsService.updateTaxSettings(id, data);
    }
}
