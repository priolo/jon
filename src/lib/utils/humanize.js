
export function formatTime (timestamp ) {
	const date = new Date(timestamp*1000)
	return `${date.getHours()}:${z(date.getMinutes())}:${z(date.getSeconds())}`;
}

function z (v) {
	return v != null ? `${v < 10 ? "0" : ""}${v}` : "";
}

export function formatFloat (num ) {
	return (+num).toFixed(2)
}