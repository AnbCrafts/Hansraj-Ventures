export const formatDate = (dateString) => {
	const date = new Date(dateString);

	// Months array to get the month name
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	// Get the components of the date
	const year = date.getFullYear();
	const month = months[date.getMonth()];
	const day = date.getDate();
	let hours = date.getHours();
	const minutes = ("0" + date.getMinutes()).slice(-2);

	// Convert hours to 12-hour format and determine AM/PM
	const ampm = hours >= 12 ? "pm" : "am";
	hours = hours % 12;
	hours = hours ? hours : 12; // 12-hour clock

	// Construct the formatted date string
	const formattedDate = `${day} ${month} ${year}, ${hours}:${minutes}${ampm}`;

	return formattedDate;
};

export const formatDate2 = (dateString) => {
	const date = new Date(dateString);

	// Months array to get the month name
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	// Get the components of the date
	const year = date.getFullYear();
	const month = months[date.getMonth()];
	const day = date.getDate();
	let hours = date.getHours();
	const minutes = ("0" + date.getMinutes()).slice(-2);

	// Convert hours to 12-hour format and determine AM/PM
	const ampm = hours >= 12 ? "pm" : "am";
	hours = hours % 12;
	hours = hours ? hours : 12; // 12-hour clock

	// Construct the formatted date string
	const formattedDate = `${day} ${month} ${year}`;

	return formattedDate;
};

export const getWeekNumber = () => {
	const date = new Date();
	const year = date.getFullYear();

	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() + 4 - (date.getDay() || 7));

	const yearStart = new Date(date.getFullYear(), 0, 1);
	const weekNumber = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
	const weekString = year + "-W" + weekNumber;

	return weekString;
};

export const getWeekNumberToDate = (week) => {
	const [year, weekNumber] = week.split("-W");
	const januaryFirst = new Date(year, 0, 1);

	const firstMonday = new Date(januaryFirst.getTime());
	firstMonday.setDate(januaryFirst.getDate() + ((1 - januaryFirst.getDay() + 7) % 7));

	const startDate = new Date(firstMonday.getTime());
	startDate.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
	const start = `${startDate.getFullYear()}-${
		startDate.getMonth() + 1 < 10 ? "0" + (startDate.getMonth() + 1) : startDate.getMonth() + 1
	}-${startDate.getDate() < 10 ? "0" + startDate.getDate() : startDate.getDate()}`;

	const endDate = new Date(startDate.getTime());
	endDate.setDate(endDate.getDate() + 6);
	const end = `${endDate.getFullYear()}-${
		endDate.getMonth() + 1 < 10 ? "0" + (endDate.getMonth() + 1) : endDate.getMonth() + 1
	}-${endDate.getDate() < 10 ? "0" + endDate.getDate() : endDate.getDate()}`;

	return { start, end };
};

export const getAllDays = (week) => {
	const [year, weekNumber] = week.split("-W");
	const januaryFirst = new Date(year, 0, 1);

	const firstMonday = new Date(januaryFirst.getTime());
	firstMonday.setDate(januaryFirst.getDate() + ((1 - januaryFirst.getDay() + 7) % 7));

	const monDate = new Date(firstMonday.getTime());
	monDate.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
	const mon = `${monDate.getDate() < 10 ? "0" + monDate.getDate() : monDate.getDate()}/${
		monDate.getMonth() + 1 < 10 ? "0" + (monDate.getMonth() + 1) : monDate.getMonth() + 1
	}`;
	const monFull = `${monDate.getFullYear()}-${
		monDate.getMonth() + 1 < 10 ? "0" + (monDate.getMonth() + 1) : monDate.getMonth() + 1
	}-${monDate.getDate() < 10 ? "0" + monDate.getDate() : monDate.getDate()}`;

	const tueDate = new Date(monDate.getTime());
	tueDate.setDate(monDate.getDate() + 1);
	const tue = `${tueDate.getDate() < 10 ? "0" + tueDate.getDate() : tueDate.getDate()}/${
		tueDate.getMonth() + 1 < 10 ? "0" + (tueDate.getMonth() + 1) : tueDate.getMonth() + 1
	}`;
	const tueFull = `${tueDate.getFullYear()}-${
		tueDate.getMonth() + 1 < 10 ? "0" + (tueDate.getMonth() + 1) : tueDate.getMonth() + 1
	}-${tueDate.getDate() < 10 ? "0" + tueDate.getDate() : tueDate.getDate()}`;

	const wedDate = new Date(monDate.getTime());
	wedDate.setDate(monDate.getDate() + 2);
	const wed = `${wedDate.getDate() < 10 ? "0" + wedDate.getDate() : wedDate.getDate()}/${
		wedDate.getMonth() + 1 < 10 ? "0" + (wedDate.getMonth() + 1) : wedDate.getMonth() + 1
	}`;
	const wedFull = `${wedDate.getFullYear()}-${
		wedDate.getMonth() + 1 < 10 ? "0" + (wedDate.getMonth() + 1) : wedDate.getMonth() + 1
	}-${wedDate.getDate() < 10 ? "0" + wedDate.getDate() : wedDate.getDate()}`;

	const thuDate = new Date(monDate.getTime());
	thuDate.setDate(monDate.getDate() + 3);
	const thu = `${thuDate.getDate() < 10 ? "0" + thuDate.getDate() : thuDate.getDate()}/${
		thuDate.getMonth() + 1 < 10 ? "0" + (thuDate.getMonth() + 1) : thuDate.getMonth() + 1
	}`;
	const thuFull = `${thuDate.getFullYear()}-${
		thuDate.getMonth() + 1 < 10 ? "0" + (thuDate.getMonth() + 1) : thuDate.getMonth() + 1
	}-${thuDate.getDate() < 10 ? "0" + thuDate.getDate() : thuDate.getDate()}`;

	const friDate = new Date(monDate.getTime());
	friDate.setDate(monDate.getDate() + 4);
	const fri = `${friDate.getDate() < 10 ? "0" + friDate.getDate() : friDate.getDate()}/${
		friDate.getMonth() + 1 < 10 ? "0" + (friDate.getMonth() + 1) : friDate.getMonth() + 1
	}`;
	const friFull = `${friDate.getFullYear()}-${
		friDate.getMonth() + 1 < 10 ? "0" + (friDate.getMonth() + 1) : friDate.getMonth() + 1
	}-${friDate.getDate() < 10 ? "0" + friDate.getDate() : friDate.getDate()}`;

	const satDate = new Date(monDate.getTime());
	satDate.setDate(monDate.getDate() + 5);
	const sat = `${monDate.getDate() < 10 ? "0" + monDate.getDate() : monDate.getDate()}/${
		monDate.getMonth() + 1 < 10 ? "0" + (monDate.getMonth() + 1) : monDate.getMonth() + 1
	}`;
	const satFull = `${satDate.getFullYear()}-${
		satDate.getMonth() + 1 < 10 ? "0" + (satDate.getMonth() + 1) : satDate.getMonth() + 1
	}-${satDate.getDate() < 10 ? "0" + satDate.getDate() : satDate.getDate()}`;

	return { mon, tue, wed, thu, fri, sat, monFull, tueFull, wedFull, thuFull, friFull, satFull };
};

export const convert12to24 = (time12h) => {
	const [time, period] = (time12h ?? "")?.split(" ");

	const [hours, minutes] = time?.split(":");

	let hours24 = parseInt(hours, 10);
	if (period === "PM" && hours24 < 12) {
		hours24 += 12;
	} else if (period === "AM" && hours24 === 12) {
		hours24 = 0;
	}

	const hoursStr = hours24.toString()?.padStart(2, "0");
	const minutesStr = minutes?.padStart(2, "0");

	return `${hoursStr}:${minutesStr}`;
};

export const getMonthNumber = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
	const monthString = `${year}-${month}`;
	return monthString;
};

export const getMonthNumberToDate = (monthString) => {
	const [yearStr, monthStr] = monthString.split("-");
	const year = parseInt(yearStr);
	const month = parseInt(monthStr);

	const firstDayOfMonth = new Date(year, month, 1);
	const start = `${firstDayOfMonth.getDate() < 10 ? "0" + firstDayOfMonth.getDate() : firstDayOfMonth.getDate()}-${
		month < 10 ? "0" + month : month
	}-${year}`;

	const lastDayOfMonth = new Date(year, month, 0);
	const end = `${lastDayOfMonth.getDate() < 10 ? "0" + lastDayOfMonth.getDate() : lastDayOfMonth.getDate()}-${
		month < 10 ? "0" + month : month
	}-${year}`;

	return { start, end };
};
export const getCurrentDate = (plus = false) => {
	const today = new Date();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(plus ? today.getDate() + 1 : today.getDate()).padStart(2, "0");
	const year = today.getFullYear();
	return `${year}-${month}-${day}`;
};

