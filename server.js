// Built-in Node.js modules
let fs = require("fs");
let path = require("path");

// NPM modules
let express = require("express");
let sqlite3 = require("sqlite3");
const { Chart } = require("chart.js");

let public_dir = path.join(__dirname, "public");
let template_dir = path.join(__dirname, "templates");
let db_filename = path.join(__dirname, "db", "weather.sqlite3");

let app = express();
let port = 8000;

// Open SQLite3 database (in read-only mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log("Error opening " + path.basename(db_filename));
    } else {
        console.log("Now connected to " + path.basename(db_filename));
    }
});

// Serve static files from 'public' directory
app.use(express.static(public_dir));

// GET request handler for home page '/' (redirect to desired route)
app.get("/", (req, res) => {
    let home = "/general/actual";
    res.redirect(home);
});
app.get("/city", (req, res) => {
    let home = "/city/clt";
    res.redirect(home);
});
app.get("/month", (req, res) => {
    let home = "/month/1";
    res.redirect(home);
});
app.get("/general", (req, res) => {
    let home = "/general/actual";
    res.redirect(home);
});

app.get("/city/:location_id", (req, res) => {
    console.log(req.params.location_id);
    let z = req.params.location_id.toString();
    fs.readFile(
        path.join(template_dir, "by_city_template.html"),
        (err, template) => {
            let query =
                'SELECT Locations.name AS location_id, Weather.date, Weather.record_max_temp, \
            Weather.record_max_temp_year, Weather.record_min_temp, \
            Weather.record_min_temp_year FROM Weather INNER JOIN Locations ON Weather.location_id = Locations.id \
            WHERE Weather.location_id = ? AND Weather.date LIKE "%/1/%"';

            let location_id = req.params.location_id.toUpperCase();
            db.all(query, [location_id], (err, rows) => {
                if (err || rows.length == 0) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.write('Error: no data for city ' + location_id);
                    res.end();
                } else {

                    let response = template.toString();

                    response = response.replace("%%CITY_NAME%%", rows[0].location_id.toUpperCase());
                    response = response.replace(
                        "%%CITY_IMAGE%%",
                        "/images/" + location_id + "_image.png"
                    );
                    response = response.replace(
                        "%%CITY_ALT_TEXT%%",
                        "image/logo for " + location_id
                    );

                    let city_table = "";
                    let i;
                    for (i = 0; i < rows.length; i++) {
                        city_table = city_table + "<tr><td>" + rows[i].date + "</td>";
                        city_table = city_table + "<td>" + rows[i].record_max_temp + "</td>";
                        city_table =
                            city_table + "<td>" + rows[i].record_max_temp_year + "</td>";
                        city_table = city_table + "<td>" + rows[i].record_min_temp + "</td>";
                        city_table =
                            city_table + "<td>" + rows[i].record_min_temp_year + "</td></tr>";
                    }

                    let cities = [
                        "clt",
                        "cqt",
                        "hou",
                        "ind",
                        "jax",
                        "mdw",
                        "nyc",
                        "phl",
                        "phx",
                        "sea",
                    ];
                    let index = cities.indexOf(req.params.location_id);

                    let prev;
                    let next;

                    if (index + 1 == cities.length) {
                        next = cities[0];
                        prev = cities[index - 1];
                    } else if (index - 1 < 0) {
                        next = cities[index + 1];
                        prev = cities[cities.length - 1];
                    } else {
                        next = cities[index + 1];
                        prev = cities[index - 1];
                    }

                    response = response.replace("%%CITY_WEATHER_INFO%%", city_table);

                    response = response.replace("%%NEXT%%", "/city/" + next);
                    response = response.replace("%%PREV%%", "/city/" + prev);

                    res.status(200).type("html").send(response);
                }
            });
        }
    );
});

app.get("/month/:date", (req, res) => {
    let x = req.params.date.toString();
    fs.readFile(
        path.join(template_dir, "by_month_template.html"),
        (err, template) => {
            let query1 =
                'SELECT Weather.date, Locations.name, Weather.actual_mean_temp, Weather.average_precipitation \
         FROM Weather INNER JOIN Locations ON Weather.location_id = Locations.id WHERE Weather.date LIKE "' +
                x +
                '/1/%"';

            location_id = req.params.location_id;
            db.all(query1, [location_id], (err, rows) => {

                let month_name;

                if (err || rows.length == 0) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.write('Error: no data for month number ' + x);
                    res.end();
                } else {

                    if (req.params.date.toString() == 1) {
                        month_name = "January";
                    }
                    if (req.params.date.toString() == 2) {
                        month_name = "February";
                    }
                    if (req.params.date.toString() == 3) {
                        month_name = "March";
                    }
                    if (req.params.date.toString() == 4) {
                        month_name = "April";
                    }
                    if (req.params.date.toString() == 5) {
                        month_name = "May";
                    }
                    if (req.params.date.toString() == 6) {
                        month_name = "June";
                    }
                    if (req.params.date.toString() == 7) {
                        month_name = "July";
                    }
                    if (req.params.date.toString() == 8) {
                        month_name = "August";
                    }
                    if (req.params.date.toString() == 9) {
                        month_name = "September";
                    }
                    if (req.params.date.toString() == 10) {
                        month_name = "October";
                    }
                    if (req.params.date.toString() == 11) {
                        month_name = "November";
                    }
                    if (req.params.date.toString() == 12) {
                        month_name = "December";
                    }

                    let response = template.toString();

                    response = response.replace("%%MONTH%%", month_name.toUpperCase());

                    let month_table = "";
                    let i;
                    for (i = 0; i < rows.length; i++) {
                        month_table = month_table + "<tr><td>" + rows[i].date + "</td>";
                        month_table = month_table + "<td>" + rows[i].name + "</td>";
                        month_table =
                            month_table + "<td>" + rows[i].actual_mean_temp + "</td>";
                        month_table =
                            month_table + "<td>" + rows[i].average_precipitation + "</td></tr>";
                    }

                    let index = parseInt(req.params.date);

                    let prev;
                    let next;

                    if (index == 12) {
                        next = 1;
                        prev = 11;
                    } else if (index == 1) {
                        next = 2;
                        prev = 12;
                    } else {
                        next = index + 1;
                        prev = index - 1;
                    }

                    response = response.replace("%%NEXT%%", "/month/" + next);
                    response = response.replace("%%PREV%%", "/month/" + prev);

                    response = response.replace("%%MONTH_WEATHER_INFO%%", month_table);

                    res.status(200).type("html").send(response);
                }
            });
        }
    );
});

app.get("/general/:stat_type", (req, res) => {
    fs.readFile(
        path.join(template_dir, "by_general_template.html"),
        (err, template) => {
            let query =
                'SELECT Locations.name, Weather.date, Weather.actual_mean_temp, \
            Weather.actual_max_temp, Weather.actual_min_temp, \
            Weather.actual_precipitation, Weather.average_max_temp, Weather.average_min_temp, Weather.average_precipitation, Weather.record_max_temp, \
            Weather.record_min_temp, Weather.record_precipitation FROM Weather INNER JOIN Locations ON Weather.location_id = Locations.id \
            WHERE Weather.date = "7/1/2014" OR Weather.date = "8/1/2014" OR Weather.date = "9/1/2014" OR Weather.date = "10/1/2014" \
            OR Weather.date = "11/1/2014" OR Weather.date = "12/1/2014" OR Weather.date = "1/1/2015" OR Weather.date = "2/1/2015" OR Weather.date = "3/1/2015" OR Weather.date = "4/1/2015" \
            OR Weather.date = "5/1/2015" OR Weather.date = "6/1/2015"';

            let location_id = req.params.location_id;

            db.all(query, [location_id], (err, rows) => {
                
                let x = req.params.stat_type.toString().valueOf();

                if (x != "actual" && x != "average" && x != "record") {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.write('Error: no data for stat type ' + x);
                    res.end();
                }
                else {
                    let response = template.toString();

                    response = response.replace(
                        "%%STAT_TYPE%%",
                        req.params.stat_type.toUpperCase()
                    );

                    const max_temp_clt = [];
                    const max_temp_cqt = [];
                    const max_temp_hou = [];
                    const max_temp_ind = [];
                    const max_temp_jax = [];
                    const max_temp_mdw = [];
                    const max_temp_sea = [];
                    const max_temp_nyc = [];
                    const max_temp_phx = [];
                    const max_temp_phl = [];

                    const min_temp_clt = [];
                    const min_temp_cqt = [];
                    const min_temp_hou = [];
                    const min_temp_ind = [];
                    const min_temp_jax = [];
                    const min_temp_mdw = [];
                    const min_temp_sea = [];
                    const min_temp_nyc = [];
                    const min_temp_phx = [];
                    const min_temp_phl = [];

                    let city_table = "";
                    let replace_string = "";
                    let i;
                    let j;

                    if (req.params.stat_type == "actual") {
                        console.log(rows);
                        for (i = 0; i < rows.length; i++) {
                            city_table = city_table + "<tr><td>" + rows[i].name + "</td>";
                            city_table = city_table + "<td>" + rows[i].date + "</td>";
                            city_table =
                                city_table + "<td>" + rows[i].actual_mean_temp + "</td>";
                            city_table =
                                city_table + "<td>" + rows[i].actual_max_temp + "</td>";
                            city_table =
                                city_table + "<td>" + rows[i].actual_min_temp + "</td>";
                            city_table =
                                city_table + "<td>" + rows[i].actual_precipitation + "</td></tr>";

                            if (rows[i].name == "Charlotte") {
                                max_temp_clt.push(rows[i].actual_max_temp);
                                min_temp_clt.push(rows[i].actual_min_temp);
                            }

                            if (rows[i].name == "Los Angeles") {
                                max_temp_cqt.push(rows[i].actual_max_temp);
                                min_temp_cqt.push(rows[i].actual_min_temp);
                            }

                            if (rows[i].name == "Houston") {
                                max_temp_hou.push(rows[i].actual_max_temp);
                                min_temp_hou.push(rows[i].actual_min_temp);
                            }

                            if (rows[i].name == "Indianapolis") {
                                max_temp_ind.push(rows[i].actual_max_temp);
                                min_temp_ind.push(rows[i].actual_min_temp);
                            }

                            if (rows[i].name == "Jacksonville") {
                                max_temp_jax.push(rows[i].actual_max_temp);
                                min_temp_jax.push(rows[i].actual_min_temp);
                            }

                            if (rows[i].name == "Chicago") {
                                max_temp_mdw.push(rows[i].actual_max_temp);
                                min_temp_mdw.push(rows[i].actual_min_temp);
                            }

                            if (rows[i].name == "Seattle") {
                                max_temp_sea.push(rows[i].actual_max_temp);
                                min_temp_sea.push(rows[i].actual_min_temp);
                            }

                            if (rows[i].name == "New York") {
                                max_temp_nyc.push(rows[i].actual_max_temp);
                                min_temp_nyc.push(rows[i].actual_min_temp);
                            }

                            if (rows[i].name == "Phoenix") {
                                max_temp_phx.push(rows[i].actual_max_temp);
                                min_temp_phx.push(rows[i].actual_min_temp);
                            }

                            if (rows[i].name == "Philadelphia") {
                                max_temp_phl.push(rows[i].actual_max_temp);
                                min_temp_phl.push(rows[i].actual_min_temp);
                            }
                        }
                        response = response.replace("%%NEXT%%", "/general/average");
                        response = response.replace("%%PREV%%", "/general/record");
                    }

                    if (req.params.stat_type == "average") {
                        for (i = 0; i < rows.length; i++) {
                            city_table = city_table + "<tr><td>" + rows[i].name + "</td>";
                            city_table = city_table + "<td>" + rows[i].date + "</td>";
                            city_table =
                                city_table + "<td>" + rows[i].actual_mean_temp + "</td>";
                            city_table =
                                city_table + "<td>" + rows[i].average_max_temp + "</td>";
                            city_table =
                                city_table + "<td>" + rows[i].average_min_temp + "</td>";
                            city_table =
                                city_table +
                                "<td>" +
                                rows[i].average_precipitation +
                                "</td></tr>";

                            if (rows[i].name == "Charlotte") {
                                max_temp_clt.push(rows[i].average_max_temp);
                                min_temp_clt.push(rows[i].average_min_temp);
                            }

                            if (rows[i].name == "Los Angeles") {
                                max_temp_cqt.push(rows[i].average_max_temp);
                                min_temp_cqt.push(rows[i].average_min_temp);
                            }

                            if (rows[i].name == "Houston") {
                                max_temp_hou.push(rows[i].average_max_temp);
                                min_temp_hou.push(rows[i].average_min_temp);
                            }

                            if (rows[i].name == "Indianapolis") {
                                max_temp_ind.push(rows[i].average_max_temp);
                                min_temp_ind.push(rows[i].average_min_temp);
                            }

                            if (rows[i].name == "Jacksonville") {
                                max_temp_jax.push(rows[i].average_max_temp);
                                min_temp_jax.push(rows[i].average_min_temp);
                            }

                            if (rows[i].name == "Chicago") {
                                max_temp_mdw.push(rows[i].average_max_temp);
                                min_temp_mdw.push(rows[i].average_min_temp);
                            }

                            if (rows[i].name == "Seattle") {
                                max_temp_sea.push(rows[i].average_max_temp);
                                min_temp_sea.push(rows[i].average_min_temp);
                            }

                            if (rows[i].name == "New York") {
                                max_temp_nyc.push(rows[i].average_max_temp);
                                min_temp_nyc.push(rows[i].average_min_temp);
                            }

                            if (rows[i].name == "Phoenix") {
                                max_temp_phx.push(rows[i].average_max_temp);
                                min_temp_phx.push(rows[i].average_min_temp);
                            }

                            if (rows[i].name == "Philadelphia") {
                                max_temp_phl.push(rows[i].average_max_temp);
                                min_temp_phl.push(rows[i].average_min_temp);
                            }
                        }

                        response = response.replace("%%NEXT%%", "/general/record");
                        response = response.replace("%%PREV%%", "/general/actual");
                    }

                    if (req.params.stat_type == "record") {
                        for (i = 0; i < rows.length; i++) {
                            city_table = city_table + "<tr><td>" + rows[i].name + "</td>";
                            city_table = city_table + "<td>" + rows[i].date + "</td>";
                            city_table =
                                city_table + "<td>" + rows[i].actual_mean_temp + "</td>";
                            city_table =
                                city_table + "<td>" + rows[i].record_max_temp + "</td>";
                            city_table =
                                city_table + "<td>" + rows[i].record_min_temp + "</td>";
                            city_table =
                                city_table + "<td>" + rows[i].record_precipitation + "</td></tr>";

                            if (rows[i].name == "Charlotte") {
                                max_temp_clt.push(rows[i].record_max_temp);
                                min_temp_clt.push(rows[i].record_min_temp);
                            }

                            if (rows[i].name == "Los Angeles") {
                                max_temp_cqt.push(rows[i].record_max_temp);
                                min_temp_cqt.push(rows[i].record_min_temp);
                            }

                            if (rows[i].name == "Houston") {
                                max_temp_hou.push(rows[i].record_max_temp);
                                min_temp_hou.push(rows[i].record_min_temp);
                            }

                            if (rows[i].name == "Indianapolis") {
                                max_temp_ind.push(rows[i].record_max_temp);
                                min_temp_ind.push(rows[i].record_min_temp);
                            }

                            if (rows[i].name == "Jacksonville") {
                                max_temp_jax.push(rows[i].record_max_temp);
                                min_temp_jax.push(rows[i].record_min_temp);
                            }

                            if (rows[i].name == "Chicago") {
                                max_temp_mdw.push(rows[i].record_max_temp);
                                min_temp_mdw.push(rows[i].record_min_temp);
                            }

                            if (rows[i].name == "Seattle") {
                                max_temp_sea.push(rows[i].record_max_temp);
                                min_temp_sea.push(rows[i].record_min_temp);
                            }

                            if (rows[i].name == "New York") {
                                max_temp_nyc.push(rows[i].record_max_temp);
                                min_temp_nyc.push(rows[i].record_min_temp);
                            }

                            if (rows[i].name == "Phoenix") {
                                max_temp_phx.push(rows[i].record_max_temp);
                                min_temp_phx.push(rows[i].record_min_temp);
                            }

                            if (rows[i].name == "Philadelphia") {
                                max_temp_phl.push(rows[i].record_max_temp);
                                min_temp_phl.push(rows[i].record_min_temp);
                            }
                        }

                        response = response.replace("%%NEXT%%", "/general/actual");
                        response = response.replace("%%PREV%%", "/general/average");
                    }

                    response = response.replace("%%CITY_WEATHER_INFO%%", city_table);
                    response = response.replace("%%STAT_TYPE%%", req.params.stat_type);

                    // Replace Actual Max
                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + max_temp_phx[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MAX_TEMP_PHX%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + max_temp_phl[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MAX_TEMP_PHL%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + max_temp_clt[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MAX_TEMP_CLT%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + max_temp_cqt[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MAX_TEMP_CQT%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + max_temp_hou[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MAX_TEMP_HOU%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + max_temp_ind[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MAX_TEMP_IND%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + max_temp_jax[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MAX_TEMP_JAX%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + max_temp_mdw[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MAX_TEMP_MDW%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + max_temp_nyc[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MAX_TEMP_NYC%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + max_temp_sea[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MAX_TEMP_SEA%%",
                        "[" + replace_string + "]"
                    );

                    // Replace Actual Min
                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + min_temp_phx[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MIN_TEMP_PHX%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + min_temp_phl[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MIN_TEMP_PHL%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + min_temp_clt[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MIN_TEMP_CLT%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + min_temp_cqt[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MIN_TEMP_CQT%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + min_temp_hou[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MIN_TEMP_HOU%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + min_temp_ind[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MIN_TEMP_IND%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + min_temp_jax[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MIN_TEMP_JAX%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + min_temp_mdw[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MIN_TEMP_MDW%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + min_temp_nyc[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MIN_TEMP_NYC%%",
                        "[" + replace_string + "]"
                    );

                    replace_string = "";
                    for (i = 0; i < 12; i++) {
                        replace_string = replace_string + min_temp_sea[i];
                        if (i < 11) {
                            replace_string = replace_string + ",";
                        }
                    }
                    response = response.replace(
                        "%%MIN_TEMP_SEA%%",
                        "[" + replace_string + "]"
                    );

                    res.status(200).type("html").send(response);
                }
            });
        }
    );
});

app.listen(port, () => {
    console.log("Now listening on port " + port);
});
