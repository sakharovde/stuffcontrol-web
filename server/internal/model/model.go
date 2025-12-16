package model

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

// EventType represents a supported storage event.
type EventType string

const (
	EventAddProducts       EventType = "addProducts"
	EventRemoveProducts    EventType = "removeProducts"
	EventChangeProductName EventType = "changeProductName"
	EventCreateStorage     EventType = "createStorage"
	EventDeleteStorage     EventType = "deleteStorage"
	EventChangeStorageName EventType = "changeStorageName"
)

var (
	eventTypeToDB = map[EventType]string{
		EventAddProducts:       "add_products",
		EventRemoveProducts:    "remove_products",
		EventChangeProductName: "change_product_name",
		EventCreateStorage:     "create_storage",
		EventDeleteStorage:     "delete_storage",
		EventChangeStorageName: "change_storage_name",
	}
	eventTypeFromDB = func() map[string]EventType {
		result := make(map[string]EventType, len(eventTypeToDB))
		for k, v := range eventTypeToDB {
			result[v] = k
		}
		return result
	}()
)

// ToDB converts the value to its database representation.
func (e EventType) ToDB() (string, error) {
	if db, ok := eventTypeToDB[e]; ok {
		return db, nil
	}
	return "", fmt.Errorf("unsupported event type: %s", string(e))
}

// EventTypeFromDB converts a snake_case value from the DB into EventType.
func EventTypeFromDB(raw string) (EventType, error) {
	if val, ok := eventTypeFromDB[raw]; ok {
		return val, nil
	}
	return "", fmt.Errorf("unknown event type from db: %s", raw)
}

// StorageEventData describes the payload stored in storage_event.data.
type StorageEventData struct {
	ExpiryDate      *string `json:"expiryDate,omitempty"`
	ManufactureDate *string `json:"manufactureDate,omitempty"`
	ProductName     *string `json:"productName,omitempty"`
	Quantity        *int    `json:"quantity,omitempty"`
	ShelfLifeDays   *int    `json:"shelfLifeDays,omitempty"`
	StorageName     *string `json:"storageName,omitempty"`
}

// MarshalDB encodes the payload using snake_case keys for compatibility.
func (d StorageEventData) MarshalDB() ([]byte, error) {
	type storageEventDataDB struct {
		ExpiryDate      *string `json:"expiry_date,omitempty"`
		ManufactureDate *string `json:"manufacture_date,omitempty"`
		ProductName     *string `json:"product_name,omitempty"`
		Quantity        *int    `json:"quantity,omitempty"`
		ShelfLifeDays   *int    `json:"shelf_life_days,omitempty"`
		StorageName     *string `json:"storage_name,omitempty"`
	}

	payload := storageEventDataDB{
		ExpiryDate:      d.ExpiryDate,
		ManufactureDate: d.ManufactureDate,
		ProductName:     d.ProductName,
		Quantity:        d.Quantity,
		ShelfLifeDays:   d.ShelfLifeDays,
		StorageName:     d.StorageName,
	}

	return json.Marshal(payload)
}

// UnmarshalDB decodes jsonb stored data into the camelCase struct.
func (d *StorageEventData) UnmarshalDB(raw []byte) error {
	if len(raw) == 0 {
		*d = StorageEventData{}
		return nil
	}

	type storageEventDataDB struct {
		ExpiryDate      *string `json:"expiry_date,omitempty"`
		ManufactureDate *string `json:"manufacture_date,omitempty"`
		ProductName     *string `json:"product_name,omitempty"`
		Quantity        *int    `json:"quantity,omitempty"`
		ShelfLifeDays   *int    `json:"shelf_life_days,omitempty"`
		StorageName     *string `json:"storage_name,omitempty"`
	}

	var payload storageEventDataDB
	if err := json.Unmarshal(raw, &payload); err != nil {
		return err
	}

	*d = StorageEventData{
		ExpiryDate:      payload.ExpiryDate,
		ManufactureDate: payload.ManufactureDate,
		ProductName:     payload.ProductName,
		Quantity:        payload.Quantity,
		ShelfLifeDays:   payload.ShelfLifeDays,
		StorageName:     payload.StorageName,
	}

	return nil
}

// SnapshotItem models a product batch stored on a shelf.
type SnapshotItem struct {
	StorageID       string  `json:"storageId"`
	ProductID       string  `json:"productId"`
	BatchID         string  `json:"batchId"`
	ProductName     string  `json:"productName"`
	Quantity        int     `json:"quantity"`
	ExpiryDate      *string `json:"expiryDate,omitempty"`
	ManufactureDate *string `json:"manufactureDate,omitempty"`
	ShelfLifeDays   *int    `json:"shelfLifeDays,omitempty"`
}

// SnapshotToDB converts snapshot items to the database JSON shape.
func SnapshotToDB(items []SnapshotItem) ([]byte, error) {
	type snapshotItemDB struct {
		StorageID       string  `json:"storage_id"`
		ProductID       string  `json:"product_id"`
		BatchID         string  `json:"batch_id"`
		ProductName     string  `json:"product_name"`
		Quantity        int     `json:"quantity"`
		ExpiryDate      *string `json:"expiry_date,omitempty"`
		ManufactureDate *string `json:"manufacture_date,omitempty"`
		ShelfLifeDays   *int    `json:"shelf_life_days,omitempty"`
	}

	payload := make([]snapshotItemDB, 0, len(items))
	for _, item := range items {
		payload = append(payload, snapshotItemDB{
			StorageID:       item.StorageID,
			ProductID:       item.ProductID,
			BatchID:         item.BatchID,
			ProductName:     item.ProductName,
			Quantity:        item.Quantity,
			ExpiryDate:      item.ExpiryDate,
			ManufactureDate: item.ManufactureDate,
			ShelfLifeDays:   item.ShelfLifeDays,
		})
	}

	return json.Marshal(payload)
}

// SnapshotFromDB decodes the stored JSON snapshot.
func SnapshotFromDB(raw []byte) ([]SnapshotItem, error) {
	if len(raw) == 0 {
		return nil, nil
	}

	type snapshotItemDB struct {
		StorageID       string  `json:"storage_id"`
		ProductID       string  `json:"product_id"`
		BatchID         string  `json:"batch_id"`
		ProductName     string  `json:"product_name"`
		Quantity        int     `json:"quantity"`
		ExpiryDate      *string `json:"expiry_date,omitempty"`
		ManufactureDate *string `json:"manufacture_date,omitempty"`
		ShelfLifeDays   *int    `json:"shelf_life_days,omitempty"`
	}

	var payload []snapshotItemDB
	if err := json.Unmarshal(raw, &payload); err != nil {
		return nil, err
	}

	out := make([]SnapshotItem, 0, len(payload))
	for _, item := range payload {
		out = append(out, SnapshotItem{
			StorageID:       item.StorageID,
			ProductID:       item.ProductID,
			BatchID:         item.BatchID,
			ProductName:     item.ProductName,
			Quantity:        item.Quantity,
			ExpiryDate:      item.ExpiryDate,
			ManufactureDate: item.ManufactureDate,
			ShelfLifeDays:   item.ShelfLifeDays,
		})
	}

	return out, nil
}

// StorageEvent mirrors the table row and shapes JSON responses.
type StorageEvent struct {
	ID            string           `json:"id"`
	StorageID     string           `json:"storageId"`
	ProductID     *string          `json:"productId,omitempty"`
	BatchID       *string          `json:"batchId,omitempty"`
	EventType     EventType        `json:"eventType"`
	Data          StorageEventData `json:"data"`
	CreatedAt     time.Time        `json:"createdAt"`
	SyncSessionID *string          `json:"syncSessionId,omitempty"`
}

// SyncSession is the materialized snapshot for a storage.
type SyncSession struct {
	ID            string         `json:"id"`
	StorageID     string         `json:"storageId"`
	Snapshot      []SnapshotItem `json:"snapshot"`
	CreatedAt     time.Time      `json:"createdAt"`
	StorageEvents []StorageEvent `json:"storageEvents,omitempty"`
}

// ProductInfo exposes aggregated product data.
type ProductInfo struct {
	ProductID     string    `json:"productId"`
	ProductName   *string   `json:"productName"`
	ShelfLifeDays *string   `json:"shelfLifeDays"`
	CreatedAt     time.Time `json:"createdAt"`
}

// StorageInfo exposes aggregated storage data.
type StorageInfo struct {
	StorageID   string    `json:"storageId"`
	StorageName *string   `json:"storageName"`
	CreatedAt   time.Time `json:"createdAt"`
}

// ParseEventType helps HTTP handlers validate payloads.
func ParseEventType(value string) (EventType, error) {
	e := EventType(value)
	if _, ok := eventTypeToDB[e]; ok {
		return e, nil
	}
	return "", errors.New("unknown eventType")
}
