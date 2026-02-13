import 'package:flutter/material.dart';

import '../../data/models/product_model.dart';

class ProductCard extends StatelessWidget {
  const ProductCard({
    super.key,
    required this.product,
    required this.onTap,
    this.isListView = false,
  });

  final ProductModel product;
  final VoidCallback onTap;
  final bool isListView;

  @override
  Widget build(BuildContext context) {
    final priceText = 'Rp ${product.sellPrice.toStringAsFixed(0)}';

    if (isListView) {
      return Card(
        child: ListTile(
          title: Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis),
          subtitle: Text('${product.barcode} • ${product.unit}'),
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(priceText, style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              IconButton(
                onPressed: onTap,
                icon: const Icon(Icons.add_shopping_cart),
              ),
            ],
          ),
        ),
      );
    }

    return Card(
      child: InkWell(
        onTap: onTap,
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
                    color: Colors.grey.shade400,
                  ),
                ),
              ),
              Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 6),
              Text(priceText, style: TextStyle(fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary)),
            ],
          ),
        ),
      ),
    );
  }
}