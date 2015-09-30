/* Semantic Web assignment 4
 * Name: Daan Siepelinga
 * Student id: 2584178
 * Date: 30-09-2015
 *
 * Here the SPARQL queries get initialized based on the active settings and
 * queried to the local stardog database. Afterwards the results are formatted
 * and shown in the results div. 
 */

$(document).ready(function()
{
    $("#inferencing_checkbox").click(function()
    {
        resetResults();
    });

    $(".view_button").click(function()
    {
        resetResults();
        $(".view_button").removeClass("active");
        $(this).addClass("active");
    });

    /* When the load meals button is clicked, send a SPARQL query to the stardog database
     * based on the settings and show the results in the results div */
    $("#load_meals").click(function()
    {
        /* Reset the previous results and make the load button active */
        $("#results ul").html("");
        $(this).addClass("active");

        var inferencing = $("#inferencing_checkbox").is(":checked");

        /* Check which of the view modes is active and use the corresponding query afterwards */
        if ($(".view_button.active").val() == "Normal View")
        {
            var query = "SELECT DISTINCT ?food ?type ?contains WHERE { VALUES ?type {:Meal :Food :Drink}"
                        + " ?food :contains ?contains . ?food rdf:type ?type }";
                         
             queryDBNormal(query, inferencing, $("#results ul"));
        }
        else
        {
            var query = "SELECT DISTINCT ?meal WHERE { ?meal rdf:type :Meal }";
            
            queryDBHierarchy(query, inferencing, "meal", $("#results ul"), true);
        }
    });
});

/* Reset the previous results and make the load button inactive */
function resetResults()
{
    $("#results ul").html("");
    $("#load_meals").removeClass("active");
}

/* Query all the top level (meals, foods, drinks) classes of the ontology with their contains
 * relations and format the results into a table */
function queryDBNormal(query, inferencing, selector)
{
    /* Ajax get request to the stardog database */
    $.get('/sparql',data={'query': query, 'inferencing': inferencing}, function(json){
        
        result = json.results.bindings;
        
        /* Initialize the table with its header row */
        selector.append("<table><thead><tr><th>Food</th><th>Type</th><th>Contains</th></tr></thead><tbody></table>");
        
        var l = result.length;
        var table_cells = "";
        
        /* Loop through the result data, adding a row to the table per result */
        for (var i = 0; i < l; i++)
        {
            table_cells += "<td>" + splitURI(result[i]["food"].value) + "</td>";
            table_cells += "<td>" + splitURI(result[i]["type"].value) + "</td>";
            table_cells += "<td>" + splitURI(result[i]["contains"].value) + "</td>";
            
            selector.children("table").append("<tr>" + table_cells + "</tr>");
            
            table_cells = "";
        }
        
        selector.children("table").append("</tbody>");
    });
}

/* Reduce the result URI of format 'http://...#item' to the format 'item' and
 * replace the '_' in the result with a ' ' */
function splitURI(item)
{
    var split_uri = item.split("#");
    
    if (split_uri.length > 1)
        return split_uri[1].replace("_", " ");
    else
        return split_uri[0].replace("_", " ");
}

/* Query one level of content (meals, foods, drinks or ingredients) and format the
 * result in a list with a button if it is not an ingredient that queries a level
 * down in the hierarchy */
function queryDBHierarchy(query, inferencing, item, selector, show_more)
{
    /* Ajax get request to the stardog database */
    $.get('/sparql',data={'query': query, 'inferencing': inferencing}, function(json){
        
        if (!((selector.children(".level_down")).length))
            selector.append("<div class='level_down'></div>");

        var l = json.results.bindings.length;
        for (var i = 0; i < l; i++)
        {
            addFood(json.results.bindings[i][item].value, selector, show_more);
        }
        
        if (show_more)
        {
            initializeShowMoreButtons();
        }
    });
}

/* Display the results in a list with button if the result is not an ingredient */
function addFood(food, selector, show_more)
{
    food = splitURI(food);
    
    if (show_more)
        selector.children(".level_down").append("<li>" + food + " <input class='uninitialized show_more' type='button' name='"
                          + food.replace(" ", "_") + "' /></li>");
    else
        selector.children(".level_down").append("<li>" + food + "</li>");
}

/* Initialize all the uninitialized show more buttons to query a level down the hierarchy on click
 * and afterwards change into a show less button that removes the level down on click */
function initializeShowMoreButtons()
{
    $(".uninitialized.show_more").click(function()
    {
        /* Query a level down the hierarchy and change to a show less button */
        if ($(this).hasClass("show_more"))
        {
            showMore($(this).attr("name"), $(this).parent());
            $(this).removeClass("show_more").addClass("show_less");
        }
        /* Remove the level down and change back into a show more button */
        else
        {
            $(this).parent().children(".level_down").remove();
            $(this).removeClass("show_less").addClass("show_more");
        }
    });
    
    $(".uninitialized").removeClass("uninitialized");
}

/* Initialize the level down queries and query them to the stardog database.
 * The ingredient query is separated, so that it can be formatted on its own without
 * a show more button */
function showMore(food, selector)
{
    var query = "SELECT DISTINCT ?food WHERE { :" + food +
                " :contains ?food . { ?food rdf:type :Food . } UNION " + 
                "{ ?food rdf:type :Drink . } }";
    
    var inferencing = $("#inferencing_checkbox").is(":checked");
    
    queryDBHierarchy(query, inferencing, "food", selector, true);
    
    var query = "SELECT DISTINCT ?ingredient WHERE { :" + food +
                " :contains ?ingredient . ?ingredient rdf:type :Ingredient }";

    queryDBHierarchy(query, inferencing, "ingredient", selector, false);
}
