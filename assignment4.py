# Semantic Web assignment 4
# Name: Daan Siepelinga
# Student id: 2584178
# Date: 30-09-2015
#
# In this file the web application gets started using Flask on port 4000. Two
# routes are defined, one to render the page and one to query the Stardog database
# used by the application 

from flask import Flask, render_template, url_for, request, jsonify
from SPARQLWrapper import SPARQLWrapper, RDF, JSON
import requests
import os
import json


app = Flask(__name__)


TRIPLE_STORE = "http://localhost:5820/foodOntology"

@app.route("/")
def home_page():
    return render_template("index.html")
    
@app.route("/sparql", methods=["GET"])
def sparql():
    query = request.args.get("query", None)    
    inferencing = request.args.get("inferencing")
    
    # If the query and inference variables are not empty, send the sparql query 
    # to the stardog database and return the results as JSON
    if (query and inferencing):
        
        sparql = SPARQLWrapper(TRIPLE_STORE + "/query")
        
        sparql.setQuery(query)

        sparql.setReturnFormat(JSON)
        sparql.addParameter("Accept","application/sparql-results+json")

        sparql.addParameter("reasoning",inferencing)
        
        try:
            response = sparql.query().convert()

            return jsonify(response)
        except Exception as e:
            return jsonify({"result": "Error"})
    else :
        return jsonify({"result": "Error"})
    

if __name__ == "__main__":
    app.debug = True
    port = int(os.environ.get("PORT", 4000))
    app.run(port=port)
