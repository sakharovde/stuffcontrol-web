package postgres

import (
	"gorm.io/gorm"

	"stuffcontrol/internal/application/ports"
)

// Store is the concrete persistence adapter backed by GORM.
type Store struct {
	db *gorm.DB
}

// NewStore builds a GORM backed repository implementation.
func NewStore(db *gorm.DB) *Store {
	return &Store{db: db}
}

var (
	_ ports.StorageEventQuery = (*Store)(nil)
	_ ports.ProductQuery      = (*Store)(nil)
	_ ports.StorageQuery      = (*Store)(nil)
	_ ports.SyncSessionQuery  = (*Store)(nil)
	_ ports.SyncPersistence   = (*Store)(nil)
)
