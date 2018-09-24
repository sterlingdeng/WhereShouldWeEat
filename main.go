package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

const maxPartySize int = 10
const newSessionRandomInt int = 9999

// Session struct to handle parties
// if the first letter of each attribute in struct is not capitalized... it will not export.
type Session struct {
	ID            int              `json:"id"`
	MaxPartySize  int              `json:"MaxPartySize"`
	CurrPartySize int              `json:"CurrPartySize"`
	Users         map[string]*User `json:"users"`
	Location      string           `json:"location"`
	Hub           *Hub
	BusinessList  map[string]*BusinessData
}

func (s *Session) hasUser(uid string) bool {
	if _, has := s.Users[uid]; has {
		return true
	}
	return false
}

func (s *Session) addUser(user User) bool {
	if s.hasUser(user.Username) {
		return false //user already exists
	}
	s.Users[user.Username] = &user
	s.CurrPartySize++
	return true
}

func (s *Session) deleteUser(user User) bool {
	if s.hasUser(user.Username) {
		delete(s.Users, user.Username)
		s.CurrPartySize--
		return true
	}
	return false
}

func (s *Session) businessExist(bid string) bool {
	if _, has := s.BusinessList[bid]; has {
		return true
	}
	return false
}

func (s *Session) addBusiness(b *BusinessData) {
	if s.businessExist(b.ID) == false {
		s.BusinessList[b.ID] = b
	}
}

// SessionManager manages all active sessions and provides methods to handle sessions
type SessionManager struct {
	ActiveSessions map[int]*Session
}

func (s *SessionManager) size() int {
	return len(s.ActiveSessions)
}

func (s *SessionManager) hasSession(sid int) (bool, *Session) {
	if _, has := s.ActiveSessions[sid]; has {
		return true, s.ActiveSessions[sid]
	}
	return false, nil
}

func (s *SessionManager) delete(sid int) interface{} {
	if has, _ := s.hasSession(sid); has {
		delete(s.ActiveSessions, sid)
	}
	return nil
}

func (s *SessionManager) add(session *Session) bool {
	if has, _ := s.hasSession(session.ID); has {
		return false // session already exists
	}
	s.ActiveSessions[session.ID] = session
	return true
}

func (s *SessionManager) initSession(location string) Session {
	//create a new session... add session to the session manager

	newSession := Session{rand.Intn(newSessionRandomInt), maxPartySize, 0, make(map[string]*User), location, NewHub(), make(map[string]*BusinessData)}
	s.add(&newSession)

	// initialize chat server
	fmt.Println("initialization chat server")
	go ChatServerInit(newSession.Hub)

	return newSession
}

// User struct to handle individual users within Sessions
type User struct {
	Username string `json:"username"`
	hub      *Hub
	conn     *websocket.Conn // Websocket Connection
	send     chan []byte     // Buffered channel of outbound messages
}

// Init books var as a slice Book struct
/*
Remember that in order to initialize a map, it needs to be done with var something = make(map..) because if it is initialized like var activeSession = map[int]Session initializes a nil map
*/

var manager = new(SessionManager)

func init() {
	manager.ActiveSessions = make(map[int]*Session)
}

/*
func createSession
type: "POST"
json: {
	"username": string
	"location": string
}
*/
func createSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Username string `json:"username"`
		Location string `json:"location"`
	}

	json.NewDecoder(r.Body).Decode(&req)

	session := manager.initSession(req.Location)

	user := User{Username: req.Username}

	manager.ActiveSessions[session.ID].addUser(user)

	fmt.Println(manager.ActiveSessions)
	json.NewEncoder(w).Encode(manager.ActiveSessions)
}

/*
func joinSession
type: "GET"
query parameters: [id, username]
*/

func joinSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	v := r.URL.Query()

	newUsername := v.Get("username")
	seshID, _ := strconv.Atoi(v.Get("id"))

	if has, sessionPtr := manager.hasSession(seshID); has {

		newUser := User{Username: newUsername}
		sessionPtr.addUser(newUser)
		json.NewEncoder(w).Encode(manager.ActiveSessions)
		// once session is found, need to connect user to the session, maybe this is where we initiate a websocket connection?

	} else {
		fmt.Println("not found")

		// if session is not found, need to send not found to front end
	}

}

func handleClientYelpReq(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	v := r.URL.Query()

	loc := v.Get("location")
	lat, _ := strconv.ParseFloat(v.Get("lat"), 64)
	lng, _ := strconv.ParseFloat(v.Get("lng"), 64)

	clientGeographicData := InitGeographicData{location: loc, LatLng: LatLng{Lat: lat, Lng: lng}}

	yelpResponseStruct := FetchYelpInfoFromYelpEndpoint(&clientGeographicData)

	jsonEncodeErr := json.NewEncoder(w).Encode(yelpResponseStruct)

	if jsonEncodeErr != nil {
		log.Fatal(jsonEncodeErr)
	}
	// transmit YelpResponse to client

}

func main() {
	// Initialize Router
	r := mux.NewRouter()

	// Router Handlers / Endpoints
	r.HandleFunc("/CreateSession", createSession).Methods("POST")
	r.HandleFunc("/JoinSession", joinSession).Methods("GET")

	// Yelp API handlers
	r.HandleFunc("/yelpdata", handleClientYelpReq).Methods("GET")

	log.Fatal(http.ListenAndServe(":8000", r))

}
