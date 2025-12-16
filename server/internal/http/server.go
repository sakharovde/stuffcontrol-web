package http

import (
	"encoding/json"
	"log"
	"net/http"

	"gorm.io/gorm"

	"stuffcontrol/internal/model"
	"stuffcontrol/internal/repository"
	"stuffcontrol/internal/service"
)

// Server wires HTTP routes to the underlying services.
type Server struct {
	mux         *http.ServeMux
	db          *gorm.DB
	syncService *service.SyncService
}

// NewServer prepares all routes.
func NewServer(db *gorm.DB, syncService *service.SyncService) *Server {
	srv := &Server{
		mux:         http.NewServeMux(),
		db:          db,
		syncService: syncService,
	}
	srv.registerRoutes()
	return srv
}

func (s *Server) registerRoutes() {
	s.mux.HandleFunc("/ping", s.handlePing)
	s.mux.HandleFunc("/api/storage-events", s.handleStorageEvents)
	s.mux.HandleFunc("/api/products", s.handleProducts)
	s.mux.HandleFunc("/api/batches", s.handleBatches)
	s.mux.HandleFunc("/api/storages", s.handleStorages)
	s.mux.HandleFunc("/api/sync-sessions", s.handleSyncSessions)
}

// ServeHTTP adds CORS headers before dispatching to the mux.
func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	s.mux.ServeHTTP(w, r)
}

func (s *Server) handlePing(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("pong\n"))
}

func (s *Server) handleStorageEvents(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	events, err := repository.ListStorageEvents(r.Context(), s.db)
	if err != nil {
		internalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, events)
}

func (s *Server) handleProducts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	products, err := repository.Products(r.Context(), s.db)
	if err != nil {
		internalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, products)
}

func (s *Server) handleStorages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	storages, err := repository.Storages(r.Context(), s.db)
	if err != nil {
		internalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, storages)
}

func (s *Server) handleSyncSessions(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		sessions, err := repository.ListSyncSessions(r.Context(), s.db)
		if err != nil {
			internalError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, sessions)
	case http.MethodPost:
		s.handleCreateSyncSession(w, r)
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) handleBatches(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	snapshot, err := repository.LatestSnapshot(r.Context(), s.db)
	if err != nil {
		internalError(w, err)
		return
	}

	if snapshot == nil {
		snapshot = []model.SnapshotItem{}
	}

	writeJSON(w, http.StatusOK, snapshot)
}

func (s *Server) handleCreateSyncSession(w http.ResponseWriter, r *http.Request) {
	var payload service.SyncRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		badRequest(w, "invalid JSON payload")
		return
	}

	session, err := s.syncService.CreateSyncSession(r.Context(), payload)
	if err != nil {
		switch err {
		case service.ErrStorageIDRequired, service.ErrEventsEmpty:
			badRequest(w, err.Error())
		default:
			internalError(w, err)
		}
		return
	}

	writeJSON(w, http.StatusOK, session)
}

func methodNotAllowed(w http.ResponseWriter) {
	w.WriteHeader(http.StatusMethodNotAllowed)
}

func badRequest(w http.ResponseWriter, message string) {
	writeJSON(w, http.StatusBadRequest, map[string]string{"message": message})
}

func internalError(w http.ResponseWriter, err error) {
	log.Printf("http error: %v", err)
	writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "internal server error"})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload == nil {
		_, _ = w.Write([]byte("null"))
		return
	}
	_ = json.NewEncoder(w).Encode(payload)
}
