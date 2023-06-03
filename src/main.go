package main

import (
	"fmt"
)

type Tmux struct {
	Command string
}

func (tmux *Tmux) NewSession(nameOfSession string) *Tmux {
	return &Tmux{
		Command: fmt.Sprintf("tmux new-session -t '%s'", nameOfSession),
	}
}

func (tmux *Tmux) NewWindow(nameofWindow string) *Tmux {
	tmux.Command += fmt.Sprintf("tmux new-window %s", nameofWindow)
	return tmux
}

func main() {
	tmuxCommand := &Tmux{}
	test := tmuxCommand.NewSession("ArbPortal").NewWindow("Nvim")

	fmt.Println(test.Command)

	// cmd := exec.Command("echo", "Test")
	// stdout, err := cmd.Output()
	// if err != nil {
	// 	log.Fatal(err)
	// }

	// fmt.Println(string(stdout))
}
