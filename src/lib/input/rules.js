/* eslint eqeqeq: "off" */
import { Validator } from "@priolo/jon-utils"


/**
 * rules to apply to validators
 * @deprecated use the utilities in jon-utils
 */
export const rules = {

	obligatory: v => {
		if ( !Validator.obligatory(v) ) return "string.obligatory"
	},

	// https://www.w3resource.com/javascript/form/email-validation.php
	email: v => {
		if ( !Validator.email(v) ) return "email.syntax"
	},

	// https://stackoverflow.com/a/5717133/5224029
	url: v => {
		if ( !Validator.url(v) ) return "url.syntax"
	},

	obligatoryArray: v => {
		if ( !Validator.obligatoryArray(v) ) return "array.obligatory"
	},

}

