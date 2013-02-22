var manifest = {
			"manifest": {
				"expiration": "2020-01-01T00:00:00Z",
				"conditions": [ 
					{"bucket": "uploads.lesfeuxverts.com"},
					["starts-with", "$key", ""],
					{"acl": "public-read"},
					["starts-with", "$Content-Type", ""],
					["content-length-range", 0, 20000000]
				]
			},
			"manifest_encoded": "eyJjb25kaXRpb25zIjogW3siYnVja2V0IjogInVwbG9hZHMubGVzZmV1eHZlcnRzLmNvbSJ9LCBbInN0YXJ0cy13aXRoIiwgIiRrZXkiLCAiIl0sIHsiYWNsIjogInB1YmxpYy1yZWFkIn0sIFsic3RhcnRzLXdpdGgiLCAiJENvbnRlbnQtVHlwZSIsICIiXSwgWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsIDAsIDIwMDAwMDAwXV0sICJleHBpcmF0aW9uIjogIjIwMjAtMDEtMDFUMDA6MDA6MDBaIn0=",
			"signature": "eLi39RSGMtupXieJxcTzLceCHSY=",
			"AWS_access_key_ID": "AKIAINBYKLKXBMF7YXHA"
		};

var secret = manifest.AWS_access_key_ID;
var policy = manifest.manifest_encoded;
var signature = manifest.signature;

var UPLOAD_LINK = "http://uploads.lesfeuxverts.com.s3.amazonaws.com/";

var file;

function fileSelected()
{
	var tmp_file = document.getElementById('file').files[0];

	var extensionsok = ".gif,.jpg,.jpeg,.png"; // extensions acceptées
	var valeur = tmp_file.name.toLowerCase(); // en minuscule
	var chainearray = valeur.split('.');
	var chaineext = chainearray[chainearray.length-1]; // extension du fichier
	if(extensionsok.indexOf(chaineext)==-1) { // extension PAS ok
		alert('Erreur : ce fichier n\'est pas valide !\n\nExtensions acceptées : ' + extensionsok);
	}
	else
	{
		file = document.getElementById('file').files[0];
	}
	
}

function rand(length,current){
 	current = current ? current : '';
 	return length ? rand( --length , "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".charAt( Math.floor( Math.random() * 60 ) ) + current ) : current;
}

function uploadFile()
	{
	    var fd = new FormData();

	    if(file == undefined)
	    {
	    	alert('Aucun fichier choisi');
	    	return;
	    }

	    var xhr = new XMLHttpRequest();

	    var randomName = rand(16);
	    var filename = file.name;

	    filename = filename.split('.');
		var extension = filename[filename.length-1]; // extension du fichier

		filename = randomName+"."+extension;

	    fd.append('key', filename);
	    fd.append('Content-Type',file.type);
	    fd.append('acl', 'public-read');     
	    fd.append('AWSAccessKeyId', secret);
	    fd.append('policy', policy)
	    fd.append('signature',signature);
	    fd.append('file',file,filename);
		
		xhr.open('POST', UPLOAD_LINK, true); //MUST BE LAST LINE BEFORE YOU SEND 

		xhr.send(fd);



    	xhr.onreadystatechange = function() {
    		console.log(xhr.readyState);
		    if(xhr.readyState == 4)
		    {
		    	var media_url = UPLOAD_LINK+encodeURIComponent(filename);
		    	$('#progressNumber').before('<img src="'+media_url+'">');
		    }
		}

	}

	function uploadProgress(evt) {
    	if (evt.lengthComputable) {
      		var percentComplete = Math.round(evt.loaded * 100 / evt.total);
      		document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
    	}
    	else {
      		document.getElementById('progressNumber').innerHTML = 'unable to compute';
    	}
  	}
	
	function uploadFailed(evt) {
		alert("There was an error attempting to upload the file." + evt);
	}

	function uploadCanceled(evt) {
	  	//alert("The upload has been canceled by the user or the browser dropped the connection.");
	}