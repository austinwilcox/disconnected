package tmux

type Tmux struct {
	Command string
}

func (tmux *Tmux) Test() *Tmux {
	return &Tmux{
		Command: "Test this out",
	}
}

func (tmux *Tmux) TestAgain() *Tmux {
	tmux.Command += "Test this out now"
	return tmux
}