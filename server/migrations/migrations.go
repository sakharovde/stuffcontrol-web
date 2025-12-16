package migrations

import (
	"context"
	"fmt"
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type syncSessionSchema struct {
	ID        string         `gorm:"type:uuid;primaryKey"`
	StorageID string         `gorm:"type:uuid;not null;index:idx_sync_session_storage_id"`
	Snapshot  datatypes.JSON `gorm:"type:jsonb;not null;default:'[]'::jsonb"`
	CreatedAt time.Time      `gorm:"type:timestamptz;not null;default:now()"`
}

func (syncSessionSchema) TableName() string { return "sync_session" }

type storageEventSchema struct {
	ID            string             `gorm:"type:uuid;primaryKey"`
	StorageID     string             `gorm:"type:uuid;not null;index:idx_storage_event_storage_id"`
	ProductID     *string            `gorm:"type:uuid;index:idx_storage_event_product_id"`
	BatchID       *string            `gorm:"type:uuid"`
	EventType     string             `gorm:"type:varchar(64);not null"`
	Data          datatypes.JSON     `gorm:"type:jsonb;not null;default:'{}'::jsonb"`
	CreatedAt     time.Time          `gorm:"type:timestamptz;not null;default:now()"`
	SyncSessionID *string            `gorm:"type:uuid;index"`
	SyncSession   *syncSessionSchema `gorm:"foreignKey:SyncSessionID;references:ID;constraint:OnDelete:SET NULL"`
}

func (storageEventSchema) TableName() string { return "storage_event" }

// Run applies the minimal schema needed for the rewritten Go service.
func Run(ctx context.Context, db *gorm.DB) error {
	if err := db.WithContext(ctx).AutoMigrate(
		&syncSessionSchema{},
		&storageEventSchema{},
	); err != nil {
		return fmt.Errorf("applying migrations: %w", err)
	}
	return nil
}
