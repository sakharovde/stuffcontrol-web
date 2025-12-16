package repository

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"stuffcontrol/internal/model"
)

type storageEventRow struct {
	ID            string    `gorm:"column:id"`
	StorageID     string    `gorm:"column:storage_id"`
	ProductID     *string   `gorm:"column:product_id"`
	BatchID       *string   `gorm:"column:batch_id"`
	EventType     string    `gorm:"column:event_type"`
	Data          []byte    `gorm:"column:data"`
	CreatedAt     time.Time `gorm:"column:created_at"`
	SyncSessionID *string   `gorm:"column:sync_session_id"`
}

func (storageEventRow) TableName() string { return "storage_event" }

type syncSessionRow struct {
	ID        string    `gorm:"column:id"`
	StorageID string    `gorm:"column:storage_id"`
	Snapshot  []byte    `gorm:"column:snapshot"`
	CreatedAt time.Time `gorm:"column:created_at"`
}

func (syncSessionRow) TableName() string { return "sync_session" }

// ListStorageEvents returns every stored event.
func ListStorageEvents(ctx context.Context, db *gorm.DB) ([]model.StorageEvent, error) {
	var rows []storageEventRow
	if err := db.WithContext(ctx).
		Model(&storageEventRow{}).
		Order("created_at ASC").
		Find(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]model.StorageEvent, 0, len(rows))
	for _, row := range rows {
		evt, err := mapEventRow(row)
		if err != nil {
			return nil, err
		}
		result = append(result, evt)
	}

	return result, nil
}

// ListSyncSessions returns all sync sessions ordered by creation time.
func ListSyncSessions(ctx context.Context, db *gorm.DB) ([]model.SyncSession, error) {
	var rows []syncSessionRow
	if err := db.WithContext(ctx).
		Model(&syncSessionRow{}).
		Order("created_at ASC").
		Find(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]model.SyncSession, 0, len(rows))
	for _, row := range rows {
		snapshot, err := model.SnapshotFromDB(row.Snapshot)
		if err != nil {
			return nil, err
		}
		result = append(result, model.SyncSession{
			ID:        row.ID,
			StorageID: row.StorageID,
			Snapshot:  snapshot,
			CreatedAt: row.CreatedAt,
		})
	}

	return result, nil
}

// LatestSnapshot returns the snapshot from the newest sync session overall.
func LatestSnapshot(ctx context.Context, db *gorm.DB) ([]model.SnapshotItem, error) {
	var row syncSessionRow
	err := db.WithContext(ctx).
		Model(&syncSessionRow{}).
		Order("created_at DESC").
		Limit(1).
		Take(&row).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return model.SnapshotFromDB(row.Snapshot)
}

// LatestSnapshotByStorage returns the most recent snapshot for a storage.
func LatestSnapshotByStorage(ctx context.Context, db *gorm.DB, storageID string) ([]model.SnapshotItem, error) {
	var row syncSessionRow
	err := db.WithContext(ctx).
		Model(&syncSessionRow{}).
		Where("storage_id = ?", storageID).
		Order("created_at DESC").
		Limit(1).
		Take(&row).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return model.SnapshotFromDB(row.Snapshot)
}

// CreateSyncSession inserts a new sync session row.
func CreateSyncSession(ctx context.Context, db *gorm.DB, id, storageID string, snapshot []model.SnapshotItem, createdAt time.Time) error {
	snapshotBytes, err := model.SnapshotToDB(snapshot)
	if err != nil {
		return err
	}

	row := syncSessionRow{
		ID:        id,
		StorageID: storageID,
		Snapshot:  snapshotBytes,
		CreatedAt: createdAt,
	}
	return db.WithContext(ctx).Create(&row).Error
}

// InsertStorageEvents persists multiple events.
func InsertStorageEvents(ctx context.Context, db *gorm.DB, events []model.StorageEvent) error {
	rows := make([]storageEventRow, 0, len(events))
	for _, evt := range events {
		row, err := mapEventToRow(evt)
		if err != nil {
			return err
		}
		rows = append(rows, row)
	}

	return db.WithContext(ctx).Create(&rows).Error
}

// SyncSessionByID fetches a session by its identifier.
func SyncSessionByID(ctx context.Context, db *gorm.DB, id string) (*model.SyncSession, error) {
	var row syncSessionRow
	if err := db.WithContext(ctx).
		First(&row, "id = ?", id).Error; err != nil {
		return nil, err
	}

	snapshot, err := model.SnapshotFromDB(row.Snapshot)
	if err != nil {
		return nil, err
	}

	return &model.SyncSession{
		ID:        row.ID,
		StorageID: row.StorageID,
		Snapshot:  snapshot,
		CreatedAt: row.CreatedAt,
	}, nil
}

// StorageEventsBySession returns events associated with a sync session.
func StorageEventsBySession(ctx context.Context, db *gorm.DB, syncSessionID string) ([]model.StorageEvent, error) {
	var rows []storageEventRow
	if err := db.WithContext(ctx).
		Where("sync_session_id = ?", syncSessionID).
		Order("created_at ASC").
		Find(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]model.StorageEvent, 0, len(rows))
	for _, row := range rows {
		evt, err := mapEventRow(row)
		if err != nil {
			return nil, err
		}
		result = append(result, evt)
	}

	return result, nil
}

// DeleteSyncData removes a storage's sync sessions and events.
func DeleteSyncData(ctx context.Context, db *gorm.DB, storageID string) error {
	if err := db.WithContext(ctx).
		Where("storage_id = ?", storageID).
		Delete(&storageEventRow{}).Error; err != nil {
		return err
	}

	return db.WithContext(ctx).
		Where("storage_id = ?", storageID).
		Delete(&syncSessionRow{}).Error
}

func mapEventRow(row storageEventRow) (model.StorageEvent, error) {
	evtType, err := model.EventTypeFromDB(row.EventType)
	if err != nil {
		return model.StorageEvent{}, err
	}

	var data model.StorageEventData
	if err := data.UnmarshalDB(row.Data); err != nil {
		return model.StorageEvent{}, err
	}

	return model.StorageEvent{
		ID:            row.ID,
		StorageID:     row.StorageID,
		ProductID:     row.ProductID,
		BatchID:       row.BatchID,
		EventType:     evtType,
		Data:          data,
		CreatedAt:     row.CreatedAt,
		SyncSessionID: row.SyncSessionID,
	}, nil
}

func mapEventToRow(evt model.StorageEvent) (storageEventRow, error) {
	payload, err := evt.Data.MarshalDB()
	if err != nil {
		return storageEventRow{}, err
	}

	eventType, err := evt.EventType.ToDB()
	if err != nil {
		return storageEventRow{}, err
	}

	return storageEventRow{
		ID:            evt.ID,
		StorageID:     evt.StorageID,
		ProductID:     evt.ProductID,
		BatchID:       evt.BatchID,
		EventType:     eventType,
		Data:          payload,
		CreatedAt:     evt.CreatedAt,
		SyncSessionID: evt.SyncSessionID,
	}, nil
}
