// Purpose of Hub is to maintain the registered clients and broadcast messages to clients
// Channels are used to register, unregister, and broadcast messages

package main

import (
	"fmt"
)

// Hub struct maintain active clients and broadcast message to clients
type Hub struct {
	// Registered Clients
	clients map[*User]bool

	// Inbound messages from the clients
	broadcast chan []byte

	// Register request from clients
	register chan *User

	// Unregister request from  clients
	unregister chan *User
}

// NewHub initializes a new Hub for the chat server. There is 1 Hub per 1 Session
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*User]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *User),
		unregister: make(chan *User),
	}
}

func (h *Hub) run() {
	for {
		select {
		// register client
		case client := <-h.register:
			h.clients[client] = true
			fmt.Printf("There are %n users in the chat room\n", len(h.clients))

			// remove client from clients map
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				// need to close send channel
				close(client.send)
				fmt.Printf("There are %n users in the chat room\n", len(h.clients))
			}

		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
					// if cannot send, either connection is severed, thus, remove client from list
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

