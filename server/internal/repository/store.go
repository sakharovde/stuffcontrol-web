package repository

import (
	"stuffcontrol/internal/app"

	"gorm.io/gorm"
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
	_ app.StorageEventQuery = (*Store)(nil)
	_ app.ProductQuery      = (*Store)(nil)
	_ app.StorageQuery      = (*Store)(nil)
	_ app.SyncSessionQuery  = (*Store)(nil)
	_ app.SyncPersistence   = (*Store)(nil)
)
