import 'package:flutter/material.dart';

import '../../data/models/product_model.dart';

class WarungProductCard extends StatelessWidget {
  const WarungProductCard({
    super.key,
    required this.item,
    required this.onTap,
    this.isListView = false,
  });

  final WarungProductModel item;
  final VoidCallback onTap;
  final bool isListView;

  @override
  Widget build(BuildContext context) {
    // Fallback if product detail is missing
    final name = item.product?.name ?? 'Unknown Product';
    final barcode = item.product?.barcode ?? '-';
    final unit = item.product?.unit ?? '-';
    
    final priceText = 'Rp ${item.sellingPrice.toStringAsFixed(0)}';
    final stockText = 'Stok: ${item.stockQty}';

    if (isListView) {
      return Card(
        child: ListTile(
          title: Text(name, maxLines: 2, overflow: TextOverflow.ellipsis),
          subtitle: Text('$barcode • $unit\n$stockText'),
          isThreeLine: true,
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(priceText,
                  style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              IconButton(
                onPressed: item.stockQty > 0 ? onTap : null,
                icon: const Icon(Icons.add_shopping_cart),
              ),
            ],
          ),
        ),
      );
    }

    return Card(
      child: InkWell(
        onTap: item.stockQty > 0 ? onTap : null,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Center(
                  child: Icon(
                    Icons.inventory_2_outlined,
                    size: 48,
                    color: item.stockQty > 0 ? Colors.grey.shade400 : Colors.red.shade200,
                  ),
                ),
              ),
              Text(name, maxLines: 2, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(priceText,
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary)),
                  Text(
                    'Qty: ${item.stockQty}',
                    style: TextStyle(
                      fontSize: 12,
                      color: item.stockQty > 0 ? Colors.grey.shade700 : Colors.red,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
