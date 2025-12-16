package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"stuffcontrol/internal/model"
	"stuffcontrol/internal/repository"
)

var (
	ErrStorageIDRequired = errors.New("storageId is required")
	ErrEventsEmpty       = errors.New("at least one event must be provided")
)

// SyncService encapsulates the snapshotting logic.
type SyncService struct {
	DB *gorm.DB
}

// NewSyncService builds a new service instance.
func NewSyncService(db *gorm.DB) *SyncService {
	return &SyncService{DB: db}
}

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

// CreateSyncSession persists the supplied events and returns the resulting snapshot.
func (s *SyncService) CreateSyncSession(ctx context.Context, req SyncRequest) (*model.SyncSession, error) {
	if strings.TrimSpace(req.StorageID) == "" {
		return nil, ErrStorageIDRequired
	}
	if len(req.Events) == 0 {
		return nil, ErrEventsEmpty
	}

	latestSnapshot, err := repository.LatestSnapshotByStorage(ctx, s.DB, req.StorageID)
	if err != nil {
		return nil, err
	}
	if latestSnapshot == nil {
		latestSnapshot = []model.SnapshotItem{}
	}

	mappedEvents := make([]model.StorageEvent, 0, len(req.Events))
	sessionID := uuid.NewString()
	now := time.Now().UTC()

	for _, evt := range req.Events {
		eventType, err := model.ParseEventType(evt.EventType)
		if err != nil {
			return nil, err
		}

		mappedEvents = append(mappedEvents, model.StorageEvent{
			ID:        uuid.NewString(),
			StorageID: req.StorageID,
			ProductID: normalizeID(evt.ProductID),
			BatchID:   normalizeID(evt.BatchID),
			EventType: eventType,
			Data: model.StorageEventData{
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

	snapshot := latestSnapshot
	for _, evt := range mappedEvents {
		snapshot = applyEvent(snapshot, evt)
	}

	if err := s.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := repository.CreateSyncSession(ctx, tx, sessionID, req.StorageID, snapshot, now); err != nil {
			return err
		}

		if err := repository.InsertStorageEvents(ctx, tx, mappedEvents); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return nil, err
	}

	if containsDeleteStorage(mappedEvents) {
		if err := repository.DeleteSyncData(ctx, s.DB, req.StorageID); err != nil {
			return nil, err
		}
		return nil, nil
	}

	session, err := repository.SyncSessionByID(ctx, s.DB, sessionID)
	if err != nil {
		return nil, err
	}

	eventsForSession, err := repository.StorageEventsBySession(ctx, s.DB, sessionID)
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

func containsDeleteStorage(events []model.StorageEvent) bool {
	for _, evt := range events {
		if evt.EventType == model.EventDeleteStorage {
			return true
		}
	}
	return false
}

func applyEvent(snapshot []model.SnapshotItem, evt model.StorageEvent) []model.SnapshotItem {
	switch evt.EventType {
	case model.EventAddProducts:
		return addProducts(snapshot, evt)
	case model.EventRemoveProducts:
		return removeProducts(snapshot, evt)
	case model.EventChangeProductName:
		return renameProduct(snapshot, evt)
	default:
		return snapshot
	}
}

func addProducts(snapshot []model.SnapshotItem, evt model.StorageEvent) []model.SnapshotItem {
	if evt.ProductID == nil || evt.BatchID == nil {
		return snapshot
	}

	key := compositeKey(*evt.ProductID, *evt.BatchID, evt.StorageID)
	quantity := valueOrZero(evt.Data.Quantity)

	for idx, item := range snapshot {
		if compositeKey(item.ProductID, item.BatchID, item.StorageID) == key {
			snapshot[idx].Quantity += quantity
			return snapshot
		}
	}

	productName := "Unknown"
	if evt.Data.ProductName != nil && *evt.Data.ProductName != "" {
		productName = *evt.Data.ProductName
	}

	snapshot = append(snapshot, model.SnapshotItem{
		StorageID:       evt.StorageID,
		ProductID:       *evt.ProductID,
		BatchID:         *evt.BatchID,
		ProductName:     productName,
		Quantity:        quantity,
		ExpiryDate:      evt.Data.ExpiryDate,
		ManufactureDate: evt.Data.ManufactureDate,
		ShelfLifeDays:   evt.Data.ShelfLifeDays,
	})

	return snapshot
}

func removeProducts(snapshot []model.SnapshotItem, evt model.StorageEvent) []model.SnapshotItem {
	if evt.ProductID == nil || evt.BatchID == nil {
		return snapshot
	}

	key := compositeKey(*evt.ProductID, *evt.BatchID, evt.StorageID)
	quantity := valueOrZero(evt.Data.Quantity)

	for idx, item := range snapshot {
		if compositeKey(item.ProductID, item.BatchID, item.StorageID) == key {
			newQuantity := item.Quantity - quantity
			if newQuantity < 0 {
				newQuantity = 0
			}
			snapshot[idx].Quantity = newQuantity
			break
		}
	}

	return snapshot
}

func renameProduct(snapshot []model.SnapshotItem, evt model.StorageEvent) []model.SnapshotItem {
	if evt.ProductID == nil || evt.Data.ProductName == nil {
		return snapshot
	}

	for idx, item := range snapshot {
		if item.ProductID == *evt.ProductID {
			snapshot[idx].ProductName = *evt.Data.ProductName
		}
	}

	return snapshot
}

func compositeKey(productID, batchID, storageID string) string {
	return productID + "-" + batchID + "-" + storageID
}

func valueOrZero(value *int) int {
	if value == nil {
		return 0
	}
	return *value
}
