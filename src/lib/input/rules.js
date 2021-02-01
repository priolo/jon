/* eslint eqeqeq: "off" */

// regole da applicare ai "validator"
export const rules = {

	obligatory: v => {
		if (v != null && v.trim().length > 0 ) return
		return "validation.obligatory"
	},

	repassword: v2=>v1=>{
		if ( v1==v2 ) return
		return "validation.same_password"
	},

	notTheSame: v2=>v1=>{
		if ( v1!=v2 ) return
		return "validation.not_the_same"
	},
	
}
