var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var fs = require('fs');
const { PDFDocument, PDFName, PDFString, PDFNumber, PDFBool } = require( 'pdf-lib' );
const csv = require('fast-csv');

var savedDataPath = __dirname+'\\generated\\database\\data.csv';

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


/** PAGE MANAGER */
app.use(express.static('assets'));

//load UI
app.get('/registration', function(req, res){
	res.sendFile(__dirname + '/customerregistration.html');
});

//save new customer
app.post('/submit', function(req, res) {
	console.log('POST /submit', req.body);
	var inputData = req.body[0];

	try{

		if(!inputData.name || !inputData.surname){
			throw new error("Malformed input");
		}

		//open saved data
		var savedData = [];
		fs.createReadStream(savedDataPath)
			.pipe(csv.parse({ headers: true }))
			.on('error', (error) => console.error(error))
			.on('data', (row) => savedData.push(row))
			.on('end', function(rowCount){ 
				console.log(`Parsed ${rowCount} rows`);
				console.log("LOADED DATA", savedData);

				//verify if saved data contains new data
				var contains = false;
				for(var i = 0; i<savedData.length; i++ ){

					if(savedData[i].name.toLowerCase() === inputData.name.toLowerCase() && savedData[i].surname.toLowerCase() === inputData.surname.toLowerCase()){
						contains = true;
						break;
					}
				}

				if(!contains){
					savedData.push(inputData);
					console.log("pushed", savedData);

					var ws = fs.createWriteStream(savedDataPath);
					csv
					  .write(savedData, { headers: true })
					  .pipe(ws)
					  .on('error', (error) => console.error(error))
					  .on('end', () => console.error("End Write " + savedData.length + " records"));
				}



				console.log("END DATA", savedData);

				
			});
		

		/***********************************************/
		const fillForm = async ( inFileName, data, outFileName ) => {
			const pdfDoc = await PDFDocument.load( fs.readFileSync( inFileName ) );

			const form = pdfDoc.context.lookup( pdfDoc.catalog.get( PDFName.of( 'AcroForm' )));
			if ( !form ) {
				throw new Error( 'PDF does not contain a form' );
			}

			form.set( PDFName.of( 'NeedAppearances' ), PDFBool.True );

			const fieldRefs = form.context.lookup( form.get( PDFName.of( 'Fields' )));
			if ( !fieldRefs ) {
				throw new Error( 'PDF form does not contain any fields' );
			}

			const fields = fieldRefs.array.map( ref => form.context.lookup( ref ));

			fields.forEach( field => {
				const name = field.get( PDFName.of( 'T' ));
				if ( name ) {
					const newValue = data[ name.value ];
					if ( newValue ) {
						field.set( PDFName.of( 'V' ), PDFString.of( newValue ));
						field.set( PDFName.of( 'Ff' ), PDFNumber.of( 1 ));
					}
				}
			});

			await fs.writeFileSync( outFileName, await pdfDoc.save());	

			var filePath = __dirname + '\\' + filename;
			console.log("path", filePath);
			var stat = fs.statSync(filePath);
			
			res.writeHead(200, {
		        'Content-Type': 'application/pdf',
		        'Content-Length': stat.size,
		        'Content-disposition': 'attachment; filename='+req.body.name+'_registration.pdf',
		        'Content-Transfer-Encoding': 'binary',
		        'Cache-Control': 'must-revalidate',
		        'Pragma': 'public'
		    });

		    
		    fs.createReadStream(filePath)
		    	.setEncoding("utf8")
		    	.pipe(res);
		}

		var filename = 'generated\\'+req.body.name+'_registration.pdf';
		fillForm( 'template_reg.pdf', req.body[0],  filename);


		/***********************************************/


	} catch(err){
		console.log("OUT ERR", err);
	}
	console.log("END");
});

//load customers data
app.get('/customers', function(req, res){
	console.log('GET /customers');
	try{

		//open saved data
		var savedData = [];
		fs.createReadStream(savedDataPath)
			.pipe(csv.parse({ headers: true }))
			.on('error', (error) => console.error(error))
			.on('data', (row) => savedData.push(row))
			.on('end', function(rowCount){
				console.log("Loaded " + savedData.length + " rows");

				res.writeHead(200, {
			        'Content-Type': 'application/json',
			    });

				res.end(JSON.stringify(savedData));
			})

	} catch(err){
		console.log("OUT ERR", err);
	}
});

http.listen(8080, function(){
	console.log('listening on *:8080');

	console.log(" ");
	console.log("Start Chromium");

});