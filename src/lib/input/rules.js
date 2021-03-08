/* eslint eqeqeq: "off" */

// regole da applicare ai "validator"
export const rules = {

	obligatory: v => {
		if (v != null && v.trim().length > 0 ) return
		return "validation.obligatory"
	},

	// non va piu' bene
	repassword: v2=>v1=>{
		if ( v1==v2 ) return
		return "validation.same_password"
	},

	// non va piu' bene
	notTheSame: v2=>v1=>{
		if ( v1!=v2 ) return
		return "validation.not_the_same"
	},

	obligatoryArray: v => {
		if (Array.isArray(v) && v.length > 0 ) return
		return "insert at least one element"
	},

	photoperiod: ([day, night]) => {
		if ( day<0 || night<0 ) return "no negative number"
		const sum = (+day) + (+night)
		if ( sum==0 || (sum <= 24 && 24 % sum == 0) ) return
		return "Invalid values"
	},
	
}

