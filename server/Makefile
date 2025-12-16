BINARY ?= stuffcontrol
BIN_DIR ?= bin
ENTRYPOINT ?= ./cmd/server

.PHONY: build run test lint fmt tidy clean tools

build:
	@echo "-> building $(BINARY)"
	go build -o $(BIN_DIR)/$(BINARY) $(ENTRYPOINT)

run:
	go run $(ENTRYPOINT)

test:
	go test ./...

lint:
	golangci-lint run ./...

fmt:
	gofmt -w $$(find internal cmd -name '*.go')

tidy:
	go mod tidy

clean:
	rm -rf $(BIN_DIR)

tools:
	@command -v golangci-lint >/dev/null || { \
		echo "golangci-lint is not installed. See https://golangci-lint.run/welcome/install/"; \
		exit 1; \
	}
