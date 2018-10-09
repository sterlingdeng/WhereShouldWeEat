package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"time"
)

// LatLng struct contains the latitude and longitude data as float64
type LatLng struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type Location struct {
	Address        string    `json:"address1"`
	Address2       string    `json:"address2"`
	Address3       string    `json:"address3"`
	City           string    `json:"city"`
	State          string    `json:"state"`
	ZipCode        string    `json:"zip_code"`
	Country        string    `json:"country"`
	DisplayAddress [2]string `json:"display_address"`
	CrossStreets   string    `json:"cross_streets"`
}

// YelpSearchParameters struct contains the location and lat & lng data that is sent from the client when a new session is created
// THESE CAN ALL BE STRINGS.....
type YelpSearchParameters struct {
	location string `json:"location"` // provide location such as NYC, or San Francisco, CA
	LatLng   LatLng
	Offset   string `json:"offset"`
}

func (i *YelpSearchParameters) assembleURI() string {

	yelpEndpoint := "https://api.yelp.com/v3/businesses/search"

	if &i.LatLng.Lat != nil && &i.LatLng.Lng != nil {
		lat := strconv.FormatFloat(i.LatLng.Lat, 'f', -1, 64)
		lng := strconv.FormatFloat(i.LatLng.Lng, 'f', -1, 64)
		yelpEndpoint += "?latitude=" + lat + "&longitude=" + lng + "&categories=Restaurant"
		// return yelpEndpoint + "?location=CastroValley&categories=Restaurant" // this is a test case
	} else {
		yelpEndpoint += "?location=" + i.location
	}

	if &i.Offset != nil {
		// offset := strconv.FormatInt(i.Offset, 32)
		yelpEndpoint += "&offset=" + i.Offset
	}

	return yelpEndpoint
}

// YelpResponse provides a struct to unmarshal the JSON from the yelp API
type YelpResponse struct {
	Businesses []BusinessData `json:"businesses"`
}

type BusinessData struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Rating       float64  `json:"rating"`
	ReviewCount  int      `json:"review_count"`
	Price        string   `json:"price"`
	DisplayPhone string   `json:"display_phone"`
	Distance     float64  `json:"distance"`
	Location     Location `json:"location"`
	Coordinates  struct {
		Lat float64 `json:"latitude"`
		Lng float64 `json:"longitude"`
	} `json:"coordinates"`
	IsClosed   bool   `json:"is_closed"`
	ImageURL   string `json:"image_url"`
	Categories []struct {
		Title string `json:"title"`
	} `json:"categories"`
}

// MappedYelpResponse struct provides a map, relating the key, which is the business ID, to the value, which is the BusinessData. ** Not sure if this will be used lol..
type MappedYelpResponse struct {
	MappedBusinessStruct map[string]BusinessData
}

// ConvertYelpResponseToMappedYelpResponse converts the YelpResponse struc to the mapped data structure, with the key as the ID and value as the BusinessData
func (y *YelpResponse) ConvertYelpResponseToMappedYelpResponse() *MappedYelpResponse {
	mappedPtr := &MappedYelpResponse{make(map[string]BusinessData)}

	for index, key := range y.Businesses {
		mappedPtr.MappedBusinessStruct[key.Name] = key
		fmt.Print(index)
	}

	return mappedPtr
}

// FetchYelpInfoFromYelpEndpoint function performs the GET call to the yelp API
func FetchYelpInfoFromYelpEndpoint(loc *YelpSearchParameters) *YelpResponse {
	addr := loc.assembleURI()
	fmt.Printf("%s\n", addr)

	client := http.Client{
		Timeout: time.Second * 2,
	}

	req, err := http.NewRequest(http.MethodGet, addr, nil)
	if err != nil {
		log.Fatal(err)
	}

	req.Header.Set("Authorization", "Bearer "+yelpAPIKey)

	res, getErr := client.Do(req)
	if getErr != nil {
		log.Fatal(getErr)
	}

	body, readErr := ioutil.ReadAll(res.Body)
	if readErr != nil {
		log.Fatal(readErr)
	}

	YelpRes := YelpResponse{}

	jsonErr := json.Unmarshal(body, &YelpRes)
	// fmt.Print(YelpRes)

	if jsonErr != nil {
		log.Fatal(jsonErr)
	}

	fmt.Printf("Number of records recieved %n \n", len(YelpRes.Businesses))

	return &YelpRes

}
