package syncsession

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"

	"stuffcontrol/internal/application/ports"
	"stuffcontrol/internal/domain/storage"
)

var (
	ErrStorageIDRequired = errors.New("storageId is required")
	ErrEventsEmpty       = errors.New("at least one event must be provided")
)

// SyncRequest mirrors the JSON payload consumed by the POST /api/sync-session endpoint.
type SyncRequest struct {
	StorageID string      `json:"storageId"`
	Events    []SyncEvent `json:"events"`
}

// SyncEvent represents a single event in the request body.
type SyncEvent struct {
	ProductID       string  `json:"productId"`
	BatchID         string  `json:"batchId"`
	EventType       string  `json:"eventType"`
	Quantity        *int    `json:"quantity,omitempty"`
	ProductName     *string `json:"productName,omitempty"`
	StorageName     *string `json:"storageName,omitempty"`
	ExpiryDate      *string `json:"expiryDate,omitempty"`
	ManufactureDate *string `json:"manufactureDate,omitempty"`
	ShelfLifeDays   *int    `json:"shelfLifeDays,omitempty"`
}

// Command describes the behavior that driving adapters can trigger.
type Command interface {
	CreateSyncSession(ctx context.Context, req SyncRequest) (*storage.SyncSession, error)
}

// Service encapsulates the snapshotting logic.
type Service struct {
	persistence ports.SyncPersistence
}

var _ Command = (*Service)(nil)

// NewService builds a new service instance.
func NewService(persistence ports.SyncPersistence) *Service {
	return &Service{persistence: persistence}
}

// CreateSyncSession persists the supplied events and returns the resulting snapshot.
func (s *Service) CreateSyncSession(ctx context.Context, req SyncRequest) (*storage.SyncSession, error) {
	if strings.TrimSpace(req.StorageID) == "" {
		return nil, ErrStorageIDRequired
	}
	if len(req.Events) == 0 {
		return nil, ErrEventsEmpty
	}

	latestSnapshot, err := s.persistence.LatestSnapshotByStorage(ctx, req.StorageID)
	if err != nil {
		return nil, err
	}
	if latestSnapshot == nil {
		latestSnapshot = []storage.SnapshotItem{}
	}

	mappedEvents := make([]storage.StorageEvent, 0, len(req.Events))
	sessionID := uuid.NewString()
	now := time.Now().UTC()

	for _, evt := range req.Events {
		eventType, err := storage.ParseEventType(evt.EventType)
		if err != nil {
			return nil, err
		}

		mappedEvents = append(mappedEvents, storage.StorageEvent{
			ID:        uuid.NewString(),
			StorageID: req.StorageID,
			ProductID: normalizeID(evt.ProductID),
			BatchID:   normalizeID(evt.BatchID),
			EventType: eventType,
			Data: storage.StorageEventData{
				Quantity:        evt.Quantity,
				ProductName:     evt.ProductName,
				StorageName:     evt.StorageName,
				ExpiryDate:      evt.ExpiryDate,
				ManufactureDate: evt.ManufactureDate,
				ShelfLifeDays:   evt.ShelfLifeDays,
			},
			CreatedAt:     now,
			SyncSessionID: &sessionID,
		})
	}

	snapshot := storage.ApplyEvents(latestSnapshot, mappedEvents)

	if err := s.persistence.PersistSyncSession(ctx, sessionID, req.StorageID, snapshot, mappedEvents, now); err != nil {
		return nil, err
	}

	if storage.HasDeleteStorageEvent(mappedEvents) {
		if err := s.persistence.DeleteSyncData(ctx, req.StorageID); err != nil {
			return nil, err
		}
		return nil, nil
	}

	session, err := s.persistence.SyncSessionByID(ctx, sessionID)
	if err != nil {
		return nil, err
	}

	eventsForSession, err := s.persistence.StorageEventsBySession(ctx, sessionID)
	if err != nil {
		return nil, err
	}

	session.StorageEvents = eventsForSession
	return session, nil
}

func normalizeID(value string) *string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}
