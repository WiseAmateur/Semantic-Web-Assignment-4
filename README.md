##Semantic Web Application (assignment 4)
### @VU University Amsterdam
#### Daan Siepelinga

This web application uses the food ontology created for assignment 3 with a few modificiations. New instances of certain classes were added so that the results without inferencing were larger and an old instance swapped names with a new instance as it made sense.

### Setting the application up

To get this thing up and running on a local machine, you need the following:

* Python 2.7
* Virtualenv (`pip install virtualenv`)
* Setup the virtualenv in the directory of this repository (`virtualenv .`)
* Activate the virtualenv (`source bin/activate` on linux-like systems)
* Install the necessary packages (install using `pip install -r requirements.txt`)
* A recent Stardog installation
* A stardog database called foodOntology using the ontology found in the /stardog map
	* On linux this database can be created with the command `./stardog-admin db create -o reasoning.sameas=FULL -n foodOntology <this repository>/stardog/food_ontology_2548178.ttl`

Once everything is ready:

* start your Stardog server with `stardog-admin server start --disable-security`,
* run `python assignment4.py`.

The application is then running at <http://localhost:4000> .
