package ports

import (
	"context"
	"time"

	"stuffcontrol/internal/domain/storage"
)

// StorageEventQuery exposes read operations for storage events.
type StorageEventQuery interface {
	ListStorageEvents(ctx context.Context) ([]storage.StorageEvent, error)
}

// ProductQuery exposes read operations for products aggregated from events.
type ProductQuery interface {
	Products(ctx context.Context) ([]storage.ProductInfo, error)
}

// StorageQuery exposes read operations for storages aggregated from events.
type StorageQuery interface {
	Storages(ctx context.Context) ([]storage.StorageInfo, error)
}

// SyncSessionQuery exposes read operations for sync sessions and snapshots.
type SyncSessionQuery interface {
	ListSyncSessions(ctx context.Context) ([]storage.SyncSession, error)
	LatestSnapshot(ctx context.Context) ([]storage.SnapshotItem, error)
}

// SyncPersistence abstracts transactional operations required by the sync use case.
type SyncPersistence interface {
	LatestSnapshotByStorage(ctx context.Context, storageID string) ([]storage.SnapshotItem, error)
	PersistSyncSession(ctx context.Context, sessionID, storageID string, snapshot []storage.SnapshotItem, events []storage.StorageEvent, createdAt time.Time) error
	SyncSessionByID(ctx context.Context, id string) (*storage.SyncSession, error)
	StorageEventsBySession(ctx context.Context, sessionID string) ([]storage.StorageEvent, error)
	DeleteSyncData(ctx context.Context, storageID string) error
}
