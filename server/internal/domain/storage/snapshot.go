package storage

// ApplyEvents mutates the snapshot by applying all provided events.
func ApplyEvents(snapshot []SnapshotItem, events []StorageEvent) []SnapshotItem {
	result := snapshot
	if result == nil {
		result = []SnapshotItem{}
	}

	for _, evt := range events {
		result = applyEvent(result, evt)
	}

	return result
}

// HasDeleteStorageEvent reports whether the events contain a delete storage event.
func HasDeleteStorageEvent(events []StorageEvent) bool {
	for _, evt := range events {
		if evt.EventType == EventDeleteStorage {
			return true
		}
	}
	return false
}

func applyEvent(snapshot []SnapshotItem, evt StorageEvent) []SnapshotItem {
	switch evt.EventType {
	case EventAddProducts:
		return addProducts(snapshot, evt)
	case EventRemoveProducts:
		return removeProducts(snapshot, evt)
	case EventChangeProductName:
		return renameProduct(snapshot, evt)
	default:
		return snapshot
	}
}

func addProducts(snapshot []SnapshotItem, evt StorageEvent) []SnapshotItem {
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

	snapshot = append(snapshot, SnapshotItem{
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

func removeProducts(snapshot []SnapshotItem, evt StorageEvent) []SnapshotItem {
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

func renameProduct(snapshot []SnapshotItem, evt StorageEvent) []SnapshotItem {
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
