package main

import (
	// "fmt"
	"fmt"
	"log"
	"os/exec"
)

func main() {
	cmd := exec.Command("echo", "Test")
	stdout, err := cmd.Output()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(string(stdout))
}
