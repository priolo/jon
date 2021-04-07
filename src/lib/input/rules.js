/* eslint eqeqeq: "off" */


// regole da applicare ai "validator"
export const rules = {

	obligatory: v => {
		if (v != null && v.trim().length > 0) return
		return "string.obligatory"
	},

	// https://www.w3resource.com/javascript/form/email-validation.php
	email: v => {
		
		if (/^[^\s@]+@[^\s@]+$/.test(v)) return
		return "email.syntax"
	},

	// https://stackoverflow.com/a/5717133/5224029
	url: v => {
		var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
			'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
			'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
		if (!!pattern.test(v)) return
		return "url.syntax"
	},

	obligatoryArray: v => {
		if (Array.isArray(v) && v.length > 0) return
		return "array.obligatory"
	},

	// // non va piu' bene
	// repassword: v2=>v1=>{
	// 	if ( v1==v2 ) return
	// 	return "validation.same_password"
	// },

	// // non va piu' bene
	// notTheSame: v2=>v1=>{
	// 	if ( v1!=v2 ) return
	// 	return "validation.not_the_same"
	// },


	// photoperiod: ([day, night]) => {
	// 	if ( day<0 || night<0 ) return "no negative number"
	// 	const sum = (+day) + (+night)
	// 	if ( sum==0 || (sum <= 24 && 24 % sum == 0) ) return
	// 	return "Invalid values"
	// },

}

