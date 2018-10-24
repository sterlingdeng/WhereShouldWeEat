package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

const (
	maxPartySize int = 10
	votesPerUser int = 3
	// voteTimeInSec       int    = 60
	newSessionRandomInt int    = 9999
	currURL             string = "localhost" + port
	port                string = ":8000"
	wsport              string = ":8080"
	wsURL               string = "localhost" + wsport
)

// Session struct to handle parties
// if the first letter of each attribute in struct is not capitalized... it will not export.
type Session struct {
	ID              int                       `json:"id"`
	MaxPartySize    int                       `json:"MaxPartySize"`
	CurrPartySize   int                       `json:"CurrPartySize"`
	Users           map[string]*User          `json:"users"`
	Location        LatLng                    `json:"location"`
	NomineeList     map[string]*NomineeStruct `json:"nomineeList"`
	Messages        []string                  `json:"messages"`
	TimeInitialized time.Time
	TimeVoteInit    time.Time
	YelpBizList     map[string]BusinessData // initial list to send to the client (this may not be necessary)
	state           int
	clients         map[*User]bool
	broadcast       chan Msg   // Inbound messages from the clients
	register        chan *User // Register request from clients
	unregister      chan *User // Unregister request from  clients
	read            chan Msg   // Read message from client and adds info to db
}

func (s Session) hasUser(uid string) bool {
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

func (s *Session) nomineeExist(bid string) bool {
	for _, nominee := range s.NomineeList {
		if nominee.Business.ID == bid {
			return true
		}
	}
	return false
}

func (s *Session) addNominee(b *BusinessData) {
	if s.nomineeExist(b.ID) == false {
		newNominee := NomineeStruct{
			Business: b,
			Votes:    0,
		}
		s.NomineeList[b.ID] = &newNominee
		// send information to users that the business list got updated
	}
}

func (s *Session) voteNominee(nomid string, vote string, user string) {
	if !s.nomineeExist(nomid) {
		log.Fatal("something")
	}

	u := s.Users[user]        // user
	n := s.NomineeList[nomid] // nominee

	fmt.Printf("Before: %d\n", n.Votes)

	if vote == "add" && u.votesLeft != 0 {
		n.Votes++
		u.votesLeft--
	} else if vote == "remove" {
		n.Votes--
		u.votesLeft++
	}
	fmt.Printf("After: %d\n", n.Votes)
}

func (s Session) areAllUsersReady() bool {
	usersAreReady := true
	for _, user := range s.Users {
		if user.ReadyUp == false {
			usersAreReady = false
			break
		}
	}
	return usersAreReady
}

func (s *Session) startVotePhase() {
	//	need to send responses to the users..

	// change state so that in voting phase
	// set timer
	// countdown
	// when timer gets to zero, see what is the highest vote
	msg := Msg{
		AllReady:      true,
		VoteTimeInSec: 10,
	}

	s.broadcast <- msg

}

func (s *Session) findMostVotedNominee() []*BusinessData {
	var mostVoted []*BusinessData
	acc := 0
	for _, nominee := range s.NomineeList {
		if nominee.Votes > acc {
			acc = nominee.Votes
			mostVoted = nil
			mostVoted = append(mostVoted, nominee.Business)
		} else if nominee.Votes == acc {
			mostVoted = append(mostVoted, nominee.Business)
		}
	}
	for _, biz := range mostVoted {
		fmt.Print(biz.ID)
	}
	return mostVoted
}

func (s *Session) startVoteTimer() {
	tick := time.Tick(time.Second)
	end := time.After(10 * time.Second)
	counter := 10
	for {
		select {
		case <-tick:
			//do something
			fmt.Printf("Tick: %d\n", counter)
			msg := Msg{
				Username: "server",
				Message:  fmt.Sprintf("Counter: %d\n", counter),
			}
			s.broadcast <- msg
			counter--
		case <-end:
			winners := s.findMostVotedNominee()
			msg := Msg{
				Winner: winners,
			}
			s.broadcast <- msg
			return
		}
	}
}

// [ 2 , 4, 5, 5, 3, 1]

type NomineeStruct struct {
	Business *BusinessData
	Votes    int
}

// User struct to handle individual users within Sessions
type User struct {
	Username  string `json:"username"`
	ReadyUp   bool   `json:"ready"`
	votesLeft int
	session   *Session
	conn      *websocket.Conn // Websocket Connection
	send      chan Msg        // Buffered channel of outbound messages
}

// SessionManager manages all active sessions and provides methods to handle sessions
type SessionManager struct {
	ActiveSessions map[int]*Session
	MaxSessions    int
}

func (s *SessionManager) size() int {
	return len(s.ActiveSessions)
}

func (s *SessionManager) hasSession(sid int) (bool, *Session) {
	if session, has := s.ActiveSessions[sid]; has {
		return true, session
	}
	return false, nil
}

func (s *SessionManager) delete(sid int) {
	if has, _ := s.hasSession(sid); has {
		delete(s.ActiveSessions, sid)
	}
}

func (s *SessionManager) add(session *Session) bool {
	if has, _ := s.hasSession(session.ID); has {
		return false // session already exists
	}
	s.ActiveSessions[session.ID] = session
	return true
}

func (s *SessionManager) initSession(latlng LatLng) *Session {
	//create a new session... add session to the session manager

	session := Session{
		ID:              rand.Intn(newSessionRandomInt),
		MaxPartySize:    maxPartySize,
		CurrPartySize:   0,
		Users:           make(map[string]*User),
		Location:        latlng,
		NomineeList:     make(map[string]*NomineeStruct, 0), // used to vote
		Messages:        make([]string, 0),
		TimeInitialized: time.Now(),
		YelpBizList:     nil,
		clients:         make(map[*User]bool),
		broadcast:       make(chan Msg),
		register:        make(chan *User),
		unregister:      make(chan *User),
		read:            make(chan Msg),
	}

	s.add(&session)
	fmt.Println("Initializing Chat Server")
	ChatServerInstance := chatServerFactory()
	go ChatServerInstance(&session)

	return &session
}

/*
func createSession
type: "POST"
recieving body/json: {
	"username": string
	"LatLng": {"latlng" : {"lat" : float64, "lng" : float64}}
}
desc: client to send username and latlng information to the server.
latlng will be used as inital location to fetch yelp data.
The conversion from a city string to a latlng can be done using another end point. (To provide later)
*/

func createSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Username string `json:"username"`
		Latlng   LatLng `json:"latlng"`
	}

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		log.Fatal(err)
	}

	user := User{
		Username:  req.Username,
		ReadyUp:   false,
		votesLeft: votesPerUser,
	}

	session := manager.initSession(req.Latlng)
	session.addUser(user)
	session.Location = req.Latlng

	// update yelp business address
	sessionLocationData := &YelpSearchParameters{LatLng: req.Latlng}
	yelpResPtr := FetchYelpInfoFromYelpEndpoint(sessionLocationData).ConvertYelpResponseToMappedYelpResponse()

	session.YelpBizList = *yelpResPtr

	json.NewEncoder(w).Encode(session)

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
		json.NewEncoder(w).Encode(manager.ActiveSessions[seshID])
		// once session is found, need to connect user to the session, maybe this is where we initiate a websocket connection?

	} else {
		fmt.Println("Session not found")

		// if session is not found, need to send not found to front end
	}

}

func handleClientYelpReq(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	v := r.URL.Query()

	loc := v.Get("location")
	lat, _ := strconv.ParseFloat(v.Get("lat"), 64)
	lng, _ := strconv.ParseFloat(v.Get("lng"), 64)
	offset := v.Get("offset")

	searchParameters := &YelpSearchParameters{
		location: loc,
		LatLng: LatLng{
			Lat: lat,
			Lng: lng,
		},
		Offset: offset,
	}

	yelpResponseStruct := FetchYelpInfoFromYelpEndpoint(searchParameters).ConvertYelpResponseToMappedYelpResponse()

	jsonEncodeErr := json.NewEncoder(w).Encode(yelpResponseStruct)

	if jsonEncodeErr != nil {
		log.Fatal(jsonEncodeErr)
	}
	// transmit YelpResponse to client

}

func rtNominate(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Sid      int          `json:"sid"`
		Username string       `json:"username"`
		Nominee  BusinessData `json:"nominee"`
	}

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		log.Fatal(err)
	}

	if has, _ := manager.hasSession(req.Sid); !has {
		log.Fatal("session not found")
	}

	session := manager.ActiveSessions[req.Sid]

	if !session.nomineeExist(req.Nominee.ID) {
		session.addNominee(&req.Nominee)
		entry := make(map[string]NomineeStruct)
		entry[req.Nominee.ID] = NomineeStruct{
			Business: &req.Nominee,
			Votes:    0,
		}

		msg := Msg{
			Username: req.Username,
			Nominee:  entry,
		}

		session.broadcast <- msg
	}
}

func readyUp(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	v := r.URL.Query()
	username := v.Get("username")
	sid, _ := strconv.Atoi(v.Get("sid"))
	isReady, boolerr := strconv.ParseBool(v.Get("isready"))

	if boolerr != nil {
		isReady = false
	}

	var session *Session
	var has bool

	if has, session = manager.hasSession(sid); !has {
		log.Fatal(err)
	}

	if !session.hasUser(username) {
		log.Fatal(err)
	}

	session.Users[username].ReadyUp = isReady
	fmt.Printf("\n %b", session.areAllUsersReady())
	if session.areAllUsersReady() {
		session.startVotePhase()
		session.startVoteTimer()
	}
}

func handleVote(w http.ResponseWriter, r *http.Request) {
	v := r.URL.Query()
	username := v.Get("username")
	sid, _ := strconv.Atoi(v.Get("sid"))
	nomid := v.Get("nomid")
	vote := v.Get("vote")

	var session *Session
	var has bool

	if has, session = manager.hasSession(sid); !has {
		log.Print("Session not found")
	}

	if !session.hasUser(username) {
		log.Print("User not found")
	}

	if !session.nomineeExist(nomid) {
		log.Print("Nominee not found")
	}

	session.voteNominee(nomid, vote, username)

}

// Init books var as a slice Book struct
/*
Remember that in order to initialize a map, it needs to be done with var something = make(map..) because if it is initialized like var activeSession = map[int]Session initializes a nil map
*/

var manager = new(SessionManager)

func init() {
	manager.ActiveSessions = make(map[int]*Session)
	manager.MaxSessions = 1
}

func main() {
	// Initialize Router
	r := mux.NewRouter()
	fmt.Printf("Initializing server on port %s \n", port)

	// Router Handlers / Endpoints
	r.HandleFunc("/CreateSession", createSession).Methods("POST")
	r.HandleFunc("/JoinSession", joinSession).Methods("GET")
	r.HandleFunc("/ReadyUp", readyUp).Methods("GET")

	// Yelp API handlers
	r.HandleFunc("/yelpsearch", handleClientYelpReq).Methods("GET")

	// Search Location Handlers
	r.HandleFunc("/search", searchLocation).Methods("GET")

	// Handle adding a restaurant to the nominate list
	r.HandleFunc("/nominate", rtNominate).Methods("POST")

	r.HandleFunc("/vote", handleVote).Methods("GET")

	log.Fatal(http.ListenAndServe(port, r))

}
