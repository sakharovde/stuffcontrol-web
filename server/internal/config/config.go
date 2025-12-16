package config

import (
	"fmt"
	"os"
	"strconv"
)

// Env describes runtime environment.
type Env string

const (
	EnvDevelopment Env = "development"
	EnvTest        Env = "test"
	EnvProduction  Env = "production"
)

// Config holds all runtime configuration required by the server.
type Config struct {
	Env      Env
	HTTPPort int
	DB       DBConfig
}

// DBConfig encapsulates Postgres connectivity settings.
type DBConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Name     string
	SSLMode  string
}

// ConnString materializes a PostgreSQL DSN.
func (c DBConfig) ConnString() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Host,
		c.Port,
		c.User,
		c.Password,
		c.Name,
		c.SSLMode,
	)
}

// Load reads the config from environment variables with sane defaults.
func Load() Config {
	env := detectEnv()
	port := intFromEnv("PORT", 3000)

	var db DBConfig

	switch env {
	case EnvProduction:
		db = DBConfig{
			Host:     fallback(os.Getenv("DB_HOST"), "localhost"),
			Port:     intFromEnv("DB_PORT", 5432),
			User:     fallback(os.Getenv("DB_USER"), "stuffcontrol_user"),
			Password: fallback(os.Getenv("DB_PASSWORD"), "stuffcontrol_password"),
			Name:     fallback(os.Getenv("DB_NAME"), "stuffcontrol_production"),
			SSLMode:  fallback(os.Getenv("DB_SSL_MODE"), "require"),
		}
	case EnvTest:
		db = DBConfig{
			Host:     fallback(os.Getenv("DB_HOST"), "localhost"),
			Port:     intFromEnv("DB_PORT", 5432),
			User:     fallback(os.Getenv("DB_USER"), "stuffcontrol_user"),
			Password: fallback(os.Getenv("DB_PASSWORD"), "stuffcontrol_password"),
			Name:     fallback(os.Getenv("DB_NAME"), "stuffcontrol_test"),
			SSLMode:  fallback(os.Getenv("DB_SSL_MODE"), "disable"),
		}
	default:
		db = DBConfig{
			Host:     fallback(os.Getenv("DB_HOST"), "localhost"),
			Port:     intFromEnv("DB_PORT", 5432),
			User:     fallback(os.Getenv("DB_USER"), "stuffcontrol_user"),
			Password: fallback(os.Getenv("DB_PASSWORD"), "stuffcontrol_password"),
			Name:     fallback(os.Getenv("DB_NAME"), "stuffcontrol_development"),
			SSLMode:  fallback(os.Getenv("DB_SSL_MODE"), "disable"),
		}
	}

	return Config{
		Env:      env,
		HTTPPort: port,
		DB:       db,
	}
}

func detectEnv() Env {
	switch os.Getenv("NODE_ENV") {
	case string(EnvProduction):
		return EnvProduction
	case string(EnvTest):
		return EnvTest
	default:
		return EnvDevelopment
	}
}

func intFromEnv(key string, fallbackValue int) int {
	raw := os.Getenv(key)
	if raw == "" {
		return fallbackValue
	}

	parsed, err := strconv.Atoi(raw)
	if err != nil {
		return fallbackValue
	}

	return parsed
}

func fallback(value, defaultValue string) string {
	if value == "" {
		return defaultValue
	}
	return value
}
