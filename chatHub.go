// Purpose of Hub is to maintain the registered clients and broadcast messages to clients
// Channels are used to register, unregister, and broadcast messages

package main

import (
	"fmt"
)

// Msg struct defines the json format that is to be recieved
type Msg struct {
	Username string       `json:"username"`
	Message  string       `json:"msg"`
	Business BusinessData `json:bizdata`
}

// Hub struct maintain active clients and broadcast message to clients
// type Hub struct {
// 	// Registered Clients
// 	clients map[*User]bool

// 	// Inbound messages from the clients
// 	broadcast chan Msg

// 	// Register request from clients
// 	register chan *User

// 	// Unregister request from  clients
// 	unregister chan *User

// 	// Read message from client and adds info to db
// 	read chan Msg
// }

// NewHub initializes a new Hub for the chat server. There is 1 Hub per 1 Session

func (s *Session) run() {
	for {
		select {
		// register client
		case client := <-s.register:
			s.clients[client] = true
			fmt.Printf("There are %n users in the chat room\n", len(s.clients))

			// remove client from clients map
		case client := <-s.unregister:
			if _, ok := s.clients[client]; ok {
				delete(s.clients, client)
				// need to close send channel
				close(client.send)
				fmt.Printf("There are %n users in the chat room\n", len(s.clients))
			}

		case message := <-s.broadcast:
			for client := range s.clients {
				select {
				case client.send <- message:
					// if cannot send, either connection is severed, thus, remove client from list
				default:
					close(client.send)
					delete(s.clients, client)
				}
			}

		case message := <-s.read:
			// if message contains business info, need to add to busines list
			// if message contains Message.. add to Messages
			fmt.Printf("Reading Message")
			fmt.Print(message)
			if &message.Business != nil {
				s.BusinessList[message.Business.ID] = &message.Business
			} else if &message.Message != nil {
				idMessage := message.Username + ": " + message.Message
				s.Messages = append(s.Messages, idMessage)
			}
			s.broadcast <- message
		}
	}
}
