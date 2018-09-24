package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"
)

const yelpEndpoint string = "https://api.yelp.com/v3/businesses/search"

// InitGeographicData struct contains the location and lat & lng data that is sent from the client when a new session is created
type InitGeographicData struct {
	location string `json:"location"` // provide location such as NYC, or San Francisco, CA
	LatLng
}

func (i *InitGeographicData) assembleURI() string {
	if &i.LatLng.Lat == nil || &i.LatLng.Lng == nil {
		return yelpEndpoint + "?latitude=" + fmt.Sprintf("%f", i.LatLng.Lat) + "&longitude=" + fmt.Sprintf("%f", i.LatLng.Lng)
	}
	return yelpEndpoint + "?location=" + i.location
}

// LatLng struct contains the latitude and longitude data as float64
type LatLng struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

// YelpResponse provides a struct to unmarshal the JSON from the yelp API
type YelpResponse struct {
	Businesses []BusinessData `json:"businesses"`
}

type BusinessData struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	Rating       int     `json:"int"`
	ReviewCount  int     `json:"review_count`
	Price        string  `json:"price"`
	DisplayPhone string  `json:"display_phone"`
	Distance     float64 `json:"distance"`
	Coordinates  struct {
		Lat float64 `json:"latitude"`
		Lng float64 `json:"longitude"`
	} `json:"coordinates"`
	IsClosed string `json:"is_closed"`
	ImageURL string `json:"image_url"`
}

// MappedYelpResponse struct provides a map, relating the key, which is the business ID, to the value, which is the BusinessData. ** Not sure if this will be used lol..
type MappedYelpResponse struct {
	MappedBusinessStruct map[string]*BusinessData
}

// ConvertYelpResponseToMappedYelpResponse converts the YelpResponse struc to the mapped data structure, with the key as the ID and value as the BusinessData ** Not sure if this will be used lol..
func (y *YelpResponse) ConvertYelpResponseToMappedYelpResponse() *MappedYelpResponse {
	mappedPtr := &MappedYelpResponse{make(map[string]*BusinessData)}

	for _, key := range y.Businesses {
		mappedPtr.MappedBusinessStruct[key.ID] = &key
	}

	return mappedPtr
}

// FetchYelpInfoFromYelpEndpoint function performs the GET call to the yelp API
func FetchYelpInfoFromYelpEndpoint(loc *InitGeographicData) *YelpResponse {
	addr := loc.assembleURI()
	fmt.Printf(addr)

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
	fmt.Print(YelpRes)

	if jsonErr != nil {
		log.Fatal(jsonErr)
	}

	return &YelpRes

}
