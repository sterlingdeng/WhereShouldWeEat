package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	// _ "github.com/go-sql-driver/mysql"
	// _ "github.com/jmoiron/sqlx"
	// _ "github.com/mattn/go-sqlite3"
	// _ "github.com/mongodb/mongo-go-driver/mongo"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// learned several things today.. a driver is required to read the database. drivers can be mysql, sqlite3, sqlx , etc

var session *mgo.Session
var c *mgo.Collection
var err error

func init() {
	// if := is used rather than =, it will create a local db variable which will not be global.. thus the db.Query
	// in the next function will not be able to properly reference the db that was returned from sql.Open
	// db, err = sql.Open("mysql", "server=localhost; /location") // the DSN (database source name) string is dependeng on the driver
	// fmt.Print(db)

	session, err = mgo.Dial(mongoURI)

	if err != nil {
		log.Fatal(err)
	}

	c = session.DB("firstdeployment").C("places")

}

func searchLocation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	v := r.URL.Query()

	search := v.Get("search")

	fmt.Printf("Search: %s\n", search)

	// rows, err := db.Query("SELECT * FROM places WHERE postal_code LIKE ?1 OR place_name LIKE ?1 OR admin_code1 LIKE ?1 LIMIT 10", search)

	var rows []struct {
		ID        bson.ObjectId `bson:"_id" json:"_id"`
		PlaceName string        `bson:"place_name" json:"place_name"`
		Country   string        `bson:"country_code" json:"country_code"`
		ZipCode   int           `bson:"postal_code" json:"zip_code"`
		StateCode string        `bson:"admin_code1" json:"state"`
		Lat       float64       `bson:"latitude" json:"lat"`
		Lng       float64       `bson:"longitude" json:"lng"`

		// example data below
		Status string `bson:"status" json:"status"`
	}

	err := c.Find(bson.M{"$or": []bson.M{
		//bson.M{"postal_code": bson.M{"$regex": "[0-9]", "$options": "i"}}, // does not currently work
		bson.M{"place_name": bson.M{"$regex": search + ".*", "$options": "i"}}}}).Limit(10).All(&rows)

	if err != nil {
		log.Fatal(err)
	}

	// rows, err := db.Query("SELECT * FROM places LIMIT 10")

	fmt.Print(rows)

	json.NewEncoder(w).Encode(rows)

}
