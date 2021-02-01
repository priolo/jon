/* eslint eqeqeq: "off" */
const LOG_OPTION_STYLE = [
	"background: azure; color: black",
	"background: yellow; color: black",
	"background: red; color: black"
];
const LOG_OPTION_LABEL = [
	"DEBUG: ",
	"WARNING: ",
	"ERROR: "
];

export const LOG_OPTION = {
	DEBUG: 0,
	WARNING: 1,
	ERROR: 2,
}

export function log ( message, type=LOG_OPTION.DEBUG, param=null ) {
	if ( LogOptions.enabled == false ) return;
	if ( isNaN(type) ) {
		param = type
		type = LOG_OPTION.DEBUG
	}
	console.log ( `%c${LOG_OPTION_LABEL[type]}${message}`,LOG_OPTION_STYLE[type]);
	if ( param!=null ) console.log ( param );
}

export let LogOptions = { 
	enabled: true 
};