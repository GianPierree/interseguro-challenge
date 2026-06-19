// Package main is the entry point. It only loads env vars and delegates
// everything else to the infrastructure layer.
package main

import (
	"log"

	"github.com/joho/godotenv"

	"github.com/interseguro/go-api/internal/infrastructure"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	if err := infrastructure.Start(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
