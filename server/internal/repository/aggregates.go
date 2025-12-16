package repository

import (
	"context"
	"time"

	"gorm.io/gorm"

	"stuffcontrol/internal/model"
)

type storageInfoRow struct {
	StorageID   string    `gorm:"column:storage_id"`
	StorageName *string   `gorm:"column:storage_name"`
	CreatedAt   time.Time `gorm:"column:created_at"`
}

type productInfoRow struct {
	ProductID     string    `gorm:"column:product_id"`
	ProductName   *string   `gorm:"column:product_name"`
	ShelfLifeDays *string   `gorm:"column:shelf_life_days"`
	CreatedAt     time.Time `gorm:"column:created_at"`
}

// Storages aggregates events to list distinct storages.
func Storages(ctx context.Context, db *gorm.DB) ([]model.StorageInfo, error) {
	query := `
        SELECT
            se.storage_id AS storage_id,
            (
                SELECT se2.data ->> 'storage_name'
                FROM storage_event se2
                WHERE se2.storage_id = se.storage_id
                ORDER BY se2.created_at DESC
                LIMIT 1
            ) AS storage_name,
            MIN(se.created_at) AS created_at
        FROM storage_event se
        GROUP BY se.storage_id
        ORDER BY created_at ASC`

	var rows []storageInfoRow
	if err := db.WithContext(ctx).Raw(query).Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]model.StorageInfo, 0, len(rows))
	for _, row := range rows {
		result = append(result, model.StorageInfo{
			StorageID:   row.StorageID,
			StorageName: row.StorageName,
			CreatedAt:   row.CreatedAt,
		})
	}

	return result, nil
}

// Products aggregates product details across storage events.
func Products(ctx context.Context, db *gorm.DB) ([]model.ProductInfo, error) {
	query := `
        SELECT
            se.product_id AS product_id,
            (
                SELECT se2.data ->> 'product_name'
                FROM storage_event se2
                WHERE se2.product_id = se.product_id
                ORDER BY se2.created_at DESC
                LIMIT 1
            ) AS product_name,
            (
                SELECT se3.data ->> 'shelf_life_days'
                FROM storage_event se3
                WHERE se3.product_id = se.product_id
                ORDER BY se3.created_at DESC
                LIMIT 1
            ) AS shelf_life_days,
            MIN(se.created_at) AS created_at
        FROM storage_event se
        WHERE se.product_id IS NOT NULL
        GROUP BY se.product_id
        ORDER BY created_at ASC`

	var rows []productInfoRow
	if err := db.WithContext(ctx).Raw(query).Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]model.ProductInfo, 0, len(rows))
	for _, row := range rows {
		result = append(result, model.ProductInfo{
			ProductID:     row.ProductID,
			ProductName:   row.ProductName,
			ShelfLifeDays: row.ShelfLifeDays,
			CreatedAt:     row.CreatedAt,
		})
	}

	return result, nil
}
