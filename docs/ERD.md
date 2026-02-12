# ERD BUMAS Ansor (Simplified)

```mermaid
erDiagram
    USER ||--o{ REFRESH_TOKEN : has
    WARUNG ||--o{ USER : owns
    CATEGORY ||--o{ PRODUCT : groups
    SUPPLIER ||--o{ PURCHASE_ORDER : supplies
    WAREHOUSE ||--o{ STOCK : stores
    PRODUCT ||--o{ STOCK : stocked
    PRODUCT ||--o{ STOCK_MOVEMENT : moved
    WAREHOUSE ||--o{ STOCK_MOVEMENT : from
    WAREHOUSE ||--o{ STOCK_MOVEMENT : to

    PURCHASE_ORDER ||--|{ PO_ITEM : contains
    PRODUCT ||--o{ PO_ITEM : referenced

    WARUNG ||--o{ DELIVERY_ORDER : receives
    WAREHOUSE ||--o{ DELIVERY_ORDER : source
    USER ||--o{ DELIVERY_ORDER : assigned_kurir
    DELIVERY_ORDER ||--|{ DO_ITEM : contains
    PRODUCT ||--o{ DO_ITEM : referenced

    WARUNG ||--o{ SALE : buys
    WAREHOUSE ||--o{ SALE : from
    SALE ||--|{ SALE_ITEM : contains
    PRODUCT ||--o{ SALE_ITEM : referenced

    WARUNG ||--o{ RECEIVABLE : owes
    DELIVERY_ORDER ||--o| RECEIVABLE : creates
    SALE ||--o| RECEIVABLE : creates
    RECEIVABLE ||--o{ PAYMENT : paid_by
```
