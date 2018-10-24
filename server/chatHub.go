// Purpose of Hub is to maintain the registered clients and broadcast messages to clients
// Channels are used to register, unregister, and broadcast messages

package main

import (
	"fmt"
)

// Msg struct defines the json format that is to be recieved
type Msg struct {
	Username      string                   `json:"username"`
	Message       string                   `json:"msg"`
	Nominee       map[string]NomineeStruct `json:"nominee"`
	ReadyUp       bool                     `json:"readyup"`
	AllReady      bool                     `json:"allReady"`
	Winner        []*BusinessData          `json:"winner"`
	VoteTimeInSec int                      `json:"voteTime"`
	VoteNominee   struct {
		BusinessData,
		Action string
	} `json:"votenominee"`
}

// NewHub initializes a new Hub for the chat server. There is 1 Hub per 1 Session

func (s *Session) run() {
	for {
		select {
		// register client
		case client := <-s.register:
			s.clients[client] = true
			fmt.Printf("There are %d user(s) in the chat room\n", len(s.clients))

			// remove client from clients map
		case client := <-s.unregister:
			if _, ok := s.clients[client]; ok {
				delete(s.clients, client)
				// need to close send channel
				close(client.send)
				fmt.Printf("There are %d user(s) in the chat room\n", len(s.clients))
			}

		case message := <-s.broadcast:
			// fmt.Print("\n Broadcasting Message \n")
			for client := range s.clients {

				select {
				case client.send <- message:
					// if cannot send, either connection is severed, thus, remove client from list
				default:
					fmt.Print("closing ws connection\n")
					close(client.send)
					delete(s.clients, client)
				}
			}

		case message := <-s.read:
			// if message contains business info, need to add to busines list
			// if message contains Message.. add to Messages
			// fmt.Printf("Reading Message")
			idMessage := message.Username + ": " + message.Message
			s.Messages = append(s.Messages, idMessage)

			// fmt.Print("\n line is executing \n")
			for client := range s.clients {

				select {
				case client.send <- message:
					// fmt.Print("\nsending message\n")
					// if cannot send, either connection is severed, thus, remove client from list
				default:
					fmt.Print("closing ws connection\n")
					close(client.send)
					delete(s.clients, client)
				}
			}
		}
	}
}
