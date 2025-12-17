package app

import (
	"context"
	"time"

	"stuffcontrol/internal/model"
)

// StorageEventQuery exposes read operations for storage events.
type StorageEventQuery interface {
	ListStorageEvents(ctx context.Context) ([]model.StorageEvent, error)
}

// ProductQuery exposes read operations for products aggregated from events.
type ProductQuery interface {
	Products(ctx context.Context) ([]model.ProductInfo, error)
}

// StorageQuery exposes read operations for storages aggregated from events.
type StorageQuery interface {
	Storages(ctx context.Context) ([]model.StorageInfo, error)
}

// SyncSessionQuery exposes read operations for sync sessions and snapshots.
type SyncSessionQuery interface {
	ListSyncSessions(ctx context.Context) ([]model.SyncSession, error)
	LatestSnapshot(ctx context.Context) ([]model.SnapshotItem, error)
}

// SyncPersistence abstracts transactional operations required by the sync use case.
type SyncPersistence interface {
	LatestSnapshotByStorage(ctx context.Context, storageID string) ([]model.SnapshotItem, error)
	PersistSyncSession(ctx context.Context, sessionID, storageID string, snapshot []model.SnapshotItem, events []model.StorageEvent, createdAt time.Time) error
	SyncSessionByID(ctx context.Context, id string) (*model.SyncSession, error)
	StorageEventsBySession(ctx context.Context, sessionID string) ([]model.StorageEvent, error)
	DeleteSyncData(ctx context.Context, storageID string) error
}

// SyncCommand describes the behavior that driving adapters can trigger.
type SyncCommand interface {
	CreateSyncSession(ctx context.Context, req SyncRequest) (*model.SyncSession, error)
}
