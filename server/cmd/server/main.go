package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"stuffcontrol/internal/config"
	"stuffcontrol/internal/db"
	httpapi "stuffcontrol/internal/http"
	"stuffcontrol/internal/service"
	"stuffcontrol/migrations"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()

	database, err := db.Connect(ctx, cfg.DB)
	if err != nil {
		log.Fatalf("unable to connect to database: %v", err)
	}
	sqlDB, err := database.DB()
	if err != nil {
		log.Fatalf("unable to acquire sql.DB: %v", err)
	}
	defer sqlDB.Close()

	if err := migrations.Run(ctx, database); err != nil {
		log.Fatalf("unable to run migrations: %v", err)
	}

	syncService := service.NewSyncService(database)
	server := httpapi.NewServer(database, syncService, cfg.StaticDir)

	host := "localhost"
	if os.Getenv("RENDER") != "" {
		host = "0.0.0.0"
	}
	addr := fmt.Sprintf("%s:%d", host, cfg.HTTPPort)

	httpServer := &http.Server{
		Addr:    addr,
		Handler: server,
	}

	go func() {
		log.Printf("Server listening on %s", addr)
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("http server error: %v", err)
		}
	}()

	awaitShutdown(httpServer)
}

func awaitShutdown(server *http.Server) {
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	<-sigCh

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("graceful shutdown failed: %v", err)
	}
}
