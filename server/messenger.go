package main

import "encoding/json"

// Envelope is a wrapper for the message
type Envelope struct {
	Type string      `json:"type"`
	Body interface{} `json:"body"`
}

// ChatMsg is used to relay message chats over websocket
type ChatMsg struct {
	Username string `json:"username"`
	Message  string `json:"message"`
}

// NomineeMsg is used to help broadcast the updated nominee list to users in the session.
type NomineeMsg struct {
	Username string                    `json:"username"`
	Nominee  map[string]*NomineeStruct `json:"nominee"`
}

// StartVote provides the trigger to egin voting phase
type StartVote struct {
	AllReady  bool `json:"allReady"`
	VoteCount int  `json:"votecount"`
}

type VotingPhase struct {
	Nomid  string `json:"nomid"`
	Action string `json:"action"`
	User   string `json:"user"`
}

type updateUserVotesLeft struct {
	User      string `json:"user"`
	VotesLeft int    `json:"votesleft"`
}

type voteTick struct {
	Tick int `json:"tick"`
}

type Winner struct {
	Winner []*BusinessData `json:"winner"`
}

type ReadEnvelope struct {
	Type string          `json:"type"`
	body json.RawMessage `json:"body"`
}

func (c ChatMsg) packAndSend(s *Session) {
	envelope := Envelope{
		Type: "ChatMsg",
		Body: c,
	}
	s.broadcast <- envelope
}

func (n NomineeMsg) PackAndSend(s *Session) {
	envelope := Envelope{
		Type: "NomineeMsg",
		Body: n,
	}
	s.broadcast <- envelope
}

func (st StartVote) PackAndSend(s *Session) {
	envelope := Envelope{
		Type: "StartVote",
		Body: st,
	}
	s.broadcast <- envelope
}

func (v VotingPhase) PackAndSend(s *Session) {
	envelope := Envelope{
		Type: "VotingPhase",
		Body: v,
	}
	s.broadcast <- envelope
}
func (t voteTick) PackAndSend(s *Session) {
	envelope := Envelope{
		Type: "voteTick",
		Body: t,
	}
	s.broadcast <- envelope
}

func (w Winner) PackAndSend(s *Session) {
	envelope := Envelope{
		Type: "Winner",
		Body: w,
	}
	s.broadcast <- envelope
}

type Msg struct {
	Username    string `json:"username"`
	Message     string `json:"message"`
	ReadyUp     bool   `json:"readyup"`
	VoteNominee struct {
		BusinessData,
		Action string
	} `json:"votenominee"`
}
