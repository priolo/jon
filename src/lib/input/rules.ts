/* eslint eqeqeq: "off" */
import { Validator } from "@priolo/jon-utils"

export type ValidationRule = (value: any) => string | null | undefined;

/**
 * rules to apply to validators
 */
export const rules: Record<string, ValidationRule> = {

	obligatory: (v: any) => {
		if ( !Validator.obligatory(v) ) return "string.obligatory"
	},

	// https://www.w3resource.com/javascript/form/email-validation.php
	email: (v: any) => {
		if ( !Validator.email(v) ) return "email.syntax"
	},

	// https://stackoverflow.com/a/5717133/5224029
	url: (v: any) => {
		if ( !Validator.url(v) ) return "url.syntax"
	},

	obligatoryArray: (v: any) => {
		if ( !Validator.obligatoryArray(v) ) return "array.obligatory"
	},

}

