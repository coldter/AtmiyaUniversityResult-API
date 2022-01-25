const enrollBox = document.querySelector('#enrollmentNo');
const submitButton = document.querySelector('#submit');
const spanAlert = document.querySelector('#span');
const tableResult = document.querySelector('#tbody');
const table = document.querySelector('#table');
const loader0 = document.querySelector("#loading0");
const loader1 = document.querySelector("#loading1");
const avatar = document.querySelector('.avatar');
const hiName = document.querySelector('#hiName')
const imgBlock = document.querySelector('#imgBlock');

const apiURL = 'https://api.atmiya.ga/?u=';
const photoURL = 'https://exam.atmiyauni.ac.in/Images/Photo/';

let DETAILS;

//functions
function clearInBox() {
	enrollBox.value = '';
}

function clearDisplay() {
	spanAlert.style.display = 'none';
	table.style.display = 'none';
	imgBlock.style.display = 'none'
}

function displayLoading1() {
	loader1.style.display = 'block';
	imgBlock.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
	setTimeout(() => {
		loader1.style.display = 'none';
	}, 15000);
}

function hideLoading1() {
	loader1.style.display = 'none';
}

function displayLoading0() {
	loader0.style.display = 'block';
	setTimeout(() => {
		loader0.style.display = 'none';
	}, 15000);
}

function hideLoading0() {
	loader0.style.display = 'none';
}

function getStudentDetails() {
	let body = {enrollement_no: enrollBox.value};
	
	displayLoading0();

	return fetch(`${apiURL}1`,{
		method: 'POST',
		body: new URLSearchParams(body),
		headers: new Headers({
			'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
		})
	})
	.then(resp => {
		hideLoading0();
		return resp.json();	
	})
	.catch(error => {
		console.log(error);
		sAlert('Something went worng try again after some time...');
		hideLoading0();
	});
}

function resultDownload(index) {
	let body = {
		Collegeid: DETAILS[index].swd_college_id,
		Yearid: DETAILS[index].year_id,
		Semid: DETAILS[index].sem_id,
		Exam_id: DETAILS[index].exam_id,
		stud_id: DETAILS[index].student_id
	};

	displayLoading1();
	
	fetch(`${apiURL}2`,{
		method: 'POST',
		body: new URLSearchParams(body),
		headers: new Headers({
			'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
		})
	})
	
	.then(resp => resp.json())
	
	.then(resp => {
		generatePDF(resp.base64string, `${DETAILS[index].programname}.pdf`)
		hideLoading1();
	})

	.catch(error => {
		console.log(error);
		sAlert('Something went worng try again after some time...');
	})
}

function generatePDF(data, fileName) {
	const linkSource = `data:application/pdf;base64,${data}`;
	const link = document.createElement('a');

	link.href = linkSource;
	link.download = fileName;
	link.click();
}

function isObjEmpty(obj) {
	return Object.keys(obj).length === 0;
}

function sAlert (alert) {
	spanAlert.style.display = 'block';
	spanAlert.innerHTML = alert;
}

function putPhoto(uri, nm) {
	imgBlock.style.display = 'block';

	avatar.style.backgroundImage = `url('${photoURL}${uri}')`;
	hiName.innerHTML = nm;
}

function putTable(details) {
	table.style.display = 'block';
	let output = '';

	details.forEach((detail,i) => {
		output += `<tr>
		<td>${detail.programname}</td>
		<td>${detail.year_name}</td>
		<td><button class="download" onclick="resultDownload(${i})"><i class="icon ion-ios-cloud-download-outline" style="font-size: 2em;"></i></button></td>
	</tr>`
	});

	tableResult.innerHTML = output;
	imgBlock.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
}

function tirmName(nm) {
	nm = nm.toLowerCase().split(" ");
	nm = nm[1].charAt(0).toUpperCase() + nm[1].slice(1);

	return nm.replace(/bhai/g, '').replace(/ben/g, '').replace(/baa/g, '');
}

//Events

enrollBox.addEventListener('keyup', (e) => {
	if(e.keyCode === 13) {
		e.preventDefault();

		submitButton.click();
	}
});

submitButton.addEventListener('click', () => {
	clearDisplay();
	
	if(enrollBox.value.length !== 0) {
		
		getStudentDetails()

			.then(details => {
			if(!isObjEmpty(details)) {
					DETAILS = details;
					
					putPhoto(details[0].Student_Photo, tirmName(details[0].name));
					putTable(details);
				}
        else {
				sAlert('Invalid entry please check the entered enrollment');
			}
		})
		
		.catch(error => {
			console.log(error);
			sAlert('Something went worng try again after some time...');
		})
		
		.then(() =>
			{
				clearInBox();
			}
		);
	}
	else {
		sAlert('Enrollment can\'t be empty and Enrollment must be a number...');
		clearInBox();
	}
});