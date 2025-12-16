# Server module

This directory hosts the Go backend for StuffControl. Common day‑to‑day tasks are wrapped in the `Makefile` so you can quickly build, test, lint, or format the code.

## Prerequisites

- Go 1.23+
- `golangci-lint` (optional, required for `make lint`)

## Useful commands

```bash
# Format sources in cmd/ and internal/
make fmt

# Run unit tests
make test

# Run static analysis via golangci-lint
make lint

# Build a binary into bin/stuffcontrol
make build

# Launch the API locally
make run
```

If you add new modules or generated code, update `.golangci.yml` and the `Makefile` targets accordingly.
