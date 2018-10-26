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

func (c ChatMsg) packAndSend(s *Session) {
	envelope := Envelope{
		Type: "ChatMsg",
		Body: c,
	}
	s.broadcast <- envelope
}

type NomineeMsg struct {
	Username string                   `json:"username"`
	Nominee  map[string]NomineeStruct `json:"nominee"`
}

func (n NomineeMsg) PackAndSend(s *Session) {
	envelope := Envelope{
		Type: "NomineeMsg",
		Body: n,
	}
	s.broadcast <- envelope
}

type StartVote struct {
	AllReady      bool `json:"allReady"`
	VoteTimeInSec int  `json:"voteTime"`
}

func (st StartVote) PackAndSend(s *Session) {
	envelope := Envelope{
		Type: "StartVote",
		Body: st,
	}
	s.broadcast <- envelope
}

type Winner struct {
	Winner []*BusinessData `json:"winner"`
}

func (w Winner) PackAndSend(s *Session) {
	envelope := Envelope{
		Type: "Winner",
		Body: w,
	}
	s.broadcast <- envelope
}

type ReadEnvelope struct {
	Type string          `json:"type"`
	body json.RawMessage `json:"body"`
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
