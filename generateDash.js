addEventListener('DOMContentLoaded', init);
var team = "Digby";
var segments = [{
    code: "Low",
    name: "low"
}, {
    code: "Trad",
    name: "traditional"
}, {
    code: "High",
    name: "high"
}, {
    code: "Pfm",
    name: "performance"
}, {
    code: "Size",
    name: "size"
}];

function newScreen(divId, divContent, prevDiv, parentDiv) {
    var divId = divId ? divId : "newScreen";

    // hide table sitting in 
    var divs = document.getElementsByTagName("div");
    var tableDiv = document.getElementById("tableDiv");
    var prevDiv = prevDiv ? prevDiv : tableDiv;
    //tableDiv.style.visibility = "hidden";

    // create new div with ID divID
    var newDiv = document.createElement("div");
    newDiv.style.height = "auto";
    newDiv.id = divId;
		if(parentDiv)
	    parentDiv.insertBefore(newDiv, prevDiv);
		else
	    document.body.insertBefore(newDiv, prevDiv);

    // popualate div if divContent is defined
    if (divContent)
        newDiv.innerHTML = divContent;
    return newDiv;
}

// called on DOMContentLoaded, this function prepares the setting
function init() {

    // at the beginning there is only one main div, assign this the id 'TableDiv'
    var tableDiv = document.getElementsByTagName('div')[0];
    tableDiv.id = 'tableDiv';
		tableDiv.style.visibility = 'hidden';

    // this populates launchDiv with a button to generate prod reports for a team
    var menuString = '<div id="menu" class="main-menu"><div class="main-input"> <input type="text" placeholder="Team" id="teamInput"><button id="enterTeam">Enter Team </button></div></div>';
    newScreen("launcher", menuString, tableDiv);
		
		document.getElementById('launcher').style.width = '100%';
    var enterTeam = document.getElementById("enterTeam");
    enterTeam.addEventListener("click", function() {
        var teamValue = document.getElementById("teamInput").value;
        forecastProduction(teamValue);
    });
}

function getData() {

    var tables = document.getElementsByTagName('table');

    // recorded table tableIndices
    var tableIndices = [{
        "id": 19,
        "name": "FinStats"
    }, {
        "id": 28,
        "name": "StocksBonds"
    }, {
        "id": 32,
        "name": "BondSumm"
    }, {
        "id": 33,
        "name": "PrimeRate"
    }, {
        "id": 40,
        "name": "CFS"
    }, {
        "id": 42,
        "name": "CFS"
    }, {
        "id": 44,
        "name": "IncStmt"
    }, {
        "id": 53,
        "name": "Production"
    }, {
        "id": 61,
        "name": "TradSegStats"
    }, {
        "id": 62,
        "name": "TradSegGrow"
    }, {
        "id": 64,
        "name": "TradSegCrit"
    }, {
        "id": 68,
        "name": "TradSegProds"
    }, {
        "id": 76,
        "name": "LowSegStats"
    }, {
        "id": 77,
        "name": "LowSegGrow"
    }, {
        "id": 79,
        "name": "LowSegCrit"
    }, {
        "id": 83,
        "name": "LowSegProds"
    }, {
        "id": 91,
        "name": "HighSegStats"
    }, {
        "id": 92,
        "name": "HighSegGrow"
    }, {
        "id": 94,
        "name": "HighSegCrit"
    }, {
        "id": 98,
        "name": "HighSegProds"
    }, {
        "id": 106,
        "name": "PfmSegStats"
    }, {
        "id": 107,
        "name": "PfmSegGrow"
    }, {
        "id": 109,
        "name": "PfmSegCrit"
    }, {
        "id": 113,
        "name": "PfmSegProds"
    }, {
        "id": 121,
        "name": "SizeSegStats"
    }, {
        "id": 122,
        "name": "SizeSegGrow"
    }, {
        "id": 124,
        "name": "SizeSegCrit"
    }, {
        "id": 128,
        "name": "SizeSegProds"
    }, {
        "id": 137,
        "name": "MktShare"
    }, {
        "id": 139,
        "name": "PotShare"
    }, {
        "id": 149,
        "name": "APercMap"
    }, {
        "id": 151,
        "name": "BPercMap"
    }, {
        "id": 153,
        "name": "CPercMap"
    }, {
        "id": 155,
        "name": "DPercMap"
    }, {
        "id": 157,
        "name": "EPercMap"
    }, {
        "id": 159,
        "name": "FPercMap"
    }, {
        "id": 167,
        "name": "HRSumm"
    }, {
        "id": 170,
        "name": "TQMSumm"
    }];

    var tableData = [];

    // table iterator
    function applyAll(ref) {
        for (i = 0; i < tables.length; i++) {
            ref(tables[i]);
        }
    }


    // removes content in HTML tags (used when filtering innerHTML values)
    function clearMarkup(string) {
        var patt = /<[^>]*>/g;
        string = string.replace(patt, '');
        patt = /&.+;/;
        string = string.replace(patt, '');
        return string;
    }

    // formats strings to be camelCase for keys in key-value pairs		
    function formatHeader(string) {
        string = clearMarkup(string);
        string = string.replace(/\s/g, '');
        return string;
    }

    // strips currency string formatting (dollar signs, commas, and parentheses)
    // converts all currency strings to doubles
    function convertCurrency(string) {
        string = string.replace(/\$/g, '');
        string = string.replace(/\,/i, '');

        // finds strings that have an open parenthesis
        // these would be negative values on financial statements
        if (string.match(/\(/) && string.match(/\)/)) {
            string = string.replace(/\(/, '');
            string = string.replace(/\)/, '');
            string = parseFloat(string);
            string = 0 - string;
        } else {
            string = parseFloat(string);
        }
        return string;
    }

    // strips percentage sign after percentage data and divides by 100
    function convertPercentage(string) {
        string.replace('%', '');
        string = parseFloat(string);
        string /= 100;
        return string;
    }

    // strips percentage sign after percentage data and divides by 100
    function convertNumber(string) {
        string = string.replace(',', '');
        string = parseFloat(string);
        return string;
    }

    // fixes segment statistics table from having undefined keys with
    // defined values
    function fixSegStats(object) {
        var newObj = new Object();
        newObj["totalDemand"] = object[0].slot1;
        newObj["actualDemand"] = object[1].slot1;
        newObj["segPctInd"] = object[2].slot1;
        return newObj;
    }

    // fixes segment products table and makes the product name the key
    function fixSegProds(object) {
        var newObj = new Object();
        for (i in object)
            newObj[object[i].Name] = object[i];
        return newObj;
    }

    // fixes segment statistics table from having undefined keys with
    // defined values
    function fixSegCrit(object) {
        var newObj = new Object();
        for (i = 0; i < object.length; i++) {
            if (i > 1) {
                var criteria = '';
                var o = object[i];
                if (o.slot1.match(/Position/i))
                    criteria = 'pos';
                else if (o.slot1.match(/Age/i))
                    criteria = 'age';
                else if (o.slot1.match(/Price/i))
                    criteria = 'price';
                else
                    criteria = 'mtbf';
                newObj[criteria] = {
                    position: i,
                    expectation: o.slot2,
                    importance: o.slot3
                };
            }
        }
        return newObj;
    }


    // converts table to JSON
    function tableToJson(table) {
        var data = [];
        var headers = [];
        var prevKey = '';

        /*
         * if the table is a Segment Growth Rate Table, return the
         * second cell in the first row of the table (the growth
         * rate cell)
         */
        if (table.rows[0].cells[0].innerHTML.match(/Segment\ Growth\ Rate/))
            return convertPercentage(table.rows[0].cells[1].innerHTML.trim());

        for (var i = 0; i < table.rows[0].cells.length; i++) {
            var headerVal = formatHeader(table.rows[0].cells[i].innerHTML);
            headerVal = headerVal.replace(/(-|\.)/g, '');
            if (headerVal == "&nbsp;") headerVal = prevKey;
            headers[i] = clearMarkup(headerVal);
            prevKey = headers[i];
        }

        if (table.rows[0].cells[0].innerHTML.match(/Customer\ Buying\ Criteria/)) {
            var i = 2;
        }

        // go through cells
        for (i ? i = 1 : i; i < table.rows.length; i++) {
            var tableRow = table.rows[i];
            var rowData = {};
            for (j = 0; j < tableRow.cells.length; j++) {
                var cellData = clearMarkup(tableRow.cells[j].innerHTML);
                if (cellData) {
                    if (!(cellData === "&nbsp;")) {
                        cellData = cellData.trim();

                        /*
                         * for rows with more cells than corresponding headers
                         * this prevents rowData[undefined] from being overwritten
                         * by each value after headers[] is emptied
                         */
                        key = headers[j] ? headers[j] : "slot" + j;
                        if (j == 0) {
                            cellDataKey = formatHeader(cellData);
                        }

                        // formats cellData appropriately
                        if (cellData.match(/^.*\$.*\s*$/))
                            cellData = convertCurrency(cellData);
                        else if (cellData.match(/^.*\%\s*$/))
                            cellData = convertPercentage(cellData);
                        else if (cellData.match(/^\s*[0-9]+,[0-9]+.*$/))
                            cellData = convertNumber(cellData);
                        else if (cellData.match(/^[0-9]+(\.*[0-9]+)*$/))
                            cellData = parseFloat(cellData);
                        rowData[key] = cellData;
                    }
                }
            }
            data.push(rowData);
        }
        return data;
    }

    /*
     * populates tableData with an object with properties stating the name of
     * the data table and listing the actual table data objects generated by the
     * tableToJson function
     */
    function processTables() {
        for (var i = 0; i < tableIndices.length; i++) {
            var item = tableIndices[i];
            var tableDatum = new Object();
            tableData[item.name] = tableToJson(tables[item.id]);
            if (item.name.match(/SegStats/))
                tableData[item.name] = fixSegStats(tableData[item.name]);
            else if (item.name.match(/SegCrit/))
                tableData[item.name] = fixSegCrit(tableData[item.name]);
            else if (item.name.match(/SegProds/))
                tableData[item.name] = fixSegProds(tableData[item.name]);
        }
    }

    processTables();
    console.log(tableData);
    return tableData;
}

// TODO: make sure we need the low, high parameters
function forecastProduction(team, low, high) {
    team = team ? team : "Digby";
		var modCode = "Prod";
    var x = getData();
    var teamCode = team.substring(0, 1);
    var segObjects = new Object();
    for (i in segments) {
        var segment = segments[i];
				function variables() {
						segCode = segment.code;
            segName = segment.name;
            growthKey = segCode + "SegGrow";
            growthRate = x[growthKey];
            statsKey = segCode + "SegStats";
            stats = x[statsKey];
            segDemand = stats.actualDemand;
            prodsKey = segCode + "SegProds";
            products = x[prodsKey];
            marketShareKey = "MarketShare";
            marketShareReference = 0;
            var product;
                for (i in products) {
										// replace condition check with a check for teamCode
                    if (i.substring(0, 1) === teamCode) {
                        var productHolder = products[i];
                        if (productHolder[marketShareKey] > marketShareReference) {
                            marketShareReference = productHolder[marketShareKey];
                            product = productHolder;
                        }
                    }
                }
						if(!product) return null;
						marketShare = product[marketShareKey];
            name = product['Name'];
						years = 1;
						lowEst = 1000;
						midEst = 1200;
						highEst = 1400;
						capacity = parseInt(midEst * marketShare / 2);
						capacityUse = 0;

            return {
                segCode, segName, growthRate, stats, segDemand, product, marketShare, name, years, capacity, capacityUse, lowEst, midEst, highEst
            };
        }

        function render() {
						if(variables())
							var vars = variables();
						else return null;
            var divId = 'div' + modCode + vars.segCode;
            var renderString = '';
            var nl = '\n';
            renderString += 
                '<table class="table-production">' + nl +
								'<thead> <tr> <td colspan="2"> <span id="' + vars.segCode + 'Name"></span> </td> <tr><thead>' + nl +
                '</td> </tr> </thead>' + nl +
                '<tbody>' + nl +
                '<tr><td>Segment</td><td><span id="' + vars.segCode + 'Segment"></span> </td></tr>' + nl +
                '<tr><td>Years in Future</td><td><span id="' + vars.segCode + 'Years"></span> </td></tr>' + nl +
                '<tr><td colspan="2"><input type="range" id="' + vars.segCode + 'YearSlider" value="' + vars.years + '" min="1" max="7"></td></tr>' + nl +
                '<tr><td>Market Share</td><td><input type="text" style="width:4em" id="' + vars.segCode + 'Market"></span> </td></tr>' + nl +
                '<tr><td colspan="2"><input type="range" id="' + vars.segCode + 'MarketSlider" value="'+ (vars.marketShare * 100) + '"></td></tr>' + nl +
                '<tr><td>Low Estimate</td><td><span id="' + vars.segCode + 'LowEst" class="text-low"></span> </td></tr>' + nl +
								'<tr><td>Mid Estimate</td><td><span id="' + vars.segCode + 'MidEst" class="text-mid"></span> </td></tr>' + nl +
                '<tr><td>High Estimate</td><td><span id="' + vars.segCode + 'HighEst" class="text-high"></span> </td></tr>' + nl +
								'<tr><td colspan="2"><hr></hr></td></tr>' + nl +
                '<tr><td>Capacity</td><td><span id="' + vars.segCode + 'Cap"></span> </td></tr>' + nl +
                '<tr><td colspan="2"><input type="range" id="' + vars.segCode + 'CapSlider" value="' + vars.capacity+ '" min="100" max="8000"></td></tr>' + nl +
                '<tr><td>2nd Shift Usage (mid)</td><td><span id="' + vars.segCode + 'CapUse"></span> </td></tr>' + nl +
                '</tbody> </table>';

            newScreen(divId, renderString, document.getElementById('menu'), document.getElementById('launcher'));
        }
        render();

				function update(vars) {
            vars = vars?vars:variables();
						if(!vars) return null;
						var lowDiff = low?low:0.05;
						var highDiff = high?high:0.02;
						vars.lowEst = parseInt((1 + (vars.years * vars.growthRate)) * vars.segDemand * (vars.marketShare - lowDiff));
						vars.midEst = parseInt((1 + (vars.years * vars.growthRate)) * vars.segDemand * (vars.marketShare));
						vars.highEst = parseInt((1 + (vars.years * vars.growthRate)) * vars.segDemand * (vars.marketShare + highDiff));
						vars.capacityUse = vars.midEst / vars.capacity;	
						document.getElementById(vars.segCode + "Name").innerHTML = vars.name;
						document.getElementById(vars.segCode + "Segment").innerHTML = vars.segName;
						document.getElementById(vars.segCode + "Years").innerHTML = vars.years;
						document.getElementById(vars.segCode + "Market").value = (vars.marketShare * 100).toFixed(0);
						document.getElementById(vars.segCode + "MarketSlider").value = (vars.marketShare * 100).toFixed(0);
						document.getElementById(vars.segCode + "LowEst").innerHTML = vars.lowEst;
						document.getElementById(vars.segCode + "MidEst").innerHTML = vars.midEst;
						document.getElementById(vars.segCode + "HighEst").innerHTML = vars.highEst;
						document.getElementById(vars.segCode + "Cap").innerHTML = vars.capacity;
						document.getElementById(vars.segCode + "CapUse").innerHTML = ((vars.capacityUse - 1) * 100).toFixed(2) + '%';
        }
				update();

        function bind() {
          var vars = variables();
						if(!vars) return null;
					
					// takes MarketSlider value, converts to decimal, passes to vars, updates
					var ms = document.getElementById(vars.segCode + 'MarketSlider');
					ms.addEventListener('input',function() {
						document.getElementById(vars.segCode + 'Market').value = (ms.value );
						vars.marketShare = parseInt(document.getElementById(vars.segCode + 'Market').value.match(/[0-9]+/) );
						vars.marketShare /= 100;
						update(vars);
					});
					var msi = document.getElementById(vars.segCode + 'Market');
					msi.addEventListener('change',function() {
						document.getElementById(vars.segCode + 'Market').value = (msi.value );
						vars.marketShare = parseInt(document.getElementById(vars.segCode + 'Market').value.match(/[0-9]+/) );
						vars.marketShare /= 100;
						update(vars);
					});

					// takes YearSlider value, passes to vars, calls update
					var yrs = document.getElementById(vars.segCode + 'YearSlider');
					yrs.addEventListener('input',function() {
						document.getElementById(vars.segCode + 'Years').innerHTML = yrs.value; 
						vars.years = yrs.value;
						update(vars);
					});

					// takes CapSlider value, passes it to vars, calls update
					var cap = document.getElementById(vars.segCode + 'CapSlider');
					cap.addEventListener('input',function() {
						vars.capacity= cap.value; 
						vars.capacityUse = vars.midEst / vars.capacity;
						update(vars);
					});
        }
				bind();

    }
}

function forecastRnD(team) {
    team = team ? team : "Digby";
    var x = getData();
    var teamCode = team.substring(0, 1);
		var products = x[teamCode + 'PercMap'];
		console.log(products);
		var modCode = "RnD";
		var teamKey = teamCode + "PercMap";
    var segObjects = new Object();
    for (i in segments) {
        var segment = segments[i];
				
				function variables() {
						segCode = segment.code;
            segName = segment.name;
						name = products[i].Name;
						pfmn = products[i].Pfmn;
						size = products[i].Size;
						rev =	products[i].Revised;
            return {
                segCode, segName, pfmn, size, rev, name
            };
        }

        function render() {
						var vars = variables();
            var divId = 'div' + modCode;
            var renderString = '';
            var nl = '\n';
						
						/*
						 * Sorry this is such a mess. The idea was to not alter the DOM
						 * manually in any way before inserting the script. Data in these
						 * tables is supposed to be updated only. The values inserted here 
						 * are span and input IDs for the bind() and update()
						 * functions. Range type input fields do get an initial value
						 * to reflect the positions they should be at upon table render.
						 */
            renderString += 
                '<table class="table-production">' + nl +
								'<thead> <tr> <td colspan="2"> <span id="' + vars.segCode + 'Name"></span> </td> <tr><thead>' + nl +
                '</td> </tr> </thead>' + nl +
                '<tbody>' + nl +
                '<tr><td>Segment</td><td><span id="' + vars.segCode + 'Segment"></span> </td></tr>' + nl +
                '<tr><td>Performance</td><td><span id="' + vars.segCode + 'Pfmn"></span> </td></tr>' + nl +
                '<tr><td colspan="2"><input type="range" id="' + vars.segCode + 'PfmnSlider" value="' + vars.pfmn+ '" min="10" max="500"></td></tr>' + nl +
                '<tr><td>Size</td><td><span id="' + vars.segCode + 'Size"></span> </td></tr>' + nl +
                '<tr><td colspan="2"><input type="range" id="' + vars.segCode + 'SizeSlider" value="' + vars.pfmn+ '" min="10" max="500"></td></tr>' + nl +
                '<tr><td>Revision</td><td><span id="' + vars.segCode + 'Rev"></span> </td></tr>' + nl +
                '<tr><td colspan="2"><input type="range" id="' + vars.segCode + 'RevSlider" value="' + vars.pfmn+ '" min="1" max="25"></td></tr>' + nl +
                '</tbody> </table>';

            newScreen(divId, renderString, document.getElementById('menu'), document.getElementById('launcher'));
        }
        render();

				/*
				 * This function gets values from vars, which is passed along from
				 * function to function after it is created. It inserts the appropriate
				 * values into the table based on the IDs set in the table. This function
				 * is called after render and called each time an event fires in bind();
				 */
        function update(vars) {
            vars = vars?vars:variables();
						console.log(vars);
						document.getElementById(vars.segCode + 'Name').innerHTML = vars.name;
						document.getElementById(vars.segCode + 'Segment').innerHTML = vars.segName;
						document.getElementById(vars.segCode + 'Pfmn').innerHTML = vars.pfmn;
						document.getElementById(vars.segCode + 'Size').innerHTML = vars.size;
						document.getElementById(vars.segCode + 'Rev').innerHTML = vars.rev;
        }
				update();

				/* 
				 * This function creates event listeners to listen for changes in sliders
				 * (or whatever other inputs you want in the table). When changes occur
				 * it takes the values from the input and cleans them if necessary, then
				 * puts them in vars and sends vars on to update to update the table.
				 * To loosely put this in MVC terms, the table is the view, the event 
				 * listener sand update are the controller, and the model is vars, which 
				 * live snowhere.
				 */
        function bind() {
          var vars = variables();
					
					// for perofrmance slider
					// gets value of slider and updates vars.pfmn, then calls update()
					var ps = document.getElementById(vars.segCode + 'PfmnSlider');
					ps.addEventListener('input',function() {
						document.getElementById(vars.segCode + 'Pfmn').innerHTML = (ps.value);
						vars.pfmn = parseInt(document.getElementById(vars.segCode + 'Pfmn').innerHTML );
						vars.pfmn /= 10;
						console.log(vars.pfmn);
						update(vars);
					});

					// for size slider
					// gets value of slider and updates vars.size, then calls update()
					var ss = document.getElementById(vars.segCode + 'SizeSlider');
					ss.addEventListener('input',function() {
						document.getElementById(vars.segCode + 'Size').innerHTML = (ss.value);
						vars.size = (document.getElementById(vars.segCode + 'Size').innerHTML );
						vars.size /= 10;
						console.log(vars.size);
						update(vars);
					});

					// for revision slider
					// gets value of slider and updates vars.rev then calls update()
					var rs = document.getElementById(vars.segCode + 'RevSlider');
					rs.addEventListener('input',function() {
						document.getElementById(vars.segCode + 'Rev').innerHTML = (rs.value);
						vars.rev = parseInt(document.getElementById(vars.segCode + 'Pfmn').innerHTML );
						console.log(vars.rev);
						update(vars);
					});
        }
				bind();

    }
}
