
function getTablesCollectionAsArray() {
	var tableSet = Tables.find({});
	var tables = [];
	tableSet.forEach((table) => {
		tables.push({
			seats:table["seats"],
			table:table["table"],
			students:[]
		});
	});
	return tables;
}

function getStudentsCollectionAsArray() {
	var studentSet = Students.find({});
	var students = [];
	studentSet.forEach((student) => {
		students.push({
			name:student["name"],
			company:student["company"],
			studentsSatWith:[]
		});
	});
	return students;
}

function calculateFamiliarity(table, student) {
	var familiarity = 0;
	for (i = 0; i < table["students"].length; i++) {
		for (j = 0; j < student["studentsSatWith"].length; j++) {
			if (table["students"][i]["name"] == student["studentsSatWith"][j]["name"]) {
				familiarity += 1;
			}
			if (table["students"][i]["company"] == student["company"]) {
				familiarity += 1;
			}
		}
	}
	return familiarity;
}

function copyArrayOfTables(tables) {
	var copy = [];
	tables.forEach((table) => {
		copy.push({
			seats:table["seats"],
			table:table["table"],
			students:table["students"].slice()
		});
	});
	return copy;
}

function randomIndices(length) {
	var i = 0;
	var originalIndices = [];
	for (i = 0; i < length; i++) {
		originalIndices.push(i);
	}
	var indices = [];
	while (originalIndices.length > 0) {
		var index = Math.floor(Math.random() * originalIndices.length);
		indices.push(originalIndices[index]);
		originalIndices.splice(index, 1);
	}
	return indices;
}

export function calculateSeatingArrangementsForArrays(numberOfDays, originalTables, students) {
	var tablesArray = [];
	var i = 0;
	var tables = [];
	for (i = 0; i < numberOfDays; i++) {
		var newTables = copyArrayOfTables(originalTables);
		tables = [];
		tables = copyArrayOfTables(newTables);
		var k = 0;
		var indices = randomIndices(students.length);
		var loopK = 0;
		//for (k = 0; k < students.length; k++) {
		for (loopK = 0; loopK < indices.length; loopK++) {
			k = indices[loopK];
			//Familiarity is set to a million because that is a reasonable upper bound.
			//It needs to be higher than the highest possible REAL familiarity.
			var leastFamiliarity  = 1000000;
			var currentTableIndex = 0;
			var j = 0;
			for (j = 0; j < tables.length; j++) {
				if (tables[j]["students"].length < tables[j]["seats"]) {
					const currentFamiliarity = calculateFamiliarity(tables[j], students[k]);
					if (currentFamiliarity < leastFamiliarity) {
						//console.log("(" + i + ", " + k + ", " + j + ") = " + leastFamiliarity + " > " + currentFamiliarity);
						currentTableIndex = j;
						leastFamiliarity = currentFamiliarity;
					}
				}
			}
			
			for (j = 0; j < tables[currentTableIndex]["students"].length; j++) {
				students[k]["studentsSatWith"].push(tables[currentTableIndex]["students"][j]);
				tables[currentTableIndex]["students"][j]["studentsSatWith"].push(students[k]);
				tables[currentTableIndex]["students"][j].familiarity += leastFamiliarity;
				var foundStudent = students.find(function(student, index, array) {
					return student["name"] == tables[currentTableIndex]["students"][j]["name"];
				});
				foundStudent.studentsSatWith.push(students[k]);
			}
			var lengths = students.map((s) => { return s["studentsSatWith"].length; });
			tables[currentTableIndex]["students"].push({
				name:students[k].name,
				company:students[k].company,
				familiarity:leastFamiliarity,
				studentsSatWith:students[k]["studentsSatWith"].slice()
			});
		}
		//console.log(tables.map((t) => { return t["students"].map((s) => { return s["name"]; }); }));
		tablesArray.push({array:tables});
	}
	return tablesArray;
}
/*
export function calculateSeatingArrangements(numberOfDays) {
	var tables = getTablesCollectionAsArray();
	var students = getStudentsCollectionAsArray();
	return calculateSeatingArrangementsForArrays(numberOfDays, tables, students);
}
*/